// imageOverlay.js - Module for overlay functions
// Handles all image processes for canvas manipulation

/**
 * Creates a canvas element for overlaying content.
 * @returns {HTMLCanvasElement|null} - The overlay canvas or null if an image hasn't been uploaded.
 */
async function createOverlay() {
    // Get the HTML div element with the ID 'myCanvas'. This div is expected to contain the base image canvas.
    // The comment suggests a potential improvement for handling multiple canvas destinations in the future.
    const myCanvas = document.getElementById('myCanvas');
    // Check if the 'myCanvas' div has a property called 'imageCanvas'.
    // This property is set in the 'uploadImage' function and holds the canvas containing the uploaded image.
    if (!myCanvas.imageCanvas) {
        // If 'imageCanvas' is not present, it means an image hasn't been uploaded yet.
        console.error("Image must be uploaded first.");
        // Return null to indicate that an overlay canvas cannot be created without a base image.
        return null;
    }

    // Create a new HTML canvas element. This will be the overlay canvas.
    const overlayCanvas = document.createElement('canvas');
    // Set the width of the overlay canvas to be the same as the width of the base image canvas.
    overlayCanvas.width = myCanvas.imageCanvas.width;
    // Set the height of the overlay canvas to be the same as the height of the base image canvas.
    overlayCanvas.height = myCanvas.imageCanvas.height;
    // Return the newly created overlay canvas element.
    console.log("overlay created in createOverlay()")
    return overlayCanvas;
}

/**
 * Creates a text overlay on the image.
 * @param {string} text - The text to overlay.
 * @param {number} x - The x-coordinate of the text. Defaults to 55.
 * @param {number} y - The y-coordinate of the text. Defaults to 100.
 * @param {string} [font='50px Arial'] - The font of the text. Defaults to '60px Arial'.
 * @param {string} [color='red'] - The color of the text. Defaults to 'red'.
 * @returns {HTMLCanvasElement|null} - The overlay canvas with the text or null if an error occurred.
 */
export async function overlayText(text, x = 55, y = 100, font = '60px Arial', color = 'red') {
    // Call the 'createOverlay' function to get a new canvas for the overlay.
    const overlayCanvas = await createOverlay();
    console.log("new overlay created: " + overlayCanvas);
    // Check if 'createOverlay' returned a valid canvas. If it returned null (due to no uploaded image), exit the function.
    if (!overlayCanvas) return null;

    // Get the 2D rendering context of the overlay canvas.
    const ctx = overlayCanvas.getContext('2d');
    // Set the font style for the text to be drawn on the overlay.
    ctx.font = font;
    // Set the fill color for the text to be drawn on the overlay.
    ctx.fillStyle = color;
    // Draw the specified 'text' onto the overlay canvas at the given 'x' and 'y' coordinates.
    ctx.fillText(text, x, y);
    console.log("text written to the screen: " + text);
    // Return the overlay canvas with the text drawn on it.
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
// Not currently in use.
export function overlayImage(imageUrl, x, y, width, height) {
    // Call the 'createOverlay' function to get a new canvas for the overlay.
    const overlayCanvas = createOverlay();
    // Check if 'createOverlay' returned a valid canvas. If it returned null (due to no uploaded image), exit the function.
    if (!overlayCanvas) return null;

    // Get the 2D rendering context of the overlay canvas.
    const ctx = overlayCanvas.getContext('2d');
    // Create a new Image object. This object will be used to load the overlay image.
    const img = new Image();

    // Define an event handler for when the overlay Image object has finished loading.
    img.onload = function () {
        // Draw the loaded overlay image onto the overlay canvas at the specified 'x' and 'y' coordinates,
        // with the given 'width' and 'height'.
        ctx.drawImage(img, x, y, width, height);
    };

    // Set the 'src' attribute of the overlay Image object to the provided 'imageUrl'.
    // This starts the loading process for the overlay image.
    img.src = imageUrl;

    // Return the overlay canvas. The image will be drawn on it asynchronously once it has loaded.
    return overlayCanvas;
}

/**
 * Updates the main canvas with the overlay.
 * @param {HTMLCanvasElement} overlayCanvas - The overlay canvas to draw onto the main canvas.
 */
export async function displayUpdate(overlayCanvas) {
    // Get the HTML div element with the ID 'myCanvas'.
    const myCanvas = document.getElementById('myCanvas');
    console.log(myCanvas);
    // Check if the 'myCanvas' div has the 'imageCanvas' property (the canvas containing the uploaded image).
    if (!myCanvas.imageCanvas) {
        // If not, log an error as an image needs to be uploaded first.
        console.error("Image must be uploaded first.");
        return;
    }
    // Check if a valid 'overlayCanvas' was provided as an argument.
    if (!overlayCanvas) {
        // If not, log an error as there's no overlay to draw.
        console.error("Overlay canvas must be created.");
        return;
    }

    // Get the 2D rendering context of the base image canvas.
    const baseCtx = await myCanvas.imageCanvas.getContext('2d');
    // Draw the content of the 'overlayCanvas' onto the base image canvas at coordinates (0, 0).
    // This effectively merges the overlay with the original image displayed on the main canvas.
    baseCtx.drawImage(overlayCanvas, 0, 0);
}
