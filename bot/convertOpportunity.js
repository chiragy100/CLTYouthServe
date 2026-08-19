/*
  FILE PURPOSE:
  This module (bot/convertOpportunity.js) transforms raw AI-extracted JSON data into the exact front-end application data 
  schema used by the CLT YouthServe website. It merges extracted details with hardcoded map metadata (latitude/longitude 
  coordinates, image paths, and domain verification status) and parses city names out of address strings.

  FILES REFERENCED IN THIS FILE:
  - Referenced Images: images/Common Heart.jpg, images/Matthews Help Center.jpg
  - Associated Bot Scripts: Imported by test scripts (e.g., bot/testConverter.js) and ingestion pipelines to prepare raw bot JSON 
    files for database insertion.
*/

// Map of pre-configured metadata attributes (coordinates, image links, domain info) keyed by organization name
const organizationMetadata = {
    "Common Heart": {
        coords: [35.0780, -80.6550],
        imageSrc: "images/Common Heart.jpg",
        verified: true,
        website: "commonheart.org"
    },

    "Matthews Help Center": {
        coords: [35.1199, -80.7208],
        imageSrc: "images/Matthews Help Center.jpg",
        verified: true,
        website: "matthewshelpcenter.org"
    }
};

// Converts raw AI-scraped opportunity data into the frontend UI / Firestore database schema format
export function convertOpportunity(opportunity, id) {
    const metadata = organizationMetadata[opportunity.organizationName];

    // Ensure organization metadata exists in lookup table
    if (!metadata) {
        throw new Error(
            `No metadata configured for ${opportunity.organizationName}`
        );
    }

    // Construct and return structured opportunity object matching web app schema
    return {
        id,

        name: opportunity.organizationName,
        category: opportunity.category,

        city: extractCity(opportunity.address),
        address: opportunity.address,

        hours: opportunity.shiftLength,
        age: opportunity.minimumAge
            ? `${opportunity.minimumAge}+`
            : "Not specified",

        isOpen: true,

        contactInfo:
            opportunity.contactEmail ||
            opportunity.contactPhone ||
            null,

        link: opportunity.applicationUrl,

        coords: metadata.coords,
        imageSrc: metadata.imageSrc,

        description: opportunity.description,

        commitment: opportunity.recurringOpportunity === true
            ? "Recurring"
            : opportunity.recurringOpportunity === false
                ? "One-Time"
                : "Not specified",

        verified: metadata.verified,

        website: metadata.website,

        bgCheck:
            opportunity.backgroundCheckRequired === true
                ? "Required"
                : opportunity.backgroundCheckRequired === false
                    ? "Not required"
                    : "Not specified",

        training:
            opportunity.trainingRequired === true
                ? "Required"
                : opportunity.trainingRequired === false
                    ? "Not required"
                    : "Not specified",

        schedule: opportunity.schedule,

        mission: null,

        responsibilities: opportunity.volunteerRoles || []
    };
}

// Helper function: Parses full street address string to extract "City, NC"
function extractCity(address) {
    if (!address) return null;

    // Regular expression matching city name prior to NC state identifier
    const match = address.match(
        /,\s*([^,]+),\s*(?:North Carolina|NC)\b/i
    );

    return match
        ? `${match[1].trim()}, NC`
        : null;
}