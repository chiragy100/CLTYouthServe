/*
  FILE PURPOSE:
  This module (bot/extractOpportunity.js) formats raw webpage text and source URLs into a strict AI prompt instruction set, 
  sends a request to the Cloudflare Worker AI service, and returns a validated JSON object matching the app's target schema.

  FILES REFERENCED IN THIS FILE:
  - Associated Bot Scripts: Imported by bot/runOpportunityPipeline.js and bot/testExtraction.js to parse raw webpage text.
  - External API Endpoint: https://cltyouthserve-ai.chiragy100.workers.dev/
*/

const AI_WORKER_URL = "https://cltyouthserve-ai.chiragy100.workers.dev/";

export async function extractOpportunity(pageText, sourceUrl) {
    const prompt = `
You are a highly accurate data extraction system for CLT YouthServe.

Extract structured volunteer opportunity information from the webpage text below.

Your job is to extract ONLY information that is explicitly supported by the webpage text.

==================================================
STRICT ACCURACY RULES
==================================================

1. NEVER invent, guess, estimate, or hallucinate information.
2. If a field cannot be determined from the webpage text, use null (or default values specified below).
3. Do not confuse organization information with volunteer opportunity information.
4. Preserve exact scheduling information when available.
5. Do not shorten schedules in a way that removes important times.
6. Preserve restrictions such as age requirements.
7. Return ONLY valid JSON. No markdown syntax wrapper. No explanation.

==================================================
CATEGORY CLASSIFICATION
==================================================

The "category" field MUST contain exactly ONE of these values:
- "Community Support"
- "Parks & Recreation"
- "Youth & Education"
- "Animal Welfare"
- "Health & Wellness"

If the webpage does not provide enough information to reasonably classify it, use null.

==================================================
FIELD MAPPING RULES
==================================================

name: Organization or event name explicitly stated.
category: Choose exactly one allowed category from the list above.
city: Extract city and state from the address (e.g., "Matthews, NC").
address: Full physical street address if available.
hours: Shift length string (e.g., "4 Hours" or "Varies").
age: Minimum age requirement formatted as string (e.g., "14+", "Flexible", "All ages").
isOpen: Set to true if actively accepting volunteers, otherwise false. Default to true.
contactInfo: Primary email or phone number.
link: Explicit application URL or signup form link found in text. IF NONE FOUND, USE "${sourceUrl}".
coords: Leave as [0, 0].
imageSrc: Leave as empty string "".
description: A concise 1-2 sentence factual summary based ONLY on the webpage.
commitment: Formatted as "Recurring", "One-Time", "Flexible", or "Project Based".
verified: Set to false by default.
website: Organization domain name (e.g., "matthewshelpcenter.org").
bgCheck: Formatted string ("Required", "Not required", or "Not specified").
training: Formatted string ("Required", "Not required", or "Not specified").
schedule: Complete shift details and days of the week.
mission: Explicitly stated organization mission statement. If none, set to null.
responsibilities: Array of strings listing specific volunteer roles or tasks.

==================================================
REQUIRED JSON STRUCTURE
==================================================

{
  "id": null,
  "name": null,
  "category": null,
  "city": null,
  "address": null,
  "hours": null,
  "age": null,
  "isOpen": true,
  "contactInfo": null,
  "link": "${sourceUrl}",
  "coords": [0, 0],
  "imageSrc": "",
  "description": null,
  "commitment": null,
  "verified": false,
  "website": "",
  "bgCheck": "Not specified",
  "training": "Not specified",
  "schedule": null,
  "mission": null,
  "responsibilities": [],
  "sourceUrl": "${sourceUrl}"
}

==================================================
WEBPAGE TEXT
==================================================

${pageText}
`;

    const response = await fetch(AI_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        throw new Error(`AI Worker returned HTTP ${response.status}`);
    }

    const result = await response.json();
    const message = result?.choices?.[0]?.message;
    const content = message?.content;

    if (!content) {
        console.error("\n========== AI RESPONSE DEBUG ==========\n");
        console.error(JSON.stringify(result, null, 2));
        console.error("\n=======================================\n");
        throw new Error("AI returned no message content.");
    }

    try {
        const parsed = JSON.parse(content);
        
        // Code-level fallback safeguard
        if (!parsed.link || parsed.link.trim() === "") {
            parsed.link = sourceUrl;
        }

        return parsed;
    } catch {
        console.error("AI returned invalid JSON:");
        console.error(content);
        throw new Error("AI response was not valid JSON.");
    }
}