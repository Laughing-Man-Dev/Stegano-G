/**
 * Helper Utility for Managing Steganography, Encryption, and Signing
 * 
 * Functions:
 * Utility
 * - pubkey(): Encodes the public to to base58.
 * - writeMessageOutput(): Writes return value to the HTML div ID.
 * - dispalySave(): Updates the currently active display and saves the current image in canvasOverlay/finalCanvas.
 * Embed
 * - signature(): Uses the crypto.subtle.sign() function and returns base58 output
 * - stampPublicKey(): Stamps the public key on an image.
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
// import { sign, verify, 
//     getPrivkeySigning, getPrivkeyEncryption, 
//     getPubkeySigning, getPubkeyEncryption, 
//     fingerprintPubKeySign, signFingerprint, verifyFingerprint,
//     fingerprintPubKeyEncrypt, base58Encode
//  } from "./keyManagement.js";

import { Keys, SigningKeys, EncryptionKeys, Fingerprints } from "./keyManagementClassRebase.js";
import { saveImage } from "./imageLoading.js";
// overlayImage not yet implemented. 
import { overlayText, overlayImage, displayUpdate, createOverlay } from "./imageOverlay.js";
import { base58Encode } from "./keyManagement.js";

/**
 * Write text to output message box.
 * @param {HTMLElement} elementID - The ID of the field. Var_Name = document.getElementByID("ELEMENTNAME")
 * @param {string} msg - the message content to be written in the element
 * @returns {Promise<HTMLElement>} - The updated element context.
 */
export async function writeMessageOutput(elementID, msg) {
    // Sets elements to the ID given as param
    const elements = elementID;
    // Writes message/text to the html
    elements.innerHTML = msg;
    console.log("Writing in HTML: " + msg);
    // types out each letter
    for (let i = 0; i < elements.length; i++) {
        elements[i].innerHTML = msg;
    }
    // returns the new element
    return elements;
    // dont think there is a need for the return anymore now that we have moved it out of popup...
}

/** More decriptive name PLEASE
 * Combines the save and display update functions for use in popup.js
 * Ensures you are saving and showing the same canvas. 
 * @param {HTMLCanvasElement} canvasToSave 
 */
export async function displaySave(canvasToSave) {
    // Calls displayUpdate and uses the parameters passed for the canvas to display.
    await displayUpdate(canvasToSave);
    console.log("new canvas: " + canvasToSave);
    // Calls saveImage and provides the parameter canvas as a image.png download. 
    await saveImage(canvasToSave);
    console.log("Saving image: " + canvasToSave);
}

/**
 * Signs an image with the active private key as the native keypair.privatekey. 
 * @param {HTMLElement} inputFile - The image to sign.
 * @param {SigningKeys} signingKeys
 * @returns {Promise<Uint8Array>} - Uint8Array signature output. 
 */
export async function signature(inputFile, signingKeys){
    let b = new Uint8Array(inputFile);
    // Takes the input file [images currently] and signs using crypto.subtle.sign() returns Array8Byte
    let signOutput = await signingKeys.sign(b); //Returns Uint8Array
    // Converts the results to a human readable base64 encoding.
    let base64SignOutput = await signingKeys.arrayBufferToBase64(signOutput);
    console.log(base64SignOutput); // base64
    console.log(signOutput); // Uint8Array
    //for now return
    return base64SignOutput; // signOutput; Uint8Array
}



/**
 * EMBED & SIGN FUNCTIONS
 * These fucntions are used to either embed or sign a content [image].
 * Each return value should be at least a canvas and any other return value. 
 */

/**
 * Stamps an image with the in use public key as base58 output.
 * @returns {HTMLCanvasElement} - Returns a canvas element with the changes.
 * 
 */
export async function stampPublicKey() {
    // calls pubkey and returns a base58 public key.;
    let e = await fingerprintPubKeySign(new Uint8Array(signingPK));
    let text = base58Encode(e);
    
    console.log("text to be stamped: " + text);
    // Creates a canvas with the provided text [Public Key] overlayed. Based on the uploaded image. 
    let canvas = await overlayText(text);
    console.log("current canvas: " + canvas);
    // Returns the newly created canvas object.
    return canvas;
}
/**
 * Stamps an image with the in use public key as base64 output.
 * @param {SigningKeys|EncryptionKeys} keypair - keypair set.
 * @returns {HTMLCanvasElement} - Returns a canvas element with the changes. 
 * 
 * 
 *     if(keypair == SigningKeys) {
        text = await keypair.arrayBufferToBase64(this.getSignPublicKey()); // Base 64 output
        console.log("text to print" + text);
    }
    if(keypair == EncryptionKeys) {
        text = await keypair.arrayBufferToBase64(this.getEncryptPublicKey()); //Base 64 output
        console.log("text to print" + text);
    }
    else{
        Error("You did not provide a keypair"); 
        return;
    }
 * 
 * 
 * 
 * 
 */
export async function stamp(keypair) {
    let text;
    let spk = await keypair.exportPublicKey(keypair.signPublicKey);
    let x, _y;
    x = spk.x;
    //_y = spk.y;
    text = x; //+ _y;
    console.log("Stamp text: " + text);
    //text = await keypair.arrayBufferToBase64(new ArrayBuffer(keypair.publicKey));
    let canvas = await overlayText(text);
    console.log("current canvas: stamp(): " + canvas );
    return canvas;
}



/**
 * Stamps and signs an image without embedding data.
 * @param {SigningKeys|EncryptionKeys} keypair - Keypair set.
 * @returns {Promise<HTMLCanvasElement>} - The stamped and signed image.
 * @returns {Promise<string>} - The signed output of the canvas in base58.
 */
export async function stampSign(keypair) {
    // Calls stampPublicKey to return a newly created canvas object. Based on the uploaded image. 
    let canvas = await stamp(keypair);
    // Signs the new canvas and returns a base58 sign output string.
    let signOutput = await signature(canvas, keypair);
    console.log("signature output:" + signOutput);
    // Returns the new canvas object and the signed output text in base58.
    return [canvas, signOutput];
}

/**
 * Stamps, signs, and embeds a message with a password into the image. 
 * @param {string} password - The password for encryption.
 * @param {string} message - The message to embed.
 * @param {SigningKeys|EncryptionKeys} keypair - Keypair set.
 * @returns {Promise<HTMLCanvasElement>} - The final processed image.
 * @returns {Promise<string>} - The signed output of the final image in base58. 
 */
export async function stampEmbedSign(password, message, keypair) {
    // Calls stampPublicKey to return a newly created canvas object. Based on the uploaded image. 
    let canvas = await stamp(keypair);
    console.log("Active Canvas" + canvas);
    // Encrypts the message using the password and returns a base64 encoded string.
    const encryptedMessage = await encrypt(message, password);
    console.log("The encrypted message: " + encryptedMessage);
    // Embeds the encrypted message into the data of the created canvas, 
    // returns a new canvas containing the embedded data and the OG image.
    let finalCanvas = await embed(canvas, encryptedMessage);
    console.log("embeded result canvas: " + finalCanvas);
    // Signs the new canvas and returns a base58 sign output string.
    let signOutput = await signature(finalCanvas, keypair); // Signature output in base58
    // Returns the finalCanvas and the sign message output.
    return [finalCanvas, signOutput];
}

/**
 * Stamps, signs, and embeds a message for multiple receivers.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} password - The password for encryption.
 * @param {SigningKeys|EncryptionKeys} keypair 
 * @param {string} defaultMessage - The default message for password-only access.
 * @param {Array<{pubkey: string, message: string}>} recipients - List of recipient public keys and messages.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 * @returns {Promise<string>} - The signed output in base58.
 * 
 * Change order of operations: stamp, encrypt, embed, then sign final canavs output.  
 * Not exactly correct at this current time. The messages for each destination is no different it is 
 * using the current encrypted default message for each reciever. 
 * Allow for config/json file to upload / 
 * NEW FUNCTIONALITY: create download tool where you enter pubkeys of your [TEAM] and it gives you a 
 * formated output and then you can update with unique messages for each reciever. 
 */
export async function stampEmbedSignDestination(image, password, keypair, defaultMessage, recipients) {
    // Calls stampPublicKey to return a newly created canvas object. Based on the uploaded image.
    const canvas = await stamp(keypair);
    console.log("Active Canvas" + canvas);
    // Encrypts the default message using the password and returns a base64 encoded string.
    const encryptedDefault = await encrypt(defaultMessage, password);
    console.log("The encrypted message: " + encryptedDefault)
    // Not implemented correctly:
    // Currently: takes recipient array and gives them all the same signed default message 
    // this is incorrect behavior
    // The message should be in the passed over recipients list 
    // Intended: take recipient array containing unique messages for each reciever. 
    // pubkey: "KEYABCDEFG1234567890XYZ12" message: "Uniques message for reciever[i]"
    // pubkey: "KEYABCDEFG1234567890XYZ123" message: "Uniques message for reciever[i+1]"
    // pubkey: "KEYABCDEFG1234567890XYZ1234" message: "Uniques message for reciever[i+2]"
    let embeddedData = { default: { message: encryptedDefault }, recipients: [] };
    console.log("The embedded data" + embeddedData);
    // This function should work for the future and getting the unique messages via recipient.message[i] into the file.
    for (const recipient of recipients) {
        const encryptedMessage = await encrypt(recipient.message, recipient.pubkey);
        embeddedData.recipients.push({ pubkey: recipient.pubkey, message: encryptedMessage });
        console.log("Encrypted with pubkey: " + recipient.pubkey);
        console.log("Message placed in image: " + recipient.message);
    }
    // Creates the final canvas by embedding the totality of the data into a new canvas,
    console.log("Returning the following values: ");
    const finalCanvas = await embed(canvas, JSON.stringify(embeddedData));
    // Signs the new canvas and returns a base58 sign output string.
    let signOutput = await signature(finalCanvas, keypair); // Signature output in base58
    console.log("The embeded canvas: " + finalCanvas);
    console.log("The signature output: " + signOutput);
    // Returns the finalCanvas and the sign message output.
    return [finalCanvas, signOutput];
}

/**
 * Embeds a message using password-only steganography.
 * @param {HTMLImageElement} image - The image to modify.
 * @param {string} message - The message to embed.
 * @param {string} password - The password for encryption.
 * @returns {Promise<HTMLCanvasElement>} - The processed image.
 */
export async function embedAnonymous(image, message, password) {
    console.log("The image: " + image);
    console.log("The message: " + message);
    console.log("The password: " + password);
    let canvas = image;
    canvas = await createOverlay();
    console.log("Created overlay canvas for embedding message");
    const encryptedMessage = await encrypt(message, password);
    console.log("The encrypted message embeded in the canvas: " + encryptedMessage);
    return await embed(canvas, encryptedMessage);
}

/**
 * EXTRACT FUNCTIONS
 * These functions extract data and return a value in plain text for the user to read. 
 */

/**
 * Extracts and verifies a signature from an image.
 * @param {HTMLImageElement} image - The image containing a signed message.
 * @returns {Promise<string>} - The extracted signature.
 * 
 * Currently not implemented as intended as the sign 
 * is only generated not attached to the actual image. 
 * So it cannot be extracted from the image currently.
 */
export async function extractSign(image) {
    console.log("Your image file: " + image);
    const extractedData = await extract(image);
    // Signature verification logic should be added here. Returning a TRUE valid or FALSE invalid statement.
    return extractedData;
}

/**
 * Extracts a message using the receiver's private key.
 * @param {HTMLImageElement} image - The image containing the hidden message.
 * @param {string} privateKey - The receiver's private key for decryption.
 * @returns {Promise<string>} - The extracted message.
 */
export async function extractUnique(image, privateKey) {
    console.log("Your image file: " + image);
    console.log("Your privateKey input: " + privateKey);
    const extractedData = await extract(image);
    console.log("The extracted data: " + extractedData);
    const dataObject = JSON.parse(extractedData);
    console.log("The data object to be read:" + dataObject)
    for (const recipient of dataObject.recipients) {
        if (recipient.pubkey === privateKey) {
            console.log("Checking to see if you key matches an output.");
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
    console.log("Your image file: " + image);
    console.log("Your password input: " + password);
    const extractedData = await extract(image);
    console.log("The extracted data: " + extractedData);
    console.log(typeof extractedData);
    //const dataObject = JSON.parse(extractedData);
    const dataObject = new Uint8ClampedArray(extractedData)
    
    console.log("The data object to be read: " + dataObject);
    console.log(typeof dataObject); 
    return await decrypt(dataObject.default.message, password);
}
