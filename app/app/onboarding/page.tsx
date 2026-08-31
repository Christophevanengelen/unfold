"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { StepPromise } from "@/components/demo/onboarding/StepPromise";
import type { OnboardingFormData } from "@/components/demo/onboarding/StepInput";
import { OnboardingProgress } from "@/components/demo/onboarding/OnboardingProgress";

/**
 * Perf: only StepPromise (screen 0) ships in the first-load bundle.
 * The five later steps are split into their own chunks and warmed up
 * in the background while the user reads the promise screen (~3 s) —
 * so the first tap never waits on a chunk download + hydration burst.
 * (Cold-visit INP measured at 3–8 s before this split; see audit pass 1.)
 */
const stepLoading = () => (
  <div className="flex h-full items-center justify-center">
    <div
      className="h-5 w-5 animate-spin rounded-full border-2 border-transparent"
      style={{
        borderTopColor: "var(--accent-purple)",
        borderRightColor: "var(--accent-purple)",
        opacity: 0.5,
      }}
    />
  </div>
);

const StepSignalPreview = dynamic(
  () => import("@/components/demo/onboarding/StepSignalPreview").then((m) => m.StepSignalPreview),
  { ssr: false, loading: stepLoading }
);
const StepTimelineTeaser = dynamic(
  () => import("@/components/demo/onboarding/StepTimelineTeaser").then((m) => m.StepTimelineTeaser),
  { ssr: false, loading: stepLoading }
);
const StepPriorities = dynamic(
  () => import("@/components/demo/onboarding/StepPriorities").then((m) => m.StepPriorities),
  { ssr: false, loading: stepLoading }
);
const StepInput = dynamic(
  () => import("@/components/demo/onboarding/StepInput").then((m) => m.StepInput),
  { ssr: false, loading: stepLoading }
);
const StepPreparing = dynamic(
  () => import("@/components/demo/onboarding/StepPreparing").then((m) => m.StepPreparing),
  { ssr: false, loading: stepLoading }
);

/** Warm the split chunks during idle time on screen 0 — order = user order. */
function preloadLaterSteps() {
  const load = () => {
    import("@/components/demo/onboarding/StepSignalPreview").catch(() => {});
    import("@/components/demo/onboarding/StepTimelineTeaser").catch(() => {});
    import("@/components/demo/onboarding/StepPriorities").catch(() => {});
    import("@/components/demo/onboarding/StepInput").catch(() => {});
    import("@/components/demo/onboarding/StepPreparing").catch(() => {});
  };
  if ("requestIdleCallback" in window) {
    (window as Window & typeof globalThis).requestIdleCallback(load, { timeout: 2000 });
  } else {
    setTimeout(load, 300);
  }
}
import { saveUserProfile } from "@/lib/user-profile";
import type { PriorityDomain } from "@/types/user-profile";

const TOTAL_STEPS = 6;
const SWIPE_THRESHOLD = 50;

/** Slide animation variants — direction-aware */
const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const stepTransition = {
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

/** Screens where swiping back is disabled */
const NO_SWIPE_BACK = new Set([0, 5]); // first screen, preparing screen
/** Screens where swiping forward is disabled (use CTA instead) */
const NO_SWIPE_FORWARD = new Set([4, 5]); // form input, preparing screen

/**
 * Onboarding orchestrator — 6-screen single-page flow.
 * 0: Promise  1: Signal Preview  2: Timeline Teaser  3: Priorities  4: Birth Input  5: Preparing
 */
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const dragX = useMotionValue(0);
  const [priorities, setPriorities] = useState<PriorityDomain[]>([]);
  const [formData, setFormData] = useState<OnboardingFormData>({
    nickname: "",
    dob: "",
    timeOfBirth: "",
    placeOfBirth: "",
  });

  // Warm later-step chunks while the user reads the promise screen.
  useEffect(() => {
    preloadLaterSteps();
  }, []);

  const next = useCallback(() => {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const back = useCallback(() => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  // Save priorities when user advances past step 3
  const handlePrioritiesNext = useCallback(() => {
    if (priorities.length > 0) {
      saveUserProfile({
        priorities,
        prioritiesSetAt: new Date().toISOString(),
      });
    }
    next();
  }, [priorities, next]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const swipe = info.offset.x;
      const velocity = Math.abs(info.velocity.x);
      const confident = Math.abs(swipe) > SWIPE_THRESHOLD || velocity > 500;

      if (!confident) return;

      if (swipe < 0 && !NO_SWIPE_FORWARD.has(step)) {
        next();
      } else if (swipe > 0 && !NO_SWIPE_BACK.has(step)) {
        back();
      }
    },
    [step, next, back]
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepPromise onNext={next} />;
      case 1:
        return <StepSignalPreview onNext={next} onBack={back} />;
      case 2:
        return <StepTimelineTeaser onNext={next} onBack={back} />;
      case 3:
        return (
          <StepPriorities
            selected={priorities}
            onChange={setPriorities}
            onNext={handlePrioritiesNext}
            onBack={back}
          />
        );
      case 4:
        return (
          <StepInput
            formData={formData}
            onChange={setFormData}
            onNext={next}
            onBack={back}
          />
        );
      case 5:
        return <StepPreparing formData={formData} />;
      default:
        return null;
    }
  };

  const isFirstScreen = step === 0;

  return (
    <div
      className="relative h-full overflow-hidden px-5"
      style={{
        // 20px comme avant quand l appareil n a ni encoche ni barre d accueil ;
        // la zone de securite prend le dessus des qu elle est plus grande.
        paddingTop: "max(20px, var(--safe-top))",
        paddingBottom: "max(20px, var(--safe-bottom))",
      }}
    >
      {/* Progress dots — hidden on preparing screen (step 5) */}
      {step < 5 && (
        <div className="mb-4">
          <OnboardingProgress current={step} total={5} />
        </div>
      )}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          className="h-full"
          custom={dir}
          variants={stepVariants}
          initial={isFirstScreen ? false : "enter"}
          animate="center"
          exit="exit"
          transition={stepTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          style={{ x: dragX }}
          onDragEnd={handleDragEnd}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
