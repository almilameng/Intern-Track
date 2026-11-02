"use client";
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>We couldn’t load your workspace.</h1>
        <p>Your saved applications have not been changed. Please try again.</p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
