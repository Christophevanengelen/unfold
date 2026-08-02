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
};

export function DateInput({
  value,
  onChange,
  min,
  max,
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
  const displayValue = focused ? draft : value ? formatEuropeanDateInput(value) : "";

  const handleDraftChange = (nextValue: string, selectionStart: number | null) => {
    const nextDraft = formatEuropeanDateDraft(nextValue);
    const digitsBeforeCursor = nextValue
      .slice(0, selectionStart ?? nextValue.length)
      .replace(/\D/g, "")
      .length;

    setDraft(nextDraft);

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

  const commitDraft = () => {
    const parsed = parseEuropeanDateInput(draft);
    if (parsed && isIsoDateWithinRange(parsed, min, max)) {
      onChange(parsed);
      setDraft(formatEuropeanDateInput(parsed));
      return;
    }

    if (!draft.trim()) {
      onChange("");
      setDraft("");
      return;
    }

    setDraft(value ? formatEuropeanDateInput(value) : "");
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
      placeholder={placeholder}
      className={className}
      style={style}
      onChange={(event) => handleDraftChange(event.target.value, event.target.selectionStart)}
      onFocus={(event) => {
        setDraft(value ? formatEuropeanDateInput(value) : "");
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
