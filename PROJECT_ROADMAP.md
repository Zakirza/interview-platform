# AI Mock Interview Agent Roadmap

## Product Intent

Build an industrial-grade AI mock interview platform for machine learning engineer candidates. The system accepts a resume PDF, parses it into structured sections, conducts a five-phase interview using a concise professional interviewer persona, monitors speech signals for anxiety, and produces a final evaluation report.

The first implementation should prioritize a reliable end-to-end interview loop over secondary infrastructure. CI/CD, GCP deployment, and anti-cheating systems are deferred until the core product is stable.

## Current Inputs

- Sample resume: `Mohdzakir_Resume (1).pdf`
- Primary model target: Gemini 2.5 Flash on Vertex AI through the Google GenAI SDK
- Database target: Supabase
- External interview bank: [andrewekhalel/MLQuestions](https://github.com/andrewekhalel/MLQuestions), a public repository containing ML, computer vision, and NLP technical interview questions
- Initial role focus: Machine Learning Engineer

## MVP Scope

The MVP should support one candidate session from resume upload to final report.

Core capabilities:

- Upload a resume PDF.
- Parse the PDF with Gemini 2.5 Flash into structured resume sections.
- Store candidate, resume, parsed sections, interview state, messages, phase scores, and final report data in Supabase.
- Conduct a five-phase interview through chat.
- Use project-specific Socratic follow-up logic for technical phases.
- Ask factual ML engineering questions selected from a local markdown corpus derived from MLQuestions, with fallback generated questions when retrieval is weak.
- Detect speech pacing or stuttering signals well enough to pause and respond empathetically.
- Generate a final student report with phase-level scores, strengths, gaps, and recommended practice areas.

Out of scope for MVP:

- Video analysis.
- Anti-cheating detection.
- Full CI/CD and production GCP deployment.
- Multi-tenant organization management.
- Human interviewer dashboard beyond the candidate session and report.

## Interview Flow

### Phase 1: Background Warmup

Purpose: establish context from the resume without scoring.

Example prompts:

- "Please tell me about yourself."
- "Walk me through the most relevant parts of your background for a machine learning engineer role."
- "Which project or experience best represents your current technical ability?"

Evaluation:

- No formal score.
- Save observations only, such as clarity, confidence, and resume alignment.

### Phase 2: Primary Technical Deep Dive

Purpose: identify the strongest or most relevant project and drill down through increasingly specific ML engineering questions.

Questioning pattern:

1. Ask what the candidate built.
2. Ask how the system works end to end.
3. Ask about core concepts used in the project.
4. Ask about implementation trade-offs.
5. Ask formula-level, algorithmic, or systems-level details.
6. Continue follow-ups until the candidate cannot answer or reaches strong depth.

Example RAG chain:

- "What exactly did you build?"
- "How does the retrieval pipeline work?"
- "What is retrieval augmented generation?"
- "Which chunking strategies did you consider, and what are their trade-offs?"
- "How does vector indexing work?"
- "Compare HNSW and IVF Flat."
- "What is cosine similarity? Please give the formula."
- "What are the disadvantages of RAG?"
- "Why did you not use fine-tuning?"

Evaluation:

- Russian Doll Depth Score: how many valid follow-up levels the candidate sustains.
- Technical Correctness: factual and conceptual accuracy.
- Trade-off Reasoning: ability to compare alternatives.
- Implementation Ownership: evidence that the candidate actually built or deeply understood the work.
- Hint Responsiveness: whether the candidate moves toward the correct answer after a hint.

### Phase 3: Secondary Technical Deep Dive

Purpose: test transfer of understanding across another project, internship, research experience, or technical domain from the resume.

Evaluation:

- Same rubric as Phase 2.
- Add Breadth Transfer: whether the candidate can apply ML engineering reasoning outside the primary project.

### Phase 4: Factual ML Engineering Questions

Purpose: ask four to five objective technical questions with verifiable answers.

Question sourcing:

- Download or curate MLQuestions content into a local markdown corpus.
- Parse the resume to infer likely domains such as NLP, RAG, LLMs, computer vision, data science, or MLOps.
- Retrieve relevant questions using simple embedding or lexical similarity.
- Ensure at least five questions cover slightly different areas so the score is not overfit to one project.
- Generate replacement questions only when the corpus does not contain enough relevant coverage.

Evaluation:

- Correctness count.
- Partial-credit rubric per question.
- Coverage notes by topic.

### Phase 5: Behavioral Interview

Purpose: assess maturity, teamwork, realism, communication, and candidate curiosity.

Example prompts:

- "Where do you see yourself in five years?"
- "What are the most important challenges you have faced?"
- "How do you work in a team?"
- "Do you have any questions for me?"

Evaluation:

- Proactivity.
- Vision with realistic grounding.
- Team orientation.
- Self-awareness.
- Communication clarity.
- Follow-up question quality.
- Apply a penalty when the candidate asks no follow-up questions.

## Interviewer Persona

The interviewer must sound professional, concise, and neutral.

Rules:

- Do not over-praise answers.
- Avoid phrases such as "incredible", "great answer", and "let's move to the next".
- Do not reveal scoring while the interview is active.
- Use brief transitions.
- Ask one primary question at a time.
- When the candidate struggles, offer one useful hint, then evaluate whether they move toward the answer.
- If speech signals indicate anxiety, pause the interview and say something calm and direct, such as: "Let's pause for a moment. Take a breath, and when you are ready, continue from the last point."

## Architecture

Recommended stack for the MVP:

- Frontend: Next.js or React with a focused interview workspace.
- Backend: Node.js API routes or a Python FastAPI service, chosen before implementation based on the current repo direction.
- LLM: Google GenAI SDK with Vertex AI Gemini 2.5 Flash.
- Storage: Supabase Postgres plus Supabase Storage for uploaded PDFs if needed.
- Voice: browser speech capture, speech-to-text, pacing/stutter heuristics, and Gemini-backed response generation. Text-to-speech can be added after the typed chat loop is reliable.
- Retrieval: local markdown corpus from MLQuestions plus embeddings or lexical similarity.

Key services:

- Resume Parser: Gemini PDF extraction into normalized sections.
- Interview Orchestrator: phase state machine, interviewer prompt, and follow-up selection.
- Question Retriever: domain inference and factual question selection.
- Evaluator: per-phase scoring and evidence capture.
- Report Generator: final student-facing report.
- Voice Monitor: speech rate, long pauses, repeated restarts, and stutter-like repetition signals.

## Data Model Draft

Supabase tables:

- `candidates`: candidate profile and metadata.
- `resume_documents`: uploaded file metadata and parse status.
- `resume_sections`: structured resume sections such as background, education, experience, projects, skills, and publications.
- `interview_sessions`: session state, role target, current phase, and completion status.
- `interview_messages`: interviewer and candidate turns.
- `phase_evaluations`: phase score, rubric details, evidence, and hint responsiveness.
- `question_bank_items`: imported or generated factual questions, answers, tags, and source.
- `final_reports`: generated report content and aggregate score.
- `voice_events`: speech rate, pause, stutter, and empathy intervention events.

## Prompting Plan

Prompt templates needed:

- Resume parsing prompt with strict JSON schema.
- Interviewer system prompt with professional persona rules.
- Phase 1 background prompt.
- Phase 2 and Phase 3 Socratic deep-dive prompt.
- Phase 4 factual question prompt with answer key.
- Phase 5 behavioral prompt.
- Evaluation prompt per phase.
- Final report prompt.
- Empathy intervention prompt.

All prompts should be versioned in source control because rubric drift will affect scores.

## Evaluation Criteria

### Phase 1

- No score.
- Store non-scored notes: clarity, resume alignment, and areas to probe.

### Phase 2 and Phase 3

Use a 0-5 scale for each metric:

- Depth: number and difficulty of follow-up levels answered.
- Correctness: factual accuracy.
- Reasoning: trade-off analysis and causal explanation.
- Ownership: concrete implementation details.
- Recovery: ability to improve after hints.

Suggested Russian Doll Depth Score:

- 0: cannot explain the project beyond surface claims.
- 1: explains the high-level goal only.
- 2: explains components but misses core mechanisms.
- 3: explains mechanisms and some trade-offs.
- 4: handles implementation details, trade-offs, and failure modes.
- 5: reaches algorithmic, mathematical, or systems-level depth with accuracy.

### Phase 4

- Score each factual answer as correct, partially correct, or incorrect.
- Track the answer key and evidence used.
- Report total correct out of total asked.

### Phase 5

Use a 0-5 scale for:

- Proactivity.
- Realistic ambition.
- Teamwork.
- Self-awareness.
- Communication.
- Interviewer follow-up questions.

Apply a penalty when the candidate asks no follow-up questions.

## Implementation Tasks

### Approval Gate 0: Roadmap Approval

- [ ] Review and approve this roadmap.
- [ ] Confirm frontend/backend stack preference.
- [ ] Confirm Supabase project details and environment variable names.
- [ ] Confirm GCP project, Vertex AI location, and Gemini model name.

### Milestone 1: Project Foundation

- [ ] Initialize the application framework.
- [ ] Add environment configuration validation.
- [ ] Add basic routing and interview workspace shell.
- [ ] Add Supabase client setup.
- [ ] Add Google GenAI client setup.

### Milestone 2: Resume Upload and Parsing

- [ ] Build resume PDF upload UI.
- [ ] Store uploaded resume metadata.
- [ ] Send PDF to Gemini 2.5 Flash for parsing.
- [ ] Validate parsed JSON schema.
- [ ] Store normalized resume sections in Supabase.
- [ ] Add parse error handling and retry states.

### Milestone 3: Interview Orchestration

- [ ] Implement interview session state machine.
- [ ] Add phase progression rules.
- [ ] Implement professional interviewer prompt template.
- [ ] Add message persistence.
- [ ] Build typed chat experience.
- [ ] Add Phase 1 background flow.

### Milestone 4: Socratic Technical Deep Dives

- [ ] Identify primary project from resume sections.
- [ ] Generate Phase 2 drill-down questions.
- [ ] Track depth level and candidate answer quality.
- [ ] Add hinting behavior.
- [ ] Add Phase 2 evaluation.
- [ ] Repeat the same structure for Phase 3 with a secondary project or experience.

### Milestone 5: Factual Question Bank

- [ ] Download or curate MLQuestions into a local markdown file.
- [ ] Normalize questions, answers, tags, and sources.
- [ ] Infer candidate domain from resume.
- [ ] Implement simple similarity retrieval.
- [ ] Select at least five questions across nearby ML engineering areas.
- [ ] Add generated fallback questions with answer keys when needed.
- [ ] Add Phase 4 grading.

### Milestone 6: Behavioral Interview

- [ ] Add Phase 5 behavioral prompts.
- [ ] Add behavioral scoring rubric.
- [ ] Penalize missing candidate follow-up questions.
- [ ] Store behavioral evidence snippets.

### Milestone 7: Voice and Empathy Layer

- [ ] Add browser audio capture.
- [ ] Add speech-to-text path.
- [ ] Track speech rate, long pauses, repeated restarts, and stutter-like repetitions.
- [ ] Trigger pause-and-relax intervention when anxiety signals exceed threshold.
- [ ] Store voice events.
- [ ] Add optional interviewer text-to-speech after typed interview is stable.

### Milestone 8: Final Report

- [ ] Aggregate phase scores.
- [ ] Generate final report with strengths, weaknesses, and recommendations.
- [ ] Add report view.
- [ ] Add report export path.

### Milestone 9: Quality and Hardening

- [ ] Add unit tests for state machine and scoring helpers.
- [ ] Add integration tests for resume parsing and interview flow with mocked LLM responses.
- [ ] Add prompt regression fixtures.
- [ ] Add Supabase schema migration files.
- [ ] Add privacy and data-retention notes.
- [ ] Add graceful failure states for LLM, database, and audio errors.

### Future Milestones

- [ ] CI/CD with GitHub Actions.
- [ ] GCP deployment.
- [ ] Anti-cheating signals.
- [ ] Video-based stress and attention analysis.
- [ ] Interviewer dashboard.
- [ ] Multi-role interview presets.

## Risks and Decisions

Open decisions:

- Whether the app should be Next.js full-stack or React plus FastAPI.
- Whether audio should be implemented in the MVP or immediately after the typed flow.
- Whether the factual question bank should be stored in Git as markdown only, Supabase only, or both.
- Whether generated factual questions require human review before being used.

Risks:

- Gemini PDF parsing may occasionally produce malformed structured output, so schema validation and retries are required.
- Deep-dive scoring can become inconsistent unless prompts and rubrics are versioned.
- Voice anxiety detection should be treated as a supportive signal, not a medical or psychological diagnosis.
- Supabase keys and GCP credentials must never be committed.

## Definition of Done for MVP

- A student can upload the sample resume.
- The resume is parsed into structured sections.
- The interview progresses through all five phases.
- The interviewer maintains a neutral professional tone.
- Technical phases use project-specific Socratic drill-down.
- Factual questions are selected from or aligned with the MLQuestions corpus.
- The system evaluates each scored phase with evidence.
- The final report is generated and viewable.
- Secrets are read from environment variables only.
- Core flows have tests or reliable mocked verification.
