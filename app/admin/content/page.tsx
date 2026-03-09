export default function ContentPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">Content Editor</h1>
      <p className="mt-2 text-text-body-subtle">
        Manage content keys and namespaces for all apps.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border-light bg-bg-primary p-6">
          <h3 className="font-display text-lg font-semibold text-text-heading">Unfold</h3>
          <p className="mt-1 text-sm text-text-body-subtle">First app in the platform</p>
          <div className="mt-4 space-y-2 text-sm text-text-body">
            <div className="flex justify-between">
              <span>landing</span>
              <span className="text-text-body-subtle">24 keys</span>
            </div>
            <div className="flex justify-between">
              <span>onboarding</span>
              <span className="text-text-body-subtle">0 keys</span>
            </div>
            <div className="flex justify-between">
              <span>settings</span>
              <span className="text-text-body-subtle">0 keys</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border-light p-6">
          <p className="text-sm text-text-body-subtle">+ Add new app</p>
        </div>
      </div>
    </div>
  );
}
