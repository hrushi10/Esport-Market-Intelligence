"use client";

import { useEffect, useState } from "react";

type Health = {
  status: string;
  database: string;
  version: string;
  environment: string;
};

type RequestState =
  | { kind: "loading" }
  | { kind: "success"; health: Health }
  | { kind: "error"; message: string };

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [state, setState] = useState<RequestState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        const response = await fetch(`${apiUrl}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const health = (await response.json()) as Health;
        setState({ kind: "success", health });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Unknown connection error",
        });
      }
    }

    loadHealth();
    return () => controller.abort();
  }, []);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Release v0.1.0</p>
        <h1>Esports Market Intelligence</h1>
        <p className="subtitle">
          Production foundation for real-time prediction-market analysis.
        </p>
      </header>

      <section className="grid" aria-label="System status">
        <StatusCard
          label="Frontend"
          value="Online"
          detail="Next.js + TypeScript"
          status="healthy"
        />

        {state.kind === "loading" && (
          <>
            <StatusCard
              label="Backend"
              value="Checking"
              detail="Connecting to FastAPI"
              status="loading"
            />
            <StatusCard
              label="Database"
              value="Checking"
              detail="Waiting for API response"
              status="loading"
            />
          </>
        )}

        {state.kind === "error" && (
          <>
            <StatusCard
              label="Backend"
              value="Unavailable"
              detail={state.message}
              status="error"
            />
            <StatusCard
              label="Database"
              value="Unknown"
              detail="Backend health check failed"
              status="error"
            />
          </>
        )}

        {state.kind === "success" && (
          <>
            <StatusCard
              label="Backend"
              value={capitalize(state.health.status)}
              detail={`FastAPI ${state.health.version}`}
              status="healthy"
            />
            <StatusCard
              label="Database"
              value={capitalize(state.health.database)}
              detail="PostgreSQL"
              status="healthy"
            />
          </>
        )}
      </section>

      <section className="panel">
        <div>
          <p className="panel-label">Current milestone</p>
          <h2>Application foundation</h2>
        </div>
        <div className="milestone">
          <span>Frontend</span>
          <span>Backend API</span>
          <span>Database</span>
          <span>Docker</span>
        </div>
      </section>

      <footer>
        <a href={`${apiUrl}/docs`} target="_blank" rel="noreferrer">
          Open API documentation
        </a>
      </footer>
    </main>
  );
}

function StatusCard({
  label,
  value,
  detail,
  status,
}: {
  label: string;
  value: string;
  detail: string;
  status: "healthy" | "loading" | "error";
}) {
  return (
    <article className="card">
      <div className="card-heading">
        <span className={`status-dot ${status}`} aria-hidden="true" />
        <p>{label}</p>
      </div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
