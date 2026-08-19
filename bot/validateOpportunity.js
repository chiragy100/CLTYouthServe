/*
  FILE PURPOSE:
  This module (bot/validator.js) provides a validation utility function used by administrative AI scraping 
  or data-ingestion bots. It inspects raw AI-extracted opportunity objects to ensure required fields, proper data types, 
  and valid URL formats before writing data to the system.

  FILES REFERENCED IN THIS FILE:
  - Associated Bot Scripts: Imported by administrative testing scripts and data ingestion pipelines (e.g., bot/scraper.js or test-validator.js) 
    to verify extracted data structure before database insertion.
    node bot/runOpportunityPipeline.js
*/

// Exports function to inspect and validate the structure of an AI-extracted opportunity object
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
    const requiredFields = [
        "organizationName",
        "sourceUrl"
    ];

    for (const field of requiredFields) {
        if (
            !Object.prototype.hasOwnProperty.call(opportunity, field) ||
            opportunity[field] === null ||
            opportunity[field] === ""
        ) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Step 3: Validate field data types and nullability

    // Age requirement check
    if (
        opportunity.minimumAge !== null &&
        typeof opportunity.minimumAge !== "number"
    ) {
        errors.push("minimumAge must be a number or null.");
    }

    // Background check flag check
    if (
        opportunity.backgroundCheckRequired !== null &&
        typeof opportunity.backgroundCheckRequired !== "boolean"
    ) {
        errors.push(
            "backgroundCheckRequired must be true, false, or null."
        );
    }

    // Training flag check
    if (
        opportunity.trainingRequired !== null &&
        typeof opportunity.trainingRequired !== "boolean"
    ) {
        errors.push(
            "trainingRequired must be true, false, or null."
        );
    }

    // Recurring commitment flag check
    if (
        opportunity.recurringOpportunity !== null &&
        typeof opportunity.recurringOpportunity !== "boolean"
    ) {
        errors.push(
            "recurringOpportunity must be true, false, or null."
        );
    }

    // Array type checks for roles and requirements
    if (!Array.isArray(opportunity.volunteerRoles)) {
        errors.push("volunteerRoles must be an array.");
    }

    if (!Array.isArray(opportunity.requirements)) {
        errors.push("requirements must be an array.");
    }

    // Step 4: Validate URL structure for source link
    if (typeof opportunity.sourceUrl === "string") {
        try {
            new URL(opportunity.sourceUrl);
        } catch {
            errors.push("sourceUrl is not a valid URL.");
        }
    }

    // Return validation result summary
    return {
        valid: errors.length === 0,
        errors
    };
}