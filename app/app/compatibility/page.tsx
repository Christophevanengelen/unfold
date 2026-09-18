"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShareNodes, Plus } from "flowbite-react-icons/outline";
import {
  getConnections,
  getMyInviteCode,
  addConnection,
  type RealConnection,
} from "@/lib/connections-store";
import { getBirthDataSync, type BirthData } from "@/lib/birth-data";
import { ConnectionList } from "@/components/demo/compat/ConnectionList";
import { AjouterMatchSheet } from "@/components/demo/compat/AjouterMatchSheet";
import { apiFetch } from "@/lib/api-client";
import { connectionHref } from "@/lib/connection-href";
import { detectLocale, t } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

const LONG_PRESS_HINT_KEY = "unfold_longpress_hint_seen_v1";

export default function ConnectionsPage() {
  const locale = detectLocale();
  const router = useRouter();
  const [connections, setConnections] = useState<RealConnection[]>([]);
  const [myBirthData, setMyBirthData] = useState<BirthData | null>(null);
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [myCode, setMyCode] = useState("...");
  const [showHint, setShowHint] = useState(false);
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  // Le choix entre les deux facons d avoir un match (voir AjouterMatchSheet).
  const [matchSheetOuvert, setMatchSheetOuvert] = useState(false);

  useEffect(() => {
    const list = getConnections();
    setConnections(list);
    setMyCode(getMyInviteCode());
    setMyBirthData(getBirthDataSync());
    if (list.length > 0 && typeof window !== "undefined") {
      const seen = localStorage.getItem(LONG_PRESS_HINT_KEY);
      if (!seen) setShowHint(true);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem(LONG_PRESS_HINT_KEY, "1"); } catch {}
  };

  const handleCodeSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) return;

    // Prevent adding yourself
    if (trimmed === myCode) {
      setCodeError(t("connexions.code_soi", locale));
      return;
    }
    // Prevent duplicate
    if (connections.some((c) => c.inviteCode === trimmed)) {
      setCodeError(t("connexions.code_deja", locale));
      return;
    }

    setCodeSubmitting(true);
    setCodeError(null);
    try {
      const res = await apiFetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      if (res.status === 404) {
        setCodeError(t("connexions.code_introuvable", locale));
        return;
      }
      if (!res.ok) {
        setCodeError(t("connexions.code_erreur", locale));
        return;
      }

      const { name, birthData } = (await res.json()) as {
        name: string;
        birthData: BirthData;
      };

      // Create the connection locally + on Supabase (relationship default: friend,
      // user can change it via the long-press sheet)
      const newConn = addConnection({
        name,
        relationship: "friend",
        birthData,
        inviteCode: trimmed,
      });
      setConnections(getConnections());
      setCode("");
      setShowCodeInput(false);
      router.push(connectionHref(newConn.id));
    } catch {
      setCodeError(t("connexions.code_reseau", locale));
    } finally {
      setCodeSubmitting(false);
    }
  };

  const handleDeleted = (id: string) => {
    setConnections((cs) => cs.filter((c) => c.id !== id));
  };

  return (
    // Le degagement du bas. Le conteneur du layout ne reserve que la zone sure
    // de l appareil — la barre d accueil de l iPhone — pas la hauteur de la
    // barre d onglets, qui fait 128 px et flotte par-dessus. Tant que cette
    // page tenait dans un ecran, ca ne se voyait pas ; la fiche de match la
    // rend longue, et la derniere phrase passait sous « Match ».
    <div className="pb-36">
      {/* Header */}
      <div className="relative mb-1 px-14 text-center">
        {/* Goodly, pas Uniform Rounded (font-display) : c est la police
            "magazine" de la marque, deja posee sur les gros titres de
            app/app/vie/page.tsx. Un ecran de gestion reste un ecran de la
            marque, pas un simple panneau d administration. */}
        <h1
          className="text-[26px] leading-[1.1] text-text-heading"
          style={{ fontFamily: "var(--font-titre)", fontWeight: 300, letterSpacing: "-0.02em", textWrap: "balance" }}
        >
          {t("connexions.titre", locale)}
        </h1>
        {/* Rien sous le titre quand la liste est vide : la vitrine porte sa
            propre phrase, et « Invitez quelqu un pour commencer » la doublait
            en vouvoyant, alors que tout le reste de l app tutoie. */}
        {connections.length > 0 ? (
          <p className="text-xs text-text-body-subtle">
            {t("connexions.compte", locale).replace("{n}", String(connections.length))}
          </p>
        ) : null}

        {/* Point d entree UNIQUE des deux facons d avoir un match — code ou
            saisie manuelle, posees a egalite dans la feuille qu il ouvre. Voir
            AjouterMatchSheet. Visible que la liste soit vide ou non : la
            vitrine garde son propre appel a inviter, celui-ci est le geste
            constant, toujours au meme endroit. */}
        <button
          type="button"
          onClick={() => setMatchSheetOuvert(true)}
          aria-label={perso("compat.ajouter_match", locale)}
          className="absolute right-0 top-0 flex items-center justify-center rounded-full"
          style={{
            width: "var(--taille-tactile-min)",
            height: "var(--taille-tactile-min)",
            background: "var(--surface-light)",
            color: "var(--accent-purple)",
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      <AjouterMatchSheet
        open={matchSheetOuvert}
        onClose={() => setMatchSheetOuvert(false)}
        onCode={() => setShowCodeInput(true)}
      />

      {/* Rhythm inbox */}
      <ConnectionList
        connections={connections}
        myBirthData={myBirthData}
        onDeleted={handleDeleted}
        onCodeRecu={() => setShowCodeInput(true)}
      />

      {/* Le conseil d appui long occupait la place la plus chere de l ecran :
          juste sous le titre, avant les connexions. Quelqu un qui ouvre le
          Match vient voir ses proches, pas apprendre un geste. Il passe donc
          APRES la liste, la ou il repond a une question qu on se pose une fois
          les connexions sous les yeux : comment j en modifie une ? */}
      {/* Long-press hint */}
      {showHint && connections.length > 0 && (
        <motion.button
          onClick={dismissHint}
          className="mb-3 mt-1 flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-[11px]"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
            color: "var(--text-body-subtle)",
          }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{perso("compat.balayer", locale)}</span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--accent-purple)" }}>
            {t("connexions.compris", locale)}
          </span>
        </motion.button>
      )}

      {/* Le separateur et la carte « partager mon code » n apparaissent QUE
          s il y a deja des connexions : sans connexion, la vitrine porte deja
          l appel a inviter, et repeter le meme geste ici en plus remettrait le
          code FAV-XXXX en clair a l ecran, alors que c est de la plomberie qui
          a sa place dans la feuille de partage.

          LE FORMULAIRE DE SAISIE, LUI, N EST PLUS SOUMIS A CETTE CONDITION.
          Corrige le 17/09 au soir : « J ai recu un code », dans la vitrine
          affichee sans connexion, ouvrait `showCodeInput` — mais le formulaire
          qui repond a cet etat vivait entierement DANS le bloc reserve aux
          connexions existantes. Le bouton changeait un etat que rien
          n ecoutait tant qu on etait a zero connexion : au clic, rien ne se
          passait. C est exactement ce que Christophe a signale : « je ne
          peux pas encoder le code ». */}
      {connections.length > 0 ? (
      <>
      <div className="my-5 h-px" style={{ background: "var(--surface-medium)" }} />

      <div className="space-y-3">
        <Link
          href="/app/invite/share"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
          style={{ background: "var(--surface-light)", border: "1px solid var(--border-tint-light)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--border-tint-light)" }}
          >
            <ShareNodes size={16} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-heading">{perso("compat.partager_code", locale)}</p>
            <p className="text-[11px] text-text-body-subtle">
              {perso("compat.invitez_comparer", locale)}
            </p>
          </div>
          <span
            className="text-xs font-mono font-semibold tracking-wider"
            style={{ color: "var(--accent-purple)" }}
          >
            {myCode}
          </span>
        </Link>

        {!showCodeInput && (
          <button
            onClick={() => setShowCodeInput(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{
              border: "1px solid var(--border-tint-medium)",
              color: "var(--accent-purple)",
            }}
          >
            {perso("compat.entrer_code", locale)}
          </button>
        )}
      </div>
      </>
      ) : null}

      {/* Le formulaire de saisie, accessible AVEC ou SANS connexion. */}
      {showCodeInput && (
          <motion.div
            className="rounded-2xl p-4"
            style={{ background: "var(--surface-light)", border: "1px solid var(--border-tint-light)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
              {perso("compat.entrez_code", locale)}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (codeError) setCodeError(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !codeSubmitting) handleCodeSubmit(); }}
                placeholder="FAV-XXXX"
                // Ce champ etait ecrit pour le theme sombre seulement : texte blanc, fond
                // blanc a 5 %, bordure blanche a 10 %. En theme clair, on tapait donc
                // du blanc sur du blanc — le code saisi etait invisible pendant qu on
                // le tapait.
                className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-muted)",
                  color: "var(--text-heading)",
                }}
                maxLength={12}
                disabled={codeSubmitting}
              />
              <button
                onClick={handleCodeSubmit}
                disabled={code.trim().length < 4 || codeSubmitting}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-30"
                // La paire de marque : blanc sur --accent-purple donnait 4,46 en
                // clair et 3,23 en sombre. Meme correction que la bascule de vue.
                style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
              >
                {codeSubmitting ? "…" : perso("compat.connecter", locale)}
              </button>
            </div>
            {codeError ? (
              <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--danger)" }}>
                {codeError}
              </p>
            ) : (
              <p className="mt-2 text-[10px] text-text-body-subtle">
                {t("connexions.code_ou_lien", locale)}
              </p>
            )}
          </motion.div>
      )}
    </div>
  );
}
