"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Brand from "./brand";
import type { Application } from "@/lib/applications";
import type { Profile, Match } from "@/lib/ai-types";
type Props = {
  resume: { profile: Profile; filename: string } | null;
  apps: { app: Application; result: Match | null; stale: boolean }[];
  pro: boolean;
  demo: boolean;
};
export default function MatchWorkspace({ resume, apps, pro, demo }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function send(path: string, options: RequestInit, key: string) {
    if (busy) return;
    setBusy(key);
    setError("");
    setNotice("");
    try {
      const response = await fetch(path, options);
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Could not complete this request. Please try again.",
        );
      setNotice(
        key === "upload"
          ? "Resume profile saved. Review the extracted details below."
          : key === "delete"
            ? "Resume profile and saved matches removed."
            : "Match saved.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect.");
    } finally {
      setBusy("");
    }
  }
  function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(
      "/api/resume",
      { method: "POST", body: new FormData(e.currentTarget) },
      "upload",
    );
  }
  const ranked = [...apps].sort(
    (a, b) => (b.result?.score ?? -1) - (a.result?.score ?? -1),
  );
  return (
    <div className="feature-page">
      <header className="feature-header">
        <Brand />
        <nav>
          <Link href="/dashboard">Tracker</Link>
          <Link href="/billing">{pro ? "Pro plan" : "Upgrade"}</Link>
        </nav>
      </header>
      <main className="feature-main">
        <span className="section-kicker">FIND YOUR NEXT FIT</span>
        <h1>Your experience. Your next opportunity.</h1>
        <p className="feature-intro">
          Upload your resume, add job descriptions in the tracker, and compare
          where your experience fits. No invented openings—every match uses a
          job you added.
        </p>
        {demo && (
          <p className="info-banner">
            This is a shared demo account with full Pro access. Use fictional
            resume details here; other demo visitors can see this workspace.
          </p>
        )}
        <div role="status" className="notice">
          {busy
            ? "Analyzing… This can take up to a minute. Keep this page open."
            : notice}
        </div>
        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}
        <section className="feature-card resume-card">
          <h2>{resume ? "Your resume profile" : "Start with your resume"}</h2>
          <p>
            PDF (up to 6 pages) or TXT, up to 2 MB. Uploading sends your file to
            OpenAI for analysis. We save the extracted profile in your account,
            not the original file. You can remove the profile and matches below.
          </p>
          <form onSubmit={upload} className="upload-form">
            <label>
              Resume file
              <input
                name="resume"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                required
                disabled={!!busy}
              />
            </label>
            <button className="button" disabled={!!busy}>
              {busy === "upload"
                ? "Reading resume…"
                : resume
                  ? "Replace resume"
                  : "Upload & analyze resume"}
            </button>
          </form>
          <small>
            {pro ? "30" : "5"} AI requests per day, shared between resume
            analysis and job matching. Resets at midnight UTC.
          </small>
          {resume && (
            <div className="resume-profile">
              <strong>{resume.filename}</strong>
              <p>{resume.profile.summary}</p>
              <h3>Education</h3>
              <ul>
                {resume.profile.education.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <h3>Skills</h3>
              <div className="skill-tags">
                {resume.profile.skills.map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <h3>Experience & projects</h3>
              <ul>
                {resume.profile.experience.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="muted">
                Check this summary against your resume. Replace the file if
                important information is missing.
              </p>
              <button
                disabled={!!busy}
                className="button secondary small"
                onClick={() => {
                  if (
                    window.confirm(
                      "Remove your saved resume profile and all AI matches?",
                    )
                  )
                    void send("/api/resume", { method: "DELETE" }, "delete");
                }}
              >
                Remove resume & matches
              </button>
            </div>
          )}
        </section>
        <div className="section-heading">
          <div>
            <h2>Your jobs, ranked by fit</h2>
            <p>
              Fit scores estimate how closely the supplied evidence matches the
              role, not your odds of being hired.
            </p>
          </div>
          <Link href="/dashboard" className="button secondary">
            Add or edit jobs
          </Link>
        </div>
        {!apps.length && (
          <div className="empty-state">
            <h3>Add your first job to compare.</h3>
            <p>
              Save a company, position, and job description in the tracker, then
              return here.
            </p>
            <Link href="/dashboard" className="button">
              Open tracker
            </Link>
          </div>
        )}
        <div className="match-grid">
          {ranked.map(({ app, result, stale }) => (
            <article className="feature-card match-card" key={app.id}>
              <div className="match-heading">
                <div>
                  <span className="section-kicker">{app.company}</span>
                  <h3>{app.position}</h3>
                </div>
                {result && (
                  <strong className="fit-score">
                    {result.score}
                    <small>/100</small>
                  </strong>
                )}
              </div>
              <p>
                {result?.fit ||
                  (stale
                    ? "Details changed—run a fresh match"
                    : "Ready to compare")}
              </p>
              {result && (
                <>
                  <p>{result.summary}</p>
                  {(
                    [
                      ["What fits", result.strengths],
                      ["Gaps or missing evidence", result.gaps],
                      ["Your next steps", result.nextSteps],
                    ] as const
                  ).map(([title, items]) => (
                    <div key={title}>
                      <h4>{title}</h4>
                      <ul>
                        {items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
              {(app.jobDescription?.trim().length ?? 0) < 80 && (
                <p className="muted">
                  Add at least 80 characters of job description in the tracker.
                </p>
              )}
              <button
                className="button"
                disabled={
                  !!busy ||
                  !resume ||
                  (app.jobDescription?.trim().length ?? 0) < 80
                }
                onClick={() =>
                  void send(
                    "/api/matches",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ applicationId: app.id }),
                    },
                    app.id,
                  )
                }
              >
                {busy === app.id
                  ? "Comparing…"
                  : result
                    ? "Run match again"
                    : "Match my resume"}
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
