import type { ParsedResume } from "./types";

export const mockParsedResume: ParsedResume = {
  candidateName: "Mohd Zakir",
  targetRole: "Machine Learning Engineer",
  inferredDomains: ["machine learning", "natural language processing", "retrieval augmented generation"],
  strongestProjectId: "project-rag",
  secondaryProjectId: "project-ml",
  sections: [
    {
      id: "background",
      kind: "background",
      title: "Candidate Background",
      summary:
        "Machine learning engineer candidate with project experience that should be probed through applied ML, NLP, and system design questions.",
      evidence: ["Sample resume uploaded locally. Replace with Gemini PDF parsing when credentials are configured."]
    },
    {
      id: "project-rag",
      kind: "projects",
      title: "Primary ML Project",
      summary:
        "A resume-derived primary project placeholder for Socratic ML engineering drill-down. The live parser will replace this with the strongest extracted project.",
      evidence: ["Project section to be extracted from the resume PDF."]
    },
    {
      id: "skills",
      kind: "skills",
      title: "Technical Skills",
      summary: "Likely ML engineering, NLP, and data science skills inferred for the initial MVP flow.",
      evidence: ["Skills section to be extracted from the resume PDF."]
    }
  ]
};
