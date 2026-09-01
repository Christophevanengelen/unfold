"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMomentum } from "@/lib/momentum-store";
import { getMyInviteCode, buildInviteUrl } from "@/lib/connections-store";
import { t } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { useLocale } from "@/lib/use-locale";

export default function InviteShare() {
  const locale = useLocale();
  const { birthData } = useMomentum();
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("...");
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    const code = getMyInviteCode();
    setInviteCode(code);
    if (birthData) {
      setInviteUrl(buildInviteUrl(birthData.nickname || t("connexions.moi", locale), birthData, code));
    }
  }, [birthData, locale]);

  const handleCopy = async () => {
    const textToCopy = inviteUrl || inviteCode;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareMessage = t("connexions.partage_message", locale).replace("{url}", inviteUrl);

  const handleShare = async (method: string) => {
    if (method === "copy") {
      handleCopy();
      return;
    }

    const encodedMsg = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(inviteUrl);

    if (method === "whatsapp") {
      window.open(`https://wa.me/?text=${encodedMsg}`, "_blank");
    } else if (method === "sms") {
      window.open(`sms:?body=${encodedMsg}`, "_blank");
    } else if (method === "email") {
      window.open(`mailto:?subject=${encodeURIComponent(t("connexions.partage_sujet", locale))}&body=${encodedMsg}`, "_blank");
    } else if (navigator.share) {
      try {
        await navigator.share({ title: "Favorable", text: shareMessage, url: inviteUrl });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <div className="flex h-full flex-col px-4 py-2">
      {/* Header */}
      <div>
        <Link href="/app/compatibility" className="flex items-center gap-1 text-sm text-text-body-subtle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {perso("compat.retour", locale)}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-text-heading">
          {perso("compat.partager_code", locale)}
        </h1>
        <p className="mt-1 text-sm text-text-body-subtle">
          {t("connexions.partage_sous", locale)}
        </p>
      </div>

      {/* Code display */}
      <div
        className="mt-6 rounded-2xl py-6 text-center"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">{t("connexions.votre_code", locale)}</p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-[0.15em]" style={{ color: "var(--accent-purple)" }}>
          {inviteCode}
        </p>
      </div>

      {/* Share buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => handleShare("whatsapp")}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-sm active:scale-95 transition-transform"
        >
          WhatsApp
        </button>
        <button
          onClick={() => handleShare("sms")}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm active:scale-95 transition-transform"
          style={{ background: "var(--accent-green)" }}
        >
          {t("connexions.bouton_sms", locale)}
        </button>
        <button
          onClick={() => handleShare("email")}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm active:scale-95 transition-transform"
          style={{ background: "var(--accent-blue)" }}
        >
          Email
        </button>
        <button
          onClick={() => handleShare("copy")}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm active:scale-95 transition-transform"
          style={{ background: "var(--accent-purple)" }}
        >
          {copied ? t("connexions.copie", locale) : t("connexions.copier", locale)}
        </button>
      </div>

      {/* Back */}
      <div className="mt-auto pt-6 pb-4">
        <Link
          href="/app/compatibility"
          className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-95"
          style={{ border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)", color: "var(--accent-purple)" }}
        >
          {t("connexions.retour_liste", locale)}
        </Link>
      </div>
    </div>
  );
}
