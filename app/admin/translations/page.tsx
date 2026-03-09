import { TranslationTable } from "@/components/admin/TranslationTable";

const mockRows = [
  {
    key: "hero.title",
    description: "Main hero headline",
    translations: {
      en: { value: "Know when life moves in your favor", status: "READY" as const },
      fr: { value: "Sachez quand la vie joue en votre faveur", status: "READY" as const },
      es: { value: "Sabe cuándo la vida se mueve a tu favor", status: "DRAFT" as const },
    },
  },
  {
    key: "hero.subtitle",
    description: "Hero subheadline",
    translations: {
      en: { value: "Your personal momentum engine.", status: "READY" as const },
      fr: { value: "Votre moteur de momentum personnel.", status: "READY" as const },
      es: { value: "", status: "NOT_STARTED" as const },
    },
  },
  {
    key: "pricing.title",
    description: "Pricing section title",
    translations: {
      en: { value: "Start free. Unlock more.", status: "READY" as const },
      fr: { value: "Commencez gratuitement. Débloquez plus.", status: "DRAFT" as const },
      es: { value: "", status: "NOT_STARTED" as const },
    },
  },
];

export default function TranslationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-heading">Translations</h1>
          <p className="mt-2 text-text-body-subtle">
            Manage all content keys and translations across languages.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <TranslationTable rows={mockRows} languages={["en", "fr", "es"]} />
      </div>
    </div>
  );
}
