export type InterviewPhaseId = 1 | 2 | 3 | 4 | 5;

export type InterviewRole = "interviewer" | "candidate" | "system";

export type ResumeSectionKind =
  | "background"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "publications"
  | "other";

export type ResumeSection = {
  id: string;
  kind: ResumeSectionKind;
  title: string;
  summary: string;
  evidence: string[];
};

export type ParsedResume = {
  candidateName: string;
  targetRole: string;
  inferredDomains: string[];
  strongestProjectId?: string;
  secondaryProjectId?: string;
  sections: ResumeSection[];
};

export type InterviewMessage = {
  id: string;
  role: InterviewRole;
  phaseId: InterviewPhaseId;
  content: string;
  createdAt: string;
};

export type PhaseEvaluation = {
  phaseId: InterviewPhaseId;
  score: number | null;
  maxScore: number;
  rubric: Record<string, number | null>;
  evidence: string[];
  notes: string;
};

export type InterviewSession = {
  id: string;
  candidateName: string;
  currentPhaseId: InterviewPhaseId;
  parsedResume: ParsedResume | null;
  messages: InterviewMessage[];
  evaluations: PhaseEvaluation[];
  status: "draft" | "active" | "complete";
};

export type NextQuestionInput = {
  session: InterviewSession;
  candidateAnswer?: string;
};

export type NextQuestionOutput = {
  session: InterviewSession;
  interviewerMessage: InterviewMessage;
  empathyIntervention?: string;
};

export type FactualQuestion = {
  id: string;
  topic: string;
  question: string;
  answerKey: string;
  source: "mlquestions" | "generated";
};
