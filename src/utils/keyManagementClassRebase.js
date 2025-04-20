// Combine Fingerprint and Keys into 1 class as keys that SigningKeys and
//  EncryptionKeys extend. After the program works without fingerprints.

/**
 * 
 */
class Keys {
    // Basiclly a shared function class for all key types. 
    constructor(CryptoKeyPair){
        this.CryptoKeyPair = CryptoKeyPair;
    }
    /**
     * Functions to add to Keys
     * generateKeys(): One for each signing type. One for each encryption type.
     * 
     */

    // Update this functions to 1 or the other. Or split it.
    async exportPublicKey(publicKey) {
        try {
            // // Export to JWK format
            const jwk = await crypto.subtle.exportKey("jwk", publicKey);
            console.log("Public Key (JWK):", jwk);
            // // // Export to SPKI format (DER encoding)
            // const spkiDer = await crypto.subtle.exportKey("spki", publicKey);
            // //spkiDer is an ArrayBuffer, we need to convert it to base64 to be easily shareable
            // const spkiBase64 = await arrayBufferToBase64(spkiDer);
            // console.log("Public Key (SPKI/DER/Base64):", spkiBase64);
            return jwk; // Return both formats  // return { jwk, spkiBase64 }; 
    
        } catch (error) {
            console.error("Error exporting public key:", error);
            throw error;
        }
    }
    
    // Utility function to convert ArrayBuffer to Base64
    async arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}


/**
 * 
 */
class SigningKeys extends Keys {
    constructor(CryptoKeyPair = null) {
        super();
        // Signing & Verifying Keys
        if (CryptoKeyPair == null) {
            CryptoKeyPair = this.genECDSA();
            return CryptoKeyPair;
        }
        this.signKeypair = CryptoKeyPair;
        this.signPrivateKey = CryptoKeyPair.privateKey || CryptoKeyPair.signingPrivateKey;
        this.signPublicKey = CryptoKeyPair.publicKey || CryptoKeyPair.signingPublicKey;

    };
    /**
     * Generates a new ECDSA keypair for signing and stores it in memory.
     * @returns {CryptoKeyPair} Keyypair for signing and verifying.
     */
    async genECDSA() {
        let signKeypair = await crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-384"
            },
            true,
            ["sign", "verify"]
        );
        this.signKeypair = signKeypair;
        this.signPrivateKey = signKeypair.privateKey;
        this.signPublicKey = signKeypair.publicKey;
        return { keypair: this.signKeypair, privateKey: this.signPrivateKey, publicKey: this.signPublicKey };
    }
    /**
    * Signs a file [image] using the private key.
    * @param {string | Uint8Array} data - The data to sign.  Make this more general.
    * @returns {Promise<Uint8Array>} Signature.
    */
    async sign(data) {
        if (!this.signPrivateKey) {
            throw new Error("No private key available for signing.");
        }
        // const encoder = new TextEncoder();  // Remove this.  Handle encoding outside.
        // const data = encoder.encode(file);
        try {
            const signature = await crypto.subtle.sign(
                { name: "ECDSA", hash: { name: "SHA-384" } },
                this.signPrivateKey,
                data
            );
            return new Uint8Array(signature);
        } catch (error) {
            console.error("Error during signing", error);
            throw error;
        }

    }
    /**
     * Verifies a signature.
     * @param {CryptoKey} publicKey - The sender's public key.
     * @param {Uint8Array} signature - The signature to verify.
     * @param {string | Uint8Array} data - The original data that was signed.
     * @returns {Promise<boolean>}  True if the signature is valid, false otherwise.
     */
    async verify(publicKey, signature, data) {
        try {
            const result = await crypto.subtle.verify(
                {
                    name: "ECDSA",
                    hash: { name: "SHA-384" },
                },
                publicKey,
                signature,
                data
            );
            console.log("signature output" + result);
            return result;
        } catch (error) {
            console.error("Error during verification:", error);
            throw error; //  Important: Re-throw the error!
        }
    }
    // Getter functions
    // signing
    getSignKeypair() {  // get keypair set for signing
        return this.signKeypair;
    }
    getSignPrivateKey() { // private key
        return this.signPrivateKey;
    }
    getSignPublicKey() { // public key
        return this.signPublicKey;
    }
}

/**
 * 
 * 
 */
class EncryptionKeys extends Keys {
    constructor(CryptoKeyPair = null) {
        super();
        // Encryption & Decryption Keys
        if (CryptoKeyPair == null) {
            CryptoKeyPair = this.genRSA();
            return CryptoKeyPair;
        }
        this.encryptKeypair = CryptoKeyPair;
        this.encryptPrivateKey = CryptoKeyPair.privateKey || CryptoKeyPair.encryptionPrivateKey;
        this.encryptPublicKey = CryptoKeyPair.publicKey || CryptoKeyPair.encryptionPublicKey;
    }
    /** 
     * Generate a new keypair using RSA-OAEP algo and store it in memory.
     * @returns {CryptoKeyPair} Keypair for encryption / decryption.
     */
    async genRSA() {
        let encryptKeypair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                // Consider using a 4096-bit key for systems that require long-term security
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
        this.encryptKeypair = encryptKeypair;
        this.encryptPrivateKey = encryptKeypair.privateKey;
        this.encryptPublicKey = encryptKeypair.publicKey;

        return { keypair: this.encryptKeypair, privateKey: this.encryptPrivateKey, publicKey: this.encryptPublicKey };
    }
    /**
     * Encrypts data using the public key.
     * @param {string | Uint8Array} data - The data to encrypt.
     * @param {CryptoKey} publicKey - The recipient's public key.
     * @returns {Promise<ArrayBuffer>} The encrypted data.
     */
    async encrypt(data, publicKey) {
        if (!publicKey) {
            throw new Error("Public key is required for encryption.");
        }
        try {
            return await crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" },
                },
                publicKey,
                data
            );
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }

    /**
     * Decrypts data using the private key.
     * @param {ArrayBuffer} data - The data to decrypt.
     * @returns {Promise<ArrayBuffer | string>} The decrypted data.
     */
    async decrypt(data) {
        if (!this.encryptPrivateKey) {
            throw new Error("No private key available for decryption.");
        }
        try {
            return await crypto.subtle.decrypt(
                {
                    name: "RSA-OAEP",
                    hash: { name: "SHA-256" },
                },
                this.encryptPrivateKey,
                data
            );
        } catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    }

    // Getter functions
    // encryption
    getEncryptKeypair() { // get keypair set for encryption
        return this.encryptKeypair;
    }
    getEncryptPrivateKey() { // private key
        return this.encryptPrivateKey;
    }
    getEncryptPublicKey() { // public key
        return this.encryptPublicKey;
    }
};
/**
 * Function list:
 * TBD
 * 
 * @param {SigningKeys} var.getSignKeypair- SigningKeys class to get public and private keys.
 * @param {EncryptionKeys} var.getEncryptKeypair- EncryptionKeys calls to get publick and private keys.
 * 
 */
class KeyManager {
    constructor(SigningKeypair, EncryptionKeyPair) {
        if (!SigningKeypair || !EncryptionKeyPair) {
            this.clearKeypair();
        }
        this.SigningKeys = SigningKeypair;
        this.EncryptionKeys = EncryptionKeyPair;
    }
    /**
     * Clear Keypairs takes current keys in memory and replaces with null
     */
    async clearKeypair() {
        // Sets keys to null.
        this.SigningKeys = null;
        this.EncryptionKeys = null;
        return { signingKeypair: this.SigningKeys, encryptionKeypair: this.EncryptionKeys }
    }
    /**
     * Saves the current key pair to a JSON file.
     * @param {SigningKeys} SigningKeypair - SigningKeys class 
     * @param {EncryptionKeys} EncryptionKeyPair - EncryptionKeys class
     */
    async keypairSave() {
        if (!SigningKeys || !EncryptionKeys) {
            console.log(Error("No keypairs, use Generate Key"))
            throw new Error("No keypairs available to save.");
        }

        const exportedSignPrivateKey = await crypto.subtle.exportKey("jwk", this.SigningKeys.signPrivateKey);
        const exportedSignPublicKey = await crypto.subtle.exportKey("jwk", this.SigningKeys.signPublicKey);
        const exportedEncryptPrivateKey = await crypto.subtle.exportKey("jwk", this.EncryptionKeys.encryptPrivateKey);
        const exportedEncryptPublicKey = await crypto.subtle.exportKey("jwk", this.EncryptionKeys.encryptPublicKey);
        const keyData = {

            signingPrivateKey: exportedSignPrivateKey,
            signingPublicKey: exportedSignPublicKey,
            encryptionPrivateKey: exportedEncryptPrivateKey,
            encryptionPublicKey: exportedEncryptPublicKey
        };

        const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'keypair.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    /**
        * Loads a key pair from a JSON file.
        * @param {File} file - The JSON file containing the key pair.
        * @returns {Promise<KeyManager>} A new KeyManager instance with the loaded keys.
        */
    async keypairLoad(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const keyData = JSON.parse(event.target.result);

                    // Import signing keys
                    const signKeypair = {
                        signingPrivateKey: await crypto.subtle.importKey(
                            "jwk",
                            keyData.signingPrivateKey,
                            { name: "ECDSA", namedCurve: "P-384" },
                            true,
                            ["sign",]
                        ),
                        signingPublicKey: await crypto.subtle.importKey(
                            "jwk",
                            keyData.signingPublicKey,
                            { name: "ECDSA", namedCurve: "P-384" },
                            true,
                            ["verify",]
                        ),
                    };
                    const signingKeys = new SigningKeys(signKeypair);


                    // Import encryption keys
                    const encryptKeypair = {
                        encryptionPrivateKey: await crypto.subtle.importKey(
                            "jwk",
                            keyData.encryptionPrivateKey,
                            { name: "RSA-OAEP", hash: "SHA-256" },
                            true,
                            ["decrypt",]
                        ),
                        encryptionPublicKey: await crypto.subtle.importKey(
                            "jwk",
                            keyData.encryptionPublicKey,
                            { name: "RSA-OAEP", hash: "SHA-256" },
                            true,
                            ["encrypt",]
                        ),
                    };
                    const encryptionKeys = new EncryptionKeys(encryptKeypair);

                    // Resolve with a new KeyManager instance
                    resolve(new KeyManager(signingKeys.signKeypair, encryptionKeys.encryptKeypair));

                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file."));
            };

            reader.readAsText(file);
        });
    }


    /**
     * Show keypair values in the console.
     */
    async keypairShowValues() {
        if (this.SigningKeys) {
            console.log("Signing Keypair:", this.SigningKeys.getSignKeypair());
            console.log("Signing Private Key:", this.SigningKeys.getSignPrivateKey());
            console.log("Signing Public Key:", this.SigningKeys.getSignPublicKey());
        } else {
            console.log("No Signing Keys available.");
        }
        if (this.EncryptionKeys) {
            console.log("Encryption Keypair:", this.EncryptionKeys.getEncryptKeypair());
            console.log("Encryption Private Key:", this.EncryptionKeys.getEncryptPrivateKey());
            console.log("Encryption Public Key:", this.EncryptionKeys.getEncryptPublicKey());
        } else {
            console.log("No Encryption Keys available.");
        }
    }
}

/// NOT IMPLEMENTED Fingerprinting to make the pubkey shorter for use. 
// Need to test and modify. 

/**
 * @class Fingerprint
 * @classdesc Creates fingerprints for keys. 
 * acts as the sign, verify & encrypt decrypt entry points 
 * @param {SigningKeys} SigningKeypair - Signing key class expected
 * @param {EncryptionKeys} EncryptionKeyPair - Encryption key class expected
 */
class Fingerprints {
    constructor(SigningKeypair, EncryptionKeyPair) {
        this.SigningKeys = SigningKeypair;
        this.EncryptionKeys = EncryptionKeyPair;
        this.signingFingerprint = null;
        this.encryptionFingerprint = null;
    }
    /**
     * Generates a fingerprint for a given public key using SHA-256.
     * - Uses only the Web Crypto API (no external libraries).
     * - Returns the raw hash as a Uint8Array.
     * @param {Uint8Array} publicKey - The public key in Uint8Array format.
     * @returns {Promise<Uint8Array>} - A SHA-256 hash of the public key.
     */
    async fingerprintPublicKey(publicKey) {
        if (!(publicKey instanceof Uint8Array)) {
            throw new Error("Invalid public key format. Expected Uint8Array.");
        }
        // Hash the public key using the Web Crypto API (SHA-256)
        const hashBuffer = await crypto.subtle.digest("SHA-256", publicKey);
        console.log(hashBuffer);
        // Convert ArrayBuffer to Uint8Array and return it
        return new Uint8Array(hashBuffer);
    }

    /**
     * Signs a fingerprint (SHA-256 hash of public key) using the private key.
     *
     * @param {CryptoKey} privateKey - The private key for signing. 
     * @param {Uint8Array} fingerprint - The fingerprint (SHA-256 hash of public key).
     * @returns {Promise<Uint8Array>} - The signature as a Uint8Array.
     */
    async signFingerprint(privateKey, fingerprint) {
        if (!(fingerprint instanceof Uint8Array)) {
            throw new Error("Invalid fingerprint format. Expected Uint8Array.");
        }

        // Sign the fingerprint using the private key
        const signature = await crypto.subtle.sign(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            privateKey,
            fingerprint
        );

        // Convert ArrayBuffer to Uint8Array and return it
        return new Uint8Array(signature);
    }

    /**
     * Verifies a signed fingerprint.
     *
     * @param {CryptoKey} publicKey - The public key for verification.
     * @param {Uint8Array} fingerprint - The original fingerprint (SHA-256 hash).
     * @param {Uint8Array} signature - The signature to verify.
     * @returns {Promise<boolean>} - True if the signature is valid, false otherwise.
     */
    async verifyFingerprint(publicKey, fingerprint, signature) {
        if (!(fingerprint instanceof Uint8Array) || !(signature instanceof Uint8Array)) {
            throw new Error("Invalid input format. Expected Uint8Array.");
        }

        // Verify the signature against the fingerprint
        return await crypto.subtle.verify(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            publicKey,
            signature,
            fingerprint
        );
    }
};





export { Keys, SigningKeys, EncryptionKeys, KeyManager, Fingerprints };