// File: /api/chat.js

export const config = {
    runtime: 'edge', // Use the Vercel Edge Runtime for speed
};

export default async function handler(request) {
    // 1. Get the user's prompt from the request body
    const { prompt, systemInstruction } = await request.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 2. Get the secret API key from the Environment Variable
    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

    if (!GOOGLE_AI_API_KEY) {
         return new Response(JSON.stringify({ error: "API Key not configured on the server" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_AI_API_KEY}`;

    // 3. Prepare the request to the Google AI API
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    try {
        // 4. Call the Google AI API
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error("Google API Error:", errorData);
            throw new Error(errorData.error.message || `Google API failed with status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();

        // 5. Send the response back to your frontend
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}