interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-brand-10">
        {lastUpdated}
      </p>
      <div className="legal-content mt-10 space-y-6 text-[15px] leading-relaxed text-brand-11">
        {children}
      </div>
    </article>
  );
}
