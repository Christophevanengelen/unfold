import { Badge } from "@/components/ui/Badge";

interface TranslationRow {
  key: string;
  description?: string;
  translations: Record<string, { value: string; status: "READY" | "DRAFT" | "NOT_STARTED" }>;
}

interface TranslationTableProps {
  rows: TranslationRow[];
  languages: string[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case "READY":
      return <Badge variant="ready">Ready</Badge>;
    case "DRAFT":
      return <Badge variant="draft">Draft</Badge>;
    default:
      return <Badge variant="not-started">Not started</Badge>;
  }
};

export function TranslationTable({ rows, languages }: TranslationTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-light">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-light bg-bg-secondary">
          <tr>
            <th className="px-4 py-3 font-medium text-text-heading">Key</th>
            {languages.map((lang) => (
              <th key={lang} className="px-4 py-3 font-medium text-text-heading uppercase">
                {lang}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-bg-secondary/50">
              <td className="px-4 py-3">
                <p className="font-mono text-xs text-text-body">{row.key}</p>
                {row.description && (
                  <p className="mt-0.5 text-xs text-text-body-subtle">{row.description}</p>
                )}
              </td>
              {languages.map((lang) => {
                const t = row.translations[lang];
                return (
                  <td key={lang} className="px-4 py-3">
                    {t ? (
                      <div>
                        <p className="mb-1 truncate max-w-[200px] text-text-body">{t.value}</p>
                        {statusBadge(t.status)}
                      </div>
                    ) : (
                      statusBadge("NOT_STARTED")
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
