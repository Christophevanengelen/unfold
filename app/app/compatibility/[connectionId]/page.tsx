import { ConnectionDetail } from "@/components/demo/compat/ConnectionDetail";

/**
 * Version web : l identifiant est dans l adresse.
 *
 * Composant serveur volontairement : generateStaticParams ne peut pas vivre
 * dans un fichier "use client". La liste vide suffit au build natif, qui sert
 * le meme ecran depuis /app/compatibility/view/?c=<id>.
 */
export function generateStaticParams() {
  return [];
}

export default async function ConnectionDetailRoutePage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = await params;
  return <ConnectionDetail connectionId={connectionId} />;
}
