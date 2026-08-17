const AI_WORKER_URL =
    "https://cltyouthserve-ai.chiragy100.workers.dev/";

export async function extractOpportunity(pageText, sourceUrl) {
    const prompt = `
You are a highly accurate data extraction system for CLT YouthServe.

Extract structured volunteer opportunity information from the webpage text below.

Your job is to extract ONLY information that is explicitly supported by the webpage text.

==================================================
STRICT ACCURACY RULES
==================================================

1. NEVER invent, guess, estimate, or hallucinate information.
2. If a field cannot be determined from the webpage text, use null.
3. Do not confuse organization information with volunteer opportunity information.
4. Preserve exact scheduling information when available.
5. Do not shorten schedules in a way that removes important times.
6. Do not merge separate volunteer roles into one role.
7. Do not create roles that are not explicitly supported by the text.
8. Preserve restrictions such as age requirements and court-ordered service restrictions.
9. The source URL must be returned exactly as provided.
10. Return ONLY valid JSON. No markdown. No explanation.

==================================================
CATEGORY CLASSIFICATION
==================================================

The "category" field MUST contain exactly ONE of these values:

- "Community Support"
- "Parks & Recreation"
- "Youth & Education"
- "Animal Welfare"
- "Health & Wellness"

Choose the category that best describes the PRIMARY purpose of the volunteer opportunity.

This is classification, not extraction.

If the opportunity clearly fits one category, choose it.

If the webpage does not provide enough information to reasonably classify it, use null.

NEVER create a new category.

==================================================
FIELD-SPECIFIC RULES
==================================================

organizationName:
Use the organization's explicitly stated name.

category:
Choose exactly one allowed category from the list above.

address:
Use the volunteer location if explicitly stated.
Do not invent an address.

minimumAge:
Return a number only when an explicit minimum age is stated.
Otherwise null.

backgroundCheckRequired:
Return true only if the webpage explicitly says a background check is required.
Return false only if the webpage explicitly says one is NOT required.
Otherwise null.

trainingRequired:
Return true only if training is explicitly required.
Return false only if the webpage explicitly says training is NOT required.
Otherwise null.

recurringOpportunity:
Return true if the webpage explicitly describes recurring, weekly, monthly, ongoing, or regularly scheduled volunteering.
Return false only if the webpage explicitly describes it as a one-time opportunity.
Otherwise null.

schedule:
Preserve the actual volunteer schedule.

IMPORTANT:
If multiple shifts or locations are listed, include all relevant days and times.

Example:
"Monday - Saturday. Store shifts: 9 a.m.-1 p.m. and 1 p.m.-5 p.m. Garage shifts: 7-9 a.m., 9-11 a.m., 11 a.m.-1 p.m., and 3-5 p.m."

Do NOT reduce this to simply:
"Monday - Saturday"

shiftLength:
Give the stated volunteer shift length.
If individual and group opportunities have different lengths, clearly distinguish them.
Example:
"4 hours for individuals; 2 hours for group events"

description:
Write a concise factual summary based ONLY on the webpage.
Do not add claims that are not supported.

volunteerRoles:
List distinct volunteer roles explicitly mentioned by the webpage.

IMPORTANT:
Do not combine multiple roles.
Do not duplicate roles.
Do not invent roles.

If the webpage says:
"Clothing Pricer; Art Pricer; Linens Pricer"

return:

[
  "Clothing Pricer",
  "Art Pricer",
  "Linens Pricer"
]

requirements:
Include explicit requirements and restrictions such as:
- minimum age
- required applications
- court-ordered service restrictions
- required qualifications
- required training

Do not repeat the same requirement unnecessarily.

contactName:
Return the explicitly stated contact person's full name if available.
Do not infer a person's name from an email address.

contactEmail:
Return an explicitly stated email address.

contactPhone:
Return an explicitly stated phone number.

applicationMethod:
Describe how a volunteer applies, based only on the webpage.

applicationUrl:
Return the URL used to apply if explicitly available.
Do NOT automatically use the organization's homepage.
If there is no clearly identified application URL, use null.

sourceUrl:
Return the exact source URL provided separately.

==================================================
SPECIAL HANDLING FOR GROUP OPPORTUNITIES
==================================================

If the webpage contains both individual and group volunteering:

- Extract both.
- Preserve the distinction.
- Include group-specific requirements or application methods.
- Do not replace individual information with group information.

==================================================
REQUIRED JSON STRUCTURE
==================================================

{
  "organizationName": null,
  "category": null,
  "address": null,
  "minimumAge": null,
  "backgroundCheckRequired": null,
  "trainingRequired": null,
  "recurringOpportunity": null,
  "schedule": null,
  "shiftLength": null,
  "description": null,
  "volunteerRoles": [],
  "requirements": [],
  "contactName": null,
  "contactEmail": null,
  "contactPhone": null,
  "applicationMethod": null,
  "applicationUrl": null,
  "sourceUrl": "${sourceUrl}"
}

==================================================
WEBPAGE TEXT
==================================================

${pageText}
`;

    const response = await fetch(AI_WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt
        })
    });

    if (!response.ok) {
        throw new Error(
            `AI Worker returned HTTP ${response.status}`
        );
    }

    const result = await response.json();

const message = result?.choices?.[0]?.message;
const content = message?.content;

if (!content) {
    console.error("\n========== AI RESPONSE DEBUG ==========\n");
    console.error(JSON.stringify(result, null, 2));
    console.error("\n=======================================\n");

    throw new Error(
        "AI returned no message content. The model may have hit its reasoning/token limit."
    );
}

    try {
        return JSON.parse(content);
    } catch {
        console.error("AI returned invalid JSON:");
        console.error(content);

        throw new Error(
            "AI response was not valid JSON."
        );
    }
}