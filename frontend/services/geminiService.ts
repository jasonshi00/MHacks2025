
import { GoogleGenAI, Type } from "@google/genai";
import { Component, HttpMethod } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateServiceEndpoints = async (prompt: string): Promise<Omit<Component, 'componentId' | 'serviceId' | 'children'>[]> => {
  try {
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          route: {
            type: Type.STRING,
            description: "The API route path, e.g., '/users/:id'. Should start with a '/'."
          },
          method: {
            type: Type.STRING,
            description: "The HTTP method for the endpoint: 'GET', 'POST', 'PUT', 'DELETE', or 'PATCH'."
          },
          attributes: {
            type: Type.OBJECT,
            description: "A simple JSON object representing the response body structure.",
            properties: {}
          },
        },
        required: ["route", "method", "attributes"],
      },
    };

    const fullPrompt = `Based on the following request, generate a list of REST API endpoints. For each endpoint, provide a route, an HTTP method, and a simple JSON object representing the response attributes.
    Request: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const responseText = response.text.trim();
    const generatedComponents = JSON.parse(responseText);

    // Validate and map the response to our Component type
    return generatedComponents.map((item: any) => ({
      route: item.route,
      method: item.method as HttpMethod,
      attributes: item.attributes,
    }));
    
  } catch (error) {
    console.error("Error generating service endpoints with Gemini:", error);
    throw new Error("Failed to generate AI-powered endpoints. Please check your prompt and API key.");
  }
};
