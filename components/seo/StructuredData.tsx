const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://unfold.app";

function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Unfold",
    description:
      "Personal timing app. Free daily momentum score across Love, Health, and Work. Compare rhythms with anyone. Premium unlocks future peaks and monthly momentum maps.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android",
    url: BASE_URL,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
        description:
          "Daily momentum score, Love/Health/Work breakdown, yesterday review, basic compatibility",
      },
      {
        "@type": "Offer",
        price: "4.00",
        priceCurrency: "USD",
        name: "Premium Monthly",
        description:
          "Future momentum windows, monthly momentum map, peak alerts, advanced compatibility",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "4.00",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        name: "Premium Yearly",
        description:
          "All Premium features billed annually. Save 39%.",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "29.00",
          priceCurrency: "USD",
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
    name: "Unfold",
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
