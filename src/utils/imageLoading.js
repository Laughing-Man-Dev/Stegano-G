// imageLoading.js - Module for handling image uploads and downloads
// This module handles image uploading and downloading.
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial



/**
 * Handles the content [image] upload process.
 * Reads the selected image file and displays it on the canvas.
 * @param {Event} event - The change event triggered by the file input.
 */
export function uploadImage(event) {
  // Get the HTML input element of type 'file' with the ID 'imageInput'.
    // Update for more modularity in the future.
  const imageInput = document.getElementById('imageInput');
  
  // Get the HTML div element with the ID 'myCanvas', which will be used to display the image.
    // Update for more modularity in the future.
  const myCanvas = document.getElementById('myCanvas');


  // Check if a file has been selected in the image input.
  // 'imageInput.files' is a FileList object containing the selected file(s).
  // 'imageInput.files[0]' refers to the first selected file.
  if (imageInput.files && imageInput.files[0]) {
    // Create a new FileReader object. FileReader is used to read the contents of a File.
    const reader = new FileReader();

    // Define an event handler for when the FileReader has successfully finished reading the file.
    reader.onload = function (e) {
      // Create a new Image object. This object will be used to load the image data.
      const img = new Image();

      // Define an event handler for when the Image object has finished loading the image data.
      img.onload = function () {
        // Clear any existing content inside the 'myCanvas' div.
        myCanvas.innerHTML = '';
        // Create a new HTML canvas element.
        const canvas = document.createElement('canvas');
        // Get the 2D rendering context of the canvas. This object provides methods for drawing shapes, text, images, etc.
        const ctx = canvas.getContext('2d');
        // Set the width of the canvas to the natural width of the loaded image.
        canvas.width = img.width;
        // Set the height of the canvas to the natural height of the loaded image.
        canvas.height = img.height;
        // Draw the loaded image onto the canvas at coordinates (0, 0).
        ctx.drawImage(img, 0, 0);
        // Append the newly created canvas element to the 'myCanvas' div, making it visible on the page.
        myCanvas.appendChild(canvas);
        // Store the canvas element as a property of the 'myCanvas' div. This is done to easily access the drawn image later for overlay operations.
        myCanvas.imageCanvas = canvas;
      };

      // Set the 'src' attribute of the Image object to the data URL that the FileReader has read.
      // This triggers the image loading process.
      img.src = e.target.result;
    };

    // Read the content of the selected file as a data URL.
    // A data URL is a way to represent the file's data as a base64 encoded string directly within the URL.
    reader.readAsDataURL(imageInput.files[0]);
  }
}

/**
 * COMBINE THIS AND THE ABOVE FUNTIONS.
 * Handles the content [image] upload process.
 * Reads the selected image file and displays it on the canvas.
 * @param {Event} event - The change event triggered by the file input.
 */
export function uploadImageExtract(event) {
  // Get the HTML input element of type 'file' with the ID 'imageInput'.
    // Update for more modularity in the future.
  const imageInput = document.getElementById('imageInputExtract');
  
  // Get the HTML div element with the ID 'myCanvas', which will be used to display the image.
    // Update for more modularity in the future.
  const myCanvas = document.getElementById('extractCanvas');


  // Check if a file has been selected in the image input.
  // 'imageInput.files' is a FileList object containing the selected file(s).
  // 'imageInput.files[0]' refers to the first selected file.
  if (imageInput.files && imageInput.files[0]) {
    // Create a new FileReader object. FileReader is used to read the contents of a File.
    const reader = new FileReader();

    // Define an event handler for when the FileReader has successfully finished reading the file.
    reader.onload = function (e) {
      // Create a new Image object. This object will be used to load the image data.
      const img = new Image();

      // Define an event handler for when the Image object has finished loading the image data.
      img.onload = function () {
        // Clear any existing content inside the 'myCanvas' div.
        myCanvas.innerHTML = '';
        // Create a new HTML canvas element.
        const canvas = document.createElement('canvas');
        // Get the 2D rendering context of the canvas. This object provides methods for drawing shapes, text, images, etc.
        const ctx = canvas.getContext('2d');
        // Set the width of the canvas to the natural width of the loaded image.
        canvas.width = img.width;
        // Set the height of the canvas to the natural height of the loaded image.
        canvas.height = img.height;
        // Draw the loaded image onto the canvas at coordinates (0, 0).
        ctx.drawImage(img, 0, 0);
        // Append the newly created canvas element to the 'myCanvas' div, making it visible on the page.
        myCanvas.appendChild(canvas);
        // Store the canvas element as a property of the 'myCanvas' div. This is done to easily access the drawn image later for overlay operations.
        myCanvas.imageCanvas = canvas;
      };

      // Set the 'src' attribute of the Image object to the data URL that the FileReader has read.
      // This triggers the image loading process.
      img.src = e.target.result;
    };

    // Read the content of the selected file as a data URL.
    // A data URL is a way to represent the file's data as a base64 encoded string directly within the URL.
    reader.readAsDataURL(imageInput.files[0]);
  }
}



/**
 * Saves the current canvas display (base image with overlay) as a downloadable image.
 *
 * This function now takes the overlayCanvas as an argument.  It combines the
 * base image and the overlay, then saves the combined result.
 *
 * @param {HTMLCanvasElement} overlayCanvas - The canvas containing the overlay elements.
 * If null, only the base image is saved.
 * @returns {void}
 */
export function saveImage(overlayCanvas = null) {
  // Get the HTML div element with the ID 'myCanvas'.
  const myCanvasDiv = document.getElementById('myCanvas');
  // Check if an image has been uploaded and a canvas exists.
  if (!myCanvasDiv.imageCanvas) {
    console.error("No image to save.");
    return; // Exit if no image is available.
  }
  // Get the base image canvas.
  const baseCanvas = myCanvasDiv.imageCanvas;
  // Create a new canvas to combine the base image and the overlay.
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = baseCanvas.width;
  combinedCanvas.height = baseCanvas.height;
  const combinedCtx = combinedCanvas.getContext('2d');
  // Draw the base image onto the combined canvas.
  combinedCtx.drawImage(baseCanvas, 0, 0);
  // If an overlayCanvas is provided, draw it on top of the base image.
  if (overlayCanvas) {
    combinedCtx.drawImage(overlayCanvas, 0, 0);
  }
  // Convert the combined canvas content to a data URL (PNG format).
  const dataURL = combinedCanvas.toDataURL('image/png');
  // Create a temporary anchor element for the download link.
  const link = document.createElement('a');
  // Set the 'href' attribute to the data URL.
  link.href = dataURL;
  // Set the 'download' attribute to specify the filename.
  link.download = 'image.png';
  // Programmatically click the link to trigger the download.
  link.click();
}
