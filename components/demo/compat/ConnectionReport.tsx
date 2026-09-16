"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { PlanetPill, TierBadge, EyebrowLabel } from "@/components/demo/primitives";
import { PremiumBlur } from "@/components/demo/PremiumBlur";
import { usePremiumStatus } from "@/lib/premium-gate";
import { fetchConnectionBrief, type ActivePeriod } from "@/lib/connection-brief-api";
import {
  getConnectionDelineation,
  estMurPayant,
  estSilence,
  type ConnectionDelineation,
  type PersonDelineation,
  type SilenceDelineation,
} from "@/lib/connection-delineation";
import type { MatchingWindow, RelationshipType } from "@/lib/matching-narratives";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { relationshipConfig } from "./relationshipConfig";
import { texteLisible } from "@/lib/contraste";
import { perso } from "@/lib/perso-i18n";
import { useLocale } from "@/lib/use-locale";
import { t, type Locale } from "@/lib/i18n-demo";
import { RapportMatch } from "@/components/demo/compat/RapportMatch";

interface ConnectionReportProps {
  connection: RealConnection;
  myBirthData: BirthData | null;
  /** When true, suppress the scroll container wrapper so a parent pager can manage scroll. */
  embedded?: boolean;
  /**
   * Les fenetres de timing sous la fiche de compatibilite. Fermees par defaut
   * depuis le 16/09, pour deux raisons mesurees ce jour-la sur iPhone 13 :
   *
   *  - Christophe a abandonne l approche du timing pour le match : « les gens
   *    veulent un score de compatibilite en testant leur dating, donc une fiche
   *    de compatibilite generale plutot que dans le temps ».
   *  - Le texte rendu par le moteur laissait passer du jargon en clair a
   *    l ecran — « Noeud Sud en conjonction avec Saturne natal », « un LB
   *    (loosening of the bond) sur le Lot de Spirit ». Le produit interdit tout
   *    nom de technique a l ecran ; c est un defaut de pertinence a remonter a
   *    Marie-Ange, pas quelque chose a masquer discretement.
   *
   * Rien n est supprime : le code des fenetres est intact et se rallume en
   * passant `montrerTiming`. La decision de les remettre appartient a
   * Christophe, pas a cette mise en page.
   */
  montrerTiming?: boolean;
}

/**
 * The scrolling body of a connection detail — one stack of WindowCards.
 * Extracted from app/demo/compatibility/[connectionId]/page.tsx so it can be
 * rendered standalone OR inside ConnectionCarousel for swipeable detail.
 */
export function ConnectionReport({ connection, myBirthData, embedded, montrerTiming = false }: ConnectionReportProps) {
  const locale = useLocale();
  const [windows, setWindows] = useState<MatchingWindow[]>([]);
  const [periods, setPeriods] = useState<ActivePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (montrerTiming && myBirthData && connection.birthData) {
        try {
          const result = await fetchConnectionBrief(
            myBirthData,
            connection.birthData,
            connection.relationship as RelationshipType,
            connection.name,
          );
          if (!cancelled && result.windows.length > 0) {
            setWindows(result.windows);
            setPeriods(result.periods);
            setHasData(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("[ConnectionReport] brief error:", err);
        }
      }
      if (!cancelled) {
        setWindows([]);
        setPeriods([]);
        setHasData(false);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [connection.id, connection.birthData, connection.name, connection.relationship, myBirthData, montrerTiming]);

  const rel = relationshipConfig[connection.relationship];

  const body = (() => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center py-20">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--accent-purple)",
              borderRightColor: "var(--accent-purple)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!hasData) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <p className="text-sm text-text-body">
            {connection.birthData
              ? perso("compat.pas_assez", locale)
              : perso("compat.pas_partage", locale).replace("{n}", connection.name)}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {windows.map((w, i) => (
          <WindowCard
            key={w.monthKey}
            w={w}
            period={periods[i]}
            i={i}
            relColor={rel.color}
            theirName={connection.name}
            myBirthData={myBirthData}
            theirBirthData={connection.birthData}
            // Le mois en cours part tout de suite. Les autres attendent d etre
            // approches du regard — voir useVisible().
            immediat={i === 0 || w.status === "active"}
          />
        ))}
        <div className="h-4" />
      </div>
    );
  })();

  /**
   * L ordre de l ecran a change le 16/09.
   *
   * Christophe : « on a abandonne l approche du timing parce qu elle est trop
   * compliquee — les gens veulent un score de compatibilite en testant leur
   * dating, donc une fiche de compatibilite generale plutot que dans le temps.
   * Tu peux laisser une indication temps si elle est extremement pertinente. »
   *
   * La fiche generale ouvre donc l ecran, et les fenetres de timing passent
   * dessous, sans titre tapageur et seulement quand il y en a. Elles ne sont
   * pas supprimees : elles restent le seul endroit ou le moteur dit QUAND, et
   * les retirer serait une decision de produit, pas une decision de mise en
   * page — elle appartient a Christophe.
   */
  const corps = (
    <div className="flex min-h-0 flex-col">
      {myBirthData && connection.birthData ? (
        <RapportMatch
          moi={myBirthData}
          autre={connection.birthData}
          nomAutre={connection.name}
          embedded
        />
      ) : null}
      {montrerTiming && hasData && !loading ? (
        <div className="px-1">
          <div className="mx-auto w-full max-w-[420px] px-4 pb-2">
            <EyebrowLabel color="var(--text-body-subtle)">
              {t("match.moment", locale).replace(/\s*:\s*$/, "")}
            </EyebrowLabel>
          </div>
          {body}
        </div>
      ) : null}
    </div>
  );

  if (embedded) return corps;
  return corps;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Vrai des que la carte approche de l ecran — et le reste.
 *
 * Avant : les six cartes lançaient leur lecture au modele a l instant ou
 * l ecran s ouvrait. Six appels en parallele, dont cinq pour des mois que
 * personne n avait fait defiler, et un ecran entier de barres grises qui
 * clignotent. Chaque appel se paie, et le premier — le seul qu on regarde —
 * attendait derriere les cinq autres.
 *
 * Le cache de getConnectionDelineation() ne protegeait de rien la premiere
 * fois : c est precisement la premiere fois qui compte.
 * ───────────────────────────────────────────────────────────────────────── */
function useVisible(ref: RefObject<HTMLElement | null>, immediat: boolean): boolean {
  const [vu, setVu] = useState(immediat);

  useEffect(() => {
    if (vu) return;
    const el = ref.current;
    if (!el) return;
    // Vue native ancienne, ou test : pas d observateur, donc on ne cache
    // rien. Le report d un tour evite d appeler setState pendant l effet.
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setVu(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) { setVu(true); io.disconnect(); }
      },
      // De quoi charger juste avant que la carte entre, pas pendant.
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, vu]);

  return vu;
}

// ─── WindowCard ──────────────────────────────────────────

function WindowCard({
  w,
  period,
  i,
  relColor,
  theirName,
  myBirthData,
  theirBirthData,
  immediat,
}: {
  w: MatchingWindow;
  period: ActivePeriod;
  i: number;
  relColor: string;
  theirName: string;
  myBirthData: BirthData | null;
  theirBirthData: BirthData;
  immediat: boolean;
}) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  // w.tierColor et relColor sortent du moteur : ils ne sont pas connus a
  // l avance, donc aucun jeton ne peut les couvrir. Les couleurs de palier
  // valent 2,02 a 3,19 sur le fond clair — elles ont ete choisies pour le
  // theme sombre, ou elles passent. On derive au rendu (regle 3).
  const theme = resolvedTheme === "light" ? "clair" : "sombre";

  const carte = useRef<HTMLDivElement>(null);
  const visible = useVisible(carte, immediat);
  const premium = usePremiumStatus();

  const [del, setDel] = useState<ConnectionDelineation | SilenceDelineation | null>(null);
  const [mur, setMur] = useState(false);
  const [repondu, setRepondu] = useState(false);

  useEffect(() => {
    if (!visible || !myBirthData) return;
    let annule = false;
    getConnectionDelineation(
      period,
      w.relationship,
      {
        birthDate: myBirthData.birthDate,
        birthTime: myBirthData.birthTime,
        latitude: myBirthData.latitude,
        longitude: myBirthData.longitude,
      },
      {
        birthDate: theirBirthData.birthDate,
        birthTime: theirBirthData.birthTime,
        latitude: theirBirthData.latitude,
        longitude: theirBirthData.longitude,
      },
    )
      .then((r) => {
        if (annule) return;
        // 402. Avant, la carte appelait openPremium() ici : l ecran de vente
        // se dressait tout seul, jusqu a six fois, devant quelqu un qui
        // n avait encore rien lu. Et il arrivait sans savoir quel mois etait
        // regarde, alors que memoriserDeclencheur() existe pour ca depuis le
        // 01/09 et que tout le reste de l app s en sert.
        //
        // Maintenant le voile se pose SUR la carte. Il nomme le mois, il
        // attend un doigt, et il retient ce qui etait regarde.
        if (estMurPayant(r)) { setMur(true); setDel(null); return; }
        setMur(false);
        setDel(r);
      })
      .finally(() => { if (!annule) setRepondu(true); });
    return () => { annule = true; };
    // `premium` est dans la liste exprès : au retour d un achat, la carte
    // refait sa lecture au lieu de se contenter d enlever le flou d un texte
    // de repli. Un 402 n est jamais mis en cache, donc l appel repart.
  }, [visible, premium, period, w.relationship, myBirthData, theirBirthData]);

  const chargement = !!myBirthData && visible && !repondu;
  const murVisible = mur && !premium;

  const isActive = w.status === "active";
  const estPasse = w.status === "past";
  const silencieux = estSilence(del);
  const lecture = del && !silencieux ? del : null;

  const statut = isActive
    ? perso("compat.actif", locale)
    : estPasse
      ? perso("compat.passe", locale)
      : perso("compat.a_venir", locale);
  const compte = isActive
    ? perso("compat.jours_restants", locale).replace("{n}", String(w.daysLeft))
    : estPasse
      ? ""
      : perso("compat.dans_jours", locale).replace("{n}", String(w.daysLeft));

  const titre = lecture
    ? lecture.ensemble.titre
    : silencieux
      ? perso("compat.rien_marquant", locale)
      : w.title;
  // w.title EST deja le mois : ne pas le repeter juste en dessous.
  const sousTitre = titre === w.title ? "" : w.dateRange;

  // Un mois passe garde son chapeau et se tait sur le reste : personne n a
  // besoin qu on lui propose « cette semaine, dites-vous… » pour un mois qui
  // est fini. Avant, la carte le proposait quand meme.
  const detaille = !estPasse;

  const corps = (
    <>
      {/* Le chapeau — les deux annees, et ce qui les prolonge */}
      <div
        className="mt-3 rounded-xl px-3.5 py-2.5"
        style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
      >
        {chargement && !lecture ? (
          <Barre couleur={`color-mix(in srgb, ${w.tierColor} 20%, transparent)`} largeur="w-3/4" />
        ) : (
          <p className="text-xs font-semibold leading-relaxed text-text-heading">
            {lecture ? lecture.ensemble.annees : w.sharedTheme}
          </p>
        )}
        {lecture?.ensemble.eclipses && (
          <Suite label={perso("compat.eclipses", locale)} texte={lecture.ensemble.eclipses} />
        )}
        {lecture?.ensemble.passages && (
          <Suite label={perso("compat.ce_mois", locale)} texte={lecture.ensemble.passages} />
        )}
      </div>

      {detaille && (
        <>
          <div className="mt-3 space-y-2">
            <CartePersonne
              eyebrow={perso("compat.vous", locale)}
              eyebrowColor="var(--accent-purple)"
              person={lecture?.personA}
              fallback={w.you.description}
              chargement={chargement && !lecture}
              planet={w.you.planet}
              locale={locale}
            />
            <CartePersonne
              eyebrow={theirName}
              eyebrowColor={texteLisible(relColor, theme, 0)}
              person={lecture?.personB}
              fallback={w.them.description}
              chargement={chargement && !lecture}
              planet={w.them.planet}
              titreColor={texteLisible(relColor, theme, 0)}
              locale={locale}
            />
          </div>

          {/* « Qu est-ce que l un doit comprendre de ce que l autre porte ? »
              C est la phrase que le produit vend. Elle etait posee dans un
              encart identique aux deux blocs personne, en 12 px : on passait
              dessus. Elle a maintenant le violet de l app, un filet, et le
              corps le plus lisible de la carte. */}
          {lecture?.ensemble.empathie && (
            <div
              className="mt-2.5 rounded-xl px-3.5 py-3"
              style={{
                background: "var(--surface-medium)",
                borderLeft: "2px solid var(--accent-purple)",
              }}
            >
              <p
                className="mb-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--accent-purple)" }}
              >
                {t("interface_.se_comprendre", locale)}
              </p>
              <p className="text-[13px] leading-relaxed text-text-body">
                {lecture.ensemble.empathie}
              </p>
            </div>
          )}

          <div
            className="mt-2 rounded-xl px-3.5 py-2.5"
            style={{ background: `color-mix(in srgb, ${w.tierColor} 10%, transparent)` }}
          >
            <p
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: w.tierColor }}
            >
              {perso("compat.ensemble", locale)}
            </p>
            {chargement && !lecture ? (
              <div className="space-y-1">
                <Barre couleur={`color-mix(in srgb, ${w.tierColor} 15%, transparent)`} largeur="w-full" />
                <Barre couleur={`color-mix(in srgb, ${w.tierColor} 15%, transparent)`} largeur="w-3/5" />
              </div>
            ) : (
              <p className="text-xs font-medium leading-relaxed text-text-heading">
                {lecture ? lecture.ensemble.aFaireEnsemble : w.action}
              </p>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <motion.div
      ref={carte}
      className="overflow-hidden rounded-2xl"
      style={{
        // La carte tenait sur --surface-subtle (4 % de violet translucide) et
        // sur un lisere a la couleur du palier. Le trait retire, c est le fond
        // qui porte les deux roles : --fond-cellule le pose franchement sur la
        // page, et la teinte du palier — 10 % si actif, 4 % sinon — dit l etat
        // la ou le lisere le disait. Meme couleur, autre support.
        background: `color-mix(in srgb, ${w.tierColor} ${isActive ? "10" : "4"}%, var(--fond-cellule))`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.05 }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: isActive ? w.tierColor : "var(--text-body-subtle)",
              opacity: isActive ? 1 : 0.4,
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: isActive ? texteLisible(w.tierColor, theme, 0) : "var(--text-body-subtle)",
            }}
          >
            {statut}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={w.tier} color={w.tierColor} />
          <span className="text-[10px] text-text-body-subtle">{compte}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Le mois en cours porte le titre le plus gros de l ecran : c est
            celui qu on est venu lire. Les autres restent des reperes. */}
        <h3
          className={`mt-1 font-bold text-text-heading ${isActive ? "text-[17px] leading-tight" : "text-base"}`}
        >
          {titre}
        </h3>
        {sousTitre && <p className="mt-0.5 text-[11px] text-text-body-subtle">{sousTitre}</p>}

        {silencieux ? (
          // Se taire est une reponse, pas une panne. Elle a droit a la meme
          // mise en page que les autres — pas a un rectangle gris vide.
          <div
            className="mt-3 rounded-xl px-3.5 py-2.5"
            style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
          >
            <p className="text-xs leading-relaxed text-text-body">
              {perso("compat.silence_corps", locale)}
            </p>
          </div>
        ) : murVisible ? (
          <PremiumBlur
            quand={w.dateRange}
            capsuleId={w.monthKey}
            titre={perso("flou.titre_match", locale).replace("{d}", w.title)}
          >
            {corps}
          </PremiumBlur>
        ) : (
          corps
        )}
      </div>
    </motion.div>
  );
}

function Barre({ couleur, largeur }: { couleur: string; largeur: string }) {
  return (
    <div
      className={`h-2.5 animate-pulse rounded ${largeur}`}
      style={{ background: couleur }}
    />
  );
}

/** Une comparaison qui prolonge le chapeau, sans lui voler la vedette. */
function Suite({ label, texte }: { label: string; texte: string }) {
  return (
    <p className="mt-1.5 text-[11px] leading-relaxed text-text-body-subtle">
      <span className="font-semibold text-text-body">{label} · </span>
      {texte}
    </p>
  );
}

function CartePersonne({
  eyebrow,
  eyebrowColor,
  person,
  fallback,
  chargement,
  planet,
  titreColor,
  locale,
}: {
  eyebrow: string;
  eyebrowColor: string;
  person?: PersonDelineation;
  fallback: string;
  chargement: boolean;
  planet: MatchingWindow["you"]["planet"];
  titreColor?: string;
  locale: Locale;
}) {
  // Les trois techniques secondaires etaient trois blocs empiles, chacun avec
  // son etiquette en capitales au-dessus : jusqu a huit paragraphes etiquetes
  // par carte, pour deux personnes. Ca se lisait comme un formulaire.
  //
  // Elles tiennent en un seul paragraphe, l echelle de temps en tete de phrase.
  // Le decompte de Marie-Ange tient toujours : deux a trois phrases, pas plus.
  const suites = person
    ? ([
        person.eclipse ? { cle: "e", label: perso("compat.eclipse", locale), texte: person.eclipse } : null,
        person.passage ? { cle: "p", label: perso("compat.ce_mois", locale), texte: person.passage } : null,
        person.fond ? { cle: "f", label: perso("compat.chapitre", locale), texte: person.fond } : null,
      ].filter(Boolean) as { cle: string; label: string; texte: string }[])
    : [];

  return (
    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
      <div className="flex items-start justify-between gap-2">
        <EyebrowLabel color={eyebrowColor} className="mb-1">
          {eyebrow}
        </EyebrowLabel>
        {person?.titre && (
          <span
            className="shrink-0 text-[9px] font-semibold uppercase tracking-widest"
            style={{ color: titreColor ?? eyebrowColor, opacity: titreColor ? 1 : 0.5 }}
          >
            {person.titre}
          </span>
        )}
      </div>

      {chargement ? (
        <div className="space-y-1">
          <Barre couleur="var(--surface-medium)" largeur="w-full" />
          <Barre couleur="var(--surface-medium)" largeur="w-4/5" />
        </div>
      ) : person ? (
        <>
          <p className="text-xs leading-relaxed text-text-body">{person.annee}</p>
          {suites.length > 0 && (
            <p className="mt-1.5 text-xs leading-relaxed text-text-body">
              {suites.map((s, k) => (
                <span key={s.cle}>
                  {k > 0 && " "}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-body-subtle">
                    {s.label}
                    {" · "}
                  </span>
                  {s.texte}
                </span>
              ))}
            </p>
          )}
          {person.defi && (
            // Le point dur : c est ce que l autre doit comprendre. Un filet a
            // la couleur de la personne le detache de sa lecture, au lieu de
            // le laisser finir le paragraphe en italique plus clair.
            <p
              className="mt-2 border-l-2 pl-2.5 text-[11px] italic leading-snug text-text-body-subtle"
              style={{ borderColor: `color-mix(in srgb, ${eyebrowColor} 45%, transparent)` }}
            >
              {person.defi}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs leading-relaxed text-text-body">{fallback}</p>
      )}

      {planet && <PlanetPill planet={planet} className="mt-1.5" />}
    </div>
  );
}
