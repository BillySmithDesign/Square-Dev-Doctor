"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-shell">
      <section className="error-card">
        <p className="eyebrow">Monitor unavailable</p>
        <h1>We couldn&apos;t load the operations dashboard.</h1>
        <p>Your monitored application is separate from this console. Try loading the dashboard again.</p>
        <button onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
