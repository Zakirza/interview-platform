import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GCP_PROJECT_ID: z.string().optional(),
  GCP_LOCATION: z.string().default("us-central1"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash")
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  GCP_LOCATION: process.env.GCP_LOCATION,
  GEMINI_MODEL: process.env.GEMINI_MODEL
});

export function hasGeminiConfig() {
  return Boolean(env.GCP_PROJECT_ID && env.GCP_LOCATION && env.GEMINI_MODEL);
}

export function hasSupabaseConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
