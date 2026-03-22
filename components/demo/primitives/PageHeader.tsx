/**
 * PageHeader — back arrow + title + optional subtitle.
 * Used on sub-pages (connection detail, invite, etc.)
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  backHref: string;
  title: string;
  subtitle?: string;
  /** Optional slot between back arrow and title (e.g. avatar) */
  leadingSlot?: React.ReactNode;
}

export function PageHeader({ backHref, title, subtitle, leadingSlot }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Link href={backHref} className="text-text-body-subtle">
        <ArrowLeft size={18} />
      </Link>
      {leadingSlot && (
        <div className="shrink-0">{leadingSlot}</div>
      )}
      <div>
        <p className="text-sm font-semibold text-text-heading">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-text-body-subtle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
