"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMomentum } from "@/lib/momentum-store";
import { fetchYearData } from "@/lib/momentum-api";
import type { TocTocYearData } from "@/types/api";

const MonthlyView = dynamic(
  () => import("@/components/demo/MonthlyView").then((m) => m.MonthlyView),
  { ssr: false }
);

export default function MonthlyPage() {
  const { birthData, state } = useMomentum();
  const [yearData, setYearData] = useState<TocTocYearData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!birthData) { setLoading(false); return; }

    fetchYearData(birthData).then((res) => {
      if (res?.data?.success) {
        setYearData(res.data as unknown as TocTocYearData);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [birthData]);

  if (state === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }} />
      </div>
    );
  }

  if (!yearData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-body-subtle">
          Pas de données disponibles pour la vue mensuelle.
        </p>
      </div>
    );
  }

  return <MonthlyView data={yearData} />;
}
