import { mockToday, mockUser } from "@/lib/mock-data";

function ScoreRing({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${color}`}
      >
        <span className="font-display text-2xl font-bold">{score}</span>
      </div>
      <span className="mt-2 text-xs font-medium text-text-body-subtle">{label}</span>
    </div>
  );
}

export default function DemoToday() {
  const { scores, date, overall } = mockToday;

  const categories = [
    { key: "Love", data: scores.love, color: "border-pink-400 text-pink-600" },
    { key: "Health", data: scores.health, color: "border-green-400 text-green-600" },
    { key: "Work", data: scores.work, color: "border-blue-400 text-blue-600" },
  ];

  return (
    <div>
      {/* Greeting */}
      <p className="text-sm text-text-body-subtle">
        Hello, {mockUser.name}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-text-heading">
        Today&apos;s Momentum
      </h1>
      <p className="mt-1 text-xs text-text-body-subtle">{date}</p>

      {/* Overall score */}
      <div className="mt-6 flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-accent-purple bg-bg-brand-soft">
          <span className="font-display text-4xl font-bold text-accent-purple">
            {overall}
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-text-body">Overall Momentum</p>
      </div>

      {/* Category scores */}
      <div className="mt-8 flex justify-around">
        {categories.map((cat) => (
          <ScoreRing
            key={cat.key}
            label={cat.key}
            score={cat.data.value}
            color={cat.color}
          />
        ))}
      </div>

      {/* Insights */}
      <div className="mt-8 space-y-3">
        <h2 className="font-display text-sm font-semibold text-text-heading">
          Today&apos;s Insights
        </h2>
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="rounded-xl border border-border-light bg-bg-secondary p-4"
          >
            <p className="text-xs font-medium text-text-body-subtle">{cat.key}</p>
            <p className="mt-1 text-sm text-text-body">{cat.data.description}</p>
          </div>
        ))}
      </div>

      {/* API contract note */}
      <div className="mt-8 rounded-lg border border-dashed border-brand-7 bg-brand-2 p-3 text-xs text-brand-9">
        <p className="font-semibold">API Contract — Marie Ange</p>
        <p className="mt-1 font-mono">GET /api/momentum/today</p>
        <p className="mt-0.5">Returns: DailyMomentum (see types/api.ts)</p>
      </div>
    </div>
  );
}
