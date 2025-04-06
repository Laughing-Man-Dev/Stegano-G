/**
 * Helper Utility for Managing Steganography, Encryption, and Signing
 * 
 * Functions:
 * Utility
 * - pubkey(): Encodes the public to to base58.
 * - writeMessageOutput(): writes return value to the HTML div ID.
 * Embed
 * - signature(): NEEDS TO BE ADDED TO THIS LIB.
 * - stampPublicKey(): NEEDS TO BE ADDED TO THIS LIB.
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
import { encrypt, decrypt, embed, extract } from "./steganography.js";
import { sign, getPubkey, base58Encode } from "./keypairs.js";
// Not yet implemented imports
import {uploadImage, saveImage} from "./imageLoading.js";
import {overlayText, overlayImage, displayUpdate} from "./imageOverlay.js";


/**
 * Returns a base58 encoded public key. 
 * Asks for the Public key from the keypair in memorey. 
 * @returns {string} - The base58 encoded public key.
 */
export async function pubkey() {
    return base58Encode(await getPubkey());
}

/**
 * Write text to output message box.
 * @param {HTMLElement} elementID - The ID of the field. Var_Name = document.getElementByID("ELEMENTNAME")
 * @param {string} msg - the message content to be written in the element
 * @returns {Promise<HTMLElement>} - The updated element context.
 */
export async function writeMessageOutput(elementID, msg){
    const elements = elementID;
    elements.innerHTML = msg;
    for (let i = 0; i < elements.length; i++) {
    elements[i].innerHTML = msg;
    }
    return elements;
}

/**
 * Signs an image with the active private key as the native keypair.privatekey. 
 * @param {HTMLElement} inputFile - The image to sign.
 * @returns {Promise<string>} - The base58 encoded signature output. 
 */
export async function signature(inputFile){
    let signResults = await sign(inputFile);
    console.log("Signature in Crypto.Keypair.Private: " + signResults)
    let base58Results = base58Encode(signResults);
    console.log("Signature base58 output: " + base58Results)
    return base58Results; // , signResults;  // maybe return both values?
}

/**
 * Stamps an image with the in use public key as base58 output.
 * @param {HTMLCanvasElement} image - canvas in the uploaded file.
 * @param {string} text - By default calls pubkey() to get the active public key in base58.
 * @returns {HTMLCanvasElement} - Returns a canvas element with the changes. 
 */
export async function stampPublicKey(image, text) {
    //text = pubkey();
    //const text = await pubkey();
    console.log("text to be stamped: " + text)
    let canvas = image;
    console.log("uploaded image: " + image);
    canvas = overlayText(text);
    console.log("current canvas: " + canvas);
    return canvas;
    saveImage();
}



/**
 * Stamps and signs an image without embedding data.
 * @param {HTMLImageElement} image - The image to stamp and sign.
 * @returns {Promise<HTMLCanvasElement>} - The stamped and signed image.
 */
export async function stampSign(image) {
    let publicKey = pubkey();
    const canvas = stampPublicKey(image, publicKey);
    let signOutput = signature(canvas);
    console.log(signOutput);
    return canvas;
    saveImage();
}

/**
 * Stamps, signs, and embeds a message with a password.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} password - The password for encryption.
 * @param {string} message - The message to embed.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 */
export async function stampEmbedSign(image, password, message) {
    const canvas = stampPublicKey();
    console.log("Active Canvas" + canvas);
    const encryptedMessage = await encrypt(message, password);
    console.log("The encrypted message: " + encryptedMessage);
    let r = embed(canvas, encryptedMessage);
    console.log("embeded results: " + r)
    signOut = signature(r) // signature output in base58

    return r, signOut;
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
    const canvas = await stampPublicKey(image);
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
