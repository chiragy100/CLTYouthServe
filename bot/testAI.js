/*
  FILE PURPOSE:
  This test script (bot/testAI.js) verifies network connectivity with the custom Cloudflare Worker 
  AI endpoint (`cltyouthserve-ai.chiragy100.workers.dev`). It sends a simple ping prompt to the AI 
  and prints the response message content to the terminal to confirm the endpoint is online.

  FILES REFERENCED IN THIS FILE:
  - External Endpoints: Cloudflare Worker AI API (`https://cltyouthserve-ai.chiragy100.workers.dev/`)
*/

// Step 1: Send a HTTP POST request to the custom AI worker endpoint with a simple test prompt
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

// Step 2: Parse the returned JSON response payload
const data = await response.json();

// Step 3: Print the AI's response text to the terminal console to verify connectivity
console.log(data.choices[0].message.content);