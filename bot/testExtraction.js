import fs from "fs/promises";
import { chromium } from "playwright";
import { extractOpportunity } from "./extractOpportunity.js";
import { validateOpportunity } from "./validateOpportunity.js";

const volunteerUrl =
    "https://volunteer.bloomerang.co/volunteer/#/join-party?k=0l6qzxeawydwj5";

const browser = await chromium.launch({
    headless: true
});

const page = await browser.newPage();

console.log("Opening Matthews Help Center volunteer page...");

await page.goto(volunteerUrl, {
    waitUntil: "networkidle",
    timeout: 60000
});

const pageText = await page.locator("body").innerText();

console.log(`Rendered text length: ${pageText.length}`);
console.log("Sending page to AI...");

try {
    const opportunity = await extractOpportunity(
        pageText,
        volunteerUrl
    );

    console.log("\n========== EXTRACTED OPPORTUNITY ==========\n");
    console.log(JSON.stringify(opportunity, null, 2));
    const validation = validateOpportunity(opportunity);

console.log("\n========== VALIDATION ==========\n");
console.log(validation);

if (!validation.valid) {
    console.log("\nOpportunity rejected.");
} else {
    console.log("\nOpportunity passed validation.");

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

await browser.close();