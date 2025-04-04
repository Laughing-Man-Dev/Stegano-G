/**
 * Helper Utility for Managing Steganography, Encryption, and Signing
 * 
 * Functions:
 * Utility
 * - pubkey(): Encodes the public to to base58.
 * - writeMessageOutput(): writes return value to the HTML div ID.
 * Embed
 * - sign(): NEEDS TO BE ADDED TO THIS LIB.
 * - stamp(): NEEDS TO BE ADDED TO THIS LIB.
 * - stampSign(): Stamps and signs an image.
 * - stampEmbedSign(): Stamps, signs, and embeds a message with a password.
 * - stampEmbedSignDestination(): Stamps, signs, embeds with password, default message, and multiple receiver messages.
 * - embedAnonymous(): Embeds a message with password-only steganography.
 * Extract
 * - extractSign(): Extracts and verifies the signature from an image.
 * - extractUnique(): Extracts a message using the receiver's private key.
 * - extractAnonymous(): Extracts a message using a password only.
 */

// Imports from utils folder
import { stamp, encrypt, decrypt, embed, extract } from "./steganography.js";
import { sign, getPubkey, base58Encode } from "./keypairs.js";
// Not yet implemented imports
import {uploadImage, saveImage} from "./imageLoading.js";
import {overlayText, overlayImage, displayUpdate} from "./imageOverlay.js";


// Returns a base58 encoded public key. 
// Asks for the Public key from the keypair in memorey. 
export async function pubkey() {
    return base58Encode(await getPubkey());
}

/**
 * Write text to output message box
 * Currently not in use for repeatitive function in poopup.js
 * @param {HTMLElement} textOutput - The ID of the field. textOutput = document.getElementByID("ELEMENTNAME")
 * @returns {Promise<HTMLElement>} - The updated element context.
 */
export async function writeMessageOutput(textOutput){
    const elements = textOutput;
    elements.innerHTML = r;
    for (let i = 0; i < elements.length; i++) {
    elements[i].innerHTML = r;
    }
    return elements;
}

/**
 * Signs an image with the active private key as the native keypair.privatekey. 
 * @param
 * @returns
 */

/**
 * Stamps an image with the in use public key as base58 output.
 * @param
 * @returns
 */

/**
 * Stamps and signs an image without embedding data.
 * @param {HTMLImageElement} image - The image to stamp and sign.
 * @returns {Promise<HTMLCanvasElement>} - The stamped and signed image.
 */
export async function stampSign(image) {
    const canvas = await stamp(image);
    return canvas;
}

/**
 * Stamps, signs, and embeds a message with a password.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} message - The message to embed.
 * @param {string} password - The password for encryption.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 */
export async function stampEmbedSign(image, message, password) {
    const canvas = await stamp(image);
    const encryptedMessage = await encrypt(message, password);
    return embed(canvas, encryptedMessage);
}

/**
 * Stamps, signs, and embeds a message for multiple receivers.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} password - The password for encryption.
 * @param {string} defaultMessage - The default message for password-only access.
 * @param {Array<{pubkey: string, message: string}>} recipients - List of recipient public keys and messages.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 */
export async function stampEmbedSignDestination(image, password, defaultMessage, recipients) {
    const canvas = await stamp(image);
    const encryptedDefault = await encrypt(defaultMessage, password);
    const signedDefault = await sign(encryptedDefault);

    let embeddedData = { default: { message: signedDefault }, recipients: [] };
    for (const recipient of recipients) {
        const encryptedMessage = await encrypt(recipient.message, recipient.pubkey);
        embeddedData.recipients.push({ pubkey: recipient.pubkey, message: encryptedMessage });
    }

    return embed(canvas, JSON.stringify(embeddedData));
}

/**
 * Embeds a message using password-only steganography.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} message - The message to embed.
 * @param {string} password - The password for encryption.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 */
export async function embedAnonymous(image, message, password) {
    const encryptedMessage = await encrypt(message, password);
    return embed(image, encryptedMessage);
}

/**
 * Extracts and verifies a signature from an image.
 * @param {HTMLImageElement} image - The image containing a signed message.
 * @returns {Promise<string>} - The extracted signature.
 */
export async function extractSign(image) {
    const extractedData = extract(image);
    // Signature verification logic should be added here.
    return extractedData; 
}

/**
 * Extracts a message using the receiver's private key.
 * @param {HTMLImageElement} image - The image containing the hidden message.
 * @param {string} privateKey - The receiver's private key for decryption.
 * @returns {Promise<string>} - The extracted message.
 */
export async function extractUnique(image, privateKey) {
    const extractedData = extract(image);
    const dataObject = JSON.parse(extractedData);
    for (const recipient of dataObject.recipients) {
        if (recipient.pubkey === privateKey) {
            return await decrypt(recipient.message, privateKey);
        }
    }
    console.log("No matching message found for the provided private key.")
    throw new Error("No matching message found for the provided private key.");
}

/**
 * Extracts a message using only the password.
 * @param {HTMLImageElement} image - The image containing the hidden message.
 * @param {string} password - The password for decryption.
 * @returns {Promise<string>} - The extracted message.
 */
export async function extractAnonymous(image, password) {
    const extractedData = extract(image);
    const dataObject = JSON.parse(extractedData);
    return await decrypt(dataObject.default.message, password);
}
