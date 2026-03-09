import { KPIDashboard } from "@/components/admin/KPIDashboard";

export default function KPIPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">KPI Cockpit</h1>
      <p className="mt-2 text-text-body-subtle">
        Track AARRR pirate metrics and North Star Metrics across all apps.
      </p>
      <div className="mt-8">
        <KPIDashboard />
      </div>
      <div className="mt-12 rounded-xl border border-border-light bg-bg-secondary p-8 text-center text-text-body-subtle">
        <p className="text-sm">Connect your analytics provider to see live data.</p>
        <p className="mt-1 text-xs">Supports Mixpanel, Amplitude, PostHog, and custom webhooks.</p>
      </div>
    </div>
  );
}
