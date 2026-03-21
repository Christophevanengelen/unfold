"use client";

import Image from "next/image";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ backgroundColor: "var(--bg-primary, #1B1535)" }}>
      <Image src="/logo/icon-mark.svg" alt="" width={48} height={48} />
      <h1 className="mt-6 font-display text-2xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-brand-10">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-xl px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "var(--accent-purple, #7C6BBF)" }}
      >
        Try again
      </button>
    </div>
  );
}
