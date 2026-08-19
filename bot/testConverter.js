/*
  FILE PURPOSE:
  This test script (bot/testConverter.js) reads raw AI-scraped JSON files from the bot output directory, 
  runs them through the convertOpportunity module to format them into the web app's database schema, 
  and logs the converted records to the terminal for verification.

  FILES REFERENCED IN THIS FILE:
  - Local Bot Modules: convertOpportunity.js
  - Input JSON Files: ./bot/output/common-heart.json, ./bot/output/matthews-help-center.json
  - External Libraries: fs (Node.js built-in file system)
*/

// Import standard Node.js file system library to read local JSON files
import fs from "fs";

// Import conversion utility to map raw bot data to the application database schema
import { convertOpportunity } from "./convertOpportunity.js";

// Step 1: Read and parse extracted raw JSON data files from the bot output directory
const commonHeart = JSON.parse(
    fs.readFileSync("./bot/output/common-heart.json", "utf8")
);

const matthews = JSON.parse(
    fs.readFileSync("./bot/output/matthews-help-center.json", "utf8")
);

// Step 2: Convert and display Common Heart opportunity record (assigned ID: 9)
console.log("\n========== COMMON HEART ==========\n");

console.log(
    JSON.stringify(
        convertOpportunity(commonHeart, 9),
        null,
        2
    )
);

// Step 3: Convert and display Matthews Help Center opportunity record (assigned ID: 1)
console.log("\n========== MATTHEWS HELP CENTER ==========\n");

console.log(
    JSON.stringify(
        convertOpportunity(matthews, 1),
        null,
        2
    )
);