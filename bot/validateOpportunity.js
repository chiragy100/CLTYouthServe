/*
  FILE PURPOSE:
  This module (bot/validator.js) inspects extracted opportunity objects to ensure required fields, 
  proper data types, and valid URL formats match the application schema before saving.

  FILES REFERENCED IN THIS FILE:
  - Associated Bot Scripts: Imported by bot/runOpportunityPipeline.js and test scripts.
*/

export function validateOpportunity(opportunity) {
    const errors = [];

    // Step 1: Ensure input exists and is a valid object
    if (!opportunity || typeof opportunity !== "object") {
        return {
            valid: false,
            errors: ["AI output is not an object."]
        };
    }

    // Step 2: Define and check essential required properties
    const requiredFields = ["name", "link"];

    for (const field of requiredFields) {
        if (
            !Object.prototype.hasOwnProperty.call(opportunity, field) ||
            opportunity[field] === null ||
            opportunity[field] === ""
        ) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Step 3: Validate field data types based on the updated schema

    // Responsibilities array check
    if (!Array.isArray(opportunity.responsibilities)) {
        errors.push("responsibilities must be an array.");
    }

    // Map coordinates array check
    if (!Array.isArray(opportunity.coords) || opportunity.coords.length !== 2) {
        errors.push("coords must be an array of 2 numbers [lat, lng].");
    }

    // Verification boolean check
    if (typeof opportunity.verified !== "boolean") {
        errors.push("verified must be a boolean value.");
    }

    // Step 4: Validate URL structure for application/source link
    if (typeof opportunity.link === "string" && opportunity.link.trim() !== "") {
        try {
            new URL(opportunity.link);
        } catch {
            errors.push("Link is not a valid URL.");
        }
    }

    // Return validation result summary
    return {
        valid: errors.length === 0,
        errors
    };
}