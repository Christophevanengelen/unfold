"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AstroPeoplePicker from "./AstroPeoplePicker";

const TABS = [
  { label: "Birth Chart", href: "/app/astro/chart" },
  { label: "Transits", href: "/app/astro/transits" },
  { label: "ZR", href: "/app/astro/zr" },
  { label: "Profections", href: "/app/astro/profections" },
  { label: "Eclipses", href: "/app/astro/eclipses" },
];

type ViewSubject =
  | { source: "astrolearn"; personId: string; label: string; username?: string }
  | { source: "unfold"; deviceId: string; label: string };

export default function AstroTabNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewSubject, setViewSubject] = useState<ViewSubject | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/astrolearn/admin/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setIsAdmin(Boolean(data.isAdmin));
        setViewSubject(data.viewSubject ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/astrolearn/login", { method: "DELETE" });
    router.push("/app/astro");
  }

  return (
  <>
    <div
      className="sticky top-0 z-50"
      style={{
        background: "rgba(13,10,28,0.97)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(149,133,204,0.2)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#9585CC] to-[#5B4A99]" />
          <span className="text-xs font-bold text-white tracking-tight">AstroLearn</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#4A4070]">{username}</span>
          <button
            onClick={handleLogout}
            className="text-[10px] text-[#8C7FAE] hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>

      {isAdmin ? (
        <div className="px-4 pb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] text-[#8C7FAE]">
            {viewSubject
              ? `Viewing: ${viewSubject.label} (${viewSubject.source === "astrolearn" ? "AstroLearn" : "Unfold"})`
              : "Select a person to view their chart data"}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-[10px] font-semibold text-[#D8CFF0] hover:text-white transition-colors"
          >
            {viewSubject ? "Change person" : "People"}
          </button>
        </div>
      ) : null}

      <div className="flex overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-shrink-0 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: active ? "#9585CC" : "transparent",
                color: active ? "#9585CC" : "#6B5FA0",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>

    <AstroPeoplePicker
      open={pickerOpen}
      onClose={() => setPickerOpen(false)}
      onSelected={(subject) => setViewSubject(subject)}
    />
  </>
  );
}
