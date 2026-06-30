import { NextResponse } from "next/server";
import { createSession, startSession } from "@/lib/interview/engine";
import type { ParsedResume } from "@/lib/interview/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { parsedResume?: ParsedResume };
  const session = createSession(body.parsedResume?.candidateName ?? "Candidate");
  const started = startSession({ ...session, parsedResume: body.parsedResume ?? null });

  return NextResponse.json(started);
}
