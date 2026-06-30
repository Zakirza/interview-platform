import { getPhase, nextPhase } from "./phases";
import { createEmptyEvaluation, scoreDepth } from "./rubrics";
import { retrieveQuestions } from "./question-bank";
import type { InterviewMessage, InterviewPhaseId, InterviewSession, NextQuestionInput, NextQuestionOutput } from "./types";

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function message(role: InterviewMessage["role"], phaseId: InterviewPhaseId, content: string): InterviewMessage {
  return {
    id: id(role),
    role,
    phaseId,
    content,
    createdAt: new Date().toISOString()
  };
}

export function createSession(candidateName = "Candidate"): InterviewSession {
  return {
    id: id("session"),
    candidateName,
    currentPhaseId: 1,
    parsedResume: null,
    messages: [],
    evaluations: [1, 2, 3, 4, 5].map((phaseId) => createEmptyEvaluation(phaseId as InterviewPhaseId)),
    status: "draft"
  };
}

export function startSession(session: InterviewSession): NextQuestionOutput {
  const firstQuestion = message(
    "interviewer",
    1,
    "Please tell me about yourself, focusing on the parts of your background most relevant to a machine learning engineer role."
  );

  return {
    session: {
      ...session,
      currentPhaseId: 1,
      messages: [...session.messages, firstQuestion],
      status: "active"
    },
    interviewerMessage: firstQuestion
  };
}

export function getNextQuestion({ session, candidateAnswer }: NextQuestionInput): NextQuestionOutput {
  const phaseId = session.currentPhaseId;
  const messages = [...session.messages];

  if (candidateAnswer?.trim()) {
    messages.push(message("candidate", phaseId, candidateAnswer.trim()));
  }

  const phaseMessages = messages.filter((item) => item.phaseId === phaseId);
  const candidateTurnsInPhase = phaseMessages.filter((item) => item.role === "candidate").length;
  const empathyIntervention = detectAnxietyTextSignal(candidateAnswer);
  const targetPhase = shouldAdvancePhase(phaseId, candidateTurnsInPhase) ? nextPhase(phaseId) : phaseId;
  const question = buildQuestion(session, targetPhase, candidateTurnsInPhase);
  const interviewerMessage = message("interviewer", targetPhase, empathyIntervention ? `${empathyIntervention}\n\n${question}` : question);

  const updatedEvaluations = updateLightweightEvaluation(session, phaseId, candidateAnswer, candidateTurnsInPhase);

  return {
    session: {
      ...session,
      currentPhaseId: targetPhase,
      messages: [...messages, interviewerMessage],
      evaluations: updatedEvaluations,
      status: targetPhase === 5 && candidateTurnsInPhase >= 4 ? "complete" : "active"
    },
    interviewerMessage,
    empathyIntervention
  };
}

function shouldAdvancePhase(phaseId: InterviewPhaseId, candidateTurnsInPhase: number) {
  const thresholds: Record<InterviewPhaseId, number> = {
    1: 2,
    2: 5,
    3: 4,
    4: 5,
    5: 4
  };

  return phaseId < 5 && candidateTurnsInPhase >= thresholds[phaseId];
}

function buildQuestion(session: InterviewSession, phaseId: InterviewPhaseId, candidateTurnsInPhase: number) {
  const parsedResume = session.parsedResume;
  const primaryProject =
    parsedResume?.sections.find((section) => section.id === parsedResume.strongestProjectId) ??
    parsedResume?.sections.find((section) => section.kind === "projects");
  const secondaryProject =
    parsedResume?.sections.find((section) => section.id === parsedResume.secondaryProjectId) ??
    parsedResume?.sections.find((section) => section.kind === "experience");

  if (phaseId === 1) {
    return "Which project or experience from your resume best represents your current technical ability?";
  }

  if (phaseId === 2) {
    const projectName = primaryProject?.title ?? "your strongest project";
    const chain = [
      `I want to focus on ${projectName}. What exactly did you build?`,
      "Explain how the system works end to end. Include the data flow and model components.",
      "Which ML concept is most central to this project, and how does it work?",
      "What trade-offs did you consider in the design? Be specific.",
      "Describe one failure mode and how you would debug or improve it.",
      "Give me one algorithmic or mathematical detail from this project that you understand deeply."
    ];
    return chain[Math.min(candidateTurnsInPhase, chain.length - 1)];
  }

  if (phaseId === 3) {
    const projectName = secondaryProject?.title ?? "another technical experience from your resume";
    const chain = [
      `Now I want to examine ${projectName}. What problem were you solving?`,
      "What was your specific contribution?",
      "Which technical decision in this work had the highest impact?",
      "How would you measure whether this project succeeded?",
      "If you rebuilt it today, what would you change and why?"
    ];
    return chain[Math.min(candidateTurnsInPhase, chain.length - 1)];
  }

  if (phaseId === 4) {
    const questions = retrieveQuestions(parsedResume?.inferredDomains ?? ["machine learning"], 5);
    return questions[Math.min(candidateTurnsInPhase, questions.length - 1)].question;
  }

  const behavioral = [
    "Where do you see yourself in five years?",
    "What are the most important challenges you have faced in your technical work?",
    "How do you work in a team when there is disagreement about the technical direction?",
    "What would you want to learn or improve in your next role?",
    "Do you have any questions for me?"
  ];
  return behavioral[Math.min(candidateTurnsInPhase, behavioral.length - 1)];
}

function updateLightweightEvaluation(
  session: InterviewSession,
  phaseId: InterviewPhaseId,
  candidateAnswer: string | undefined,
  candidateTurnsInPhase: number
) {
  return session.evaluations.map((evaluation) => {
    if (evaluation.phaseId !== phaseId || phaseId === 1 || !candidateAnswer?.trim()) {
      return evaluation;
    }

    const answerLengthScore = Math.min(5, Math.max(1, Math.ceil(candidateAnswer.trim().length / 120)));
    const score = phaseId === 2 || phaseId === 3 ? Math.round((scoreDepth(candidateTurnsInPhase) + answerLengthScore) / 2) : answerLengthScore;

    return {
      ...evaluation,
      score,
      rubric: Object.fromEntries(Object.keys(evaluation.rubric).map((key) => [key, score])),
      evidence: [...evaluation.evidence.slice(-4), candidateAnswer.trim()],
      notes: "Local heuristic score. Replace with Gemini evaluator when credentials are configured."
    };
  });
}

function detectAnxietyTextSignal(candidateAnswer?: string) {
  if (!candidateAnswer) return undefined;
  const repeatedFiller = /\b(um|uh|like|sorry)\b(?:\W+\b(um|uh|like|sorry)\b){2,}/i.test(candidateAnswer);
  const repeatedWords = /\b(\w{3,})\b(?:\W+\1\b){2,}/i.test(candidateAnswer);

  if (!repeatedFiller && !repeatedWords) return undefined;
  return "Let's pause for a moment. Take a breath, and when you are ready, continue from the last point.";
}

export function summarizeSession(session: InterviewSession) {
  const scored = session.evaluations.filter((evaluation) => evaluation.score !== null);
  const total = scored.reduce((sum, evaluation) => sum + (evaluation.score ?? 0), 0);
  const max = scored.reduce((sum, evaluation) => sum + evaluation.maxScore, 0);

  return {
    candidateName: session.candidateName,
    phase: getPhase(session.currentPhaseId).name,
    total,
    max,
    percentage: max ? Math.round((total / max) * 100) : 0,
    evaluations: session.evaluations
  };
}
