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

export const generateInitialFlashcards = async (file, initialCount = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const filePart = await fileToGenerativePart(file);

    const prompt = `
      You are an expert tutor. Analyze the attached PDF document to assess its length, technical depth, and information density.

      Create EXACTLY ${initialCount} high-quality flashcards focusing on the most important introductory concepts in the file to get the student started immediately.

      IMPORTANT INSTRUCTIONS:
      1. Generate the flashcards in the exact order in which the topics are discussed in the PDF.
      2. If there are any diagrams, charts, or visual aids relevant to a concept, explicitly mention them and describe what to study from them in the "answer" part of the flashcard.
      3. For the "answer" field, structure the text for MAXIMUM READABILITY. Use short sentences, clear line breaks (using \\n), and bullet points (using - ) where appropriate instead of creating a massive wall of text. KEEP IT CONCISE.

      STRICT OUTPUT FORMAT:
      Return ONLY a raw JSON array.
      Do NOT output your reasoning, summary, or any introductory text. 
      Do NOT use Markdown formatting (no \`\`\`json or \`\`\`).

      Example of expected output:
      [
        { "question": "What is X?", "answer": "X is Y. (Study the diagram showing...)" },
        { "question": "Define Z", "answer": "Z is..." }
      ]
      `;

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Error (Initial):", error);
    return [{
      question: "Error",
      answer: "Could not generate initial cards. Please check your API key or try a smaller PDF."
    }];
  }
};

export const generateRemainingFlashcards = async (file, existingCards) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const filePart = await fileToGenerativePart(file);

    // We pass the existing cards as a string to the prompt so it knows what was already generated.
    const existingCardsStr = JSON.stringify(existingCards, null, 2);

    const prompt = `
      You are an expert tutor. Analyze the attached PDF document.

      You have ALREADY generated the following flashcards:
      ${existingCardsStr}

      Based on the document's length, technical depth, and information density, dynamically determine the optimal number of ADDITIONAL high-quality flashcards needed to comprehensively test a student's understanding of the REST of the material. Create those additional flashcards focusing on the remaining important concepts.

      IMPORTANT INSTRUCTIONS:
      1. DO NOT repeat any of the questions or concepts from the ALREADY generated flashcards provided above.
      2. Generate the flashcards in the exact order in which the remaining topics are discussed in the PDF.
      3. If there are any diagrams, charts, or visual aids relevant to a concept, explicitly mention them and describe what to study from them in the "answer" part of the flashcard.
      4. For the "answer" field, structure the text for MAXIMUM READABILITY. Use short sentences, clear line breaks (using \\n), and bullet points (using - ) where appropriate instead of creating a massive wall of text. KEEP IT CONCISE.

      STRICT OUTPUT FORMAT:
      Return ONLY a raw JSON array of the NEW flashcards.
      Do NOT output your reasoning, summary, or any introductory text. 
      Do NOT include the previously generated cards in your output.
      Do NOT use Markdown formatting (no \`\`\`json or \`\`\`).

      Example of expected output:
      [
        { "question": "What is A?", "answer": "A is B. (Study the diagram showing...)" },
        { "question": "Define C", "answer": "C is..." }
      ]
      `;

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Error (Remaining):", error);
    // If background generation fails, just return an empty array so we don't break the existing cards
    return [];
  }
};