import { pubkey, stampSign, 
    embedAnonymous, stampEmbedSign, stampEmbedSignDestination, 
    extractSign, extractAnonymous, extractUnique, imageProcessing, downloadImage } from "../utils/helper.js";
import { sign, keypairGen, keypairSave, keypairLoad, base58Encode} from "../utils/keypairs.js";
import { stamp } from "../utils/steganography.js";

document.addEventListener("DOMContentLoaded", function () {
// Views
    const mainMenu = document.getElementById("mainMenu");
    const keyManagementView = document.getElementById("keyManagementView");
    const embedView = document.getElementById("embedView");
    const extractView = document.getElementById("extractView");

// Buttons to navigate between views
    // Main Menu buttons
    const keyManagementBtn = document.getElementById("keyManagementBtn");
    const embedBtn = document.getElementById("embedBtn");
    const extractBtn = document.getElementById("extractBtn");
    // ADDITIONAL BUTTIONS [must have in html]
    // const INSERTNAMEBtn = document.getElementById("INSERTNAMEBtn");

    // Return buttons
    const backToMain1 = document.getElementById("backToMain1");
    const backToMain2 = document.getElementById("backToMain2");
    const backToMain3 = document.getElementById("backToMain3");
    // ADDITIONAL BUTTONS  [must have in html]
    //const backToMainINSERTNUMBER = document.getElementById("backToMainINSERTNUMBER");

    // Switch current view.
    function switchView(viewToShow) {
        document.querySelectorAll(".view").forEach(view => view.style.display = "none");
        viewToShow.style.display = "block";
    }

// Event listeners for navigation
    // Switch to Key Management view.
    keyManagementBtn.addEventListener("click", function () {
        switchView(keyManagementView);
    });
    // Switch to Embed view.
    embedBtn.addEventListener("click", function () {
        switchView(embedView);
    });
    // Switch to Extract view. 
    extractBtn.addEventListener("click", function () {
        switchView(extractView);
    });
    // FOR ADDITIONAL VIEWS
    // Switch to INSERTNAME view. 
    // INSERTNAMEBtn.addEventListener("click", function () {
    //     switchView(INSERTNAMEView);
    // });

    // Back to main menu
        backToMain1.addEventListener("click", function () {
            switchView(mainMenu);
        });
        backToMain2.addEventListener("click", function () {
            switchView(mainMenu);
        });
        backToMain3.addEventListener("click", function () {
            switchView(mainMenu);
        });
        // FOR ADDITOANL VIEWS
        // backToMainINSERTNUMBER.addEventListener("click", function () {
        //     switchView(mainMenu);
        // });


// Key Management Functions (Placeholder for now)
    var keypair = null;     
    var publicKey = null;

    // Generate keypair.
    document.getElementById("generateKey").addEventListener("click", function () {
        keypair = keypairGen()
        alert("Saved in cache Save Key to keep.");
        return keypair;
    });
    // Load keypair to web extension.
    document.getElementById("loadKey").addEventListener("click", function () {
        const fileInput = document.getElementById('privateKeyUpload');
        const file = fileInput.files[0];
        if (file) {
          // Handle the file upload logic here
          console.log('Selected file:', file);
          keypairLoad(file); // .json file
          keypair = file;
          alert("Loading KeyPair");
          return keypair;
        } else {
          alert('Please upload a file.');
        }
    
    });
    // Save keypair.
    document.getElementById("saveKey").addEventListener("click", function () {
        let savekeypair = keypairSave();
        console.log(savekeypair);
        alert("Downloading keypair: " + savekeypair);
        // return savekeypair;
    });
    // Show current key. Used to get public key [stamp, share etc.]
    document.getElementById("showInUseKey").addEventListener("click", async function () {
        publicKey = await pubkey();
        const elements = document.getElementsByClassName("publicKey");
        elements.innerHTML = publicKey;
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = publicKey;
          }
        console.log(publicKey);
        // alert("Show In-Use Key function to be implemented!");
        return publicKey;
    });

// Embed Functions (Placeholder)
    // Get Image input from HTML
    const imageInput = document.getElementById("imageInput")
    // Get Canvas from HTML
    const canvasOut = document.getElementById("myCanvas");
        
        // Event listener for status change and image processing to canvas Returns Canvas
    imageInput.addEventListener("change", async function () {
            // Pass input and canvas to imageProcessing
        let returnValue = imageProcessing(imageInput);
        console.log("Updating for image change.");
        console.log(imageInput);
        console.log(canvasOut);
        return await returnValue;
    });
    // Get password input field 
    const passphrase = document.getElementById("password");
        // Event listener for status change
    passphrase.addEventListener("change",this.onchange);
    // Get message input field
    const messageIn = document.getElementById("message");
        // Event listener for status change
    messageIn.addEventListener("change",this.onchange);

// Sign the content [images currently] with your private key
    document.getElementById("sign").addEventListener("click", async function () {
        alert("SignOnly function to be implemented!");
        let x = await sign(imageInput);
        console.log(base58Encode(x));
    });
// Stamp the content [images currently] with your public key 
    document.getElementById("stamp").addEventListener("click", async function () {
        alert("Stamp Only function in progress");
        let i = await imageProcessing(imageInput)
        console.log(i);
        let r = await stamp(i);
        console.log(r); 
        return await downloadImage(r.toDataURL(this));
    });
// Stamp the content [images currently] with your public key & sign with your private key.
    document.getElementById("stampSign").addEventListener("click", async function () {
        
        alert("Stamp + Sign function to be implemented!");
        let i = await imageProcessing(imageInput);
        //console.log(i);
        let r = await stampSign(i);
        console.log(r);
        return await downloadImage(r.toDataURL(this)); 
    });
// Stamp the content [images currently] with your public key & sign with your private key, and 
    // use steganography to embed a message sealed with a password.
    document.getElementById("stampEmbed").addEventListener("click", async function () {
        alert("Stamp + Sign + Embed function to be implemented!");
        let i = await imageProcessing(imageInput);
        console.log(i);
        let r = await stampEmbedSign(i, messageIn, passphrase);
        console.log(r);
        downloadImage(r.toDataURL(this));
    });
// Stamp the content [images currently] with your public key & sign with your private key, and 
    // use steganography to embed a message sealed with a password. Also allow for 
    // multiple message(s) with an intended reciever(s) for each. Can only be extracted 
    // with the private key of the receiver(s)
    document.getElementById("stampEmbedReceivers").addEventListener("click", async function () {
        alert("Stamp + Sign + Embed + Receivers function to be implemented!");
// USING TEMP DATA
        const defaultMessage = "Nothing to see here, guess this was not for you.";
        const receiverList = [
            // key1: program/testing/testing_keys/8YrW23---eJ8bzv.json
            "8YrW23vqyzA6f95q6a94yCVDW7kTM1gbqEkAhg9jcmCoQCWGRnJqwBowpZeKpyE6f4jwWAjciW4uTTsPZUfW8s8XqAP5dtiT5Sq14wfrRZgtsi2JnJ6RGjzomZnTsreJ8bzv",
            // key2: program/testing/testing_keys/79yQ2U---HAmrKm.json
            "79yQ2Ud3y7Y1V1gvTreWRVp8wsABE9NALqodmQqozSpdU6RxEVvoTpYiGEy6y6XPtJp6wZr5nVGKVWkcNj3PPyPay5UoecrgJtGPZfuS6BPncuuPdZRKKkhaMFHp82HAmrKm",
            // key3: program/testing/testing_keys/8WXtwt---iZr4XH.json
            "8WXtwtcDkBL5ubSEg7CREHj4ZCrtUbZfHwRVVp39E27mS91NXQC9somHbYdLTJjz4uYr7vDfAdjPPsvEvGpL4uo3bFkU13NAm8YLaTEEe7XVTNUqUnK8L3gfVEgFUeiZr4XH"
        ];
//
        let i = await imageProcessing(imageInput);
        let r = await stampEmbedSignDestination(i, messageIn, passphrase, defaultMessage, receiverList);
        downloadImage(r.toDataURL(this));
    });




// Extract Functions (Placeholder)
    // Uploaded image to check for extractable contents
    const imageInputExtract = document.getElementById("imageInputExtract");
    // Password field
    const passwordExtract = document.getElementById("passwordExtract");
    // Signer public key field
    const signerPub = document.getElementById("signerPub");
    // Reciever private key field. [Check from stored key in the future]
    const privKey = document.getElementById("privKey");
    // Output field
    const textOutput = document.getElementById("textOutput");



    // Extract the signature from uploaded content [images currently]. Verify a signature
    document.getElementById("extractSign").addEventListener("click", function () {
        alert("Extract Signature function to be implemented!");
        return extractSign(imageInputExtract);  // returns extracted signature.
    });
    // Extract a hidden file from uploaded content. 
    document.getElementById("extractPassword").addEventListener("click", function () {
        alert("Extract Password + Message function to be implemented!");
        extractAnonymous(imageInputExtract, passwordExtract); // returns decrypted string.
    });
    // Extract a hidden file for specific destination key.
    document.getElementById("extractPrivateKey").addEventListener("click", function () {
        alert("Extract Password + Message + Private Key function to be implemented!");
        extractUnique(imageInputExtract, privKey)
    });

    // Default View
    switchView(mainMenu);
});
























// // Wait until the DOM is fully loaded before running script
// // Ensures all elements are accessible

// document.addEventListener("DOMContentLoaded", function () {
//     // DOM element references
//     const imageInput = document.getElementById("imageInput");
//     const messageInput = document.getElementById("message");
//     const passwordInput = document.getElementById("password");
//     const stampSignBtn = document.getElementById("stampSign");
//     const stampEmbedSignBtn = document.getElementById("stampEmbedSign");
//     const extractBtn = document.getElementById("extract");
//     const outputCanvas = document.getElementById("outputCanvas");
//     const outputText = document.getElementById("outputText");
//     const downloadBtn = document.getElementById("downloadImage");

//     let selectedImage = null; // Holds the currently loaded image

//     /**
//      * Handles image selection and loads it into memory
//      */
//     imageInput.addEventListener("change", function (event) {
//         const file = event.target.files[0]; // Get the selected file
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function (e) {
//                 const img = new Image();
//                 img.onload = function () {
//                     selectedImage = img; // Store loaded image
//                 };
//                 img.src = e.target.result; // Set image source from file
//             };
//             reader.readAsDataURL(file); // Read file as data URL
//         }
//     });

//     /**
//      * Stamps and signs the selected image
//      */
//     stampSignBtn.addEventListener("click", async function () {
//         if (!selectedImage) {
//             alert("Please select an image first.");
//             return;
//         }
//         const stampedCanvas = await stampSign(selectedImage); // Process image
//         outputCanvas.getContext("2d").drawImage(stampedCanvas, 0, 0); // Display processed image
//     });

//     /**
//      * Stamps, signs, and embeds a message into the selected image
//      */
//     stampEmbedSignBtn.addEventListener("click", async function () {
//         if (!selectedImage) {
//             alert("Please select an image first.");
//             return;
//         }
//         const message = messageInput.value.trim(); // Get user message
//         const password = passwordInput.value.trim(); // Get password input
//         if (!message || !password) {
//             alert("Enter both message and password.");
//             return;
//         }

//         const processedCanvas = await stampEmbedSign(selectedImage, message, password); // Embed message
//         outputCanvas.getContext("2d").drawImage(processedCanvas, 0, 0); // Display result
//     });

//     /**
//      * Extracts a hidden message from the selected image
//      */
//     extractBtn.addEventListener("click", async function () {
//         if (!selectedImage) {
//             alert("Please select an image first.");
//             return;
//         }
//         const password = passwordInput.value.trim(); // Get password input
//         if (!password) {
//             alert("Enter a password.");
//             return;
//         }

//         try {
//             const extractedMessage = await extractAnonymous(selectedImage, password); // Extract message
//             outputText.textContent = `Extracted Message: ${extractedMessage}`;
//         } catch (error) {
//             outputText.textContent = "Failed to extract message."; // Handle errors
//         }
//     });

//     /**
//      * Downloads the processed image from the canvas
//      */
//     downloadBtn.addEventListener("click", function () {
//         if (!outputCanvas) {
//             alert("No image available to download.");
//             return;
//         }
//         const link = document.createElement("a");
//         link.download = "processed_image.png";
//         link.href = outputCanvas.toDataURL("image/png");
//         link.click();
//     });
// });
