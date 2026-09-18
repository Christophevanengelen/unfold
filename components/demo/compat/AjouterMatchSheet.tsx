"use client";

/**
 * Le CHOIX entre les deux facons d avoir un match.
 *
 * Christophe, le 18/09 : « au total, il y a deux facons. Soit deux apps se
 * connectent, soit une seule app peut encoder elle-meme un match qu elle a
 * envie de faire. » Et, sur le partage par code deja en place : « je
 * n aimerais pas que ce soit caché derriere un sous-menu improbable ».
 *
 * Les deux voies sont donc posees a EGALITE dans cette feuille, jamais l une
 * derriere l autre :
 *   - « Se connecter avec un code » ferme la feuille et ouvre le formulaire
 *     de code deja present sur la page (ConnectionList / VitrineBase) — cette
 *     voie fonctionnait deja et n est pas dupliquee ici.
 *   - « Creer moi-meme ce match » ouvre le parcours de saisie manuelle, qui
 *     n exige ni invitation ni code : voir app/app/compatibility/solo/nouveau.
 */

import { useRouter } from "next/navigation";
import { QrCode, UserAdd } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives/BottomSheet";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

interface AjouterMatchSheetProps {
  open: boolean;
  onClose: () => void;
  /** Ouvre le formulaire de code deja tenu par la page appelante. */
  onCode: () => void;
}

export function AjouterMatchSheet({ open, onClose, onCode }: AjouterMatchSheetProps) {
  const locale = detectLocale();
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="50%">
      <div className="px-5 pb-6 pt-2">
        <p className="mb-4 text-center text-sm font-semibold text-text-heading">
          {perso("compat.ajouter_match", locale)}
        </p>
        <div className="space-y-2">
          <ChoiceRow
            icon={<QrCode width={18} height={18} />}
            title={perso("compat.ajouter_code_titre", locale)}
            subtitle={perso("compat.ajouter_code_sous", locale)}
            onClick={() => {
              onClose();
              onCode();
            }}
          />
          <ChoiceRow
            icon={<UserAdd width={18} height={18} />}
            title={perso("compat.ajouter_manuel_titre", locale)}
            subtitle={perso("compat.ajouter_manuel_sous", locale)}
            onClick={() => {
              onClose();
              // Delai : BottomSheet gere sa propre entree d historique factice
              // et fait un history.back() a sa fermeture (voir BottomSheet.tsx,
              // "RETOUR ARRIERE"). Appele dans la meme frappe que router.push,
              // ce back() arrive en course avec la navigation et l annule en
              // silence — le clic fermait la feuille sans jamais partir. Meme
              // bug trouve dans ProfileDrawer.tsx, corrige la aussi le 18/09.
              setTimeout(() => router.push("/app/compatibility/solo/nouveau"), 300);
            }}
          />
        </div>
      </div>
    </BottomSheet>
  );
}

function ChoiceRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors active:bg-[color:var(--surface-medium)]"
      style={{
        background: "var(--surface-light)",
        border: "1px solid var(--border-tint-light)",
        minHeight: "var(--taille-tactile-min)",
      }}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: "var(--taille-tactile-min)",
          height: "var(--taille-tactile-min)",
          background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
          color: "var(--accent-purple)",
        }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-text-heading">{title}</span>
        <span className="block text-[11px] leading-snug text-text-body-subtle">{subtitle}</span>
      </span>
    </button>
  );
}
