"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Pencil,
  X,
  MessageSquare,
  Trophy,
} from "lucide-react";
import Brand from "./brand";
import {
  type Application,
  type Status,
  statuses,
  storageKey,
  validApplications,
  demoApplications,
  deadlineLabel,
  daysUntil,
} from "@/lib/applications";
const blank = {
  company: "",
  position: "",
  location: "",
  deadline: "",
  status: "Wishlist" as Status,
  notes: "",
};
export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [view, setView] = useState<"all" | "deadlines">("all");
  const [editing, setEditing] = useState<Application | null>(null);
  const [form, setForm] = useState(blank);
  const [deleting, setDeleting] = useState<Application | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  // Read browser-only storage after hydration so server and client initially agree.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const data: unknown = JSON.parse(raw);
        if (!validApplications(data)) throw new Error("Invalid data");
        setApplications(data);
      } else {
        const demo = demoApplications();
        setApplications(demo);
        localStorage.setItem(storageKey, JSON.stringify(demo));
      }
    } catch {
      setError(
        "Your saved data could not be loaded. Existing storage has not been overwritten. You can export this session before leaving.",
      );
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  function commit(next: Application[], message: string) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setError("");
    } catch {
      setError(
        "Browser storage is unavailable or full. Changes are kept in this session only. Export your applications before leaving.",
      );
    }
    setApplications(next);
    setNotice(message);
  }
  function openForm(app?: Application) {
    setEditing(app ?? null);
    setForm(app ? { ...app } : { ...blank });
    dialog.current?.showModal();
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.company.trim() || !form.position.trim()) return;
    const app: Application = {
      ...form,
      company: form.company.trim(),
      position: form.position.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      id: editing?.id ?? crypto.randomUUID(),
    };
    commit(
      editing
        ? applications.map((a) => (a.id === editing.id ? app : a))
        : [app, ...applications],
      editing ? "Application updated." : "Application added.",
    );
    dialog.current?.close();
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(applications, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "interntrack-applications.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Applications exported.");
  }
  const upcoming = applications.filter(
    (a) =>
      a.deadline &&
      daysUntil(a.deadline) >= 0 &&
      daysUntil(a.deadline) <= 7 &&
      !["Offer", "Rejected"].includes(a.status),
  );
  const filtered = applications
    .filter(
      (a) =>
        (status === "All statuses" || a.status === status) &&
        `${a.company} ${a.position} ${a.location} ${a.notes}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (view === "all" || upcoming.some((u) => u.id === a.id)),
    )
    .sort((a, b) =>
      view === "deadlines" ? a.deadline.localeCompare(b.deadline) : 0,
    );
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Workspace">
          <button
            className={view === "all" ? "nav-item active" : "nav-item"}
            onClick={() => setView("all")}
          >
            <LayoutDashboard size={19} /> Overview{" "}
            <span>{applications.length}</span>
          </button>
          <button
            className={view === "deadlines" ? "nav-item active" : "nav-item"}
            onClick={() => setView("deadlines")}
          >
            <CalendarDays size={19} /> Upcoming deadlines{" "}
            <span>{upcoming.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <Sparkles size={21} />
            <h3>You’ve got this.</h3>
            <p>Every application brings you one step closer to what’s next.</p>
            <span>
              Keep moving forward <ArrowUpRight size={14} />
            </span>
          </div>
          <Link href="/" className="nav-item">
            <ArrowLeft size={18} /> Back to home
          </Link>
          <div className="profile">
            <span className="avatar">Y</span>
            <div>
              <strong>Your workspace</strong>
              <small>Local demo · Free plan</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="workspace-header">
          <div className="flex items-center gap-2">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {view === "all" ? "Overview" : "Upcoming deadlines"}
            </strong>
          </div>
          <span className="local-indicator">
            <span className="live-dot" /> Stored on this device
          </span>
        </header>
        <main className="dashboard-main">
          <div className="dashboard-title">
            <div>
              <span className="section-kicker">
                YOUR NEXT CHAPTER STARTS HERE
              </span>
              <h1>
                Let’s make moves <span className="wave">✦</span>
              </h1>
              <p>
                A little organization. A lot of opportunity. You’ve got this.
              </p>
            </div>
            <button
              className="button"
              onClick={() => openForm()}
              disabled={!ready}
            >
              <Plus size={18} /> Add application
            </button>
          </div>
          {error && (
            <div role="alert" className="error-banner">
              {error}
            </div>
          )}
          <div role="status" className="notice">
            {notice}
          </div>
          <section className="summary-grid" aria-label="Application summary">
            {[
              {
                label: "Total applications",
                value: applications.length,
                icon: BriefcaseBusiness,
                sub: "Your opportunities, in one place",
                color: "blue",
              },
              {
                label: "In progress",
                value: applications.filter((a) =>
                  ["Applied", "Interview"].includes(a.status),
                ).length,
                icon: FileText,
                sub: "Good things are in the works",
                color: "purple",
              },
              {
                label: "Interviews",
                value: applications.filter((a) => a.status === "Interview")
                  .length,
                icon: MessageSquare,
                sub: "Time to show what you bring",
                color: "amber",
              },
              {
                label: "Offers received",
                value: applications.filter((a) => a.status === "Offer").length,
                icon: Trophy,
                sub: "Your hard work is paying off",
                color: "green",
              },
            ].map(({ label, value, icon: Icon, sub, color }) => (
              <article className="summary-card" key={label}>
                <div className="flex justify-between items-center">
                  <span>{label}</span>
                  <span className={`stat-icon ${color}`}>
                    <Icon size={19} />
                  </span>
                </div>
                <strong>{ready ? value : "—"}</strong>
                <small>{sub}</small>
              </article>
            ))}
          </section>
          <div className="deadline-banner">
            <span className="deadline-icon">
              <CalendarDays size={20} />
            </span>
            <div>
              <strong>
                {upcoming.length
                  ? `${upcoming.length} ${upcoming.length === 1 ? "deadline" : "deadlines"} coming up this week`
                  : "A little breathing room"}
              </strong>
              <p>
                {upcoming.length
                  ? "A quick check today can open a door tomorrow."
                  : "No active deadlines in the next 7 days. Find your next opportunity."}
              </p>
            </div>
            <button
              onClick={() => {
                setView("deadlines");
                setStatus("All statuses");
                setQuery("");
              }}
            >
              View deadlines <ArrowRightIcon />
            </button>
          </div>
          <section className="applications-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {view === "all" ? "Your applications" : "Upcoming deadlines"}{" "}
                  <span>{filtered.length}</span>
                </h2>
                <p>
                  {view === "all"
                    ? "Big possibilities, neatly organized."
                    : "Active applications due within the next 7 days."}
                </p>
              </div>
              <button
                className="button secondary small"
                onClick={exportData}
                disabled={!ready}
              >
                <Download size={16} /> Export
              </button>
            </div>
            <div className="table-toolbar">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Search applications"
                  placeholder="Search company, role, or keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All statuses</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company & role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td>
                        <div className="company-cell">
                          <span
                            className={`company-logo ${["purple", "green", "dark", "blue", "amber"][i % 5]}`}
                          >
                            {a.company.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <button
                              className="company-name"
                              onClick={() => openForm(a)}
                            >
                              {a.company}
                            </button>
                            <span>{a.position}</span>
                          </div>
                        </div>
                      </td>
                      <td className="location-cell">
                        {a.location || "Not specified"}
                      </td>
                      <td>
                        <span className={`badge ${a.status.toLowerCase()}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {deadlineLabel(a.deadline)}
                        </span>
                        {a.deadline &&
                          !["Offer", "Rejected"].includes(a.status) &&
                          daysUntil(a.deadline) <= 7 && (
                            <small
                              className={`due-note ${daysUntil(a.deadline) < 0 ? "overdue" : ""}`}
                            >
                              {daysUntil(a.deadline) < 0
                                ? "Past deadline"
                                : daysUntil(a.deadline) === 0
                                  ? "Due today"
                                  : `In ${daysUntil(a.deadline)} days`}
                            </small>
                          )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            aria-label={`Edit ${a.company} ${a.position}`}
                            onClick={() => openForm(a)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            aria-label={`Delete ${a.company} ${a.position}`}
                            onClick={() => {
                              setDeleting(a);
                              deleteDialog.current?.showModal();
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!ready ? (
              <div className="empty-state">Loading your workspace…</div>
            ) : (
              filtered.length === 0 && (
                <div className="empty-state">
                  <BriefcaseBusiness size={30} />
                  <h3>
                    {applications.length
                      ? "No matching applications"
                      : "Your next chapter is a blank page."}
                  </h3>
                  <p>
                    {applications.length
                      ? "Try another search or status filter."
                      : "Add your first opportunity to start tracking."}
                  </p>
                  {applications.length ? (
                    <button
                      className="button secondary small"
                      onClick={() => {
                        setQuery("");
                        setStatus("All statuses");
                        setView("all");
                      }}
                    >
                      Show all applications
                    </button>
                  ) : (
                    <button className="button small" onClick={() => openForm()}>
                      Add your first application
                    </button>
                  )}
                </div>
              )
            )}
            <div className="table-footer">
              <span>
                Showing {filtered.length} of {applications.length} applications
              </span>
              <span>
                <Check size={14} />{" "}
                {error ? "Session only" : "Made for your next move"}
              </span>
            </div>
          </section>
          <div className="privacy-note">
            <CircleHelp size={16} />
            <p>
              This is your personal demo workspace. Data stays in this browser
              and won’t sync across devices. Clearing browser data removes it.
              Export a copy to keep a backup.
            </p>
          </div>
        </main>
      </div>
      <dialog ref={dialog} className="form-dialog">
        <form onSubmit={save}>
          <div className="dialog-heading">
            <div>
              <span className="section-kicker">ONE STEP CLOSER</span>
              <h2>{editing ? "Edit application" : "Add an application"}</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close form"
              onClick={() => dialog.current?.close()}
            >
              <X size={21} />
            </button>
          </div>
          <p className="dialog-description">
            Keep the details together. Make your next move easier.
          </p>
          <div className="form-grid">
            <label>
              Company <span>*</span>
              <input
                autoFocus
                required
                maxLength={120}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Notion"
              />
            </label>
            <label>
              Position <span>*</span>
              <input
                required
                maxLength={160}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="e.g. Product Design Intern"
              />
            </label>
            <label>
              Location
              <input
                maxLength={160}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City or remote"
              />
            </label>
            <label>
              Deadline
              <input
                type="date"
                min="1900-01-01"
                max="9999-12-31"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </label>
            <label className="full-width">
              Status
              <select
                aria-label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Notes
              <textarea
                aria-label="Notes"
                rows={4}
                maxLength={10000}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Contacts, next steps, or things to remember..."
              />
            </label>
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button
              className="button"
              type="submit"
              disabled={!form.company.trim() || !form.position.trim()}
            >
              {editing ? "Save changes" : "Add application"}
              <Check size={16} />
            </button>
          </div>
        </form>
      </dialog>
      <dialog ref={deleteDialog} className="delete-dialog">
        <h2>Delete this application?</h2>
        <p>
          <strong>{deleting?.position}</strong> at{" "}
          <strong>{deleting?.company}</strong> will be permanently removed from
          this workspace.
        </p>
        <div className="dialog-actions">
          <button
            autoFocus
            className="button secondary"
            onClick={() => deleteDialog.current?.close()}
          >
            Keep application
          </button>
          <button
            className="button danger"
            onClick={() => {
              if (deleting)
                commit(
                  applications.filter((a) => a.id !== deleting.id),
                  "Application deleted.",
                );
              deleteDialog.current?.close();
              setDeleting(null);
            }}
          >
            Delete
          </button>
        </div>
      </dialog>
    </div>
  );
}
function ArrowRightIcon() {
  return <ChevronRight size={17} />;
}
