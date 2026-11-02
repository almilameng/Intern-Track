"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Brand from "./brand";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const credentials = {
      email: String(data.get("email")).trim().toLowerCase(),
      password: String(data.get("password")),
    };
    try {
      const result = signup
        ? await authClient.signUp.email({
            ...credentials,
            name: String(data.get("name")).trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          result.error.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : signup
              ? "Could not create your account. Check your details or try logging in."
              : "Email or password is incorrect.",
        );
        setBusy(false);
        return;
      }
      // Clear all cached account views when crossing the authentication boundary.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/dashboard");
    } catch {
      setError("Could not connect. Please try again.");
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Brand />
        <span className="section-kicker">YOUR NEXT CHAPTER</span>
        <h1>{signup ? "Make room for opportunity." : "Welcome back."}</h1>
        <p>
          {signup
            ? "Create your account to keep your internship search organized across devices."
            : "Log in to pick up where you left off."}
        </p>
        <form method="post" onSubmit={submit} className="auth-fields">
          {signup && (
            <label>
              Name
              <input name="name" autoComplete="name" required maxLength={100} />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              required
              minLength={signup ? 12 : undefined}
              maxLength={128}
            />
          </label>
          {signup && <small>Use at least 12 characters.</small>}
          {error && (
            <div role="alert" className="error-banner">
              {error}
            </div>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
          </button>
        </form>
        <p>
          {signup ? "Already have an account?" : "New to InternTrack?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"}
          </Link>
        </p>
        <Link href="/">Back to home</Link>
      </div>
    </main>
  );
}
