import { mockForecast, mockAlerts } from "@/lib/mock-data";

export default function DemoPremium() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold text-text-heading">Premium</h1>
        <span className="rounded-full bg-accent-purple px-2 py-0.5 text-xs font-medium text-white">
          Pro
        </span>
      </div>
      <p className="mt-1 text-xs text-text-body-subtle">Your full momentum toolkit</p>

      {/* Future Momentum Windows */}
      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold text-text-heading">
          7-Day Forecast
        </h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {mockForecast.map((day) => (
            <div
              key={day.date}
              className={`flex min-w-[72px] flex-col items-center rounded-xl border p-3 ${
                day.isPeak
                  ? "border-accent-purple bg-bg-brand-soft"
                  : "border-border-light bg-bg-secondary"
              }`}
            >
              <span className="text-xs text-text-body-subtle">
                {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
              </span>
              <span className="mt-1 font-display text-lg font-bold text-text-heading">
                {day.momentum}
              </span>
              {day.isPeak && (
                <span className="mt-1 text-[10px] font-medium text-accent-purple">Peak</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Peak Alerts */}
      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold text-text-heading">Peak Alerts</h2>
        <div className="mt-3 space-y-2">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-accent-purple/30 bg-bg-brand-soft p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium capitalize text-accent-purple">
                  {alert.axis}
                </span>
                <span className="text-xs text-text-body-subtle">
                  {alert.date} at {alert.time}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-text-heading">{alert.message}</p>
              <p className="mt-0.5 text-xs capitalize text-text-body-subtle">
                {alert.intensity} intensity
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Map placeholder */}
      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold text-text-heading">Monthly Map</h2>
        <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary p-6 text-center">
          <p className="text-sm text-text-body-subtle">Calendar heatmap visualization</p>
          <p className="mt-1 text-xs text-text-body-subtle">
            Shows momentum intensity across the month
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-brand-7 bg-brand-2 p-3 text-xs text-brand-9">
        <p className="font-semibold">API Contracts — Marie Ange</p>
        <p className="mt-1 font-mono">GET /api/premium/forecast — ForecastWindow[]</p>
        <p className="font-mono">GET /api/premium/alerts — PeakAlert[]</p>
        <p className="font-mono">GET /api/premium/monthly-map — MonthlyMap</p>
        <p className="mt-1">All require Premium subscription. See types/api.ts</p>
      </div>
    </div>
  );
}
