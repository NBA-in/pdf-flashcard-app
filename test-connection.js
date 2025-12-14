// test-connection.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// specific logic to load local env if regular dotenv fails
dotenv.config({ path: './.env.local' }); 

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: No API Key found. Check .env.local file.");
  process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function checkConnection() {
  try {
    // 1. Try a simple text generation with the most basic model
    console.log("📡 Testing connection with 'gemini-pro'...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello, are you there?");
    console.log("✅ SUCCESS! The API is working.");
    console.log("Response:", result.response.text());
    
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED");
    console.error("Error Message:", error.message);
    
    if (error.message.includes("404")) {
      console.log("\n💡 DIAGNOSIS: The API Key is valid, but it cannot find the model.");
      console.log("👉 ACTION: Go to https://aistudio.google.com/app/apikey");
      console.log("   Create a NEW key in a new project. Your current project might be bugged.");
    } else if (error.message.includes("403")) {
      console.log("\n💡 DIAGNOSIS: API Key is restricted or quota exceeded.");
    }
  }
}

checkConnection();