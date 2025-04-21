import {
writeMessageOutput, displaySave, // Helper functions.
signature, // use the one in SigningKeys?
stamp, stampSign, stampEmbedSign, stampEmbedSignDestination, 
embedAnonymous, extractAnonymous, 
extractSign, extractUnique, 
} from "../utils/helperRebase.js";
import { uploadImage, saveImage, uploadImageExtract } from "../utils/imageLoading.js";
import { base58Encode } from "../utils/keyManagement.js";
import { Keys, KeyManager, SigningKeys, EncryptionKeys, Fingerprints} from "../utils/keyManagementClassRebase.js"


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
    var signingkeys= null; //USE: = new SigningKey(keypair);
    var encryptionkeys= null; //USE: = new EncryptionKey(keypair);
    var keyManager; //USE: = new KeyManager(signingkeys, encryptionkeys);  //new KeyManager(new SigningKeys(), new EncryptionKeys())

    // Generate keypairs.
    document.getElementById("generateKey").addEventListener("click", async function () {
        console.log("Generating New Keys.");
        keyManager = new KeyManager(null, null); // sets KeyManager to null so new keys will be generated.
// leave await calls for console.log testing.
    // Signing
        let r = await new SigningKeys(); // auto generates the value if null 
        console.log("Sign keys Generated: " + r);
        signingkeys = await new SigningKeys(r);
        // console.log("Sign keys keypair: " + signingkeys.signKeypair);
        // console.log("Sign key private: " + signingkeys.signPrivateKey);
        // console.log("Sign key public: " + signingkeys.signPublicKey);
    // Encyption
        let r2 = await new EncryptionKeys(); // auto generates the value if null
        console.log("Encrypt keys Generated: " + r);
        encryptionkeys = await new EncryptionKeys(r2);
        // console.log("Encrypt keys keypair: " + encryptionkeys.encryptKeypair);
        // console.log("Encrypt key private: " + encryptionkeys.encryptPrivateKey);
        // console.log("Encrypt key public: " + encryptionkeys.encryptPublicKey);
        signingkeys.
    // Assign KeyManager
        keyManager = new KeyManager(signingkeys,encryptionkeys)
        return {signingkeys, encryptionkeys, keyManager};
    });
    // Load keypair to web extension.
    document.getElementById("loadKey").addEventListener("click", async function () {
        const fileInput = document.getElementById('privateKeyUpload');
        const file = fileInput.files[0];
        let uploadedkeys;
        if (file) {
            // Handle the file upload logic here
            console.log('Selected file:', file);
            //let manageKeys = new KeyManager(null, null);
            alert("Loading KeyPair");
            uploadedkeys = new KeyManager(null,null);
            uploadedkeys = await uploadedkeys.keypairLoad(file);
            console.log("uploadkeys: ", uploadedkeys);
            signingkeys = new SigningKeys(uploadedkeys.SigningKeys);
            console.log(signingkeys);
            encryptionkeys = new EncryptionKeys(uploadedkeys.EncryptionKeys);
            console.log(encryptionkeys);
            alert("Saved in cache Save Key to keep.");
            keyManager = uploadedkeys;
            return {signingkeys, encryptionkeys, keyManager};
        } else {
            alert('Please upload a file.');
        }
    });
    // Save keypair.
    document.getElementById("saveKey").addEventListener("click", async function () {
        let savekeypair = new KeyManager(signingkeys, encryptionkeys);
        console.log(savekeypair);
        await savekeypair.keypairSave();
        console.log("keypair saved. upload to use in the future.");
        alert("Downloading keypair: " + savekeypair);
        await savekeypair.downloadPublicKeys();
        // return savekeypair;
    });
    // Show current key. Used to get public key [stamp, share etc.]
    // SOON TO UPTATE TO USE FINGER PRINT.
    document.getElementById("showInUseKey").addEventListener("click", async function () {
        let keyElement = document.getElementsByClassName("publicKey");
        console.log("Private key for signing: " + signingkeys.signPrivateKey);
        console.log("Private Key for encryption: " + encryptionkeys.encryptPrivateKey);
        console.log("Public key for signing: " +  signingkeys.signPublicKey);
        console.log("Public Key for encryption: " + encryptionkeys.encryptPublicKey);
        let sOut = await signingkeys.exportPublicKey();
        let eOut = await encryptionkeys.exportPublicKey();
        await writeMessageOutput(keyElement, "SIGNING PUBLIC KEY: " + sOut.x + sOut.y + 
        "<br>" + "<br>" +  "ENCRYPTION PUBLIC KEY: " + eOut.n );

        // alert("Show In-Use Key function to be implemented!");
    });

    /** Embed Functions 
     * 
     */
    // Get File [image] input field from HTML
    const imageInput = document.getElementById("imageInput")
    //Event listener for status change in file upload. 
    //imageInput.addEventListener("change", uploadImage(this.onchange, imageInput, myCanvas))
    // Get Canvas from HTML
    const myCanvas = document.getElementById("myCanvas");
    // Get password input field 
    var passphrase = document.getElementById("password");
    // Event listener for status change.
    //passphrase.addEventListener("change", onTextUpdate);
    // Get message input field
    var messageIn = document.getElementById("message");
    // Event listener for status change.
    //messageIn.addEventListener("change", onTextUpdate);
    // Output message field for the sign output.
    const embedTextOutput = document.getElementById("embedTextOutput");
    // The output canvas to write over the the OG image.
    var overlayCanvas = null;
    // The output of the signature in base58 output.
    var signatureOut = null;
    // Array to hold the outputs of multiple return values. 
    var returnArray = [overlayCanvas, signatureOut];

    //Event listener for status change in file upload. 
    imageInput.addEventListener("change", uploadImage)
  

    // Sign the content [images currently] with your private key.
    // sign logic needs to be updated but is working as intended to generate a sign message output text.
    document.getElementById("sign").addEventListener("click", async function () {
        //alert("SignOnly implemented as: working.");
        signatureOut = await signature(imageInput, signingkeys); // still needs updates. 
        // write sign message to message box [Add other features]
        await writeMessageOutput(embedTextOutput, signatureOut);
        console.log("End of sign() function.")
        return signatureOut;
    });
    // Stamp the content [images currently] with your public key.
    document.getElementById("stamp").addEventListener("click", async function () {
        //alert("Stamp Only implemented as: working as intended");
        overlayCanvas = await stamp(signingkeys);
        console.log("output canvas: " + overlayCanvas)
        await displaySave(overlayCanvas);
        console.log("End of stamp() function.")
    });
    // Embed a message in the content [image] 
    document.getElementById("anonEmbed").addEventListener("click", async function () {
        alert(":DO NOT USE: Anonymously Embed is not working as intended :DO NOT USE:");
        overlayCanvas = await embedAnonymous(imageInput, messageIn.value, passphrase.value);
        console.log("Message In: " + messageIn.value);
        console.log("Password used: " + passphrase.value);
        await displaySave(overlayCanvas);
        console.log("End of anonEmbed() function.")
    });
    // Stamp the content [images currently] with your public key & sign with your private key.
    document.getElementById("stampSign").addEventListener("click", async function () {
        //alert("Stamp + Sign function to be implemented!");
        [overlayCanvas, signatureOut] = await stampSign(signingkeys);
        writeMessageOutput(embedTextOutput, signatureOut)
        await displaySave(overlayCanvas);
        console.log("End of stampSign() function.")
    });
    // Stamp the content [images currently] with your public key & sign with your private key, and 
    // use steganography to embed a message sealed with a password.
    document.getElementById("stampEmbed").addEventListener("click", async function () {
        //alert("Working as intended")
        [overlayCanvas, signatureOut] = await stampEmbedSign(passphrase.value, messageIn.value, signingkeys);
        writeMessageOutput(embedTextOutput, signatureOut)
        await displaySave(overlayCanvas);
        console.log("End of stampEmbedSign() function.");
    });
    // ABOVE HERE IS STABLE 
    // Stamp the content [images currently] with your public key & sign with your private key, and 
    // use steganography to embed a message sealed with a password. Also allow for 
    // multiple message(s) with an intended reciever(s) for each. Can only be extracted 
    // with the private key of the receiver(s)
    document.getElementById("stampEmbedReceivers").addEventListener("click", async function () {
        alert("Working in therory. No UI for options to user at this point. Feeds preset data.");

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
        const keyMessage = [
            {
                pubkey: "8YrW23vqyzA6f95q6a94yCVDW7kTM1gbqEkAhg9jcmCoQCWGRnJqwBowpZeKpyE6f4jwWAjciW4uTTsPZUfW8s8XqAP5dtiT5Sq14wfrRZgtsi2JnJ6RGjzomZnTsreJ8bzv",
                message: "Message for key1"
            },
            {
                pubkey: "79yQ2Ud3y7Y1V1gvTreWRVp8wsABE9NALqodmQqozSpdU6RxEVvoTpYiGEy6y6XPtJp6wZr5nVGKVWkcNj3PPyPay5UoecrgJtGPZfuS6BPncuuPdZRKKkhaMFHp82HAmrKm",
                message: "message for key2"
            },
            {
                pubkey: "8WXtwtcDkBL5ubSEg7CREHj4ZCrtUbZfHwRVVp39E27mS91NXQC9somHbYdLTJjz4uYr7vDfAdjPPsvEvGpL4uo3bFkU13NAm8YLaTEEe7XVTNUqUnK8L3gfVEgFUeiZr4XH",
                message: "msg 4 key3"
            },
        ];
        //
        [overlayCanvas, signatureOut] = await stampEmbedSignDestination(imageInput, passphrase.value, defaultMessage, keyMessage);
        await writeMessageOutput(embedTextOutput, signatureOut)
        await displaySave(overlayCanvas);
        console.log("End of stampEmbedSignDestination() function.")
    });

    /** Extract Functions (Placeholder)
     * 
     */
    // Uploaded image to check for extractable contents
    const imageInputExtract = document.getElementById("imageInputExtract");
    //Event listener for status change in file upload. 
    imageInputExtract.addEventListener("change", uploadImageExtract);
    // Canvas to manipulate. A div element of canvas call the image element to use.
        // Use extractCanvas.imageCanvas
    const extractCanvas = document.getElementById("extractCanvas");
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
    // The extracted signature from the image. 
    // readSign = NOT WORKING AS INTENDED. Signature is not in the image. Can upload to verify. 
    var readSign = null;
    // The message extracted from the image. 
    var extractedMessage = null;
    // The Unique message extracted.
    var extractedUniqueMsg = null;

    


    // Extract the signature from uploaded content [images currently]. Verify a signature
    // Doesnt work as intended as the image doesnt hold the signature currently.
    document.getElementById("extractSign").addEventListener("click", async function () {
        alert("Extract Signature function to be implemented!");
        readSign = await extractSign(extractCanvas.imageCanvas);  // returns extracted signature. 
        // Doesnt actually have a signature embedded to extract.
        // write signature to message box
        writeMessageOutput(signTextOutput, readSign);
    });
    // Extract a hidden file from uploaded content. 
    document.getElementById("extractPassword").addEventListener("click", async function () {
        alert("Extract Password + Message function to be implemented!");
        extractedMessage = await extractAnonymous(extractCanvas.imageCanvas, passwordExtract.value); // returns decrypted string.
        // write password extracted message to message box
        writeMessageOutput(extractTextOutput, extractedMessage);
        return extractedMessage;
        // Dont think we need a return value.
    });
    // Extract a hidden file for specific destination key.
    document.getElementById("extractPrivateKey").addEventListener("click", async function () {
        alert("Extract Password + Message + Private Key function to be implemented!");
        extractedUniqueMsg = await extractUnique(extractCanvas.imageCanvas, privKey.value); // returns the extracted message if it exists. 
        // write unique message to message box
        writeMessageOutput(extractPrivTextOutput, extractedUniqueMsg);
        return extractedUniqueMsg;
        // Dont think we need a return value.

    });

    // Default View
    switchView(mainMenu);
});
