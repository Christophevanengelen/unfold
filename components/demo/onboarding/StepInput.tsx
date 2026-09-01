"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CTA_IMMEDIAT, CTA_DEPART, CTA_ARRIVEE } from "@/lib/onboarding-motion";
import { ChevronLeft } from "flowbite-react-icons/outline";
import { DateInput } from "@/components/ui/DateInput";
import { searchCities, type GeoResult } from "@/lib/geocode";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";
import { villeConnue } from "@/lib/birth-data";
import { perso } from "@/lib/perso-i18n";

export interface OnboardingFormData {
  nickname: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  /** Resolved coordinates from geocoding — stored when user picks a city */
  resolvedCoords?: { lat: number; lng: number; timezone: string };
}

interface StepInputProps {
  formData: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Les quatre champs, traduits.
 *
 * Ils etaient ecrits en dur en anglais — « Time of birth », « City, Country » —
 * pour les dix langues du produit. Et leurs aides disaient « Optional » alors
 * que la validation exige les quatre : le bouton se bloquait sans que rien
 * n explique pourquoi.
 *
 * Marie-Ange, qui a ecrit le moteur, l a dit : sans l heure et le lieu exacts,
 * le calcul ne tourne pas correctement. L aide le dit maintenant aussi.
 */
const champs = (locale: Locale) => [
  {
    key: "nickname" as const,
    label: t("onboarding.p6_nom", locale),
    type: "text",
    placeholder: t("onboarding.p6_nom_ex", locale),
  },
  {
    key: "dob" as const,
    label: t("onboarding.p6_date", locale),
    type: "date" as const,
    placeholder: "",
  },
  {
    key: "timeOfBirth" as const,
    label: t("onboarding.p6_heure", locale),
    type: "time",
    placeholder: "HH:MM",
    helper: t("onboarding.p6_heure_aide", locale),
  },
  {
    key: "placeOfBirth" as const,
    label: t("onboarding.p6_lieu", locale),
    type: "text",
    placeholder: t("onboarding.p6_lieu_ex", locale),
    helper: t("onboarding.p6_lieu_aide", locale),
  },
];

/**
 * Screen 6 — Configure Your Signal.
 * Place of birth uses live Nominatim geocoding via Open-Meteo.
 */
export function StepInput({
  formData,
  onChange,
  onNext,
  onBack,
}: StepInputProps) {
  const locale = detectLocale();
  const fields = champs(locale);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // « repos », « cherche », « vide » et « echec » sont quatre choses
  // differentes. Un seul booleen les confondait, et l ecran affichait le meme
  // rien pour une ville inexistante et pour une panne de reseau.
  const [etatLieu, setEtatLieu] = useState<"repos" | "cherche" | "vide" | "echec">("repos");
  const isSearching = etatLieu === "cherche";
  // Index survole au clavier. -1 = aucun.
  const [survol, setSurvol] = useState(-1);
  // La liste s ouvre vers le HAUT quand le clavier ne laisse pas la place.
  const [versLeHaut, setVersLeHaut] = useState(false);
  const avortRef = useRef<AbortController | null>(null);
  const placeRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Y a-t-il la place d ouvrir la liste sous le champ ?
   *
   * Le lieu est le QUATRIEME et dernier champ, donc deja bas dans l ecran. Le
   * clavier iOS occupe environ 290 points, et la vue web ne se redimensionne
   * pas (capacitor.config : resize « none »), donc la liste s ouvrait
   * integralement DERRIERE le clavier. On tapait, quelque chose se produisait
   * hors de vue, et il fallait fermer le clavier pour le decouvrir.
   *
   * visualViewport donne la hauteur reellement visible, clavier deduit.
   */
  const choisirSens = useCallback(() => {
    const el = placeRef.current;
    if (!el) return;
    const bas = el.getBoundingClientRect().bottom;
    const visible = window.visualViewport?.height ?? window.innerHeight;
    // 220 px : quatre lignes de 44 plus la bordure. En dessous, on ouvre haut.
    setVersLeHaut(visible - bas < 220);
  }, []);

  // Les quatre champs sont requis, et ce n est pas un exces de zele.
  //
  // Marie-Ange, qui a ecrit le moteur, l a dit noir sur blanc : sans l heure et
  // le lieu exacts, le calcul ne tourne pas correctement. L Ascendant et le Lot
  // de l Esprit — sur lesquels repose tout le zodiacal releasing — se deplacent
  // de plusieurs signes selon l heure de naissance. Une timeline calculee sur
  // une heure approximative n est pas une timeline approximative : c est la
  // timeline de quelqu un d autre.
  //
  // Le code substituait auparavant « 12:00 » et « Brussels » en silence. La
  // personne recevait alors un resultat qui n etait pas le sien, sans que rien
  // ne l en avertisse.
  // Le lieu doit etre SITUE, pas seulement saisi.
  //
  // Exiger une chaine non vide ne suffisait pas : « Liege » tape sans choisir
  // de suggestion passait la validation avec des coordonnees absentes, et
  // l ecran suivant repliait alors sur Bruxelles en silence. Le commentaire
  // ci-dessus disait vrai pour la date et l heure, faux pour le lieu — la
  // substitution vivait une couche plus bas.
  //
  // On accepte deux preuves : des coordonnees rendues par le geocodage, ou une
  // ville que la table locale sait situer sans reseau. Sans l une des deux, on
  // ne laisse pas avancer.
  const lieuSitue =
    formData.resolvedCoords !== undefined || villeConnue(formData.placeOfBirth);

  const isValid =
    formData.nickname.trim() !== "" &&
    formData.dob !== "" &&
    formData.timeOfBirth !== "" &&
    formData.placeOfBirth.trim() !== "" &&
    lieuSitue;

  const handleChange = (key: keyof OnboardingFormData, value: string) => {
    if (key === "placeOfBirth") {
      // Clear stored coords when user edits the city field manually
      onChange({ ...formData, [key]: value, resolvedCoords: undefined });
      // Debounced geocode search
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // On annule la requete precedente, pas seulement son minuteur : deux
      // requetes en vol et la plus lente ecrasait la plus recente.
      avortRef.current?.abort();
      setSurvol(-1);
      if (value.trim().length >= 2) {
        setEtatLieu("cherche");
        debounceRef.current = setTimeout(async () => {
          const ctrl = new AbortController();
          avortRef.current = ctrl;
          const r = await searchCities(value, { signal: ctrl.signal, langue: locale });
          if (ctrl.signal.aborted) return;
          if (r.etat === "ok") {
            setSuggestions(r.villes);
            setShowSuggestions(true);
            setEtatLieu("repos");
            choisirSens();
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setEtatLieu(r.etat);
          }
        }, 300);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setEtatLieu("repos");
      }
    } else {
      onChange({ ...formData, [key]: value });
    }
  };

  const selectCity = useCallback((city: GeoResult) => {
    onChange({
      ...formData,
      placeOfBirth: city.displayName,
      resolvedCoords: {
        lat: city.latitude,
        lng: city.longitude,
        timezone: city.timezone,
      },
    });
    setSuggestions([]);
    setShowSuggestions(false);
  }, [formData, onChange]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (placeRef.current && !placeRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div className="flex h-full flex-col">

      {/* Back */}
      <motion.button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <ChevronLeft size={14} />
        {t("onboarding.back", locale)}
      </motion.button>

      {/* Headline */}
      <motion.h1
        className="mt-5 font-display text-2xl font-bold"
        style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {t("onboarding.p5_headline", locale)}
      </motion.h1>
      <motion.p
        className="mt-1.5 text-sm"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {t("onboarding.p5_sub", locale)}
      </motion.p>

      {/* Form fields */}
      <div className="mt-5 space-y-3.5">
        {fields.map((field, i) => {
          const isPlaceField = field.key === "placeOfBirth";
          return (
            <motion.div
              key={field.key}
              ref={isPlaceField ? placeRef : undefined}
              className="relative rounded-2xl border border-border-light bg-bg-secondary px-4 py-3.5 transition-colors duration-200 focus-within:border-accent-purple"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <label>
                <span
                  className="font-medium uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--accent-purple)",
                    opacity: 0.5,
                  }}
                >
                  {field.label}
                  {/* Le lieu est-il SITUE ? Rien ne le disait : apres selection,
                      le champ contenait un texte identique a ce qu on aurait pu
                      taper a la main. Or ce qui distingue les deux, c est
                      d avoir des coordonnees — et donc un theme juste. */}
                  {isPlaceField && formData.resolvedCoords && (
                    <span className="ml-2 normal-case" style={{ color: "var(--accent-green)" }}>
                      ✓ {perso("lieu.confirme", locale)}
                    </span>
                  )}
                  {isPlaceField && isSearching && (
                    <span className="ml-2 normal-case" style={{ opacity: 0.4 }}>
                      {perso("lieu.recherche", locale)}
                    </span>
                  )}
                </span>
                {field.type === "date" ? (
                  <DateInput
                    value={formData.dob}
                    onChange={(value) => handleChange("dob", value)}
                    className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-brand-5"
                    style={{ color: "var(--accent-purple)" }}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onFocus={() => {
                      if (isPlaceField) {
                        choisirSens();
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }
                    }}
                    onKeyDown={
                      isPlaceField
                        ? (e) => {
                            // Sans ceci, aucune suggestion n etait atteignable
                            // au clavier — ni fleches, ni Entree, ni Echap.
                            if (!showSuggestions || suggestions.length === 0) return;
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setSurvol((v) => (v + 1) % suggestions.length);
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setSurvol((v) => (v <= 0 ? suggestions.length - 1 : v - 1));
                            } else if (e.key === "Enter" && survol >= 0) {
                              e.preventDefault();
                              selectCity(suggestions[survol]);
                            } else if (e.key === "Escape") {
                              setShowSuggestions(false);
                              setSurvol(-1);
                            }
                          }
                        : undefined
                    }
                    placeholder={field.placeholder}
                    autoComplete={isPlaceField ? "off" : undefined}
                    // La correction automatique d iOS mutile les noms de villes
                    // etrangeres.
                    autoCorrect={isPlaceField ? "off" : undefined}
                    spellCheck={isPlaceField ? false : undefined}
                    role={isPlaceField ? "combobox" : undefined}
                    aria-expanded={isPlaceField ? showSuggestions : undefined}
                    aria-controls={isPlaceField ? "villes-suggerees" : undefined}
                    aria-autocomplete={isPlaceField ? "list" : undefined}
                    aria-activedescendant={
                      isPlaceField && survol >= 0 ? `ville-${suggestions[survol]?.id}` : undefined
                    }
                    className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-brand-5"
                    style={{ color: "var(--accent-purple)" }}
                  />
                )}
              </label>
              {"helper" in field && field.helper && (
                <p
                  className="mt-1"
                  style={{ fontSize: 10, color: "var(--accent-purple)", opacity: 0.5 }}
                >
                  {field.helper}
                </p>
              )}

              {/* Suggestions de villes.

                  Trois changements qui portent tout l usage au doigt :

                  - Le SENS d ouverture. Le lieu est le dernier des quatre
                    champs, donc bas dans l ecran ; la vue web ne se
                    redimensionne pas a l ouverture du clavier iOS. La liste
                    s ouvrait donc integralement derriere le clavier.
                  - La HAUTEUR de chaque ligne : 44 points, le minimum
                    d Apple. Elles faisaient 40 px, collees, sans separateur —
                    quatre pixels d ecart et on choisissait la ville voisine.
                  - Ce qui s affiche quand il n y a RIEN. Une ville inexistante
                    et une panne de reseau produisaient le meme vide. */}
              {isPlaceField && (
                <AnimatePresence>
                  {(showSuggestions && suggestions.length > 0) ||
                  etatLieu === "cherche" ||
                  etatLieu === "vide" ||
                  etatLieu === "echec" ? (
                    <motion.div
                      id="villes-suggerees"
                      role="listbox"
                      className="absolute left-0 right-0 z-50 rounded-xl border overflow-y-auto"
                      style={{
                        ...(versLeHaut
                          ? { bottom: "100%", marginBottom: 4 }
                          : { top: "100%", marginTop: 4 }),
                        maxHeight: 220,
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-light)",
                      }}
                      initial={{ opacity: 0, y: versLeHaut ? 4 : -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: versLeHaut ? 4 : -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {etatLieu === "cherche" && (
                        <p className="px-4 py-3 text-sm" style={{ color: "var(--text-body-subtle)" }}>
                          {perso("lieu.recherche", locale)}
                        </p>
                      )}
                      {etatLieu === "vide" && (
                        <p className="px-4 py-3 text-sm" style={{ color: "var(--text-body-subtle)" }}>
                          {perso("lieu.aucune", locale)}
                        </p>
                      )}
                      {etatLieu === "echec" && (
                        <p className="px-4 py-3 text-sm" style={{ color: "var(--text-body-subtle)" }}>
                          {perso("lieu.echec", locale)}
                        </p>
                      )}
                      {etatLieu === "repos" &&
                        suggestions.map((city, index) => (
                          <button
                            key={city.id}
                            id={`ville-${city.id}`}
                            role="option"
                            aria-selected={survol === index}
                            type="button"
                            onMouseEnter={() => setSurvol(index)}
                            onClick={() => selectCity(city)}
                            className="flex min-h-11 w-full flex-col justify-center border-b px-4 py-2 text-left transition-colors last:border-b-0"
                            style={{
                              borderColor: "var(--border-muted)",
                              background:
                                survol === index ? "var(--bg-tertiary)" : "transparent",
                            }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--text-heading)" }}
                            >
                              {city.name}
                            </span>
                            {city.admin1 || city.country ? (
                              // Region et pays a la meme taille que le nom :
                              // c est l information qui distingue Paris en
                              // France de Paris au Texas, et elle etait la
                              // moins lisible de la ligne.
                              <span className="text-xs" style={{ color: "var(--text-body-subtle)" }}>
                                {[city.admin1, city.country].filter(Boolean).join(", ")}
                              </span>
                            ) : null}
                          </button>
                        ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Reassurance */}
      <motion.p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        Your details are only used to prepare your personal rhythm.
      </motion.p>

      {/* CTA */}
      <motion.div
        className="mt-auto pt-6"
        initial={CTA_DEPART}
        animate={CTA_ARRIVEE}
        transition={CTA_IMMEDIAT}
      >
        <button
          type="button"
          // Le bouton etait seulement STYLE en desactive : il restait tapable
          // et focalisable, et un tap ne produisait rien ni aucune explication.
          disabled={!isValid}
          aria-disabled={!isValid}
          onClick={() => isValid && onNext()}
          className={`flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all ${
            isValid
              ? "bg-bg-brand text-text-on-brand shadow-lg active:scale-95"
              : "cursor-not-allowed bg-brand-4 text-text-disabled"
          }`}
        >
          {t("onboarding.p5_cta", locale)}
        </button>
      </motion.div>
    </motion.div>
  );
}
