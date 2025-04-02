# SteganoG

SteganoG is a web extension for steganography (embedding and extracting content from files), and authentication (Sign, verify, and stamp).  The goal is to have an extension that works with Web APIs <https://developer.mozilla.org/en-US/docs/Web/API> (built into modern browsers), and runs locally in the browser. The tool will work offline if you have a decently up to date browser installed and this package.  

## Work in Progress

Features to add/change:

- Alt text: Add to metadata, Add to file description,
- Metadata: Verify, Modify, Read.
- Site interaction: Use tool(s) on site content.  
- Update: base58 encoding, decoding

Issues:

- Fix canvas functions for proper image processing
- Fix sign vs sign stamp code.
- Only one key active. [Add ability to switch between known/named keys]
- Add image load/download process to utils/

## Installation

Download this repo and run unpacked in "chrome://extenstion" (currently testing with chrome) developer mode as an unpacked web extension. Allows for live testing.

## Usage

Currently not stable and lacking testing and error handling. Not recommended for use outside of testing or development at this time.  
Uses Web APIs built into the browser.  

## Additional Resources

Access your chrome extensions:  
<chrome://extensions/>

1. Mozilla Development MDN:  <https://developer.mozilla.org/en-US/>

- Canvas API:  <https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API>
- Web Crypto API:  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API>  

1. Chrome for developers: <https://developer.chrome.com/docs/extensions/reference>

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. Refactoring requests will be ignored until 0.9.x. in preparation for a 1.x release. Not all style guidelines or best practices are implemented at this time.  
As this is very early in the project and has a much larger roadmap. 

Please make sure to update tests as appropriate.

## File Structure

```bash
/steganography-extension
│
├── /icons/                    # Icons for the extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── /assets/                   # Other assets like default messages, etc.  < NOT IN USE
│
├── /src/                      # Source code for the extension
│   ├── /background/           # Background script for key management, encryption, etc.
│   │   └── background.js      # Handle keypair generation, encryption, and decoding logic
│   │
│   ├── /content/              # Content script for web interactions (No current use)
│   │   └── content.js         # This could be for interacting with the current webpage if necessary  (No current use)
│   │
│   ├── /popup/                # Popup UI for user interactions
│   │   ├── popup.html         # The HTML structure for the popup UI
│   │   ├── popup.js           # Script to handle UI interactions (key generation, encoding, etc.)
│   │   └── popup.css          # Styling for the popup UI
│   │
│   ├── /utils/                # Utility functions (encryption, decryption, etc.)
│   │   ├── steganography.js   # LSB steganography functions
│   │   ├── encryption.js      # AES-GCM encryption & RSA signing
│   │   └── keypair.js         # Functions for keypair management (generation, storage)
│   │
│   └── /tests/                # Unit tests (if needed for functionality)
│       └── <ASSOCIATED_SCRIPT_NAME>.test.js  # Tests for each of the functionalities
│
├── manifest.json              # Extension manifest for browser
├── README.md                  # Documentation for the extension
├── Outline                    # Outline of the file structure [This file]
└── package.json               # NPM dependencies and scripts  < NOT IN USE

```

## License

GNU Lesser General Public License (LGPL) <https://www.gnu.org/licenses/lgpl-3.0.html>
