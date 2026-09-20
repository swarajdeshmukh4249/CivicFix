import "./states.css";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="state state--loading" role="status">
      <span className="state__pulse" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p>Could not load this data. {message}</p>
      {onRetry && (
        <button type="button" className="state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="state state--empty">{children}</div>;
}
