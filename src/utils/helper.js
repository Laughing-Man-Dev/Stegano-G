/**
 * Helper Utility for Managing Steganography, Encryption, and Signing
 * 
 * Functions:
 * - stampSign(): Stamps and signs an image.
 * - stampEmbedSign(): Stamps, signs, and embeds a message with a password.
 * - stampEmbedSignDestination(): Stamps, signs, embeds with password, default message, and multiple receiver messages.
 * - embedAnonymous(): Embeds a message with password-only steganography.
 * - extractSign(): Extracts and verifies the signature from an image.
 * - extractUnique(): Extracts a message using the receiver's private key.
 * - extractAnonymous(): Extracts a message using a password only.
 */

import { stamp, encrypt, decrypt, embed, extract } from "./steganography.js";
import { sign, getPubkey } from "./keypairs.js";

export async function pubkey(){
    return getPubkey();
};


/**
 * Processes an image file and returns an HTMLImageElement once it's fully loaded.
 * 
 * @param {File} inputImage - The image file selected by the user.
 * @returns {Promise<HTMLImageElement>} - The loaded image element.
 */
export async function imageProcessing(inputImage) {
    // Get references to the file input and canvas
        //const fileInput = document.getElementById('fileInput');
        console.log(inputImage);
        const fileInput = inputImage;
        console.log(fileInput);
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        ctx.height = fileInput.height;
        ctx.width = fileInput.width;


        // Event listener for the file input change (when an image is uploaded)
        fileInput.addEventListener('change', handleFileSelect);

        // Function to handle file selection and drawing on the canvas
        function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();

            // When the file is read, draw the image on the canvas
            reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Draw the uploaded image onto the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw image to fit canvas
                
                // Add text on top of the image
                ctx.font = '30px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText('Hello, World!', 50, 50); // Example text at coordinates (50, 50)
            };
            img.src = e.target.result;
            };

            // Read the file as a Data URL
            reader.readAsDataURL(file);
        }
    }
};

export async function downloadImage(imageData) {
        if (imageData) {
          // Create a link element to trigger the download
          const link = document.createElement('a');
          link.download = 'canvas_image.png'; // Set the name of the downloaded file
          link.href = imageData;
          link.click(); // Programmatically click the link to download the image
        } else {
          alert('Please upload an image first!');
        }

}


///////////////////////////////////////////////////

/**
 * Stamps and signs an image without embedding data.
 * @param {HTMLImageElement} image - The image to stamp and sign.
 * @returns {Promise<HTMLCanvasElement>} - The stamped and signed image.
 */
export async function stampSign(image) {
    const canvas = await stamp(image);
    //console.log(canvas);
    downloadImage(canvas.toDataURL(this))
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
    return extractedData; // Signature verification logic should be added here.
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
