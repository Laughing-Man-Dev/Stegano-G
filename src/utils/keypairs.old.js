/**
 * Key Pair Utility using Web Crypto API and Base58 Encoding
 * Functions:
 * - keypairGen(): Generates a key pair using ECDSA with P-384 and outputs Base58 public key.
 * - keypairSave(): Saves the generated key pair as a JSON file.
 * - keypairLoad(): Loads a key pair from a JSON file.
 * - getPubkey(): Returns the Base58-encoded public key.
 * - sign(): Signs a message using the private key and returns a Base58-encoded signature.
 */

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Encodes a Uint8Array into a Base58 string.
 * @param {Uint8Array} buffer - The data to encode.
 * @returns {string} - The Base58-encoded string.
 */
function base58Encode(buffer) {
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

let keyPair = null; // Holds the generated key pair

/**
 * Generates a new ECDSA key pair using P-384 and stores it in memory.
 * @returns {Promise<string>} The public key in Base58 format.
 */
export async function keypairGen() {
    keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-384"
        },
        true,
        ["sign", "verify",]
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
                ["sign"]
            ),
            publicKey: await crypto.subtle.importKey(
                "jwk",
                keyData.publicKey,
                { name: "ECDSA", namedCurve: "P-384" },
                true,
                ["verify"]
            )
        };
    };
}

/**
 * Returns the Base58-encoded public key.
 * @returns {Promise<string>} The public key in Base58 format.
 */
export async function getPubkey() {
    if (!keyPair || !keyPair.publicKey) {
        throw new Error("No public key available.");
    }
    const exportedPublicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    return base58Encode(new Uint8Array(exportedPublicKey));
}

/**
 * Signs a message using the private key.
 * @param {string} message - The message to sign.
 * @returns {Promise<string>} The Base58-encoded signature.
 */
export async function sign(message) {
    if (!keyPair || !keyPair.privateKey) {
        throw new Error("No private key available for signing.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        keyPair.privateKey,
        data
    );
    return base58Encode(new Uint8Array(signature));
}
