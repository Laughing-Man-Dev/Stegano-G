// NOT IN USE. Not configured correctly.

import { stampSign, stampEmbedSign, extractAnonymous } from "../utils/helper.js";
// Background script to handle logging and runtime communication
console.log("Background script loaded");

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "stampSign") {
        console.log("Stamp and sign requested");
        sendResponse({ status: "Received stampSign request" });
    } else if (request.action === "stampEmbedSign") {
        console.log("Stamp, sign, and embed requested");
        sendResponse({ status: "Received stampEmbedSign request" });
    } else if (request.action === "extractAnonymous") {
        console.log("Extract message requested");
        sendResponse({ status: "Received extractAnonymous request" });
    } else {
        console.log("Unknown request", request);
        sendResponse({ status: "Unknown request" });
    }
    return true;
});
