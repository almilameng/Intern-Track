export const statuses = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
] as const;
export type Status = (typeof statuses)[number];
export type Application = {
  id: string;
  company: string;
  position: string;
  location: string;
  deadline: string;
  status: Status;
  notes: string;
};
export const storageKey = "interntrack.applications.v1";
export function validApplications(value: unknown): value is Application[] {
  return (
    Array.isArray(value) &&
    value.every(
      (a) =>
        a &&
        typeof a === "object" &&
        ["id", "company", "position", "location", "deadline", "notes"].every(
          (k) => typeof a[k] === "string",
        ) &&
        statuses.includes(a.status) &&
        (!a.deadline ||
          (/^\d{4}-\d{2}-\d{2}$/.test(a.deadline) &&
            !Number.isNaN(Date.parse(a.deadline)))),
    ) &&
    new Set(value.map((a) => a.id)).size === value.length
  );
}
export function demoApplications(): Application[] {
  const date = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return [
    {
      id: "demo-1",
      company: "Linear",
      position: "Product Design Intern",
      location: "San Francisco, CA",
      deadline: date(4),
      status: "Interview",
      notes: "Prepare portfolio walkthrough and questions for the team.",
    },
    {
      id: "demo-2",
      company: "Spotify",
      position: "Software Engineering Intern",
      location: "New York, NY",
      deadline: date(9),
      status: "Applied",
      notes: "Applied through the university careers portal.",
    },
    {
      id: "demo-3",
      company: "Notion",
      position: "Product Marketing Intern",
      location: "Remote",
      deadline: date(2),
      status: "Wishlist",
      notes: "Tailor cover letter before applying.",
    },
    {
      id: "demo-4",
      company: "Figma",
      position: "UX Research Intern",
      location: "San Francisco, CA",
      deadline: date(14),
      status: "Applied",
      notes: "Follow up next week.",
    },
    {
      id: "demo-5",
      company: "Microsoft",
      position: "Explore Intern",
      location: "Redmond, WA",
      deadline: date(20),
      status: "Offer",
      notes: "Review offer details and next steps.",
    },
    {
      id: "demo-6",
      company: "Airbnb",
      position: "Data Science Intern",
      location: "Remote",
      deadline: date(-3),
      status: "Rejected",
      notes: "Keep in mind for the next recruiting cycle.",
    },
  ];
}
export function deadlineLabel(date: string) {
  return date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";
}
export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000,
  );
}
