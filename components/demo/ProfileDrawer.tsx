"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { User, Sun, Moon, AdjustmentsHorizontal, ArrowRightToBracket, ArrowLeftToBracket, CalendarEdit, Globe, Eye, TrashBin, Bell } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { PersonalizeFlow } from "@/components/demo/PersonalizeFlow";
import { getUserProfileSync, saveUserProfile } from "@/lib/user-profile";
import { isProfileComplete, type UserProfile } from "@/types/user-profile";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase-auth";
import { clearBirthData, getBirthDataSync, birthHash } from "@/lib/birth-data";
import { AuthSheet } from "@/components/demo/AuthSheet";
import { t, detectLocale, setLocale, LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n-demo";
import { getStreak } from "@/lib/streak";
import { etatPermission, demanderPuisEnregistrer, lireCadence, reglerCadence, detailEchec, type EtatPermission } from "@/lib/push";
import type { Cadence } from "@/lib/push-planification";
import { getDeviceId } from "@/lib/device-id";
import { rejouerGuide } from "@/components/demo/FirstUseGuide";
import { useBillingState } from "@/lib/premium-gate";
import { isNative, getPlatform } from "@/lib/platform";
import { apiFetch } from "@/lib/api-client";
import { mesurer } from "@/lib/mesure";
import { EditionNaissance } from "@/components/demo/EditionNaissance";
import { disponible, preparer, restaurer } from "@/lib/achats";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  // Voir app/app/layout.tsx : l instant est fige au montage plutot que lu a
  // chaque rendu, qui doit rester deterministe.
  const [maintenant] = useState(() => Date.now());
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // L apparence a trois etats, comme partout chez Apple : Systeme, Clair,
  // Sombre. Le bouton n en avait que deux : des qu on y touchait, l app cessait
  // definitivement de suivre le telephone. Quelqu un qui bascule son iPhone en
  // sombre le soir gardait une app claire, sans moyen de revenir en arriere.
  const apparence = theme === "light" || theme === "dark" ? theme : "system";
  const apparenceSuivante =
    apparence === "system" ? "light" : apparence === "light" ? "dark" : "system";

  const { birthData } = useMomentum();
  const { user, isAuthenticated } = useAuth();
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  // Suppression de compte. Apple l exige depuis le 30 juin 2022 pour toute app
  // qui cree un compte, et Google demande en plus une adresse web publique.
  // La route existait depuis des mois ; aucun ecran ne l appelait.
  const [suppressionOuverte, setSuppressionOuverte] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // Notifications. On LIT l etat sans jamais rien demander a l ouverture du
  // tiroir : sur iOS la boite systeme ne s affiche qu une fois dans la vie de
  // l installation, et un refus ne se rattrape plus depuis l app. Elle n est
  // appelee que sur un geste explicite.
  /**
   * L etat de depart ne peut pas etre « indisponible ».
   *
   * « indisponible » veut dire « nous ne sommes pas dans l app, ce reglage
   * n existe pas ici » — et c est la seule valeur qui MASQUE le bloc. En la
   * prenant comme valeur initiale, on affirmait cette absence avant d avoir
   * rien verifie.
   *
   * Concretement : le reglage n apparaissait qu APRES la resolution de
   * etatPermission(), qui charge le greffon par import dynamique. Tant que
   * cette promesse n avait pas repondu — et si elle ne repondait jamais — le
   * bloc n existait pas. Christophe l a cherche en vain dans la build 120.
   *
   * isNative() est synchrone et fiable : dans le paquet natif, la constante de
   * compilation suffit. On part donc de « jamais_demande », qui affiche le
   * reglage et le rend actionnable, et la vraie valeur le corrige des qu elle
   * arrive. Sur le web, on garde « indisponible » : la, c est vrai.
   */
  const [permission, setPermission] = useState<EtatPermission>(() =>
    isNative() ? "jamais_demande" : "indisponible",
  );
  const [cadence, setCadence] = useState<Cadence>(lireCadence);
  useEffect(() => {
    if (open) void etatPermission().then(setPermission);
  }, [open]);
  const [authOpen, setAuthOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const locale = useLocale();
  const [editionOuverte, setEditionOuverte] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const billing = useBillingState();
  const native = isNative();
  const platform = getPlatform();

  const userName = birthData?.nickname || (locale === "fr" ? "Toi" : locale === "es" ? "Tú" : locale === "pt" ? "Você" : "You");

  useEffect(() => {
    const p = getUserProfileSync();
    setHasProfile(isProfileComplete(p));
  }, [open]);

  const handlePersonalizeComplete = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setHasProfile(true);
    setPersonalizeOpen(false);
  };

  // La serie vivait dans la barre du haut, supprimee le 31/08/2026. Sa place
  // est ici : c est l ecran ou l on regarde son propre etat.
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    if (open) setStreak(getStreak().count);
  }, [open]);

  return (
    <>
      <BottomSheet open={open} onClose={onClose} maxHeight="60%">
        <div className="px-6 pb-8">
          {/* User info */}
          <div className="flex items-center gap-3 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-brand-soft">
              <User size={22} className="text-accent-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-heading">
                {userName}
              </p>
              <p className="text-xs text-text-body-subtle">
                {billing.isPremium
                  ? t("profile.premium_plan", locale)
                  : t("profile.free_plan", locale)}
                {billing.status === "trialing" && (
                  <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                      color: "var(--accent-purple)",
                    }}
                  >
                    {/* Le decompte vivait dans la barre du haut du web, qui
                        disparait. Un essai sans nombre de jours restants ne
                        pousse a rien : c est justement le nombre qui decide. */}
                    {billing.trialEnd
                      ? t("profile.trial_days", locale).replace(
                          "{n}",
                          String(
                            Math.max(
                              0,
                              Math.ceil(
                                (new Date(billing.trialEnd).getTime() - maintenant) / 86_400_000,
                              ),
                            ),
                          ),
                        )
                      : "Trial"}
                  </span>
                )}
              </p>
              {streak >= 2 && (
                <p className="mt-0.5 text-[11px] font-semibold" style={{ color: "var(--accent-purple)" }}>
                  {t("profile.streak_day", locale).replace("{n}", String(streak))}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-brand-3" />

          {/* Settings */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.settings", locale)}
          </p>

          {/* Personalize */}
          <button
            type="button"
            onClick={() => { onClose(); setTimeout(() => setPersonalizeOpen(true), 300); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <AdjustmentsHorizontal size={16} className="text-accent-purple" />
              {t("profile.personalize", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {hasProfile ? t("profile.edit", locale) : t("profile.configure", locale)}
            </span>
          </button>

          {/* Edit birth data */}
          <button
            type="button"
            // Ouvre la feuille d edition au lieu de renvoyer dans l onboarding
            // complet avec un formulaire vide. Corriger une minute d heure de
            // naissance demandait jusqu ici de refaire tout le parcours.
            //
            // Le renvoi reste pour qui n a PAS encore de donnees : dans ce cas
            // il n y a rien a corriger, c est une premiere saisie.
            onClick={() => {
              // On FERME le tiroir avant d ouvrir la fiche d edition.
              //
              // Les deux etaient affiches en meme temps : deux feuilles
              // empilees, deux poignees, celle du dessous reduite a une tranche
              // de titre. Sur iOS un sous-ecran de reglages ne s empile pas sur
              // son parent — il le remplace. Une seule feuille a la fois.
              if (birthData?.birthDate) {
                onClose();
                setEditionOuverte(true);
              } else {
                onClose();
                router.push("/app/onboarding");
              }
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <CalendarEdit size={16} className="text-accent-purple" />
              {t("profile.edit_birth", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {birthData?.birthDate ? t("profile.edit", locale) : t("profile.configure", locale)}
            </span>
          </button>

      {/* Full timeline chart — premium only */}
          {billing.isPremium && (
            <button
              type="button"
              onClick={() => { onClose(); router.push("/app/lifetime-chart"); }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
            >
              <span className="flex items-center gap-2.5">
                <Eye size={16} className="text-accent-purple" />
                {perso("profil.graphique", locale)}
              </span>
              {/* « Sausage » etait le nom interne du graphique. Un mot d atelier
                  n a rien a faire sous les yeux de la personne. */}
              <span className="text-[10px] font-semibold" style={{ color: "var(--accent-purple)", opacity: 0.7 }}>
                Premium
              </span>
            </button>
          )}

          {/* Language picker */}
          <button
            type="button"
            // Meme regle que la fiche d edition : une seule feuille a la fois.
            // Le selecteur s ouvrait par-dessus le tiroir, avec la meme pile de
            // deux poignees.
            onClick={() => {
              onClose();
              setLangPickerOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <Globe size={16} className="text-text-body-subtle" />
              {t("profile.language", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {LOCALE_LABELS[locale]}
            </span>
          </button>

          {/* Notifications — visible uniquement dans l app, la vitrine web
              n a pas de notifications distantes */}
          {permission !== "indisponible" && (
            <button
              type="button"
              disabled={permission === "accorde"}
              onClick={() => {
                // « erreur » reste cliquable : si l echec etait passager, la
                // demande peut aboutir. Une ligne grisee sans explication ne
                // laisserait aucune issue.
                if (permission === "jamais_demande" || permission === "erreur") {
                  // On mesure la DEMANDE avant son issue : sans elle, un refus
                  // systeme et une personne qui n a jamais touche le bouton
                  // produisent le meme silence.
                  mesurer("notif_demandee");
                  void demanderPuisEnregistrer().then((etat) => {
                    setPermission(etat);
                    if (etat === "accorde") mesurer("notif_accordee");
                    else if (etat === "refuse") mesurer("notif_refusee");
                    else if (etat === "erreur") {
                      mesurer("notif_echec", { detail: detailEchec() ?? "inconnu" });
                    }
                  });
                }
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary disabled:hover:bg-transparent"
            >
              <span className="flex items-center gap-2.5">
                <Bell size={16} className="text-text-body-subtle" />
                {t("profile.notifications", locale)}
              </span>
              <span className="text-xs text-text-body-subtle">
                {permission === "accorde"
                  ? t("profile.notif_active", locale)
                  : permission === "refuse"
                    ? t("profile.notif_reglages", locale)
                    : permission === "erreur"
                      // Volontairement brut : en test, savoir ce qui a casse
                      // vaut mieux qu un message poli qui ne dit rien.
                      ? (detailEchec() ?? "indisponible").slice(0, 40)
                      : t("profile.notif_activer", locale)}
              </span>
            </button>
          )}

          {permission !== "indisponible" && (
            <div className="px-3 pb-1 pt-2">
              <p className="mb-2 text-xs font-medium text-text-body-subtle">
                {t("profile.notif_cadence", locale)}
              </p>
              {permission !== "accorde" && (
                <p className="mb-2 text-[11px]" style={{ color: "var(--text-body-subtle)" }}>
                  {perso("notif.cadence_bloquee", locale)}
                </p>
              )}
              <div
                className="flex gap-1.5 rounded-xl bg-bg-secondary p-1"
                // Plus d opacite reduite : elle divisait par deux un contraste
                // deja juste, et rendait les libelles illisibles.
              >
                {/* « Aucune » en premier : c est le bouton d ARRET.
                    
                    L app permettait d activer les notifications et jamais de
                    les couper — une fois la permission accordee, la ligne
                    devenait inerte. iOS n autorise pas a revoquer une permission
                    depuis l app, mais rien n oblige a ENVOYER : ce cran coupe
                    l envoi cote serveur, ce qui est ce que « desactiver » veut
                    dire pour la personne. */}
                {(["aucune", "essentiel", "normal", "tout"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    // Plus de `disabled`. Ces boutons etaient desactives tant que
                    // la permission n etait pas accordee — c est-a-dire TOUJOURS,
                    // puisque personne ne l avait accordee. Ils s affichaient donc
                    // en permanence sans repondre au doigt, et rien ne disait
                    // pourquoi. Un reglage mort sans explication est pire qu un
                    // reglage absent : on croit l app cassee.
                    //
                    // Le choix est desormais libre. Il est enregistre localement
                    // et envoye au serveur ; il s applique le jour ou les
                    // notifications sont actives, et la ligne ci-dessous le dit.
                    onClick={() => {
                      setCadence(c);
                      void reglerCadence(c);
                    }}
                    aria-pressed={cadence === c}
                    className={`flex-1 rounded-lg px-2 text-xs font-medium transition-colors ${
                      cadence === c
                        ? "bg-bg-primary text-text-heading shadow-sm"
                        : "text-text-body-subtle hover:text-text-heading"
                    }`}
                    style={{ minHeight: 40 }}
                  >
                    {c === "aucune"
                      ? perso("cadence.aucune_nom", locale)
                      : t(`profile.notif_${c}`, locale)}
                  </button>
                ))}
              </div>
              {/* Ce que le cran choisi envoie REELLEMENT.
                  « L essentiel », « Equilibre », « Tout » sont des etiquettes :
                  on ne pouvait pas choisir en connaissance de cause. Ces lignes
                  disent l espacement applique par lib/push-planification.ts. */}
              <p className="mt-2 text-[11px]" style={{ color: "var(--text-body-subtle)" }}>
                {perso(`cadence.${cadence}`, locale)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              rejouerGuide();
              onClose();
              router.push("/app/timeline");
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <Eye size={16} className="text-text-body-subtle" />
              {t("guide.revoir", locale)}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(apparenceSuivante)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <Moon size={16} className="text-text-body-subtle" />
              ) : (
                <Sun size={16} className="text-text-body-subtle" />
              )}
              {t("profile.appearance", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {apparence === "system"
                ? t("profile.systeme", locale)
                : apparence === "dark"
                  ? t("profile.dark", locale)
                  : t("profile.light", locale)}
            </span>
          </button>

          {/* Subscription management — only when authenticated */}
          {isAuthenticated && (
            <>
              <div className="my-4 h-px bg-brand-3" />
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
                {t("profile.your_plan", locale)}
              </p>

              {/* Manage subscription */}
              <button
                type="button"
                onClick={() => {
                  if (native) {
                    // Native iOS → Apple subscriptions page
                    // Native Android → Google Play subscriptions
                    const url = platform === "ios"
                      ? "https://apps.apple.com/account/subscriptions"
                      : "https://play.google.com/store/account/subscriptions";
                    if (typeof window !== "undefined") {
                      // "_system" opens in the native browser on iOS/Android
                      window.open(url, "_system");
                    }
                  } else {
                    // Web → Stripe Customer Portal
                    apiFetch("/api/billing/portal", { method: "POST", credentials: "include" })
                      .then((r) => r.ok ? r.json() : null)
                      .then((data) => { if (data?.url) window.location.href = data.url; })
                      .catch(() => {});
                    onClose();
                  }
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 items-center justify-center text-accent-purple text-xs">✦</span>
                  {t("profile.manage_sub", locale)}
                </span>
                <span className="text-xs text-text-body-subtle">
                  {billing.isPremium ? t("profile.premium_plan", locale) : t("profile.free_plan", locale)}
                </span>
              </button>

              {/* Restore purchases — native only */}
              {native && (
                <button
                  type="button"
                  onClick={async () => {
                    // Le bouton existait mais ne restaurait RIEN : il relisait
                    // simplement /api/billing/me, c est-a-dire l etat que le
                    // serveur avait deja. Quelqu un qui change de telephone
                    // appuyait dessus, ne voyait rien revenir, et n avait aucun
                    // recours. Apple exige ce bouton — a juste titre, et il doit
                    // faire ce qu il annonce.
                    if (disponible() && user?.id) {
                      await preparer(user.id);
                      await restaurer();
                    }
                    // Puis on relit le serveur : le webhook RevenueCat a pu
                    // mettre l abonnement a jour entre-temps.
                    await apiFetch("/api/billing/me", { credentials: "include" });
                    window.dispatchEvent(new CustomEvent("unfold:plan-changed", { detail: billing.isPremium ? "premium" : "free" }));
                    onClose();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
                >
                  <span className="flex h-4 w-4 items-center justify-center text-text-body-subtle text-xs">↩</span>
                  {t("profile.restore_purchases", locale)}
                </button>
              )}
            </>
          )}

          {/* Divider */}
          <div className="my-4 h-px bg-brand-3" />

          {/* Auth section */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.account", locale)}
          </p>

          {isAuthenticated ? (
            <>
              <p className="px-3 mb-2 text-xs text-text-body-subtle truncate">
                {user?.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  clearBirthData();
                  onClose();
                  router.push("/app/onboarding");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
              >
                <ArrowLeftToBracket size={16} className="text-text-body-subtle" />
                {t("profile.sign_out", locale)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(() => setAuthOpen(true), 300); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
            >
              <ArrowRightToBracket size={16} className="text-accent-purple" />
              {t("profile.sign_in", locale)}
            </button>
          )}

          {/* Suppression de compte — toujours accessible, comme Apple l exige */}
          <div className="my-4 h-px bg-brand-3" />
          {!suppressionOuverte ? (
            <button
              type="button"
              onClick={() => setSuppressionOuverte(true)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-bg-secondary"
              style={{ color: "var(--accent-pink)" }}
            >
              <TrashBin size={16} />
              {t("profile.delete_account", locale)}
            </button>
          ) : (
            <div className="rounded-xl px-3 py-3" style={{ background: "var(--surface-light)" }}>
              <p className="text-xs leading-relaxed text-text-body-subtle">
                {t("profile.delete_warning", locale)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={suppressionEnCours}
                  onClick={async () => {
                    setSuppressionEnCours(true);
                    try {
                      const naissance = getBirthDataSync();
                      await apiFetch("/api/profile/forget", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...(naissance ? { birthHash: birthHash(naissance) } : {}),
                          deviceId: getDeviceId(),
                        }),
                      });
                    } catch {
                      // Meme si le serveur ne repond pas, on efface ce qui est
                      // sur l appareil : la personne a demande a partir.
                    }
                    try { await signOut(); } catch { /* deja deconnectee */ }
                    clearBirthData();
                    try { localStorage.clear(); } catch { /* stockage refuse */ }
                    onClose();
                    router.replace("/app/onboarding");
                  }}
                  className="flex-1 rounded-full py-2.5 text-xs font-semibold transition-opacity disabled:opacity-50"
                  // Paire d alerte : du blanc sur --accent-pink donnait 3,03 en
                  // theme sombre. Sur un bouton de suppression definitive, le
                  // libelle doit se lire sans effort.
                  style={{ background: "var(--bg-alerte)", color: "var(--text-on-alerte)", minHeight: 44 }}
                >
                  {t("profile.delete_confirm", locale)}
                </button>
                <button
                  type="button"
                  disabled={suppressionEnCours}
                  onClick={() => setSuppressionOuverte(false)}
                  className="flex-1 rounded-full py-2.5 text-xs font-semibold text-text-heading transition-colors hover:bg-bg-secondary"
                  style={{ minHeight: 44 }}
                >
                  {t("profile.delete_cancel", locale)}
                </button>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Language picker bottom sheet */}
      <BottomSheet open={langPickerOpen} onClose={() => setLangPickerOpen(false)} maxHeight="60%">
        <div className="px-6 pb-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.language", locale)}
          </p>
          <div className="space-y-1">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setLangPickerOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
                style={{
                  background: loc === locale ? "color-mix(in srgb, var(--accent-purple) 10%, transparent)" : undefined,
                }}
              >
                <span>{LOCALE_LABELS[loc]}</span>
                {loc === locale && (
                  <span className="text-xs font-bold" style={{ color: "var(--accent-purple)" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Edition des donnees de naissance.
          Montee ICI, hors de la feuille du tiroir : elle doit rester a l ecran
          une fois celui-ci ferme. */}
      {editionOuverte && (
        <EditionNaissance ouvert onFermer={() => setEditionOuverte(false)} />
      )}

      {/* Personalize flow */}
      <PersonalizeFlow
        open={personalizeOpen}
        onClose={() => setPersonalizeOpen(false)}
        onComplete={handlePersonalizeComplete}
      />

      {/* Auth sheet */}
      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
