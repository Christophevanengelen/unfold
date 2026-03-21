import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface NarrativeTransitionProps {
  text: string;
}

export function NarrativeTransition({ text }: NarrativeTransitionProps) {
  return (
    <div className="py-12 md:py-16">
      <ScrollReveal variant="fadeUp" className="mx-auto max-w-2xl text-center">
        <p className="font-display text-lg italic leading-relaxed text-logo-lavender/70 md:text-xl">
          {text}
        </p>
      </ScrollReveal>
    </div>
  );
}
