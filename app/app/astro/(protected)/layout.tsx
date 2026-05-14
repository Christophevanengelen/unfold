import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AstroMainShell from "../AstroMainShell";
import AstroTabNav from "../AstroTabNav";

export default async function AstroProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("astrolearn_session")?.value;

  if (!session) {
    redirect("/app/astro");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F0C22" }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,107,191,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Sticky tab nav (header + tabs) */}
      <AstroTabNav username={session} />

      <AstroMainShell>{children}</AstroMainShell>
    </div>
  );
}
