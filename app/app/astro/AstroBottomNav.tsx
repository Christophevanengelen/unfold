"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <line x1="12" y1="2.5" x2="12" y2="8.5" />
      <line x1="12" y1="15.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="8.5" y2="12" />
      <line x1="15.5" y1="12" x2="21.5" y2="12" />
    </svg>
  );
}

function TransitsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="5" cy="12" r="2" fill={active ? "currentColor" : "none"} />
      <path d="M7 12h10" />
      <path d="M14 9l3 3-3 3" />
      <path d="M5 5a9 9 0 0 1 9 9" strokeDasharray="2 2" />
    </svg>
  );
}

function ZRIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 14c1.5-4 3-6 4.5-6S10 12 12 12s3-4 4.5-4S19 10 21 14" />
      <line x1="3" y1="19" x2="21" y2="19" strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

function ProfectionsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function EclipseIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" className="w-5 h-5">
      <circle cx="10" cy="12" r="7" />
      <circle cx="15.5" cy="12" r="5" />
    </svg>
  );
}

const TABS = [
  { label: "Chart", href: "/app/astro/chart", Icon: ChartIcon },
  { label: "Transits", href: "/app/astro/transits", Icon: TransitsIcon },
  { label: "ZR", href: "/app/astro/zr", Icon: ZRIcon },
  { label: "Profections", href: "/app/astro/profections", Icon: ProfectionsIcon },
  { label: "Eclipses", href: "/app/astro/eclipses", Icon: EclipseIcon },
];

export default function AstroBottomNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/api/astrolearn/login", { method: "DELETE" });
    router.push("/app/astro");
  }

  return (
    <>
      {/* Top header bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(15,12,34,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(46,38,84,0.5)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9585CC] to-[#5B4A99]" />
          <span className="text-sm font-bold text-white tracking-tight">AstroLearn</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#4A4070]">{username}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-[#8C7FAE] hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: "rgba(13,10,28,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(149,133,204,0.2)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {TABS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
              style={{ color: active ? "#9585CC" : "#6B5FA0" }}
            >
              <Icon active={active} />
              <span
                className="text-[9px] font-semibold tracking-wide"
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
