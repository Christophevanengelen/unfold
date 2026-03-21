import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/ui/ScrollReveal";

interface PremiumMomentumProps {
  t: (key: string, fallback?: string) => string;
}

/** Mini timeline capsule for the teaser visualization */
const TEASER_CAPSULES = [
  { tier: "toc", label: "TOC", planets: ["Mercury"], w: 36, opacity: 0.4 },
  { tier: "toctoc", label: "TOCTOC", planets: ["Venus", "Mars"], w: 48, opacity: 0.6 },
  { tier: "toctoctoc", label: "TOCTOCTOC", planets: ["Jupiter", "Sun", "Mercury", "Moon"], w: 64, opacity: 1 },
  { tier: "toctoc", label: "TOCTOC", planets: ["Saturn", "Venus"], w: 48, opacity: 0.6 },
  { tier: "toc", label: "TOC", planets: ["Mars"], w: 36, opacity: 0.4 },
];

export function PremiumMomentum({ t }: PremiumMomentumProps) {
  const features = [
    {
      title: t("premium.timeline.title", "Your full momentum timeline"),
      desc: t("premium.timeline.desc", "See every momentum period from birth to now — and what's forming ahead. Planets tell the story."),
    },
    {
      title: t("premium.peaks.title", "Spot your peak windows"),
      desc: t("premium.peaks.desc", "Know when TOCTOCTOC intensity builds. Plan around your strongest rhythms."),
    },
    {
      title: t("premium.alerts.title", "Get alerts before key moments"),
      desc: t("premium.alerts.desc", "Real-time notifications when exceptional momentum windows open."),
    },
    {
      title: t("premium.compat.title", "Compare signals with someone"),
      desc: t("premium.compat.desc", "Deep compatibility analysis. Shared peak discovery. Timing synergy reports."),
    },
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Editorial transition */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-8 text-sm italic text-brand-10/60">
            {t("premium.transition", "Free reads your signal. Premium reveals the full timeline.")}
          </p>
        </ScrollReveal>

        {/* Header text — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t("premium.eyebrow", "Premium")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("premium.title", "Your momentum story, complete")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t("premium.subtitle", "Every period. Every planet. Every signal that shaped your rhythm.")}
          </p>
        </ScrollReveal>

        {/* Timeline teaser visualization */}
        <ScrollReveal variant="scaleIn" className="mt-12 flex justify-center">
          <div
            className="landing-glass w-full max-w-lg overflow-hidden"
            style={{
              borderColor: "color-mix(in srgb, #9585CC 30%, transparent)",
              borderWidth: 1,
            }}
          >
            <div className="p-6 pb-5">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-wider text-brand-10/50">
                Your timeline
              </p>
              {/* Mini capsules with connecting spine */}
              <div className="relative flex items-center justify-center gap-3 py-4">
                {/* Spine line */}
                <div
                  className="absolute left-8 right-8 top-1/2 h-px"
                  style={{ background: "color-mix(in srgb, #9585CC 25%, transparent)" }}
                />
                {TEASER_CAPSULES.map((cap, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col items-center gap-1.5"
                    style={{ opacity: cap.opacity }}
                  >
                    {/* Capsule body */}
                    <div
                      className="rounded-full"
                      style={{
                        width: cap.w,
                        height: cap.w,
                        background: `linear-gradient(135deg, color-mix(in srgb, #9585CC ${cap.opacity * 40}%, transparent), color-mix(in srgb, #9585CC ${cap.opacity * 20}%, transparent))`,
                        border: "1px solid color-mix(in srgb, #9585CC 30%, transparent)",
                      }}
                    />
                    {/* Planet dots */}
                    <div className="flex gap-0.5">
                      {cap.planets.map((p, j) => (
                        <div
                          key={j}
                          className="h-1 w-1 rounded-full"
                          style={{ background: "#9585CC" }}
                        />
                      ))}
                    </div>
                    {/* Tier label */}
                    <span
                      className="text-[8px] font-medium tracking-wider"
                      style={{ color: "#9585CC" }}
                    >
                      {cap.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature cards — stagger in after header */}
        <ScrollRevealGroup className="mt-16 grid gap-6 md:grid-cols-2" stagger={0.12}>
          {features.map((f) => (
            <ScrollRevealItem key={f.title} variant="fadeUp">
              <div className="landing-glass p-8">
                <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-brand-10">{f.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
