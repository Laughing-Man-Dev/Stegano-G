// imageOverlay.js - Module for overlay functions
// Handles all image processes for canvas manipulation

/**
 * Creates a canvas element for overlaying content.
 * @returns {HTMLCanvasElement|null} - The overlay canvas or null if an image hasn't been uploaded.
 */
function createOverlay() {
    const myCanvas = document.getElementById('myCanvas');  // replace with better design for more than one canvas destination
    if (!myCanvas.imageCanvas) {
        console.error("Image must be uploaded first.");
        return null;
    }

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = myCanvas.imageCanvas.width;
    overlayCanvas.height = myCanvas.imageCanvas.height;
    return overlayCanvas;
}

/**
 * Creates a text overlay on the image.
 * @param {string} text - The text to overlay.
 * @param {number} x - The x-coordinate of the text.
 * @param {number} y - The y-coordinate of the text.
 * @param {string} [font='20px Arial'] - The font of the text.
 * @param {string} [color='red'] - The color of the text.
 * @returns {HTMLCanvasElement|null} - The overlay canvas with the text or null if an error occurred.
 */
// This should replace Stamp()
export function overlayText(text, x, y, font = '20px Arial', color = 'red') {
    const overlayCanvas = createOverlay();
    if (!overlayCanvas) return null;

    const ctx = overlayCanvas.getContext('2d');
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    return overlayCanvas;
}

/**
 * Creates an image overlay on the image.
 * @param {string} imageUrl - The URL of the image to overlay.
 * @param {number} x - The x-coordinate of the overlay image.
 * @param {number} y - The y-coordinate of the overlay image.
 * @param {number} width - The width of the overlay image.
 * @param {number} height - The height of the overlay image.
 * @returns {HTMLCanvasElement|null} - The overlay canvas with the image or null if an error occurred.
 */
// Not curretnly in use.
export function overlayImage(imageUrl, x, y, width, height) {
    const overlayCanvas = createOverlay();
    if (!overlayCanvas) return null;

    const ctx = overlayCanvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        ctx.drawImage(img, x, y, width, height);
    };

    img.src = imageUrl;

    return overlayCanvas;
}

/**
 * Updates the main canvas with the overlay.
 * @param {HTMLCanvasElement} overlayCanvas - The overlay canvas to draw onto the main canvas.
 */
export function displayUpdate(overlayCanvas) {
    const myCanvas = document.getElementById('myCanvas');
    if (!myCanvas.imageCanvas) {
        console.error("Image must be uploaded first.");
        return;
    }
    if (!overlayCanvas) {
        console.error("Overlay canvas must be created.");
        return;
    }

    const baseCtx = myCanvas.imageCanvas.getContext('2d');
    baseCtx.drawImage(overlayCanvas, 0, 0);
}
