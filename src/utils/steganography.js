/**
 * Steganography Utility for Embedding Encrypted Messages into Images
 * 
 * Functions:
 * - stamp(): Overlays the sender's public key onto the image.
 * - sign(): Uses the keypair utility to sign messages.
 * - encrypt(): Encrypts messages for secure storage.
 * - decrypt(): Decrypts messages using a password or private key.
 * - embed(): Hides encrypted data into an image using LSB steganography.
 * - extract(): Retrieves and decrypts hidden messages from an image.
 */

import { getPubkey, sign } from './keypairs.js';

/**
 * Stamps the sender's public key onto the image visibly.
 * @param {HTMLImageElement} image - The image to stamp.
 * @returns {Promise<HTMLCanvasElement>} - The image with the stamped key.
 */
export async function stamp(image) {
    const publicKey = await getPubkey();
    //console.log(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 500; //image.width;  // 500
    canvas.height = 500; //image.height; // 500
    ctx.drawImage(canvas, 50, 50);
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(publicKey, 10, 20);
    return canvas;
}

/**
 * Encrypts a message using AES-GCM.
 * @param {string} message - The message to encrypt.
 * @param {string} password - The password for encryption.
 * @returns {Promise<string>} - The encrypted message in base64.
 */
export async function encrypt(message, password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(password));
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["encrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(message));
    return btoa(String.fromCharCode(...new Uint8Array(iv), ...new Uint8Array(encrypted)));
}

/**
 * Decrypts a message using AES-GCM.
 * @param {string} encryptedMessage - The encrypted message in base64.
 * @param {string} password - The password for decryption.
 * @returns {Promise<string>} - The decrypted message.
 */
export async function decrypt(encryptedMessage, password) {
    const binaryData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const iv = binaryData.slice(0, 12);
    const encryptedData = binaryData.slice(12);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(password));
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
    return new TextDecoder().decode(decrypted);
}

/**
 * Embeds encrypted data into an image using LSB steganography.
 * @param {HTMLImageElement} image - The image to embed data into.
 * @param {string} data - The encrypted data to hide.
 * @returns {HTMLCanvasElement} - The modified image with hidden data.
 */
export function embed(image, data) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let binaryData = Array.from(new TextEncoder().encode(data)).map(byte => byte.toString(2).padStart(8, '0')).join('');
    let dataIndex = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        if (dataIndex < binaryData.length) {
            imgData.data[i] = (imgData.data[i] & 0xFE) | parseInt(binaryData[dataIndex], 2);
            dataIndex++;
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

/**
 * Extracts hidden data from an image using LSB steganography.
 * @param {HTMLImageElement} image - The image containing hidden data.
 * @returns {string} - The extracted and decrypted data.
 */
export function extract(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let binaryData = '';
    for (let i = 0; i < imgData.data.length; i += 4) {
        binaryData += (imgData.data[i] & 1).toString();
    }
    
    const byteData = binaryData.match(/.{8}/g).map(byte => parseInt(byte, 2));
    return new TextDecoder().decode(new Uint8Array(byteData));
}
