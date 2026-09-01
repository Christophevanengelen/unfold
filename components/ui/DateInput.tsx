"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import {
  EU_DATE_PLACEHOLDER,
  formatEuropeanDateDraft,
  formatEuropeanDateInput,
  isIsoDateWithinRange,
  parseEuropeanDateInput,
} from "@/lib/european-date";

type DateInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  /**
   * Previent le parent qu une saisie a ete refusee, pour qu il puisse le DIRE.
   *
   * Le composant ne rend qu un <input> et six ecrans l utilisent avec leur
   * propre mise en page : y glisser un message le placerait de force chez tous.
   * On remonte donc l etat, et chaque ecran ecrit sa phrase ou il faut.
   */
  onInvalidChange?: (invalide: boolean) => void;
};

export function DateInput({
  value,
  onChange,
  min,
  max,
  onInvalidChange,
  disabled,
  required,
  className,
  style,
  placeholder = EU_DATE_PLACEHOLDER,
  onBlur,
  onFocus,
  ...rest
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => (value ? formatEuropeanDateInput(value) : ""));
  const [focused, setFocused] = useState(false);
  // Une saisie refusee reste AFFICHEE. Sinon on ne voit pas ce qu on doit
  // corriger : le champ reprenait l ancienne valeur, ou se vidait.
  const [invalide, setInvalide] = useState(false);
  const displayValue =
    focused || invalide ? draft : value ? formatEuropeanDateInput(value) : "";

  const marquer = (etat: boolean) => {
    setInvalide(etat);
    onInvalidChange?.(etat);
  };

  const handleDraftChange = (nextValue: string, selectionStart: number | null) => {
    const nextDraft = formatEuropeanDateDraft(nextValue);
    const digitsBeforeCursor = nextValue
      .slice(0, selectionStart ?? nextValue.length)
      .replace(/\D/g, "")
      .length;

    setDraft(nextDraft);
    // Des qu on retape, l erreur n a plus lieu d etre affichee : elle repartira
    // au prochain blur si la saisie est toujours refusee.
    if (invalide) marquer(false);

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      let caret = 0;
      let digitsSeen = 0;
      while (caret < nextDraft.length && digitsSeen < digitsBeforeCursor) {
        if (/\d/.test(nextDraft[caret] ?? "")) {
          digitsSeen += 1;
        }
        caret += 1;
      }

      input.setSelectionRange(caret, caret);
    });
  };

  /**
   * Ce qui se passe quand le champ perd le focus.
   *
   * Avant : une saisie illisible — « 32/13/1990 » — ou hors bornes etait
   * remplacee par l ancienne valeur, ou effacee, SANS UN MOT. On quittait le
   * champ en croyant avoir donne sa date de naissance ; le bouton restait
   * eteint plus bas, et rien ne reliait les deux.
   *
   * Maintenant : la saisie reste a l ecran, le champ se declare invalide, et le
   * parent peut l annoncer. On efface aussi la valeur retenue plus haut : garder
   * l ancienne date pendant qu une autre s affiche ferait avancer le formulaire
   * avec une date que personne n a confirmee.
   */
  const commitDraft = () => {
    const parsed = parseEuropeanDateInput(draft);
    if (parsed && isIsoDateWithinRange(parsed, min, max)) {
      onChange(parsed);
      setDraft(formatEuropeanDateInput(parsed));
      marquer(false);
      return;
    }

    if (!draft.trim()) {
      onChange("");
      setDraft("");
      marquer(false);
      return;
    }

    if (value) {
      onChange("");
    }
    marquer(true);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      disabled={disabled}
      required={required}
      aria-invalid={invalide || undefined}
      placeholder={placeholder}
      className={className}
      style={style}
      onChange={(event) => handleDraftChange(event.target.value, event.target.selectionStart)}
      onFocus={(event) => {
        // On ne recharge la valeur retenue que si la saisie n a pas ete
        // refusee : sinon revenir dans le champ effacerait ce qu on vient
        // d ecrire, au moment precis ou on venait le corriger.
        if (!invalide) setDraft(value ? formatEuropeanDateInput(value) : "");
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        commitDraft();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}
