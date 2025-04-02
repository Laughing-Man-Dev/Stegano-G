/*
* Not Implemented. For Testing.
*/

document.addEventListener("DOMContentLoaded", function () {
    const encryptionMethodSelect = document.getElementById("encryptionMethod");
    const saveButton = document.getElementById("saveOptions");
    const statusText = document.getElementById("status");

    // Load saved options
    chrome.storage.sync.get(["encryptionMethod"], function (result) {
        if (result.encryptionMethod) {
            encryptionMethodSelect.value = result.encryptionMethod;
        }
    });

    // Save selected encryption method
    saveButton.addEventListener("click", function () {
        const selectedMethod = encryptionMethodSelect.value;
        chrome.storage.sync.set({ encryptionMethod: selectedMethod }, function () {
            statusText.textContent = "Options saved!";
            setTimeout(() => { statusText.textContent = ""; }, 2000);
        });
    });
});
