/**
 * Key Pair Utility using Web Crypto API.
 * Functions:
 * - keypairGen(): Generates a key pair using ECDSA with P-384.
 * - keypairSave(): Saves the generated key pair as a JSON file.
 * - keypairLoad(): Loads a key pair from a JSON file.
 * - getPubkeys(): Returns public keys.
 * - sign(): Signs a message using the private key.
 * 
 * 
 * 
 *  https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle
 */

// Global vars for Key Management.
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var keypairSet = null; // Holds the generated keypairs only lives in memory if not downloaded. 
var signingKeypair = null; // Holds the generated keypairs for signing only lives in memory if not downloaded. 
var encryptionKeypair = null; // Holds the generated keypairs for encryption only lives in memory if not downloaded. 
var signingPrivateKey, signingPublicKey;
var encryptionPrivateKey, encryptionPublicKey;

/**
 * Generates a new ECDSA key pair using P-384 for signing / verifying
 * Generates a new RSA-AOEP using 2048 SHA-265 for encryption / decryption 
 * Stored in memory if not saved. Removes keys on end of session.
 * @returns {Promise<Uint8Array>} The keypairs for both signing and encryption
 */
export async function keypairGen() {
  signingKeypair = await genECDSA();
  signingPrivateKey = signingKeypair.privateKey;
  signingPublicKey = signingKeypair.publicKey;
  console.log("Signing Keys: " + signingKeypair);
  console.log("Signing public key: " + signingPrivateKey);
  console.log("Signing private key: " + signingPublicKey);
  encryptionKeypair = await genRSA();
  encryptionPrivateKey = encryptionKeypair.privateKey;
  encryptionPublicKey = encryptionKeypair.publicKey;
  console.log("Encryption Keys: " + encryptionKeypair);
  console.log("Encryption public key: " + encryptionPrivateKey);
  console.log("Encryption private key: " + encryptionPublicKey);
  
  keypairSet = {
    signing: [signingKeypair, signingPrivateKey, signingPublicKey],
    encryption: [encryptionKeypair, encryptionPrivateKey, encryptionPublicKey]
  };

  return keypairSet;
}
/**
 * Generates a new ECDSA keypair for signing and stores it in memory.
 * @returns {CryptoKeyPair} Keyypair for signing / verifying.
 */
async function genECDSA(){
    signingKeypair = await crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-384"
        },
        true,
        ["sign", "verify"]
    );
    return signingKeypair;
}

/** 
 * Generate a new keypair using RSA-OAEP algo and store it in memory.
 * @returns {CryptoKeyPair} Keypair for encryption / decryption.
 */
async function genRSA() {
    encryptionKeypair = await crypto.subtle.generateKey(
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
    return encryptionKeypair;
}

/**
 * Saves the current key pair to a JSON file.
 */
export async function keypairSave() {
    if (!keypairSet) {
        console.log(Error("No keypairs use Generate Key"))
        throw new Error("No keypairs available to save.");
    }
    // const exportedSignPrivateKey = await crypto.subtle.exportKey("jwk", keypairSet.signing[2]);
    // const exportedSignPublicKey = await crypto.subtle.exportKey("jwk", keypairSet.signing[1]);
    // const exportedEncryptPrivateKey = await crypto.subtle.exportKey("jwk", keypairSet.encryption[2]);
    // const exportedEncryptPublicKey = await crypto.subtle.exportKey("jwk", keypairSet.encryption[1]);
    const exportedSignPrivateKey = await crypto.subtle.exportKey("jwk", keypairSet.signing[0].privateKey);
    const exportedSignPublicKey = await crypto.subtle.exportKey("jwk", keypairSet.signing[0].publicKey);
    const exportedEncryptPrivateKey = await crypto.subtle.exportKey("jwk", keypairSet.encryption[0].privateKey);
    const exportedEncryptPublicKey = await crypto.subtle.exportKey("jwk", keypairSet.encryption[0].publicKey);
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
 */
export async function keypairLoad(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async (event) => {
        const keyData = JSON.parse(event.target.result);
        signingKeypair = {
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
            )
        };
        encryptionKeypair = {
            encryptionPrivateKey: await crypto.subtle.importKey(
                "jwk",
                keyData.encryptionPrivateKey,
                { name: "RSA-OAEP",
                  hash: "SHA-256"
                },
                true,
                ["decrypt",]
            ),
            encryptionPublicKey: await crypto.subtle.importKey(
                "jwk",
                keyData.encryptionPublicKey,
                { name: "RSA-OAEP",
                  hash: "SHA-256",
                },
                true,
                ["encrypt",] 
            )

        };
        keypairSet ={
            signing:[signingKeypair],
            encryption:[encryptionKeypair]
    };
    }
    return keypairSet;
}

/**
 * Returns the public key bytes array.
 * @returns {Promise<Uint8Array>} The public key in Uint8Array as {signPK, encryptionPK}
 */
export async function getPubkeySigning() {
    if (!keypairSet || signingKeypair.publicKey) {
        console.log("Use KeyGen to generate a keypair set.")
        throw new Error("No public key available. Use KeyGen to generate or upload a keypair set."); 
    }
    signingPublicKey = await crypto.subtle.exportKey("raw", keypairSet.signing[0].publicKey);
    encryptionPublicKey = await crypto.subtle.exportKey("raw", keypairSet.encryption[0].publicKey);
    return {signingPublicKey};
}
/**
 * Returns the public key bytes array.
 * @returns {Promise<Uint8Array>} The public key in Uint8Array as {signPK, encryptionPK}
 */
export async function getPubkeyEncryption() {
    if (!keypairSet ||encryptionKeypair.publicKey) {
        console.log("Use KeyGen to generate a keypair set.")
        throw new Error("No public key available. Use KeyGen to generate or upload a keypair set."); 
    }
    encryptionPublicKey = await crypto.subtle.exportKey("raw", keypairSet.encryption[0].publicKey);
    return {encryptionPublicKey};
}

/**
 * Returns the private keys bytes array.
 * @returns {Promise<Uint8Array>} The private keys in Uint8Array
 */
export async function getPrivkeySigning() {
    if (!keypairSet || !signingKeypair.privateKey || !encryptionKeypair.privateKey) {
        console.log("Use KeyGen to generate a keypair set.")
        throw new Error("No private key available. Use KeyGen to generate or upload a keypair set."); 
    }
    signingPrivateKey = await crypto.subtle.exportKey("raw", keypairSet.signing[0].privateKey);
    return {signingPrivateKey};
}

/**
 * Returns the private keys bytes array.
 * @returns {Promise<Uint8Array>} The private keys in Uint8Array
 */
export async function getPrivkeyEncryption() {
    if (!keypairSet || !encryptionKeypair.privateKey) {
        console.log("Use KeyGen to generate a keypair set.")
        throw new Error("No private key available. Use KeyGen to generate or upload a keypair set."); 
    }
    encryptionPrivateKey = await crypto.subtle.exportKey("raw", keypairSet.encryption[0].privateKey);
    return {encryptionPrivateKey};
}


/**
 * Encodes a Uint8Array into a Base58 string.
 * @param {Uint8Array} buffer - The data to encode.
 * @returns {string} - The Base58-encoded string.
 */
export function base58Encode(buffer) {
    let digits = [0];
    for (let byte of buffer) {
        let carry = byte;
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] * 256;
            digits[j] = carry % 58;
            carry = (carry / 58) | 0;
        }
        while (carry) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }
    return digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}





/**
 * Signs a file [image] using the private key.
 * @param {string} file - The file [image] to sign.
 * @returns {Promise<Uint8Array>} Signature.
 */
export async function sign(file) {
    if (!signingKeypair || !signingKeypair.privateKey) {
        throw new Error("No private key available for signing.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(file);
    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        signingKeypair.privateKey,
        data
    );
    return new Uint8Array(signature);
}


/**
 * Verify a file [image] has the correct signature. 
 * @param {HTMLElement} file - The upload file
 * @param {CryptoKey} pubKey - The senders public key.
 * @param {Uint8Array} signValue - the expected sign output.
 * @returns {boolean} returns a value True or False. and returns the string valid or invalid.
 * Not implemented yet.
 */
export async function verify(pubKey, signValue, file) {
    const publicKey = pubKey;
    const signature = signValue;
    const encoded = file;

    let result = await window.crypto.subtle.verify(
        {
            name: "ECDSA",
            hash: { name: "SHA-384" },
        },
        publicKey,
        signature,
        encoded
    );
    console.log(result)
    return result ? "valid" : "invalid";
}









/// NOT IMPLEMENTED Fingerprinting to make the pubkey shorter for use. 
// Need to test and modify. 

/**
 * Generates a fingerprint for a given public key using SHA-256.
 * - Uses only the Web Crypto API (no external libraries).
 * - Returns the raw hash as a Uint8Array.
 *
 * @param {Uint8Array} encryptionPublicKey - The public key in Uint8Array format.
 * @returns {Promise<Uint8Array>} - A SHA-256 hash of the public key.
 */
export async function fingerprintPubKeyEncrypt(encryptionPublicKey) {
    if (!(encryptionPublicKey instanceof Uint8Array)) {
        throw new Error("Invalid public key format. Expected Uint8Array.");
    }

    // Hash the public key using the Web Crypto API (SHA-256)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encryptionPublicKey);
    console.log(hashBuffer);
    // Convert ArrayBuffer to Uint8Array and return it
    return new Uint8Array(hashBuffer);
}

/**
 * Generates a fingerprint for a given public key using SHA-256.
 * - Uses only the Web Crypto API (no external libraries).
 * - Returns the raw hash as a Uint8Array.
 *
 * @param {Uint8Array} signingPublicKey - The public key in Uint8Array format.
 * @returns {Promise<Uint8Array>} - A SHA-256 hash of the public key.
 */
export async function fingerprintPubKeySign(signingPublicKey) {
    if (!(signingPublicKey instanceof Uint8Array)) {
        throw new Error("Invalid public key format. Expected Uint8Array.");
    }

    // Hash the public key using the Web Crypto API (SHA-256)
    const hashBuffer = await crypto.subtle.digest("SHA-256", signingPublicKey);
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
export async function signFingerprint(privateKey, fingerprint) {
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
export async function verifyFingerprint(publicKey, fingerprint, signature) {
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
