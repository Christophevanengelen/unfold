interface KPICard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const mockKPIs: KPICard[] = [
  { label: "Acquisition", value: "1,234", change: "+12%", trend: "up" },
  { label: "Activation", value: "68%", change: "+3%", trend: "up" },
  { label: "Retention (D7)", value: "42%", change: "-1%", trend: "down" },
  { label: "Revenue (MRR)", value: "$2,480", change: "+8%", trend: "up" },
  { label: "Referral", value: "156", change: "+22%", trend: "up" },
];

export function KPIDashboard() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-text-heading">AARRR Metrics</h2>
      <p className="mt-1 text-sm text-text-body-subtle">
        Pirate metrics overview — mock data, connect your analytics to go live.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mockKPIs.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border-light bg-bg-primary p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-text-body-subtle">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-text-heading">
              {kpi.value}
            </p>
            {kpi.change && (
              <p
                className={`mt-1 text-sm font-medium ${
                  kpi.trend === "up"
                    ? "text-accent-green"
                    : kpi.trend === "down"
                      ? "text-state-error"
                      : "text-text-body-subtle"
                }`}
              >
                {kpi.change}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
