
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { Recipe, GroundingSource, UserProfile, PantryItem } from "../types";

/**
 * @file geminiService.ts
 * @description High-performance service layer for Google Gemini API integration.
 * Implements vision-to-text, complex reasoning for culinary suggestions, 
 * multimodal image generation, and real-time audio orchestration.
 */

const API_KEY = process.env.API_KEY;

/**
 * Initializes and returns the Google GenAI client instance.
 * @throws {Error} If API_KEY environment variable is not configured.
 */
export const getAI = () => {
  if (!API_KEY) throw new Error("API Key is missing from environment context.");
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Vision Analysis: Processes fridge imagery to detect visible food items.
 * Uses 'gemini-3-flash-preview' for high-speed image processing.
 * @param base64Image - Standard base64 encoded JPEG string.
 * @returns Promise<string[]> - List of detected ingredient names.
 */
export async function analyzeFridgeImage(base64Image: string): Promise<string[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: 'Analyze this fridge and identify all visible ingredients. Provide only a comma-separated list of items found.' }
      ]
    },
  });
  const text = response.text || "";
  return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * AI-Driven Recipe Generation: Synthesizes user preferences, pantry inventory, 
 * and fridge contents into tailored culinary suggestions.
 * Employs 'gemini-3-pro-preview' with a thinking budget for complex logic.
 */
export async function suggestRecipes(
  fridgeIngredients: string[], 
  pantryItems: PantryItem[], 
  profile: UserProfile, 
  dietary: string[]
): Promise<Recipe[]> {
  const ai = getAI();
  const pantryNames = pantryItems.map(p => p.name).join(', ');
  const prompt = `
    Context: Professional Chef AI Assistant
    
    User Profile:
    - Skill Level: ${profile.skillLevel}
    - Cuisines: ${profile.preferredCuisines.join(', ') || 'Global'}
    - Avoid: ${profile.dislikes.join(', ') || 'None'}
    
    Inventory:
    - Fridge (High Priority): ${fridgeIngredients.join(', ')}
    - Pantry (Secondary): ${pantryNames || 'Empty'}
    
    Requirements: ${dietary.join(', ') || 'None'}

    Generate 3 distinct recipes. Prioritize items in the fridge. 
    Ensure steps includes precise timing (e.g., "Saute for 5 minutes").
    Avoid any ingredients in the "Avoid" list.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  isMissing: { type: Type.BOOLEAN }
                },
                required: ["name", "isMissing"]
              }
            },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageUrl: { type: Type.STRING }
          },
          required: ["id", "title", "description", "difficulty", "prepTime", "calories", "ingredients", "steps", "imageUrl"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

/**
 * High-End Image Generation: Creates cinematic food photography.
 * Leverages 'gemini-3-pro-image-preview' for 1K/2K resolution.
 */
export async function generateRecipeImage(prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K"): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `Professional food photography, cinematic lighting, top-down view of: ${prompt}` }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
}

/**
 * Image Editing: Modifies existing imagery using contextual prompts.
 * Utilizes 'gemini-2.5-flash-image' for reactive editing.
 */
export async function editImage(base64Image: string, editPrompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: editPrompt }
      ]
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
}

/**
 * Location-Aware Retrieval: Finds grocery stores using Google Maps grounding.
 */
export async function findNearbyStores(query: string, lat: number, lng: number): Promise<{ text: string, sources: GroundingSource[] }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
      }
    }
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.maps)
    ?.map((chunk: any) => ({
      title: chunk.maps.title,
      uri: chunk.maps.uri
    })) || [];

  return { text: response.text || "", sources };
}

/**
 * Audio Decoding Utility: Converts PCM raw bytes to browser-compatible AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * PCM Audio Encoding Utility: Normalizes Float32 to Int16 PCM.
 */
export function encodeAudio(data: Float32Array): string {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 Decoding Utility.
 */
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
