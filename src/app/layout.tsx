import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "InternTrack — Your next chapter starts here",
  description:
    "A calmer way to organize internship and job applications. Track opportunities, deadlines, and progress in one place.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
