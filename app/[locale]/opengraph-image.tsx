import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Unfold — Personal timing app showing daily momentum scores across Love, Health, and Work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const taglines: Record<string, string> = {
    en: "Know when life moves in your favor",
    fr: "Sachez quand la vie joue en votre faveur",
    es: "Descubre cuándo la vida se mueve a tu favor",
  };

  const subtitles: Record<string, string> = {
    en: "Free daily momentum across Love, Health & Work",
    fr: "Momentum quotidien gratuit en Amour, Santé & Travail",
    es: "Impulso diario gratuito en Amor, Salud & Trabajo",
  };

  const tagline = taglines[locale] ?? taglines.en;
  const subtitle = subtitles[locale] ?? subtitles.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B1535 0%, #150F2E 40%, #221842 100%)",
          position: "relative",
        }}
      >
        {/* Subtle gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124, 107, 191, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(91, 127, 238, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px 80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Category badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
              padding: "8px 20px",
              borderRadius: "100px",
              background: "rgba(149, 133, 204, 0.15)",
              border: "1px solid rgba(149, 133, 204, 0.2)",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#9585CC",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Personal Timing App
            </span>
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: "20px",
            }}
          >
            unfold
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.4,
              maxWidth: "700px",
              marginBottom: "16px",
            }}
          >
            {tagline}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 400,
              color: "rgba(149, 133, 204, 0.8)",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>

          {/* Three domain indicators */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "40px",
            }}
          >
            {(locale === "fr"
              ? [
                  { label: "Amour", color: "#E8617A" },
                  { label: "Santé", color: "#3CB179" },
                  { label: "Travail", color: "#5B7FEE" },
                ]
              : locale === "es"
                ? [
                    { label: "Amor", color: "#E8617A" },
                    { label: "Salud", color: "#3CB179" },
                    { label: "Trabajo", color: "#5B7FEE" },
                  ]
                : [
                    { label: "Love", color: "#E8617A" },
                    { label: "Health", color: "#3CB179" },
                    { label: "Work", color: "#5B7FEE" },
                  ]
            ).map((d) => (
              <div
                key={d.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: d.color,
                  }}
                />
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
