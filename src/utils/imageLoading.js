// imageLoading.js - Module for handling image uploads and downloads
// This module handles image uploading and downloading.

/**
 * Handles the image upload process.
 * Reads the selected image file and displays it on the canvas.
 * @param {Event} event - The change event triggered by the file input.
 */
export function uploadImage(event) {
  const imageInput = document.getElementById('imageInput');
  const myCanvas = document.getElementById('myCanvas');

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        myCanvas.innerHTML = '';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        myCanvas.appendChild(canvas);
        myCanvas.imageCanvas = canvas;
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(imageInput.files[0]);
  }
}

/**
 * Saves the current canvas display as a downloadable image.
 *
 * This function retrieves the canvas element from the 'myCanvas' div,
 * converts it to a data URL, creates a temporary anchor element, and
 * triggers a download.  This version is designed to be exported
 * and used as a module.
 * [overlays in this case are the instances of sign, stamp, embed, steganoG, etc. Need
 * to download them as a whole top layer canvas element and source element combined.]
 * Else some message or sign will be lost to improper layering.
 *
 * @returns {void}
 */
export function saveImage() {
  // Get the canvas element from the 'myCanvas' div.
  const myCanvas = document.getElementById('myCanvas');

  // Check if an image has been uploaded and a canvas exists.
  if (!myCanvas.imageCanvas) {
    console.error("No image to save.");
    return; // Exit if no image is available.
  }
  // Get the canvas that contains the image and any overlay elements.
  const canvas = myCanvas.imageCanvas;
  // Convert the canvas content to a data URL (PNG format).
  const dataURL = canvas.toDataURL('image/png');
  // Create a temporary anchor element for the download link.
  const link = document.createElement('a');
  // Set the 'href' attribute to the data URL.
  link.href = dataURL;
  // Set the 'download' attribute to specify the filename.
  link.download = 'image.png';
  // Programmatically click the link to trigger the download.
  link.click();
}
