/*

node bot/runOpportunityPipeline.js
  FILE PURPOSE:
  This script (bot/runOpportunityPipeline.js) serves as the main automated scraper pipeline runner. 
  It iterates over a list of source organizations, discovers their volunteer landing pages, scrapes page body text using Playwright, 
  extracts structured opportunity data via AI, validates the extracted schema, and writes individual JSON output files.

  FILES REFERENCED IN THIS FILE:
  - Local Bot Modules: discoverVolunteerPages.js, extractOpportunity.js, validateOpportunity.js
  - Input Config File: ./bot/sources.json
  - Output File Directory: ./bot/output/{organization-slug}.json
  - External Libraries: fs (Node.js built-in file system), playwright (browser automation)
*/

// Import standard Node.js file system library to handle reading sources and writing output JSON files
import fs from "fs";

// Import Playwright headless browser engine
import { chromium } from "playwright";

// Import custom bot pipeline modules
import { discoverVolunteerPage } from "./discoverVolunteerPages.js";
import { extractOpportunity } from "./extractOpportunity.js";
import { validateOpportunity } from "./validateOpportunity.js";

// Step 1: Read and parse the target organization list from sources.json
const sources = JSON.parse(
    fs.readFileSync("./bot/sources.json", "utf8")
);

// Step 2: Launch a single headless Chromium browser instance for batch processing
const browser = await chromium.launch({
    headless: true
});

console.log("======================================");
console.log("CLT YouthServe Opportunity Pipeline");
console.log("======================================");

// Step 3: Loop through each target organization source entry
for (const source of sources) {
    // Generate a clean URL-friendly filename slug from the organization name
    const slug = source.organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const outputPath = `./bot/output/${slug}.json`;

if (fs.existsSync(outputPath)) {
    console.log(`Already processed. Re-processing for testing.`);
}
    console.log("\n======================================");
    console.log(`Organization: ${source.organizationName}`);
    console.log(`Website: ${source.websiteUrl}`);
    console.log("======================================");

    try {
        // Step 4: Discover the direct volunteer page link from the base organization website URL
        console.log("\nDiscovering volunteer page...");

        const volunteerUrl = await discoverVolunteerPage(
            source.websiteUrl
        );

        if (!volunteerUrl) {
            console.log("No volunteer page found.");
            continue; // Skip to next organization if discovery fails
        }

        console.log(`Volunteer page found: ${volunteerUrl}`);

        // Step 5: Open a new page tab, navigate to the discovered URL, and extract rendered text
        const page = await browser.newPage();

        console.log("\nOpening volunteer page...");

        await page.goto(volunteerUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Pause briefly to allow dynamic JavaScript widgets to load
        await page.waitForTimeout(3000);

        const pageText = await page.locator("body").innerText();

        console.log(`Rendered text length: ${pageText.length}`);

        await page.close();

        // Step 6: Send page text to AI extraction module to generate structured JSON object
        console.log("\nSending page to AI...");

        const opportunity = await extractOpportunity(
            pageText,
            volunteerUrl
        );

        console.log("\nAI extraction complete.");

        // Step 7: Validate AI extracted opportunity object against schema rules
        const validation = validateOpportunity(opportunity);

        console.log("\nValidation:");
        console.log(validation);

        if (!validation.valid) {
            console.log("\nOpportunity rejected.");
            continue; // Skip saving if schema validation fails
        }

        console.log("\nOpportunity passed validation.");

        // Step 8: Save validated JSON object to the output directory
        const filename = source.organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const outputPath = `./bot/output/${filename}.json`;

        fs.writeFileSync(
            outputPath,
            JSON.stringify(opportunity, null, 2)
        );

        console.log(`Saved opportunity to ${outputPath}`);

    } catch (error) {
        console.error(
            `\nFailed to process ${source.organizationName}:`
        );
        console.error(error);
    }
}

// Step 9: Close browser and wrap up pipeline run
await browser.close();

console.log("\n======================================");
console.log("Pipeline completed.");
console.log("======================================");