import { Link } from "flowbite-react-icons/outline";

interface CompatibilityProps {
  t: (key: string, fallback?: string) => string;
}

export function Compatibility({ t }: CompatibilityProps) {
  return (
    <section className="bg-bg-primary py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-purple">
            {t("compat.eyebrow", "Better together")}
          </p>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("compat.title", "Compare your rhythms")}
          </h2>
          <p className="mt-6 text-lg text-text-body-subtle">
            {t("compat.subtitle", "Share your invite code. Discover how your momentum aligns with someone who matters. Find your shared peak moments.")}
          </p>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="rounded-2xl border border-border-light bg-bg-secondary p-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-brand-soft">
              <Link className="h-10 w-10 text-accent-purple" />
            </div>
            <p className="mt-6 font-display text-xl font-semibold">
              {t("compat.cta", "Invite someone. Compare your signals.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
