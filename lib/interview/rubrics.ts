import type { InterviewPhaseId, PhaseEvaluation } from "./types";

export const phaseRubrics: Record<InterviewPhaseId, string[]> = {
  1: ["clarity", "resumeAlignment"],
  2: ["depth", "correctness", "reasoning", "ownership", "recovery"],
  3: ["depth", "correctness", "reasoning", "ownership", "recovery", "breadthTransfer"],
  4: ["correctness", "coverage", "precision"],
  5: ["proactivity", "realisticAmbition", "teamwork", "selfAwareness", "communication", "followUpQuestions"]
};

export function createEmptyEvaluation(phaseId: InterviewPhaseId): PhaseEvaluation {
  const rubric = Object.fromEntries(phaseRubrics[phaseId].map((metric) => [metric, null]));

  return {
    phaseId,
    score: phaseId === 1 ? null : 0,
    maxScore: phaseId === 1 ? 0 : 5,
    rubric,
    evidence: [],
    notes: phaseId === 1 ? "Phase 1 is observational and not formally scored." : ""
  };
}

export function scoreDepth(answerCount: number) {
  if (answerCount <= 1) return 1;
  if (answerCount === 2) return 2;
  if (answerCount === 3) return 3;
  if (answerCount === 4) return 4;
  return 5;
}
