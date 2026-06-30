"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  FileText,
  Loader2,
  Mic,
  PauseCircle,
  Play,
  Send,
  ShieldCheck,
  Upload
} from "lucide-react";
import { interviewPhases } from "@/lib/interview/phases";
import type { InterviewMessage, InterviewSession, ParsedResume } from "@/lib/interview/types";

type Report = {
  candidateName: string;
  phase: string;
  total: number;
  max: number;
  percentage: number;
  evaluations: InterviewSession["evaluations"];
};

export default function Home() {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Upload a resume PDF to begin.");
  const [report, setReport] = useState<Report | null>(null);
  const [voicePaused, setVoicePaused] = useState(false);

  const messages = session?.messages ?? [];
  const activePhase = session?.currentPhaseId ?? 1;
  const latestScores = useMemo(() => session?.evaluations ?? [], [session]);

  async function parseResume(file: File) {
    setBusy(true);
    setStatus("Parsing resume with Gemini when configured, otherwise using local development extraction.");
    setReport(null);

    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/resume/parse", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setBusy(false);
      setStatus("Resume parsing failed. Check the PDF and try again.");
      return;
    }

    const data = (await response.json()) as { parsedResume: ParsedResume };
    setResume(data.parsedResume);
    setStatus("Resume parsed. Start the interview when ready.");
    setBusy(false);
  }

  async function startInterview() {
    if (!resume) return;
    setBusy(true);
    setReport(null);

    const response = await fetch("/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsedResume: resume })
    });
    const data = (await response.json()) as { session: InterviewSession; interviewerMessage: InterviewMessage };

    setSession(data.session);
    setStatus("Interview active.");
    setBusy(false);
  }

  async function sendAnswer() {
    if (!session || !answer.trim()) return;
    const candidateAnswer = answer;
    setAnswer("");
    setBusy(true);

    const response = await fetch("/api/interview/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, candidateAnswer })
    });
    const data = (await response.json()) as { session: InterviewSession; empathyIntervention?: string };

    setSession(data.session);
    setStatus(data.empathyIntervention ? "An empathy pause was triggered." : data.session.status === "complete" ? "Interview complete." : "Interview active.");
    setBusy(false);
  }

  async function generateReport() {
    if (!session) return;
    setBusy(true);

    const response = await fetch("/api/interview/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session })
    });
    const data = (await response.json()) as { report: Report };

    setReport(data.report);
    setStatus("Report generated.");
    setBusy(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BrainCircuit size={20} aria-hidden />
          </div>
          <div>
            <div>AI Mock Interview</div>
            <div className="small-label">ML Engineer</div>
          </div>
        </div>

        <div>
          <div className="small-label">Interview Phases</div>
          <div className="phase-list" aria-label="Interview phase progress">
            {interviewPhases.map((phase) => (
              <div className={`phase-item ${phase.id === activePhase ? "active" : ""}`} key={phase.id}>
                <div className="phase-number">{phase.id}</div>
                <div>
                  <strong>{phase.shortName}</strong>
                  <p className="empty-state">{phase.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-item">
          <h3>Runtime Status</h3>
          <p>{status}</p>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <h1>Resume-aware interview workspace</h1>
            <p>Neutral interviewer tone, Socratic technical probing, factual scoring, and final reporting.</p>
          </div>
          <button className="secondary-button" onClick={generateReport} disabled={!session || busy}>
            <ShieldCheck size={18} aria-hidden />
            Report
          </button>
        </header>

        <div className="workspace">
          <section className="panel interview-panel" aria-label="Interview chat">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Interview</h2>
                <span className="status-pill">
                  <Bot size={15} aria-hidden />
                  {session ? `Phase ${session.currentPhaseId}` : "Not started"}
                </span>
              </div>
              <button
                className="icon-button"
                onClick={() => setVoicePaused((value) => !value)}
                title={voicePaused ? "Resume voice monitoring" : "Pause voice monitoring"}
                aria-label={voicePaused ? "Resume voice monitoring" : "Pause voice monitoring"}
              >
                {voicePaused ? <Play size={19} aria-hidden /> : <PauseCircle size={19} aria-hidden />}
              </button>
            </div>

            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty-state">
                  Start by uploading the resume. The first version supports a typed interview loop while the voice layer is being wired in.
                </div>
              ) : (
                messages.map((item) => (
                  <div className={`message ${item.role}`} key={item.id}>
                    {item.content}
                  </div>
                ))
              )}
            </div>

            <div className="composer">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={session ? "Type the candidate answer..." : "Start the interview first..."}
                disabled={!session || busy}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    void sendAnswer();
                  }
                }}
              />
              <button className="icon-button" disabled title="Voice input is staged for the next milestone" aria-label="Voice input staged">
                <Mic size={19} aria-hidden />
              </button>
              <button className="primary-button" onClick={sendAnswer} disabled={!session || !answer.trim() || busy}>
                {busy ? <Loader2 size={18} aria-hidden /> : <Send size={18} aria-hidden />}
                Send
              </button>
            </div>
          </section>

          <aside className="side-stack">
            <section className="panel tool-panel" aria-label="Resume tools">
              <div className="panel-header">
                <h2 className="panel-title">Resume</h2>
                <FileText size={18} aria-hidden />
              </div>
              <label className="file-input">
                <span className="small-label">PDF Upload</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void parseResume(file);
                  }}
                />
              </label>
              <button className="primary-button" onClick={startInterview} disabled={!resume || Boolean(session) || busy}>
                <Upload size={18} aria-hidden />
                Start Interview
              </button>
              {resume ? (
                <div className="section-list">
                  <div className="section-item">
                    <h3>{resume.candidateName}</h3>
                    <p>{resume.targetRole}</p>
                  </div>
                  {resume.sections.slice(0, 4).map((section) => (
                    <div className="section-item" key={section.id}>
                      <h3>{section.title}</h3>
                      <p>{section.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No parsed resume yet.</p>
              )}
            </section>

            <section className="panel tool-panel" aria-label="Scores">
              <div className="panel-header">
                <h2 className="panel-title">Evaluation</h2>
                <ShieldCheck size={18} aria-hidden />
              </div>
              <div className="score-list">
                {latestScores.map((score) => (
                  <div className="score-item" key={score.phaseId}>
                    <h3>Phase {score.phaseId}</h3>
                    <p>{score.score === null ? "Observation only" : `${score.score}/${score.maxScore}`}</p>
                    {score.score !== null ? (
                      <div className="score-meter" aria-hidden>
                        <span style={{ width: `${(score.score / score.maxScore) * 100}%` }} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {report ? (
              <section className="panel tool-panel" aria-label="Final report">
                <div className="panel-header">
                  <h2 className="panel-title">Final Report</h2>
                  <span className="status-pill">{report.percentage}%</span>
                </div>
                <div className="section-item">
                  <h3>{report.candidateName}</h3>
                  <p>
                    Aggregate score: {report.total}/{report.max}. Current phase: {report.phase}.
                  </p>
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
