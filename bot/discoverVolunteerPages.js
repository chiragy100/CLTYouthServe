/*
  FILE PURPOSE:
  This module (bot/discoverVolunteerPages.js) provides automated web discovery functions. It fetches 
  a partner organization's base homepage HTML, extracts internal and external anchor links, ranks candidate links 
  based on volunteer-related keywords and penalty rules, and returns the highest-scoring candidate URL.

  FILES REFERENCED IN THIS FILE:
  - Associated Bot Scripts: Imported by bot/runOpportunityPipeline.js to automatically locate volunteer landing 
    pages from an organization's base website URL.
  - External Libraries: https (Node.js built-in HTTPS client module)
*/

// Import standard Node.js HTTPS module for making network requests
import https from "https";

// Helper function: Asynchronously fetches raw HTML content from a given URL with redirect handling
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139.0.0.0 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        }, (response) => {

            // Step 1: Automatically follow HTTP redirects (300–399 status codes)
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                response.resume();

                const redirectUrl = new URL(
                    response.headers.location,
                    url
                ).href;

                fetchPage(redirectUrl)
                    .then(resolve)
                    .catch(reject);

                return;
            }

            let data = "";

            response.setEncoding("utf8");

            // Accumulate response data chunks
            response.on("data", chunk => {
                data += chunk;
            });

            // Resolve full HTML string on request completion
            response.on("end", () => {
                console.log(
                    `Fetched ${url} — status ${response.statusCode}`
                );

                resolve(data);
            });
        });

        request.on("error", reject);
    });
}

// Helper function: Parses HTML content and extracts all unique href link URLs
function extractLinks(html, baseUrl) {
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;

    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];

        try {
            // Resolve relative paths against the base URL
            const absoluteUrl = new URL(href, baseUrl).href;

            if (
                absoluteUrl.startsWith("http://") ||
                absoluteUrl.startsWith("https://")
            ) {
                links.push(absoluteUrl);
            }
        } catch {
            // Ignore malformed or invalid URLs
        }
    }

    // Return deduplicated array of link URLs
    return [...new Set(links)];
}

// Helper function: Filters raw link array down to candidate links matching target keywords
function findRelevantLinks(links) {
    const keywords = [
        "volunteer",
        "volunteering",
        "get-involved",
        "get involved",
        "serve",
        "opportunit",
        "join-us",
        "join"
    ];

    return links.filter(link => {
        const lowerLink = link.toLowerCase();

        return keywords.some(keyword =>
            lowerLink.includes(keyword)
        );
    });
}

// Main exported function: Discovers, scores, and returns the best volunteer page link from a target website
export async function discoverVolunteerPage(testUrl) {
    console.log(`\nDiscovering volunteer page from: ${testUrl}`);

    // Step 1: Fetch raw HTML from base website URL
    const html = await fetchPage(testUrl);

    console.log("Successfully fetched website.");

    // Step 2: Extract all hyperlinked URLs on the homepage
    const links = extractLinks(html, testUrl);

    console.log(`Found ${links.length} total links.`);

    // Step 3: Filter extracted URLs down to relevant candidates
    const relevantLinks = findRelevantLinks(links);

    // Step 4: Score each candidate link using weighted criteria and penalty rules
    const scoredLinks = relevantLinks.map(link => {
        const url = link.toLowerCase();

        let score = 0;

        // Positive weighting for high-confidence volunteer keywords
        if (url.includes("volunteer")) score += 10;
        if (url.includes("get-involved")) score += 8;
        if (url.includes("get_involved")) score += 8;
        if (url.includes("volunteering")) score += 10;
        if (url.includes("opportunit")) score += 7;
        if (url.includes("serve")) score += 4;
        if (url.includes("join")) score += 3;

        // Negative weighting for irrelevant or social media links
        if (url.includes("donate")) score -= 10;
        if (url.includes("email-list")) score -= 10;
        if (url.includes("facebook")) score -= 10;
        if (url.includes("instagram")) score -= 10;
        if (url.includes("youtube")) score -= 10;

        return {
            url,
            score
        };
    });

    // Sort candidate links by score in descending order
    scoredLinks.sort((a, b) => b.score - a.score);

    console.log("\nRanked volunteer candidates:");

    scoredLinks.forEach((item, index) => {
        console.log(
            `${index + 1}. [${item.score}] ${item.url}`
        );
    });

    if (scoredLinks.length === 0) {
        console.log("\nNo volunteer-related pages found.");
        return null;
    }

    // Step 5: Select top-ranked URL candidate
    const bestCandidate = scoredLinks[0].url;

    console.log("\nBEST CANDIDATE:");
    console.log(bestCandidate);

    return bestCandidate;
}