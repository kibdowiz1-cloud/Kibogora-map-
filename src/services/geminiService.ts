import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MapResult {
  text: string;
  groundingChunks: any[];
}

export async function searchPlaces(query: string, location?: { latitude: number; longitude: number }): Promise<MapResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: location ? {
            latitude: location.latitude,
            longitude: location.longitude
          } : undefined
        }
      }
    },
  });

  return {
    text: response.text || "",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}
