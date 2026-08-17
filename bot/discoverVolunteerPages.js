import https from "https";

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

            // Follow redirects
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

            response.on("data", chunk => {
                data += chunk;
            });

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

function extractLinks(html, baseUrl) {
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;

    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];

        try {
            const absoluteUrl = new URL(href, baseUrl).href;

            if (
                absoluteUrl.startsWith("http://") ||
                absoluteUrl.startsWith("https://")
            ) {
                links.push(absoluteUrl);
            }
        } catch {
            // Ignore invalid URLs
        }
    }

    return [...new Set(links)];
}

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

export async function discoverVolunteerPage(testUrl) {
    console.log(`\nDiscovering volunteer page from: ${testUrl}`);

    const html = await fetchPage(testUrl);

    console.log("Successfully fetched website.");

    const links = extractLinks(html, testUrl);

    console.log(`Found ${links.length} total links.`);

    const relevantLinks = findRelevantLinks(links);

    // Score each candidate link
    const scoredLinks = relevantLinks.map(link => {
        const url = link.toLowerCase();

        let score = 0;

        if (url.includes("volunteer")) score += 10;
        if (url.includes("get-involved")) score += 8;
        if (url.includes("get_involved")) score += 8;
        if (url.includes("volunteering")) score += 10;
        if (url.includes("opportunit")) score += 7;
        if (url.includes("serve")) score += 4;
        if (url.includes("join")) score += 3;

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

    const bestCandidate = scoredLinks[0].url;

    console.log("\nBEST CANDIDATE:");
    console.log(bestCandidate);

    return bestCandidate;
}