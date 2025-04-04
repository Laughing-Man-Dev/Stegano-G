import {
    pubkey, stampSign,
    embedAnonymous, stampEmbedSign, stampEmbedSignDestination,
    extractSign, extractAnonymous, extractUnique
} from "../utils/helper.js";
import { uploadImage, saveImage } from "../utils/imageLoading.js";
import { overlayText, displayUpdate } from "../utils/imageOverlay.js";
import { sign, keypairGen, keypairSave, keypairLoad, base58Encode } from "../utils/keypairs.js";
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


/* Key Management Functions (Placeholder for now)
    * 
    */
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

/** Embed Functions 
 * 
 */
    // Get File [image] input field from HTML
    const imageInput = document.getElementById("imageInput")
    // Get Canvas from HTML
    var myCanvas = document.getElementById("myCanvas");
    //Event listener for status change in file upload. 
    imageInput.addEventListener("change", uploadImage)
    // Get password input field 
    const passphrase = document.getElementById("password");
    // Event listener for status change.
    passphrase.addEventListener("change", this.onchange);
    // Get message input field
    const messageIn = document.getElementById("message");
    // Event listener for status change.
    messageIn.addEventListener("change", this.onchange);
    // Output message field for the sign output.
    const embedTextOutput = document.getElementById("embedTextOutput");


    // Sign the content [images currently] with your private key.
    document.getElementById("sign").addEventListener("click", async function () {
        alert("SignOnly implemented as: working.");
        let x = await sign(imageInput);
        let r = base58Encode(x);
        console.log(r);
        // write sign message to message box [Add other features]
        const elements = embedTextOutput;
        elements.innerHTML = r;
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = r;
        }
    });
    // Stamp the content [images currently] with your public key.
    document.getElementById("stamp").addEventListener("click", async function () {
        alert("Stamp Only function in progress");
        console.log(myCanvas)
        myCanvas = overlayText(publicKey, 0, 0)
        console.log(myCanvas);
        //console.log(i);
        displayUpdate(myCanvas);
        saveImage();
    });
    // Stamp the content [images currently] with your public key & sign with your private key.
    document.getElementById("stampSign").addEventListener("click", async function () {
        alert("Stamp + Sign function to be implemented!");
        let r = await stampSign(imageInput);
        return r;
    });
    // Stamp the content [images currently] with your public key & sign with your private key, and 
    // use steganography to embed a message sealed with a password.
    document.getElementById("stampEmbed").addEventListener("click", async function () {
        alert("Stamp + Sign + Embed function to be implemented!");
        let r = await stampEmbedSign(imageInput, messageIn, passphrase);
        return r;
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
        await stampEmbedSignDestination(imageInput, messageIn, passphrase, defaultMessage, receiverList);
    });

/** Extract Functions (Placeholder)
 * 
 */
    // Uploaded image to check for extractable contents
    const imageInputExtract = document.getElementById("imageInputExtract");
    // Password field
    const passwordExtract = document.getElementById("passwordExtract");
    // Signer public key field
    const signerPub = document.getElementById("signerPub");
    // Reciever private key field. [Check from stored key in the future]
    const privKey = document.getElementById("privKey");
    // Signature output field
    const signTextOutput = document.getElementById("signTextOutput");
    // Output password message field
    const extractTextOutput = document.getElementById("extractTextOutput");
    // Output Private message field
    const extractPrivTextOutput = document.getElementById("extractPrivTextOutput");

    // Extract the signature from uploaded content [images currently]. Verify a signature
    document.getElementById("extractSign").addEventListener("click", function () {
        alert("Extract Signature function to be implemented!");
        let r = extractSign(imageInputExtract);  // returns extracted signature.
        // write signature to message box
        const elements = signTextOutput;
        elements.innerHTML = r;
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = r;
        }
        return r;
    });
    // Extract a hidden file from uploaded content. 
    document.getElementById("extractPassword").addEventListener("click", function () {
        alert("Extract Password + Message function to be implemented!");
        let r = extractAnonymous(imageInputExtract, passwordExtract); // returns decrypted string.
        // write password extracted message to message box
        const elements = extractTextOutput;
        elements.innerHTML = r;
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = r;
        }
        return r;
    });
    // Extract a hidden file for specific destination key.
    document.getElementById("extractPrivateKey").addEventListener("click", function () {
        alert("Extract Password + Message + Private Key function to be implemented!");
        let r = extractUnique(imageInputExtract, privKey); // returns the extracted message if it exists. 
        // write sign message to message box
        const elements = extractPrivTextOutput;
        elements.innerHTML = r;
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerHTML = r;
        }
        return r;
    });

    // Default View
    switchView(mainMenu);
});
