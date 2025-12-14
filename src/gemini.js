import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateFlashcards = async (file) => {
  try {
    // 1. Prepare the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Prepare the file
    const filePart = await fileToGenerativePart(file);

    // 3. The Prompt
    const prompt = `
      You are an expert tutor. Analyze the attached PDF document.
      Create 10 high-quality flashcards based on the most important concepts in the file.
      
      STRICT OUTPUT FORMAT:
      Return ONLY a raw JSON array. 
      Do NOT use Markdown formatting (no \`\`\`json or \`\`\`).
      
      Example of expected output:
      [
        { "question": "What is X?", "answer": "X is Y" },
        { "question": "Define Z", "answer": "Z is..." }
      ]
    `;

    // 4. Generate
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    // 5. Clean and Parse
    // Sometimes the AI wraps it in markdown despite instructions, so we clean it.
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Error:", error);
    // Return a dummy card if it fails so the app doesn't crash
    return [{ 
      question: "Error", 
      answer: "Could not generate cards. Please check your API key or try a smaller PDF." 
    }];
  }
};