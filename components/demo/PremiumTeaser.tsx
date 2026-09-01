"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarMonth, Fire, WandMagicSparkles } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { isIOSBundle } from "@/lib/platform";
import { t, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { useMomentum } from "@/lib/momentum-store";
import { prochainePeriodeForte } from "@/lib/prevision-semaine";
import { declencheurEnAttente } from "@/components/demo/PremiumTeaserContext";
import { useLocale } from "@/lib/use-locale";

interface PremiumTeaserProps {
  open: boolean;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────
 * CE QU ON GAGNE, PAS CE QUE C EST
 *
 * Les cinq puces venaient de lib/i18n-demo.ts et nommaient la technologie :
 * « Delineations IA illimitees », « Carte mensuelle de momentum ». Personne
 * hors du projet ne sait ce qu est une delineation ni un momentum, et un mot
 * qu on ne comprend pas ne se transforme jamais en envie.
 *
 * Trois lignes, chacune une chose qu on RECOIT. Les clefs de i18n-demo.ts
 * appartiennent a un autre chantier en cours, donc les traductions vivent ici,
 * comme app/app/pricing/page.tsx porte deja les siennes.
 * ───────────────────────────────────────────────────────────────────────── */
const GAINS: Record<Locale, { titreDate: string; sousDate: string; g1: string; g2: string; g3: string }> = {
  fr: {
    titreDate: "Le {d} est déjà calculé.",
    sousDate: "Il ne reste qu'à le lire — et les trois années autour.",
    g1: "Les trois prochaines années, période par période",
    g2: "Le sens de chaque période, écrit pour ta situation",
    g3: "Un mot le jour où une bonne fenêtre s'ouvre",
  },
  en: {
    titreDate: "{d} is already mapped.",
    sousDate: "All that's left is reading it — and the three years around it.",
    g1: "The next three years, period by period",
    g2: "What each period means, written for your situation",
    g3: "A word on the day a good window opens",
  },
  es: {
    titreDate: "El {d} ya está calculado.",
    sousDate: "Solo falta leerlo — y los tres años que lo rodean.",
    g1: "Los próximos tres años, periodo a periodo",
    g2: "Qué significa cada periodo, escrito para tu situación",
    g3: "Un aviso el día en que se abre una buena ventana",
  },
  pt: {
    titreDate: "O {d} já está calculado.",
    sousDate: "Só falta lê-lo — e os três anos à volta.",
    g1: "Os próximos três anos, período a período",
    g2: "O que cada período significa, escrito para a tua situação",
    g3: "Um aviso no dia em que se abre uma boa janela",
  },
  de: {
    titreDate: "Der {d} ist bereits berechnet.",
    sousDate: "Es bleibt nur, ihn zu lesen — und die drei Jahre drumherum.",
    g1: "Die nächsten drei Jahre, Phase für Phase",
    g2: "Was jede Phase bedeutet, für deine Lage geschrieben",
    g3: "Ein Hinweis an dem Tag, an dem sich ein gutes Fenster öffnet",
  },
  it: {
    titreDate: "Il {d} è già calcolato.",
    sousDate: "Resta solo da leggerlo — e i tre anni intorno.",
    g1: "I prossimi tre anni, periodo per periodo",
    g2: "Cosa significa ogni periodo, scritto per la tua situazione",
    g3: "Un avviso il giorno in cui si apre una buona finestra",
  },
  nl: {
    titreDate: "{d} is al berekend.",
    sousDate: "Je hoeft het alleen nog te lezen — en de drie jaar eromheen.",
    g1: "De komende drie jaar, periode voor periode",
    g2: "Wat elke periode betekent, geschreven voor jouw situatie",
    g3: "Een bericht op de dag dat een goed venster opengaat",
  },
  ja: {
    titreDate: "{d} はすでに算出済みです。",
    sousDate: "あとは読むだけ。前後3年分も一緒に。",
    g1: "これからの3年間を、時期ごとに",
    g2: "それぞれの時期の意味を、あなたの状況に合わせて",
    g3: "良いタイミングが開く日に、ひとこと",
  },
  zh: {
    titreDate: "{d} 已经算好了。",
    sousDate: "剩下的只是读它 — 以及前后三年。",
    g1: "未来三年，逐段呈现",
    g2: "每段时期意味着什么，为你的处境而写",
    g3: "好时机开启的那天，会有一句提醒",
  },
  ar: {
    titreDate: "{d} محسوب بالفعل.",
    sousDate: "لم يبقَ سوى قراءته — والسنوات الثلاث المحيطة به.",
    g1: "السنوات الثلاث القادمة، فترة بفترة",
    g2: "معنى كل فترة، مكتوب لوضعك أنت",
    g3: "كلمة في اليوم الذي تنفتح فيه نافذة جيدة",
  },
};

export function PremiumTeaser({ open, onClose }: PremiumTeaserProps) {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const ios = isIOSBundle();

  const { phases } = useMomentum();
  const g = GAINS[locale] ?? GAINS.en;

  /**
   * LA DATE QU ELLE REGARDAIT, si le mur vient d une periode precise.
   *
   * Elle prime sur tout le reste : quelqu un qui vient de toucher le voile du
   * 22 octobre pense au 22 octobre, pas a « la prochaine periode marquante ».
   * Lu a l ouverture de la feuille plutot qu au montage, parce que la feuille
   * reste montee entre deux ouvertures — la lire une seule fois donnerait la
   * date du PREMIER mur touche dans la session, ce qui est pire que rien.
   */
  const declencheur = useMemo(() => (open ? declencheurEnAttente() : null), [open]);

  /**
   * La proposition parle de la personne, pas du produit.
   *
   * On montre la FORME de sa prochaine periode marquante — le domaine, la
   * distance, la duree — et jamais la lecture. L information donnee est vraie
   * et verifiable le jour venu ; ce qu on garde est ce qu on vend vraiment.
   *
   * Sans periode forte a venir, on retombe sur la promesse generique. On ne
   * fabrique pas une echeance pour creer de l urgence : quelqu un s en
   * apercevrait, et une seule fois suffirait a perdre sa confiance.
   */
  const apercu = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return prochainePeriodeForte(phases ?? [], d);
  }, [phases]);

  const nomDomaine = apercu
    ? perso(
        apercu.domaine === "love" ? "priorite.love"
          : apercu.domaine === "health" ? "priorite.health_energy"
          : "priorite.career",
        locale,
      )
    : "";
  const titreSpecifique = apercu
    ? (apercu.dansJours <= 1
        ? perso("vente.demain", locale)
        : perso("vente.titre", locale).replace("{n}", String(apercu.dansJours))
      ).replace("{d}", nomDomaine)
    : "";
  const sousTitreSpecifique = apercu
    ? perso("vente.duree", locale).replace("{n}", String(Math.max(1, Math.round(apercu.dureeJours / 7))))
    : "";

  // Trois lignes, pas cinq. Une liste qu on parcourt en entier se lit ; une
  // liste qu on survole se compte, et compter c est comparer, et comparer c est
  // deja etre sorti de l envie.
  const features = [
    { icon: CalendarMonth, text: g.g1 },
    { icon: WandMagicSparkles, text: g.g2 },
    { icon: Fire, text: g.g3 },
  ];

  // Ordre de preference du discours : la date touchee, sinon la prochaine
  // periode marquante, sinon la promesse generique. Chaque cran perd de la
  // precision, aucun ne ment.
  const titre = declencheur?.quand
    ? g.titreDate.replace("{d}", declencheur.quand)
    : apercu
      ? titreSpecifique
      : t("premium.headline", locale);
  const sousTitre = declencheur?.quand
    ? g.sousDate
    : apercu
      ? sousTitreSpecifique
      : t("premium.sub", locale);

  const handleUpgrade = async () => {
    if (ios) {
      // iOS anti-steering: cannot link out to web checkout. Just close.
      // Future Phase 4: present native StoreKit IAP sheet instead.
      onClose();
      return;
    }
    // Web/Android: route to /demo/pricing where the in-app checkout flow lives.
    // /demo/pricing is inside the demo layout (safe areas, theme) and handles
    // all 10 languages via lib/i18n-demo.ts. It will prompt sign-in if needed.
    setLoading(true);
    onClose();
    router.push("/app/pricing");
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="78%">
      <div className="px-6 pb-8 pt-2">
        {/* Hero block — gradient orb suggesting premium energy */}
        <div className="mb-5 flex justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 280 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "var(--accent-purple)",
              boxShadow:
                "0 0 60px color-mix(in srgb, var(--accent-purple) 50%, transparent), 0 0 24px color-mix(in srgb, var(--accent-purple) 80%, transparent)",
            }}
          >
            <WandMagicSparkles size={28} className="text-white" />
          </motion.div>
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center font-display font-bold"
          style={{
            fontSize: 22,
            color: "var(--text-heading)",
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          {titre}
        </motion.h2>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 mt-1.5 text-center text-[13px]"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {sousTitre}
        </motion.p>

        {/* Feature bullets */}
        <div className="mb-6 space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  // La tuile d icone est un aplat teinte a 12 % : c est deja
                  // une surface distincte de la carte qui la contient.
                  background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                }}
              >
                <f.icon size={16} style={{ color: "var(--accent-purple)" }} />
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--text-heading)" }}
              >
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Trial pitch — web only */}
        {!ios && (
          <p
            className="mb-3 text-center text-[12px] font-semibold"
            style={{ color: "var(--accent-purple)" }}
          >
            {t("premium.trial_pitch", locale)}
          </p>
        )}

        {/* CTA — primary action */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mb-3 w-full rounded-2xl py-3.5 text-[14px] font-semibold transition-opacity disabled:opacity-60"
          style={{
            background: "var(--accent-purple)",
            color: "var(--text-on-brand)",
            boxShadow:
              "0 0 20px color-mix(in srgb, var(--accent-purple) 35%, transparent), 0 4px 12px rgba(0,0,0,0.2)",
            letterSpacing: "0.01em",
          }}
          onClick={handleUpgrade}
        >
          {loading
            ? "..."
            : ios
              ? t("premium.cta_ios", locale)
              : t("premium.cta_web", locale)}
        </motion.button>

        {/* Dismiss */}
        <button
          type="button"
          className="w-full py-2 text-[12px] font-medium"
          style={{ color: "var(--text-body-subtle)" }}
          onClick={onClose}
        >
          {t("premium.dismiss", locale)}
        </button>

        {/* Fine print — web only (EU disclosure) */}
        {!ios && (
          <p
            className="mt-3 text-center text-[10px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)", opacity: 0.7 }}
          >
            {t("premium.fine_print", locale)}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
