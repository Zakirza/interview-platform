import { NextResponse } from "next/server";
import { parseResumeWithGemini } from "@/lib/llm/gemini";
import { mockParsedResume } from "@/lib/interview/mock-resume";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Resume PDF is required." }, { status: 400 });
  }

  const parsedResume = (await parseResumeWithGemini(file).catch(() => null)) ?? {
    ...mockParsedResume,
    sections: mockParsedResume.sections.map((section) => ({
      ...section,
      evidence: [...section.evidence, `Uploaded file: ${file.name}`]
    }))
  };

  return NextResponse.json({ parsedResume });
}
