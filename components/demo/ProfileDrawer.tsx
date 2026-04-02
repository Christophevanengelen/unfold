"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { User, Sun, Moon, AdjustmentsHorizontal, ArrowRightToBracket, ArrowLeftToBracket, CalendarEdit } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { PersonalizeFlow } from "@/components/demo/PersonalizeFlow";
import { getUserProfileSync, saveUserProfile } from "@/lib/user-profile";
import { isProfileComplete, type UserProfile } from "@/types/user-profile";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase-auth";
import { clearBirthData } from "@/lib/birth-data";
import { AuthSheet } from "@/components/demo/AuthSheet";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { birthData } = useMomentum();
  const { user, isAuthenticated } = useAuth();
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const userName = birthData?.nickname || "You";

  useEffect(() => {
    const p = getUserProfileSync();
    setHasProfile(isProfileComplete(p));
  }, [open]);

  const handlePersonalizeComplete = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setHasProfile(true);
    setPersonalizeOpen(false);
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} maxHeight="60%">
        <div className="px-6 pb-8">
          {/* User info */}
          <div className="flex items-center gap-3 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-brand-soft">
              <User size={22} className="text-accent-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-heading">
                {userName}
              </p>
              <p className="text-xs text-text-body-subtle capitalize">
                free plan
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-brand-3" />

          {/* Settings */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            Settings
          </p>

          {/* Personalize */}
          <button
            type="button"
            onClick={() => { onClose(); setTimeout(() => setPersonalizeOpen(true), 300); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <AdjustmentsHorizontal size={16} className="text-accent-purple" />
              Personnaliser
            </span>
            <span className="text-xs text-text-body-subtle">
              {hasProfile ? "Modifier" : "Configurer"}
            </span>
          </button>

          {/* Edit birth data */}
          <button
            type="button"
            onClick={() => { onClose(); router.push("/demo/onboarding"); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <CalendarEdit size={16} className="text-accent-purple" />
              Ma naissance
            </span>
            <span className="text-xs text-text-body-subtle">
              {birthData?.birthDate ? "Modifier" : "Configurer"}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <Moon size={16} className="text-text-body-subtle" />
              ) : (
                <Sun size={16} className="text-text-body-subtle" />
              )}
              Appearance
            </span>
            <span className="text-xs text-text-body-subtle">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>

          {/* Divider */}
          <div className="my-4 h-px bg-brand-3" />

          {/* Auth section */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            Compte
          </p>

          {isAuthenticated ? (
            <>
              <p className="px-3 mb-2 text-xs text-text-body-subtle truncate">
                {user?.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  clearBirthData();
                  onClose();
                  router.push("/demo/onboarding");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
              >
                <ArrowLeftToBracket size={16} className="text-text-body-subtle" />
                Se déconnecter
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(() => setAuthOpen(true), 300); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
            >
              <ArrowRightToBracket size={16} className="text-accent-purple" />
              Se connecter
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Personalize flow */}
      <PersonalizeFlow
        open={personalizeOpen}
        onClose={() => setPersonalizeOpen(false)}
        onComplete={handlePersonalizeComplete}
      />

      {/* Auth sheet */}
      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
