"use client";

import Image from "next/image";

export default function LocaleErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <Image src="/logo/icon-mark.svg" alt="" width={40} height={40} />
      <h1 className="mt-6 font-display text-xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-brand-10">
        This page encountered an error. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "var(--accent-purple, #7C6BBF)" }}
      >
        Try again
      </button>
    </div>
  );
}
