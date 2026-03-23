"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { StepPromise } from "@/components/demo/onboarding/StepPromise";
import { StepTimelineTeaser } from "@/components/demo/onboarding/StepTimelineTeaser";
import { StepInput } from "@/components/demo/onboarding/StepInput";
import type { OnboardingFormData } from "@/components/demo/onboarding/StepInput";
import { StepPreparing } from "@/components/demo/onboarding/StepPreparing";

const TOTAL_STEPS = 4;
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
const NO_SWIPE_BACK = new Set([0, 3]); // first screen, preparing screen
/** Screens where swiping forward is disabled (use CTA instead) */
const NO_SWIPE_FORWARD = new Set([2, 3]); // form input, preparing screen

/**
 * Onboarding orchestrator — 4-screen single-page flow.
 * 0: Promise  1: Timeline Teaser  2: Birth Input  3: Preparing
 */
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const dragX = useMotionValue(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    nickname: "",
    dob: "",
    timeOfBirth: "",
    placeOfBirth: "",
  });

  const next = useCallback(() => {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const back = useCallback(() => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

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
        return <StepTimelineTeaser onNext={next} onBack={back} />;
      case 2:
        return (
          <StepInput
            formData={formData}
            onChange={setFormData}
            onNext={next}
            onBack={back}
          />
        );
      case 3:
        return <StepPreparing formData={formData} />;
      default:
        return null;
    }
  };

  const isFirstScreen = step === 0;

  return (
    <div className="relative h-full overflow-hidden">
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
