"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (e.g. Sentry) later
    console.error("Global Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Critical Subsystem Failure</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {error.message ||
            "An unexpected error occurred in the FairBid engine."}
        </p>
        <button onClick={() => reset()} className="w-full btn-primary">
          Reboot Subsystem
        </button>
      </div>
    </div>
  );
}
