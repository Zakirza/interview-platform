import { env, hasGeminiConfig } from "@/lib/env";
import { resumeParsingPrompt } from "@/lib/interview/prompts";
import type { ParsedResume } from "@/lib/interview/types";

export async function parseResumeWithGemini(file: File): Promise<ParsedResume | null> {
  if (!hasGeminiConfig()) return null;

  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({
    vertexai: true,
    project: env.GCP_PROJECT_ID,
    location: env.GCP_LOCATION
  });

  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  const response = await client.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: resumeParsingPrompt },
          {
            inlineData: {
              mimeType: file.type || "application/pdf",
              data: bytes
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) return null;

  return JSON.parse(text) as ParsedResume;
}
