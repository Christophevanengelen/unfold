"use client";

import dynamic from "next/dynamic";
import { mockTocTocYear } from "@/lib/mock-data";

const MonthlyView = dynamic(
  () => import("@/components/demo/MonthlyView").then((m) => m.MonthlyView),
  { ssr: false }
);

export default function MonthlyPage() {
  return <MonthlyView data={mockTocTocYear} />;
}
