import { GoogleGenerativeAI } from "@google/generative-ai";

import fs from 'fs';
import path from 'path';

async function main() {
    // Read .env.local manually since dotenv doesn't parse local by default or might miss it
    let apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        try {
            const envPath = path.resolve(process.cwd(), '.env.local');
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
            }
        } catch (e) {
            console.error("Could not read .env.local", e);
        }
    }

    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Unfortunately the Node SDK for GoogleGenerativeAI doesn't expose listModels directly on the main class in some versions,
    // or it might be on the GoogleAIFileManager or similar?
    // Actually, for the generic SDK, listModels might not be available easily or requires @google/generative-ai/server (deprecated) structure?
    // Wait, let's try to just generate content with a known image model and see if it 404s.
    // We'll try 'imagen-3.0-generate-001'.

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Checking gemini-1.5-flash...");
    } catch (e) {
        console.error("gemini-1.5-flash failed.");
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Checking gemini-pro...");
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-pro works. Response:", result2.response.text().substring(0, 20) + "...");
    } catch (e) {
        console.error("gemini-pro failed:", e.message);
    }

    // Check Imagen (this might fail if SDK doesn't support the image path or model doesn't exist)
    // Note: The SDK currently (as of recent versions) doesn't always support the image generation syntax directly
    // unless using the 'imagen' specific tools or if the model name is valid for generateContent.
    // But let's try.
    /*
    try {
        console.log("Checking imagen-3.0-generate-001...");
        const imgModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
        const imgResult = await imgModel.generateContent("A cute cat"); // Text-to-image usually returns different structure
        console.log("imagen-3.0-generate-001 response:", imgResult);
    } catch(e) {
        console.error("imagen-3.0-generate-001 failed:", e.message);
    }
    */
}

main();
