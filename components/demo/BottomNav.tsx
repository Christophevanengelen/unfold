"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Heart, Clock, User } from "flowbite-react-icons/outline";
import { getConnections } from "@/lib/connections-store";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

/**
 * Barre d onglets.
 *
 * Elle etait faite de trois icones nues, sans libelle, avec un trait de deux
 * pixels sous l onglet actif. Deux problemes : Apple demande des libelles, une
 * icone seule etant ambigue ; et le petit trait ne dialoguait avec rien dans le
 * reste du dessin, qui parle en pastilles (la bascule, les chevrons).
 *
 * Ce qu on fait : libelle sous l icone, et une pastille douce qui glisse
 * derriere l onglet actif au lieu du trait. La pastille reprend le vocabulaire
 * des autres commandes flottantes, et l animation partagee (layoutId) la fait
 * couler d un onglet a l autre.
 *
 * La zone tactile reste a 44 points, le minimum d Apple, et la barre degage
 * toujours la barre d accueil de l iPhone.
 */

const RESSORT = { type: "spring" as const, stiffness: 420, damping: 34 };

interface BottomNavProps {
  /** Ouvre le profil. Il vivait dans une barre du haut qui ne servait qu a ca :
      Apple veut les destinations principales dans la barre d onglets. */
  onProfile?: () => void;
  profileActive?: boolean;
}

function Onglet({
  actif,
  libelle,
  children,
}: {
  actif: boolean;
  libelle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {actif && (
        <motion.span
          layoutId="nav-pastille"
          // Largeur fixe plutot que toute la colonne : une pastille qui prend
          // le tiers de l ecran ecrase le libelle au lieu de le porter.
          className="absolute bottom-1 top-1 rounded-2xl"
          style={{
            left: "50%",
            width: 84,
            marginLeft: -42,
            background: "color-mix(in srgb, var(--accent-purple) 14%, transparent)",
          }}
          transition={RESSORT}
        />
      )}
      <span className="relative flex flex-col items-center gap-[3px]">
        {children}
        <span
          className="text-[10px] leading-none transition-colors duration-200"
          style={{
            color: actif ? "var(--accent-purple)" : "var(--text-body-subtle)",
            fontWeight: actif ? 600 : 500,
            letterSpacing: "0.01em",
          }}
        >
          {libelle}
        </span>
      </span>
    </>
  );
}

export function BottomNav({ onProfile, profileActive = false }: BottomNavProps) {
  const pathname = usePathname();
  const [connectionCount, setConnectionCount] = useState(0);
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setConnectionCount(getConnections().length);
    setLocaleState(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) setLocaleState(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

  const navItems = [
    {
      key: "timeline" as const,
      href: "/app/timeline",
      icon: Clock,
      label: t("nav.timeline", locale),
    },
    {
      key: "match" as const,
      href: "/app/compatibility",
      icon: Heart,
      label: t("nav.match", locale),
      badge: connectionCount,
    },
  ];

  const carre = "relative flex flex-1 flex-col items-center justify-center";
  const taille = { minHeight: 52, minWidth: 44 } as const;

  return (
    <nav
      className="flex items-stretch justify-around px-2"
      style={{
        // Un cran plus haut qu avant : les libelles ont besoin de place, et la
        // zone tactile reste franche.
        height: "calc(var(--barre-onglets) + var(--safe-bottom, 0px))",
        paddingBottom: "calc(6px + var(--safe-bottom, 0px))",
        paddingTop: 6,
        background: "var(--glass-bg)",
        border: "none",
        borderTop: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link key={item.key} href={item.href} className={carre} style={taille} aria-label={item.label}>
            <Onglet actif={isActive} libelle={item.label}>
              <span className="relative">
                <Icon
                  size={21}
                  className="transition-colors duration-200"
                  style={{ color: isActive ? "var(--accent-purple)" : "var(--text-body-subtle)" }}
                />
                {(item.badge ?? 0) > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold"
                    style={{ backgroundColor: "var(--bg-alerte)", color: "var(--text-on-alerte)" }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </Onglet>
          </Link>
        );
      })}

      {onProfile && (
        <button
          type="button"
          onClick={onProfile}
          className={carre}
          style={taille}
          aria-label={t("nav.profile", locale)}
        >
          <Onglet actif={profileActive} libelle={t("nav.profile", locale)}>
            <User
              size={21}
              className="transition-colors duration-200"
              style={{ color: profileActive ? "var(--accent-purple)" : "var(--text-body-subtle)" }}
            />
          </Onglet>
        </button>
      )}
    </nav>
  );
}
