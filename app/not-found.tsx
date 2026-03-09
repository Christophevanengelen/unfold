import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-accent-purple">404</h1>
      <p className="mt-4 text-lg text-text-body">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent-purple px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
