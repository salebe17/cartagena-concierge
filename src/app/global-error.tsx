"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Boundary Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950 text-white">
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-2">Fatal Application Error</h1>
            <p className="text-gray-400 mb-6">
              {error.message ||
                "A catastrophic error occurred at the root level."}
            </p>
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
            >
              Hard Reset
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
