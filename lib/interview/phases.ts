import type { InterviewPhaseId } from "./types";

export const interviewPhases: Array<{
  id: InterviewPhaseId;
  name: string;
  shortName: string;
  purpose: string;
}> = [
  {
    id: 1,
    name: "Background Warmup",
    shortName: "Background",
    purpose: "Understand the candidate's resume context without formal scoring."
  },
  {
    id: 2,
    name: "Primary Technical Deep Dive",
    shortName: "Primary Dive",
    purpose: "Use the strongest project as a proxy for ML engineering depth."
  },
  {
    id: 3,
    name: "Secondary Technical Deep Dive",
    shortName: "Second Dive",
    purpose: "Test whether the candidate can transfer technical reasoning to another project."
  },
  {
    id: 4,
    name: "Factual ML Questions",
    shortName: "Factual",
    purpose: "Ask objective ML engineering questions with verifiable answers."
  },
  {
    id: 5,
    name: "Behavioral Interview",
    shortName: "Behavioral",
    purpose: "Evaluate maturity, teamwork, proactivity, and candidate curiosity."
  }
];

export function getPhase(id: InterviewPhaseId) {
  return interviewPhases.find((phase) => phase.id === id) ?? interviewPhases[0];
}

export function nextPhase(id: InterviewPhaseId): InterviewPhaseId {
  if (id >= 5) return 5;
  return (id + 1) as InterviewPhaseId;
}
