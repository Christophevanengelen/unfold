"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConnectionDetail } from "@/components/demo/compat/ConnectionDetail";

/**
 * Meme ecran que /app/compatibility/<id>, avec l identifiant en parametre.
 * Cette adresse existe parce que l export statique ne peut pas produire un
 * fichier par identifiant. Rien ne change a l affichage.
 */
function Contenu() {
  const sp = useSearchParams();
  return <ConnectionDetail connectionId={sp.get("c") ?? ""} />;
}

export default function ConnectionDetailViewPage() {
  return (
    <Suspense fallback={null}>
      <Contenu />
    </Suspense>
  );
}
