import { NextResponse } from "next/server";
import { summarizeSession } from "@/lib/interview/engine";
import type { InterviewSession } from "@/lib/interview/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { session?: InterviewSession };

  if (!body.session) {
    return NextResponse.json({ error: "Interview session is required." }, { status: 400 });
  }

  return NextResponse.json({ report: summarizeSession(body.session) });
}
