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

export function convertOpportunity(opportunity, id) {
    const metadata = organizationMetadata[opportunity.organizationName];

    if (!metadata) {
        throw new Error(
            `No metadata configured for ${opportunity.organizationName}`
        );
    }

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

function extractCity(address) {
    if (!address) return null;

    const match = address.match(
        /,\s*([^,]+),\s*(?:North Carolina|NC)\b/i
    );

    return match
        ? `${match[1].trim()}, NC`
        : null;
}