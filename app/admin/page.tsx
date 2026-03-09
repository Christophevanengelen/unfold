import { KPIDashboard } from "@/components/admin/KPIDashboard";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">Dashboard</h1>
      <p className="mt-2 text-text-body-subtle">
        Overview of all apps managed by the Unfold platform.
      </p>
      <div className="mt-8">
        <KPIDashboard />
      </div>
    </div>
  );
}
