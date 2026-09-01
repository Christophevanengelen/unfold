"use client";

import { motion, AnimatePresence } from "motion/react";
import { Lock } from "flowbite-react-icons/outline";
import { isIOSBundle } from "@/lib/platform";
import { usePremiumStatus } from "@/lib/premium-gate";
import { t } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { memoriserIntention } from "@/lib/retour-apres-achat";
import { memoriserDeclencheur } from "@/components/demo/PremiumTeaserContext";
import { useLocale } from "@/lib/use-locale";

interface PremiumBlurProps {
  children: React.ReactNode;
  /**
   * Ce qui est masque : "future" | "ai" | undefined.
   *
   * Le voile ne change PLUS de discours selon cette valeur : il parle de la
   * periode que la personne regarde, ce qui est vrai dans les trois cas et
   * bien plus fort qu un nom de fonctionnalite. La propriete reste declaree
   * parce que les appelants la passent, et parce qu elle redeviendra utile le
   * jour ou un mur portera un discours vraiment different.
   */
  feature?: string;
  /** Blur amount in px (default 8) */
  blurAmount?: number;
  /**
   * La date de la periode floutee, deja formatee.
   *
   * Sans elle, le voile dit la meme chose partout. Avec elle, il repond a ce
   * que la personne VIENT DE FAIRE : elle a touche une periode precise parce
   * qu elle voulait savoir ce qui l attend a ce moment-la.
   */
  quand?: string;
  /** L identifiant de la periode, pour y revenir revelee apres l achat. */
  capsuleId?: string;
}

export function PremiumBlur({ children, blurAmount = 8, quand, capsuleId }: PremiumBlurProps) {
  const isPrem = usePremiumStatus();
  const locale = useLocale();

  // On parle du RESULTAT, pas de la fonctionnalite ni de la technologie qui la
  // produit. Et de SA periode quand on la connait.
  const text = {
    headline: quand
      ? perso("flou.titre_date", locale).replace("{d}", quand)
      : perso("flou.titre", locale),
    sub: perso("flou.sous", locale),
  };

  const handleUpgrade = () => {
    // Haptic feedback — medium impact for upgrade CTA
    if (typeof window !== "undefined" && window.Capacitor) {
      import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      });
    }
    // On retient CE QUE LA PERSONNE VOULAIT VOIR au moment ou le mur s est
    // dresse. Sans cela, elle paie pour connaitre une periode precise et se
    // retrouve deposee en haut de la timeline, a devoir la retrouver.
    memoriserIntention(capsuleId);
    // Et on retient CE QU ELLE REGARDAIT, pour que les deux ecrans suivants le
    // sachent. memoriserIntention() ne suffit pas : elle ne garde qu un
    // identifiant, elle se consomme a la premiere lecture, et elle sert au
    // RETOUR apres paiement. Ici il s agit de l ALLER — l ecran de vente puis
    // l ecran des prix doivent tous les deux pouvoir nommer la date.
    memoriserDeclencheur({ quand, capsuleId });
    // Dispatch custom event — PremiumTeaser in demo layout listens
    window.dispatchEvent(new CustomEvent("unfold:show-premium"));
  };

  // If user just upgraded, cascade-unblur: animate children from blur→clear,
  // then remove the overlay entirely. AnimatePresence handles the exit.
  if (isPrem) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-xl"
        initial={{ filter: `blur(${blurAmount}px)` }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Blurred children */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: `blur(${blurAmount}px)` }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Premium overlay — glass morphism with gradient */}
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center"
        style={{
          background: "var(--premium-overlay)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            // Le disque du cadenas a un fond a 15 % : il se voit contre le
            // flou qui le porte. Le lisere a 25 % ne faisait que le durcir.
            background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
          }}
        >
          <Lock size={16} style={{ color: "var(--accent-purple)" }} />
        </motion.div>

        {/* Text */}
        <div>
          <p
            className="font-display text-sm font-semibold"
            style={{ color: "var(--text-heading)", letterSpacing: "-0.01em" }}
          >
            {text.headline}
          </p>
          <p
            className="mt-1 text-[11px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)" }}
          >
            {text.sub}
          </p>
        </div>

        {/* CTA button with glow */}
        <motion.button
          type="button"
          onClick={handleUpgrade}
          whileTap={{ scale: 0.96 }}
          className="mt-1 rounded-full px-5 py-2 text-[11px] font-semibold transition-all duration-200"
          style={{
            background: "var(--accent-purple)",
            color: "var(--text-on-brand)",
            boxShadow: "0 0 20px color-mix(in srgb, var(--accent-purple) 40%, transparent), 0 2px 8px rgba(0,0,0,0.3)",
            letterSpacing: "0.01em",
          }}
        >
          {isIOSBundle() ? t("premium.cta_ios", locale) : t("premium.cta_web", locale)}
        </motion.button>
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
