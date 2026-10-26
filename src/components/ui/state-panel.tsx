import type { ReactNode } from "react";

type StatePanelProps = {
  kind: "loading" | "empty" | "error" | "forbidden" | "preparing";
  title: string;
  description: string;
  action?: ReactNode;
};

const symbols = {
  loading: "M21 12a9 9 0 1 1-9-9",
  empty: "M6 3h9l4 4v14H5V3h1Zm8 0v5h5M8 12h8M8 16h5",
  error: "M12 8v5m0 3v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  forbidden: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 5v2",
  preparing: "M4 4h16v12H9l-5 4V4Zm4 4h8M8 12h5",
};

export function StatePanel({
  kind,
  title,
  description,
  action,
}: StatePanelProps) {
  return (
    <section
      className={`state-panel state-panel--${kind}`}
      role={kind === "error" ? "alert" : kind === "loading" ? "status" : undefined}
      aria-busy={kind === "loading" || undefined}
    >
      <span className="state-symbol" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={symbols[kind]} /></svg>
      </span>
      <div className="state-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="state-actions">{action}</div>}
    </section>
  );
}
