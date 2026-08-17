import fs from "fs";
import { chromium } from "playwright";
import { discoverVolunteerPage } from "./discoverVolunteerPages.js";
import { extractOpportunity } from "./extractOpportunity.js";
import { validateOpportunity } from "./validateOpportunity.js";

const sources = JSON.parse(
    fs.readFileSync("./bot/sources.json", "utf8")
);

const browser = await chromium.launch({
    headless: true
});

console.log("======================================");
console.log("CLT YouthServe Opportunity Pipeline");
console.log("======================================");

for (const source of sources) {
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
        console.log("\nDiscovering volunteer page...");

        const volunteerUrl = await discoverVolunteerPage(
            source.websiteUrl
        );

        if (!volunteerUrl) {
            console.log("No volunteer page found.");
            continue;
        }

        console.log(`Volunteer page found: ${volunteerUrl}`);

        const page = await browser.newPage();

        console.log("\nOpening volunteer page...");

        await page.goto(volunteerUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForTimeout(3000);

        const pageText = await page.locator("body").innerText();

        console.log(`Rendered text length: ${pageText.length}`);

        await page.close();

        console.log("\nSending page to AI...");

        const opportunity = await extractOpportunity(
            pageText,
            volunteerUrl
        );

        console.log("\nAI extraction complete.");

        const validation = validateOpportunity(opportunity);

        console.log("\nValidation:");
        console.log(validation);

        if (!validation.valid) {
            console.log("\nOpportunity rejected.");
            continue;
        }

        console.log("\nOpportunity passed validation.");

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



await browser.close();

console.log("\n======================================");
console.log("Pipeline completed.");
console.log("======================================");