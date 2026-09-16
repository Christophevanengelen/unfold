"use client";

/**
 * L'écran de conversation avec Vela.
 *
 * Marie-Ange a construit tout le dessous — comprendre, router, rédiger sans
 * jargon — et l'a noté dans `CHATBOT.md` : « il n'y a pas encore de bulle de
 * discussion dans l'app. C'est la suite naturelle, mais ce n'était pas dans ce
 * chantier-ci. » Voici ce chantier-là.
 *
 * Le dessin suit `messages/vela-astrologue.html`, écran par écran : l'écran
 * vide avec ses trois pistes, l'écoute, l'attente qui se dit, la réponse, et
 * l'historique. Rien n'y est inventé côté produit ; ce fichier ne fait que
 * brancher l'interface sur ses deux routes.
 *
 * TROIS CHOSES QUI NE SONT PAS DES DÉTAILS
 *
 *  - **Le premier écran ne dépend d'aucun réseau.** La liste des conversations
 *    est locale (`lib/astrologue-local.ts`), donc elle s'affiche tout de suite.
 *    C'est la même règle que pour le Match : ce qu'on sait déjà ne se fait pas
 *    attendre.
 *  - **Chaque échec a son mot.** Les raisons que la route peut rendre sont
 *    documentées en tête de `app/api/openai/astrologue/message/route.ts` ; on
 *    en traduit deux en langage courant (budget, absence de naissance) et le
 *    reste tombe sur une phrase honnête plutôt qu'un code.
 *  - **On n'écrit jamais par-dessus Vela.** Le texte affiché est celui que la
 *    route rend, mot pour mot. Le garde anti-jargon vit côté serveur ; le
 *    refaire ici créerait deux vérités.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, TrashBin } from "flowbite-react-icons/outline";
import { VelaAvatar } from "@/components/demo/vela/VelaAvatar";
import { getBirthDataSync, type BirthData } from "@/lib/birth-data";
import { getDeviceId } from "@/lib/device-id";
import { apiFetch } from "@/lib/api-client";
import { detectLocale, t } from "@/lib/i18n-demo";
import { toucher, franchir } from "@/lib/haptique";
import {
  listerConversations,
  ouvrirConversation,
  oublierConversation,
  toucherConversation,
  type ConversationLocale,
} from "@/lib/astrologue-local";
import { RapportVela, estVisuelVela, type VisuelVela } from "@/components/demo/vela/RapportVela";

interface Parties {
  cePasse: string;
  dOuCaVient: string;
  ceQuiChange: string;
  prochaineDate?: string;
}

interface Bulle {
  role: "user" | "assistant";
  content: string;
  /** Les quatre temps de l'ecran 4, quand la route les rend. */
  parties?: Parties;
  /** Ce qui a ete mesure, quand il y a de quoi le dessiner. Additif : une
   *  reponse sans ce champ s'affiche exactement comme avant. */
  visuel?: VisuelVela;
}

type Etat = "vide" | "ecoute" | "cherche" | "erreur";

export default function AstrologuePage() {
  const locale = detectLocale();
  const router = useRouter();
  const sansMouvement = useReducedMotion();

  const [naissance, setNaissance] = useState<BirthData | null>(null);
  const [conversations, setConversations] = useState<ConversationLocale[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bulles, setBulles] = useState<Bulle[]>([]);
  const [saisie, setSaisie] = useState("");
  const [etat, setEtat] = useState<Etat>("vide");
  const [erreur, setErreur] = useState<string | null>(null);
  const filRef = useRef<HTMLDivElement>(null);

  // Deux lectures purement locales, faites une fois, apres le montage : le
  // `queueMicrotask` evite la cascade de rendus que la regle
  // react-hooks/set-state-in-effect interdit, sans retarder l affichage d une
  // image — tout est deja en memoire, il n y a pas de reseau ici.
  useEffect(() => {
    queueMicrotask(() => {
      setNaissance(getBirthDataSync());
      setConversations(listerConversations());
    });
  }, []);

  // Le fil descend quand une bulle arrive, jamais autrement : un défilement
  // automatique pendant qu'on relit une réponse est une petite violence.
  useEffect(() => {
    if (bulles.length === 0) return;
    filRef.current?.scrollTo({
      top: filRef.current.scrollHeight,
      behavior: sansMouvement ? "auto" : "smooth",
    });
  }, [bulles, sansMouvement]);

  const ouvrir = useCallback(async (id: string) => {
    setSessionId(id);
    setEtat("ecoute");
    setErreur(null);
    try {
      const res = await apiFetch(`/api/astrologue/session?sessionId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data?.ok) {
        setBulles(
          (data.messages ?? [])
            .filter((m: Bulle) => m.role === "user" || m.role === "assistant")
            .map((m: Bulle) => ({ role: m.role, content: m.content })),
        );
      } else {
        setBulles([]);
      }
    } catch {
      setBulles([]);
    }
  }, []);

  const envoyer = useCallback(
    async (texte: string) => {
      const message = texte.trim();
      if (!message || etat === "cherche") return;
      if (!naissance?.birthDate) return;

      setBulles((b) => [...b, { role: "user", content: message }]);
      setSaisie("");
      setEtat("cherche");
      setErreur(null);
      franchir();

      try {
        const res = await apiFetch("/api/openai/astrologue/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId ?? undefined,
            deviceId: getDeviceId(),
            birthData: naissance,
            locale,
            message,
          }),
        });
        const data = await res.json();

        if (!data?.ok) {
          // Deux raisons méritent leurs propres mots ; le reste dit simplement
          // que ça n'a pas marché, sans jargon d'erreur.
          setErreur(
            data?.raison === "budget_depasse"
              ? t("vela.budget", locale)
              : data?.raison === "birthdata_manquant" || data?.raison === "fuseau_manquant"
                ? t("vela.naissance_manquante", locale)
                : t("vela.erreur", locale),
          );
          setEtat("erreur");
          return;
        }

        setBulles((b) => [
          ...b,
          {
            role: "assistant",
            content: data.message.content,
            parties: data.parties,
            visuel: estVisuelVela(data.visuel) ? data.visuel : undefined,
          },
        ]);
        setEtat("ecoute");
        toucher();

        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
          ouvrirConversation(data.sessionId, message);
          setConversations(listerConversations());
        } else if (data.sessionId) {
          toucherConversation(data.sessionId, data.turn);
          setConversations(listerConversations());
        }
      } catch {
        setErreur(t("vela.erreur", locale));
        setEtat("erreur");
      }
    },
    [etat, naissance, sessionId, locale],
  );

  const nouvelle = () => {
    setSessionId(null);
    setBulles([]);
    setEtat("vide");
    setErreur(null);
    setSaisie("");
  };

  const sousTitre =
    etat === "cherche"
      ? t("vela.sous_cherche", locale)
      : bulles.length > 0
        ? t("vela.sous_ecoute", locale)
        : t("vela.sous_veille", locale);

  // ── Sans date de naissance, la conversation n'a rien à lire ───────────────
  if (naissance !== null && !naissance.birthDate) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 pb-36 text-center">
        <VelaAvatar taille={88} />
        <p className="text-sm text-text-body">{t("vela.naissance_manquante", locale)}</p>
        <button
          type="button"
          onClick={() => router.push("/app/onboarding")}
          className="rounded-full px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)", minHeight: 44 }}
        >
          {t("vela.aller_naissance", locale)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col pb-36">
      {/* En-tête : l'avatar dit l'état, le texte le nomme. */}
      <div className="flex items-center gap-3 pb-3">
        <VelaAvatar taille={38} occupee={etat === "cherche"} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-text-heading">
            {t("vela.titre", locale)}
          </p>
          <p className="text-[11px] leading-tight text-text-body-subtle">{sousTitre}</p>
        </div>
        {bulles.length > 0 && (
          <button
            type="button"
            onClick={nouvelle}
            className="shrink-0 rounded-full px-3 text-[11px] font-semibold"
            style={{ color: "var(--text-brand)", minHeight: 44 }}
          >
            {t("vela.nouvelle", locale)}
          </button>
        )}
      </div>

      <div ref={filRef} className="flex-1 space-y-2.5 overflow-y-auto scrollbar-none">
        {bulles.length === 0 ? (
          <>
            {/* L'écran vide : une question, trois pistes, rien d'autre. */}
            <div className="flex flex-col items-center gap-3 px-2 py-6 text-center">
              <VelaAvatar taille={82} />
              <p className="text-[17px] font-bold leading-tight text-text-heading">
                {t("vela.accroche", locale)}
              </p>
              <p className="max-w-[260px] text-[12.5px] leading-relaxed text-text-body-subtle">
                {t("vela.aide", locale)}
              </p>
              <div className="mt-1 w-full space-y-2">
                {(["piste1", "piste2", "piste3"] as const).map((cle) => (
                  <button
                    key={cle}
                    type="button"
                    onClick={() => envoyer(t(`vela.${cle}`, locale))}
                    className="w-full rounded-full px-4 text-left text-[12.5px] transition-transform active:scale-[0.99]"
                    style={{
                      border: "1px solid var(--border-tint-medium)",
                      color: "var(--text-body)",
                      minHeight: 44,
                    }}
                  >
                    {t(`vela.${cle}`, locale)}
                  </button>
                ))}
              </div>
            </div>

            {/* L'historique, sous l'écran vide : il n'existe que s'il y a
                quelque chose dedans. */}
            {conversations.length > 0 && (
              <div className="pt-2">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-body-subtle">
                  {t("vela.historique", locale)}
                </p>
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 border-b py-2 last:border-b-0"
                    style={{ borderColor: "var(--surface-medium)" }}
                  >
                    <button
                      type="button"
                      onClick={() => ouvrir(c.id)}
                      className="min-w-0 flex-1 text-left"
                      style={{ minHeight: 44 }}
                    >
                      <span className="block truncate text-[13px] font-semibold text-text-heading">
                        {c.titre}
                      </span>
                      <span className="block text-[10.5px] text-text-body-subtle">
                        {new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
                          new Date(c.ouverteLe),
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={t("vela.historique", locale)}
                      onClick={() => {
                        oublierConversation(c.id);
                        setConversations(listerConversations());
                      }}
                      className="shrink-0 px-2"
                      style={{ color: "var(--text-body-subtle)", minHeight: 44, minWidth: 44 }}
                    >
                      <TrashBin size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          bulles.map((b, i) => (
            <motion.div
              key={i}
              initial={sansMouvement ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                b.role === "user" ? "ml-auto" : "mr-auto"
              }`}
              style={
                b.role === "user"
                  ? { background: "var(--surface-medium)", color: "var(--text-heading)" }
                  : { background: "var(--surface-light)", color: "var(--text-body)" }
              }
            >
              {/* Quatre temps titres quand la route les rend, un bloc sinon.
                  On n essaie jamais de recouper le texte nous-memes : ce serait
                  reecrire par-dessus la redaction. */}
              {/* Ce qui a ete mesure passe AVANT les mots : on montre d abord
                  le fait — quel domaine, quelle fenetre, combien de techniques
                  concordent —, la redaction l explique ensuite. L inverse
                  ferait du dessin une illustration decorative. */}
              {b.visuel ? (
                <div className="mb-3">
                  <RapportVela visuel={b.visuel} locale={locale} />
                </div>
              ) : null}
              {b.parties ? (
                <div className="space-y-2.5">
                  {(
                    [
                      ["t_passe", b.parties.cePasse],
                      ["t_origine", b.parties.dOuCaVient],
                      ["t_change", b.parties.ceQuiChange],
                      ["t_date", b.parties.prochaineDate],
                    ] as const
                  )
                    .filter(([, texte]) => Boolean(texte))
                    .map(([cle, texte]) => (
                      <div key={cle}>
                        <span
                          className="mb-0.5 block text-[9.5px] font-bold uppercase tracking-widest"
                          style={{ color: "var(--text-brand)" }}
                        >
                          {t(`vela.${cle}`, locale)}
                        </span>
                        <p>{texte}</p>
                      </div>
                    ))}
                </div>
              ) : (
                b.content
              )}
            </motion.div>
          ))
        )}

        {/* L'attente se dit, comme sur l'écran 3 de Vela. */}
        {etat === "cherche" && (
          <div className="mr-auto flex items-center gap-2 px-1 py-2">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((k) => (
                <motion.i
                  key={k}
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent-purple)" }}
                  animate={sansMouvement ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: k * 0.16 }}
                />
              ))}
            </span>
            <span className="text-[11px] text-text-body-subtle">{t("vela.travail", locale)}</span>
          </div>
        )}

        {erreur && (
          <div className="mr-auto max-w-[86%] rounded-2xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
            <p className="text-[13px] leading-relaxed text-text-body">{erreur}</p>
          </div>
        )}
      </div>

      {/* Le composeur. Entrée envoie, Maj+Entrée va à la ligne. */}
      <div
        className="mt-3 flex items-end gap-2 rounded-3xl px-3 py-2"
        style={{ border: "1px solid var(--border-tint-medium)" }}
      >
        <textarea
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              envoyer(saisie);
            }
          }}
          rows={1}
          placeholder={t("vela.champ", locale)}
          aria-label={t("vela.champ", locale)}
          className="max-h-28 flex-1 resize-none bg-transparent py-2 text-[13px] text-text-heading outline-none placeholder:text-text-body-subtle"
        />
        <button
          type="button"
          onClick={() => envoyer(saisie)}
          disabled={!saisie.trim() || etat === "cherche"}
          aria-label={t("vela.envoyer", locale)}
          className="mb-0.5 flex shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-35"
          style={{
            background: "var(--bg-brand)",
            color: "var(--text-on-brand)",
            width: 44,
            height: 44,
          }}
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
