/*
  FILE PURPOSE:
  This test script (bot/testBrowser.js) tests headless browser page navigation and text extraction using Playwright. 
  It navigates to a specified volunteer portal URL, waits for all network activity to settle, extracts all visible text content 
  from the document body, and prints the first 15,000 characters to the terminal console.

  FILES REFERENCED IN THIS FILE:
  - External Libraries: playwright (Chromium automation engine)
*/

// Import Playwright browser automation library
import { chromium } from "playwright";

// Target volunteer portal page URL to open and test
const url = "https://volunteer.bloomerang.co/volunteer/#/join-party?k=0l6qzxeawydwj5";

// Step 1: Launch a headless Chromium browser instance
const browser = await chromium.launch({
    headless: true
});

// Create a new browser tab/page
const page = await browser.newPage();

console.log("Opening volunteer page...");

// Step 2: Navigate to target URL and wait for dynamic page scripts to load complete network calls
await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 60000
});

console.log("Page loaded.");

// Step 3: Extract all inner visible text content rendered inside the body tag
const text = await page.locator("body").innerText();

// Step 4: Output preview slice of extracted text content to terminal console
console.log("\n========== RENDERED PAGE TEXT ==========\n");
console.log(text.slice(0, 15000));
console.log("\n========================================\n");

// Step 5: Close browser instance
await browser.close();