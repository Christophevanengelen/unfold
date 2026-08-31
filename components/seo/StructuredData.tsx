const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://favorable.day";

function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Favorable",
    description:
      "Personal timing app. Free daily momentum score across Love, Health, and Work. Compare rhythms with anyone. Premium unlocks future peaks and monthly momentum maps.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android",
    url: BASE_URL,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        name: "Gratuit",
        description:
          "Daily momentum score, Love/Health/Work breakdown, yesterday review, basic compatibility",
      },
      {
        "@type": "Offer",
        price: "5.99",
        priceCurrency: "EUR",
        name: "Premium mensuel",
        description:
          "Future momentum windows, monthly momentum map, peak alerts, advanced compatibility",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "5.99",
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        price: "39.99",
        priceCurrency: "EUR",
        name: "Premium annuel",
        description:
          "Toutes les fonctions Premium, facturees a l annee. 44 % d economie.",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "39.99",
          priceCurrency: "EUR",
          billingDuration: "P1Y",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Favorable",
    url: BASE_URL,
    logo: `${BASE_URL}/logo/logo-dark.svg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function StructuredData() {
  return (
    <>
      <SoftwareApplicationSchema />
      <OrganizationSchema />
    </>
  );
}
