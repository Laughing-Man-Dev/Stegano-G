/**
 * Key Pair Utility using Web Crypto API.
 * Functions:
 * - keypairGen(): Generates a key pair using ECDSA with P-384.
 * - keypairSave(): Saves the generated key pair as a JSON file.
 * - keypairLoad(): Loads a key pair from a JSON file.
 * - getPubkey(): Returns public key.
 * - sign(): Signs a message using the private key.
 * 
 * 
 * 
 *  https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle
 */

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
let keyPair = null; // Holds the generated key pair only lives in memory if not downloaded. 

/**
 * Generates a new ECDSA key pair using P-384 and stores it in memory.
 * @returns {Promise<Uint8Array>} The public key.
 */
export async function keypairGen() {
    keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-384"
        },
        true,
        ["sign", "verify"]
    );
    console.log(getPubkey());
    return getPubkey();
}

/**
 * Saves the current key pair to a JSON file.
 */
export async function keypairSave() {
    if (!keyPair) {
        console.log(Error("No key pair use Generate Key"))
        throw new Error("No key pair available to save.");
    }
    const exportedPrivateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const exportedPublicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    
    const keyData = {
        privateKey: exportedPrivateKey,
        publicKey: exportedPublicKey
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
        
        keyPair = {
            privateKey: await crypto.subtle.importKey(
                "jwk",
                keyData.privateKey,
                { name: "ECDSA", namedCurve: "P-384" },
                true,
                ["sign",]
            ),
            publicKey: await crypto.subtle.importKey(
                "jwk",
                keyData.publicKey,
                { name: "ECDSA", namedCurve: "P-384" },
                true,
                ["verify",]
            )
        };
    };
}

/**
 * Returns the public key bytes array.
 * @returns {Promise<Uint8Array>} The public key in Base58 format.
 */
export async function getPubkey() {
    if (!keyPair || !keyPair.publicKey) {
        throw new Error("No public key available.");
    }
    const exportedPublicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    return new Uint8Array(exportedPublicKey);
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
    if (!keyPair || !keyPair.privateKey) {
        throw new Error("No private key available for signing.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(file);
    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        keyPair.privateKey,
        data
    );
    return new Uint8Array(signature);
}


/**
 * Verify a file [image] has the correct signature. 
 * @param {HTMLElement} file - The upload file
 * @param {CryptoKey} pubKey - The senders public key.
 * @param {Uint8Array} signValue - the expected sign output.
 * 
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
 * @param {Uint8Array} publicKey - The public key in Uint8Array format.
 * @returns {Promise<Uint8Array>} - A SHA-256 hash of the public key.
 */
export async function fingerprintPubKey(publicKey) {
    if (!(publicKey instanceof Uint8Array)) {
        throw new Error("Invalid public key format. Expected Uint8Array.");
    }

    // Hash the public key using the Web Crypto API (SHA-256)
    const hashBuffer = await crypto.subtle.digest("SHA-256", publicKey);

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
