"use client";

import { useRef, useState } from "react";

/**
 * La liste d attente — ce que la page propose tant que l app n est pas publiee.
 *
 * `AppStoreBadges` ne rend rien quand `APP_PUBLIEE` est faux, et c est le bon
 * choix : deux boutons vers une page d erreur coutent plus cher que pas de
 * bouton. Mais le bloc final disait quand meme « Telecharge Favorable », puis
 * ne montrait rien. Le visiteur le plus engage de la page — celui qui a lu
 * jusqu en bas — arrivait sur un mur blanc.
 *
 * Ici il laisse son adresse, elle part dans le CRM central sous l initiative
 * `unfold`, et c est la seule chose qui transforme une visite en prospect.
 *
 * Aucune promesse qu on ne tient pas : une adresse, un courriel, le jour de la
 * sortie. C est ecrit sous le champ, pas dans des conditions d utilisation.
 */

interface ListeDAttenteProps {
  t: (key: string, fallback?: string) => string;
  locale: string;
}

type Etat = "attente" | "envoi" | "fait" | "invalide" | "erreur";

export function ListeDAttente({ t, locale }: ListeDAttenteProps) {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>("attente");
  // L heure d affichage sert de piege de vitesse cote serveur : un robot
  // soumet en moins de trois secondes, une personne jamais.
  const ouvertureLe = useRef(Date.now());
  const potDeMiel = useRef<HTMLInputElement>(null);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (etat === "envoi") return;

    const adresse = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse)) {
      setEtat("invalide");
      return;
    }

    setEtat("envoi");
    try {
      const r = await fetch("/api/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adresse,
          langue: locale,
          page: typeof window !== "undefined" ? window.location.pathname : null,
          site: potDeMiel.current?.value ?? "",
          ouverture_le: ouvertureLe.current,
        }),
      });
      setEtat(r.ok ? "fait" : "erreur");
    } catch {
      setEtat("erreur");
    }
  }

  if (etat === "fait") {
    return (
      <div
        className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 backdrop-blur-sm"
        role="status"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-white"
        >
          <path
            d="M4 10.5 8 14.5 16 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-[15px] text-white">
          {t("waitlist.done", "Noted. We'll write to you on launch day.")}
        </p>
      </div>
    );
  }

  const enCours = etat === "envoi";

  return (
    <form onSubmit={envoyer} className="mx-auto max-w-md" noValidate>
      {/* Le pot de miel : hors de l ecran, hors du parcours au clavier, et
          annonce comme decoratif aux lecteurs d ecran. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="site-web">Site web</label>
        <input
          ref={potDeMiel}
          id="site-web"
          name="site"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="liste-attente-email" className="sr-only">
          {t("waitlist.placeholder", "your@email.com")}
        </label>
        <input
          id="liste-attente-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value);
            if (etat === "invalide" || etat === "erreur") setEtat("attente");
          }}
          placeholder={t("waitlist.placeholder", "your@email.com")}
          disabled={enCours}
          aria-invalid={etat === "invalide"}
          aria-describedby="liste-attente-note"
          className="h-[52px] flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={enCours}
          className="h-[52px] shrink-0 rounded-xl bg-white px-6 text-[15px] font-semibold tracking-tight text-[#12071F] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60"
        >
          {enCours
            ? t("waitlist.sending", "Sending…")
            : t("waitlist.cta", "Tell me when it's out")}
        </button>
      </div>

      <p
        id="liste-attente-note"
        className="mt-3 text-center text-[13px] text-brand-10"
        aria-live="polite"
      >
        {etat === "invalide"
          ? t("waitlist.invalid", "This address doesn't look right.")
          : etat === "erreur"
            ? t("waitlist.error", "That didn't go through. Try again in a moment.")
            : t("waitlist.privacy", "One email, on launch day. No list, nothing passed on.")}
      </p>
    </form>
  );
}
