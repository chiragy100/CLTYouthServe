import { chromium } from "playwright";

const url = "https://volunteer.bloomerang.co/volunteer/#/join-party?k=0l6qzxeawydwj5";

const browser = await chromium.launch({
    headless: true
});

const page = await browser.newPage();

console.log("Opening volunteer page...");

await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 60000
});

console.log("Page loaded.");

const text = await page.locator("body").innerText();

console.log("\n========== RENDERED PAGE TEXT ==========\n");
console.log(text.slice(0, 15000));
console.log("\n========================================\n");

await browser.close();