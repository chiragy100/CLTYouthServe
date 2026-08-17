export function validateOpportunity(opportunity) {
    const errors = [];

    if (!opportunity || typeof opportunity !== "object") {
        return {
            valid: false,
            errors: ["AI output is not an object."]
        };
    }

    // Required fields
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

    // Type checks
    if (
        opportunity.minimumAge !== null &&
        typeof opportunity.minimumAge !== "number"
    ) {
        errors.push("minimumAge must be a number or null.");
    }

    if (
        opportunity.backgroundCheckRequired !== null &&
        typeof opportunity.backgroundCheckRequired !== "boolean"
    ) {
        errors.push(
            "backgroundCheckRequired must be true, false, or null."
        );
    }

    if (
        opportunity.trainingRequired !== null &&
        typeof opportunity.trainingRequired !== "boolean"
    ) {
        errors.push(
            "trainingRequired must be true, false, or null."
        );
    }

    if (
        opportunity.recurringOpportunity !== null &&
        typeof opportunity.recurringOpportunity !== "boolean"
    ) {
        errors.push(
            "recurringOpportunity must be true, false, or null."
        );
    }

    if (!Array.isArray(opportunity.volunteerRoles)) {
        errors.push("volunteerRoles must be an array.");
    }

    if (!Array.isArray(opportunity.requirements)) {
        errors.push("requirements must be an array.");
    }

    // Basic URL validation
    if (typeof opportunity.sourceUrl === "string") {
        try {
            new URL(opportunity.sourceUrl);
        } catch {
            errors.push("sourceUrl is not a valid URL.");
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}