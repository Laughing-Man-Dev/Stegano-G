/**
 * Steganography Utility for Embedding Encrypted Messages into Images
 * 
 * Todo:
 * - Update any image manipulation to use the imageOverlay.js lib.
 *      - embed()
 *      - extract()
 * 
 * Functions:
 * - stamp(): Overlays the sender's public key onto the image. Move to helper.js
 * 
 * - encrypt(): Encrypts messages for secure storage.
 * - decrypt(): Decrypts messages using a password or private key.
 * - embed(): Hides encrypted data into an image using LSB steganography.
 * - extract(): Retrieves and decrypts hidden messages from an image.
 */

import {pubkey} from './helper.js';

/**
 * This FUNCTION needs to be moved to helper. and utilize the new image overlay lib.
 * 
 * Stamps the sender's public key onto the image visibly.
 * @param {HTMLImageElement} image - The image to stamp.
 * @returns {Promise<HTMLCanvasElement>} - The image with the stamped key.
 */
export async function stamp(image) {
    const publicKey = await pubkey();
    //console.log(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;  // 500;
    canvas.height = image.height; // 500;
    ctx.drawImage(canvas, image.width, image.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(publicKey, 10, 20);
    return canvas;
}

/**
 * Encrypts a message using AES-GCM.
 * @param {string} message - The message to encrypt.
 * @param {string} password - The password for encryption.
 * @returns {Promise<string>} - The encrypted message in base64 format.
 *
 * Description:
 * This function encrypts the given message using the AES-GCM (Advanced Encryption Standard - Galois Counter Mode) algorithm.
 * It derives an encryption key from the provided password using the SHA-256 hash function.  Important: SHA-256 is NOT a suitable
 * key derivation function (KDF) for production; a proper KDF like PBKDF2 should be used.  A unique initialization vector (IV)
 * is generated for each encryption operation to ensure ciphertext uniqueness.  The function then combines the IV and the
 * ciphertext, and returns the result as a base64-encoded string.  Base64 encoding is used to represent the binary data
 * in a format that can be easily stored and transmitted.
 */
export async function encrypt(message, password) {
    // Create a text encoder to convert the message string into a Uint8Array, which is required for the Web Crypto API.
    const encoder = new TextEncoder();
  
    // Derive the encryption key from the password using SHA-256.  Note: This is NOT a secure KDF.
    const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  
    // Import the raw key material to create a CryptoKey object.  This object is what the Web Crypto API uses for encryption.
    // The key is restricted to the 'encrypt' operation.
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["encrypt"]);
  
    // Generate a cryptographically secure, random initialization vector (IV).  A 12-byte IV is recommended for AES-GCM.
    const iv = crypto.getRandomValues(new Uint8Array(12));
  
    // Encrypt the message using the AES-GCM algorithm.  The IV is provided in the algorithm parameter.
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(message));
  
    // Combine the IV and the encrypted ciphertext into a single Uint8Array for easier handling.
    const combinedData = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combinedData.set(iv, 0); // Copy the IV to the beginning of the combined array.
    combinedData.set(new Uint8Array(encrypted), iv.byteLength); // Copy the ciphertext after the IV.
  
    // Return the combined data (IV + ciphertext) as a base64-encoded string.
    return btoa(String.fromCharCode(...combinedData));
  }
  
  /**
   * Decrypts a message using AES-GCM.
   * @param {string} encryptedMessage - The base64-encoded, encrypted message.
   * @param {string} password - The password used for encryption.
   * @returns {Promise<string>} - The decrypted message as a string.
   *
   * Description:
   * This function decrypts a message that was encrypted using AES-GCM.  It takes the base64-encoded encrypted message and the
   * password as input.  It first decodes the base64 string to obtain the combined IV and ciphertext.  It then extracts the IV
   * and ciphertext.  The decryption key is derived from the password (same as in the encrypt function).  The function then
   * uses the Web Crypto API to decrypt the ciphertext using AES-GCM and the derived key and IV.  Finally, it decodes the
   * decrypted Uint8Array into a human-readable string.
   */
  export async function decrypt(encryptedMessage, password) {
    // Decode the base64-encoded encrypted message into a Uint8Array.  This gets the combined IV and ciphertext.
    const binaryData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
  
    // Extract the initialization vector (IV) from the beginning of the binary data.  The IV is always 12 bytes.
    const iv = binaryData.slice(0, 12);
  
    // Extract the encrypted data (ciphertext) from the remaining part of the binary data.
    const encryptedData = binaryData.slice(12);
  
    // Create a text encoder.  Although not used in this function, it's good practice to keep it consistent.
    const encoder = new TextEncoder();
  
    // Derive the decryption key from the password using SHA-256.  This should match the key derivation in the encrypt function.
    const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  
    // Import the key material to create a CryptoKey object for decryption.  The key is restricted to the 'decrypt' operation.
    const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, ["decrypt"]);
  
    // Decrypt the ciphertext using AES-GCM with the derived key and the extracted IV.
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
  
    // Decode the decrypted data (a Uint8Array) into a string using TextDecoder.
    return new TextDecoder().decode(decrypted);
  }
  
  /**
   * Embeds encrypted data into an image using LSB steganography.
   * @param {HTMLImageElement} image - The image to embed data into.
   * @param {string} data - The encrypted data to hide.
   * @returns {HTMLCanvasElement} - The modified image with hidden data.
   *
   * Description:
   * This function hides the given data within the least significant bits (LSB) of the pixel data of an image.  This technique is
   * called steganography.  The function creates a canvas element, draws the image onto it, and then accesses the image's pixel data.
   * It converts the data to a binary string.  Then, it iterates through the pixels, modifying the LSB of the red, green, and blue
   * color components to store the bits of the data.  The alpha component is not modified.  Finally, it puts the modified pixel
   * data back onto the canvas and returns the canvas element.  The modified image is contained within the canvas.
   */
  export function embed(image, data) {
    // Create a canvas element.  Canvas is used for manipulating image data.
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    // Set the canvas dimensions to match the input image.
    canvas.width = image.width;
    canvas.height = image.height;
  
    // Draw the input image onto the canvas.  This makes the image's pixel data accessible.
    ctx.drawImage(image, 0, 0);
  
    // Get the image data from the canvas.  This is a Uint8ClampedArray representing the pixel data as RGBA values.
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Convert the input data string to a binary string.  Each character is converted to its ASCII code, then to binary.
    let binaryData = Array.from(new TextEncoder().encode(data)).map(byte => byte.toString(2).padStart(8, '0')).join('');
    let dataIndex = 0;
  
    // Iterate through the pixel data, modifying the LSBs.  The loop increments by 4 because each pixel has 4 values (R, G, B, A).
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (dataIndex < binaryData.length) {
        // Modify the LSB of the red, green, and blue components.
        imgData.data[i] = (imgData.data[i] & 0xFE) | parseInt(binaryData[dataIndex], 2); // Red
        dataIndex++;
      }
    }
  
    // Put the modified image data back onto the canvas.  This updates the canvas with the steganographically encoded data.
    ctx.putImageData(imgData, 0, 0);
  
    // Return the canvas element containing the modified image data.
    return canvas;
  }
  
  /**
   * Extracts hidden data from an image using LSB steganography.
   * @param {HTMLImageElement} image - The image containing the hidden data.
   * @returns {string} - The extracted data as a string.
   *
   * Description:
   * This function extracts data hidden within the LSBs of an image using steganography.  It creates a canvas, draws the image onto it,
   * and accesses the pixel data.  It then iterates through the pixels, extracting the LSBs of the red, green, and blue color
   * components to reconstruct the hidden binary data.  The binary data is then converted back into a string.
   */
  export function extract(image) {
    // Create a canvas element to manipulate the image data.
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Extract the LSBs from the red, green, and blue components of each pixel.
    let binaryData = '';
    for (let i = 0; i < imgData.data.length; i += 4) {
      binaryData += (imgData.data[i] & 1).toString(); // Extract the LSB of the Red channel.
    }
  
    // Group the binary data into 8-bit bytes and convert them to decimal values.
    const byteData = binaryData.match(/.{8}/g).map(byte => parseInt(byte, 2));
  
    // Decode the byte data into a string using TextDecoder.
    return new TextDecoder().decode(new Uint8Array(byteData));
  }
  