import { mockCompatibility, mockUser } from "@/lib/mock-data";

export default function DemoCompatibility() {
  const { score, partnerName, synergies, sharedPeaks } = mockCompatibility;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-heading">Compatibility</h1>
      <p className="mt-1 text-xs text-text-body-subtle">How your rhythms align</p>

      {/* Overall compatibility */}
      <div className="mt-6 flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-400 bg-pink-50 dark:bg-pink-950/30">
          <span className="font-display text-3xl font-bold text-pink-600">{score}%</span>
        </div>
        <p className="mt-3 text-sm text-text-body">
          {mockUser.name} & {partnerName}
        </p>
      </div>

      {/* Synergy breakdown */}
      <div className="mt-6 space-y-3">
        {synergies.map((s) => (
          <div
            key={s.axis}
            className="flex items-center justify-between rounded-xl border border-border-light bg-bg-secondary p-4"
          >
            <div>
              <span className="text-sm font-medium capitalize text-text-heading">{s.axis}</span>
              <p className="mt-0.5 text-xs text-text-body-subtle">{s.description}</p>
            </div>
            <span className="rounded-full bg-bg-brand-soft px-2 py-0.5 text-xs font-medium capitalize text-accent-purple">
              {s.strength}
            </span>
          </div>
        ))}
      </div>

      {/* Shared peaks */}
      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold text-text-heading">
          Shared Peak Windows
        </h2>
        <div className="mt-3 space-y-2">
          {sharedPeaks.map((peak, i) => (
            <div
              key={i}
              className="rounded-lg border border-border-light bg-bg-primary p-3 text-sm text-text-body"
            >
              {new Date(peak).toLocaleDateString("en", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-brand-7 bg-brand-2 p-3 text-xs text-brand-9">
        <p className="font-semibold">API Contract — Marie Ange</p>
        <p className="mt-1 font-mono">POST /api/compatibility/check</p>
        <p className="mt-0.5">Returns: CompatibilityResult (see types/api.ts)</p>
      </div>
    </div>
  );
}
