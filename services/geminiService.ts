import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBio = async (
  name: string,
  dates: string,
  keyFacts: string,
  tone: 'formal' | 'warm' | 'poetic' = 'warm'
): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Write a memorial biography for ${name} (${dates}).
      Key facts provided by family: ${keyFacts}.
      Tone: ${tone}.
      Length: Approximately 150-200 words.
      Focus on celebrating their life and legacy.
      Do not include placeholders.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate bio at this time.";
  } catch (error) {
    console.error("Gemini Bio Error:", error);
    return "An error occurred while generating the biography. Please try again.";
  }
};

export const analyzePhoto = async (base64Image: string): Promise<{ caption: string; tags: string[] }> => {
  try {
    const ai = getAI();
    
    // We want a structured output for the photo analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity in this demo context, ideally detect mime
              data: base64Image,
            },
          },
          {
            text: "Analyze this photo for a family memorial gallery. Provide a respectful, short caption (1 sentence) and a list of 3-5 relevant descriptive tags (e.g., 'Wedding', 'Vacation', 'Grandma').",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["caption", "tags"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { caption: "A cherished memory.", tags: ["Memory"] };
  }
};