import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatInstances: Record<string, Chat> = {};

const getChatInstance = (langCode: string, langName: string): Chat => {
  if (!chatInstances[langCode]) {
    console.log(`Creating new chat instance for language: ${langName} (${langCode})`);
    chatInstances[langCode] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are an expert agricultural assistant named 'SARVANAM AI Assistant'. Your role is to help farmers improve their agricultural practices. Provide concise, actionable advice on topics like pest control, soil health, irrigation, and crop disease. When asked for instructions, provide clear, step-by-step guides. Always respond in the language specified: ${langName}.`,
      },
    });
  }
  return chatInstances[langCode];
};

export const streamChatResponse = async (message: string, langCode: string, langName: string) => {
    const chat = getChatInstance(langCode, langName);
    return chat.sendMessageStream({ message: message });
};


export const analyzeCropImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    
    const textPart = {
      text: `Analyze this image of a crop. Identify the plant, detect any signs of disease, pests, or nutrient deficiencies. Provide a detailed report with the following sections:
      ### Plant Identification
      - **Species:** 
      - **Confidence:** (e.g., High, Medium, Low)
      
      ### Health Assessment
      - **Overall Health:** (e.g., Healthy, Stressed, Diseased)
      - **Detected Issues:** (List any diseases, pests, or deficiencies found)
      
      ### Detailed Findings
      - (Provide a more detailed explanation of each issue found)
      
      ### Actionable Recommendations
      - **Treatment:** (Suggest specific treatments, organic or chemical)
      - **Prevention:** (Provide steps to prevent future issues)

      ### Estimated Treatment Cost (per Acre)
      - **Organic:** (Provide an estimated cost range, e.g., $10 - $20)
      - **Chemical:** (Provide an estimated cost range, e.g., $5 - $15)
      
      If the image is unclear, not of a plant, or analysis is not possible, please state that clearly and concisely. For example: "The provided image is too blurry for an accurate analysis." or "This image does not appear to contain a plant."`
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error("Analysis service returned an empty response. The image might be unprocessable or of low quality.");
    }
    return text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // This could be refined to check for specific API error codes.
    throw new Error("The AI analysis service is currently unavailable. Please check your connection and try again later.");
  }
};