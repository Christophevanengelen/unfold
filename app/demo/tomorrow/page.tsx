import { mockTomorrow } from "@/lib/mock-data";

export default function DemoTomorrow() {
  const { scores, date, overall } = mockTomorrow;

  const categories = [
    { key: "Love", data: scores.love },
    { key: "Health", data: scores.health },
    { key: "Work", data: scores.work },
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold text-text-heading">Tomorrow</h1>
        <span className="rounded-full bg-bg-brand-soft px-2 py-0.5 text-xs font-medium text-accent-purple">
          Premium
        </span>
      </div>
      <p className="mt-1 text-xs text-text-body-subtle">{date}</p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-accent-purple bg-bg-brand-soft">
          <span className="font-display text-2xl font-bold text-accent-purple">{overall}</span>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-text-heading">Forecast</p>
          <p className="text-xs text-text-body-subtle">Your momentum tomorrow</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="flex items-center justify-between rounded-xl border border-border-light bg-bg-secondary p-4"
          >
            <div>
              <p className="text-sm font-medium text-text-heading">{cat.key}</p>
              <p className="mt-0.5 text-xs text-text-body-subtle">{cat.data.description}</p>
            </div>
            <span className="font-display text-xl font-bold text-text-heading">{cat.data.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-brand-7 bg-brand-2 p-3 text-xs text-brand-9">
        <p className="font-semibold">API Contract — Marie Ange</p>
        <p className="mt-1 font-mono">GET /api/momentum/tomorrow</p>
        <p className="mt-0.5">Returns: DailyMomentum (see types/api.ts)</p>
        <p className="mt-0.5">Requires: Premium subscription</p>
      </div>
    </div>
  );
}
