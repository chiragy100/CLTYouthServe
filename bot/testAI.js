const response = await fetch(
    "https://cltyouthserve-ai.chiragy100.workers.dev/",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: "Reply with exactly: AI CONNECTION WORKS"
        })
    }
);

const data = await response.json();

console.log(data.choices[0].message.content);