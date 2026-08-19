/*
  FILE PURPOSE:
  This test script (bot/testExtraction.js) automates the end-to-end testing pipeline for scraping a volunteer webpage. 
  It launches a headless browser using Playwright, renders and reads dynamic text from a target URL, passes the text to an AI extraction module, 
  runs validation checks on the parsed data, and saves valid results as a JSON file.

  FILES REFERENCED IN THIS FILE:
  - Local Bot Modules: extractOpportunity.js, validateOpportunity.js
  - Saved Output Destination: bot/output/matthews-help-center.json
  - External Libraries: fs/promises (Node.js file system), playwright (browser automation)
*/

// Import Node.js file system utilities for writing output files
import fs from "fs/promises";

// Import Playwright browser automation library
import { chromium } from "playwright";

// Import custom bot modules for AI extraction and schema validation
import { extractOpportunity } from "./extractOpportunity.js";
import { validateOpportunity } from "./validateOpportunity.js";

// Target volunteer posting URL to scrape and analyze
const volunteerUrl =
    "https://volunteer.bloomerang.co/volunteer/#/join-party?k=0l6qzxeawydwj5";

// Step 1: Launch headless Chromium browser instance
const browser = await chromium.launch({
    headless: true
});

// Create a new browser page/tab
const page = await browser.newPage();

console.log("Opening Matthews Help Center volunteer page...");

// Step 2: Navigate to target URL and wait for dynamic network requests to finish
await page.goto(volunteerUrl, {
    waitUntil: "networkidle",
    timeout: 60000
});

// Extract all visible body text content rendered on the web page
const pageText = await page.locator("body").innerText();

console.log(`Rendered text length: ${pageText.length}`);
console.log("Sending page to AI...");

try {
    // Step 3: Pass extracted text content into AI extraction logic
    const opportunity = await extractOpportunity(
        pageText,
        volunteerUrl
    );

    console.log("\n========== EXTRACTED OPPORTUNITY ==========\n");
    console.log(JSON.stringify(opportunity, null, 2));

    // Step 4: Validate extracted object against schema requirements
    const validation = validateOpportunity(opportunity);

    console.log("\n========== VALIDATION ==========\n");
    console.log(validation);

    // Step 5: Save JSON output if validation checks pass
    if (!validation.valid) {
        console.log("\nOpportunity rejected.");
    } else {
        console.log("\nOpportunity passed validation.");

        // Write structured data output to JSON file inside bot output directory
        await fs.writeFile(
            "./bot/output/matthews-help-center.json",
            JSON.stringify(opportunity, null, 2),
            "utf8"
        );

        console.log(
            "\nSaved opportunity to bot/output/matthews-help-center.json"
        );
    }

    console.log("\n================================");
    console.log("\n============================================");
} catch (error) {
    console.error("\nExtraction failed:");
    console.error(error);
}

// Step 6: Close browser process
await browser.close();