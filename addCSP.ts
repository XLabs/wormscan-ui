// import { readFile, writeFile } from "fs";
// eslint-disable-next-line
const fs = require("fs");

const filePath = "dist/index.html";
const searchString = '<link rel="canonical" href="https://wormholescan.io/">';
const insertText = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; upgrade-insecure-requests; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' 'unsafe-eval' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com; img-src 'self' blob: https: ipfs: data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src *; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self';" />`;

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file to add CSP:", err);
    return;
  }

  // Check if the file contains the search string
  if (data.includes(searchString)) {
    // Insert the text after the search string
    const modifiedData = data.replace(searchString, searchString + insertText);

    // Write the modified data back to the file
    fs.writeFile(filePath, modifiedData, "utf8", err => {
      if (err) {
        console.error("Error inserting CSP:", err);
      } else {
        console.log("CSP inserted successfully!");
      }
    });
  } else {
    console.log("Error inserting CSP, didnt found search text");
  }
});
