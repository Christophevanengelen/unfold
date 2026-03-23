"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/demo/timeline");
  }, [router]);
  return null;
}
