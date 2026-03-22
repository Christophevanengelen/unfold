import { supabase } from "@/lib/db";
import { TranslationTable } from "@/components/admin/TranslationTable";

interface TranslationRow {
  key: string;
  description?: string;
  translations: Record<string, { value: string; status: "READY" | "DRAFT" | "NOT_STARTED" }>;
}

async function fetchTranslations(): Promise<{ rows: TranslationRow[]; languages: string[] }> {
  if (!supabase) return { rows: [], languages: ["en", "fr", "es"] };

  const { data, error } = await supabase
    .from("Translation")
    .select(`
      value,
      status,
      languageCode,
      contentKey:ContentKey!inner (
        key,
        namespace:ContentNamespace!inner (
          name
        )
      )
    `)
    .neq("status", "NOT_STARTED");

  if (error || !data) return { rows: [], languages: ["en", "fr", "es"] };

  // Group by key
  const byKey = new Map<string, TranslationRow>();
  const languages = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const t of data as any[]) {
    const contentKey = t.contentKey;
    const key = contentKey?.key as string;
    if (!key) continue;
    const namespaceName = contentKey?.namespace?.name ?? "";
    languages.add(t.languageCode);

    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        description: namespaceName,
        translations: {},
      });
    }

    byKey.get(key)!.translations[t.languageCode] = {
      value: t.value ?? "",
      status: (t.status ?? "NOT_STARTED") as "READY" | "DRAFT" | "NOT_STARTED",
    };
  }

  // Ensure all languages show for each key
  const langArr = Array.from(languages).sort();
  for (const row of byKey.values()) {
    for (const lang of langArr) {
      if (!row.translations[lang]) {
        row.translations[lang] = { value: "", status: "NOT_STARTED" };
      }
    }
  }

  return {
    rows: Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key)),
    languages: langArr.length > 0 ? langArr : ["en", "fr", "es"],
  };
}

export default async function TranslationsPage() {
  const { rows, languages } = await fetchTranslations();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-heading">Translations</h1>
          <p className="mt-2 text-text-body-subtle">
            {rows.length} translation keys across {languages.length} languages.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <TranslationTable rows={rows} languages={languages} />
      </div>
    </div>
  );
}
