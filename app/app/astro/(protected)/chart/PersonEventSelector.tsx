"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarMonth, ChevronDown } from "flowbite-react-icons/outline";
import {
  comparePersonEventsNewestFirst,
  formatPersonEventDate,
  formatPersonEventTitle,
  getPersonEventCategoryLabel,
  getPersonEventCategoryStyles,
  type PersonEvent,
} from "@/lib/person-events";

type PersonEventSelectorProps = {
  events: PersonEvent[];
  selectedEventId: string | null;
  onSelect: (event: PersonEvent | null) => void;
  disabled?: boolean;
};

export default function PersonEventSelector({
  events,
  selectedEventId,
  onSelect,
  disabled = false,
}: PersonEventSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const sortedEvents = useMemo(
    () => [...events].sort(comparePersonEventsNewestFirst),
    [events]
  );

  const selectedEvent = useMemo(
    () =>
      selectedEventId
        ? events.find((event) => String(event.id_event) === selectedEventId) ?? null
        : null,
    [events, selectedEventId]
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerLabel = selectedEvent
    ? formatPersonEventTitle(selectedEvent)
    : "Life events";
  const triggerMeta = selectedEvent
    ? formatPersonEventDate(selectedEvent)
    : `${events.length} saved`;

  return (
    <div ref={rootRef} className="relative w-full md:w-auto md:max-w-[18rem]">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "rgba(19,15,39,0.88)",
          borderColor: selectedEvent ? "rgba(149,133,204,0.55)" : "rgba(46,38,84,0.85)",
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(149,133,204,0.16)", color: "#C8B8F0" }}
        >
          <CalendarMonth className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-white">{triggerLabel}</span>
          <span className="mt-0.5 block truncate text-[11px] text-[#8C7FAE]">{triggerMeta}</span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {!selectedEvent ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(149,133,204,0.18)", color: "#D8CFF0" }}
            >
              {events.length}
            </span>
          ) : null}
          <ChevronDown
            className={`h-4 w-4 text-[#8C7FAE] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Life events"
          className="absolute right-0 z-20 mt-2 w-full min-w-[18rem] overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            background: "#130F27",
            borderColor: "rgba(46,38,84,0.9)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
          }}
        >
          <div className="border-b border-[#2E2654]/80 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7FAE]">
              Life events
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {sortedEvents.map((event) => {
              const isSelected = String(event.id_event) === selectedEventId;
              const categoryStyles = getPersonEventCategoryStyles(event.category);

              return (
                <button
                  key={String(event.id_event)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(event);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                  style={
                    isSelected
                      ? { background: "rgba(149,133,204,0.18)" }
                      : { background: "transparent" }
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">
                        {formatPersonEventTitle(event)}
                      </span>
                      <span
                        className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={categoryStyles}
                      >
                        {getPersonEventCategoryLabel(event.category)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-[#9585CC]">
                      {formatPersonEventDate(event)}
                    </p>
                    {event.detail ? (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8C7FAE]">
                        {event.detail}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#2E2654]/80 p-2">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#C8B8F0] transition-colors hover:bg-[#9585CC]/12"
            >
              Live transits
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
