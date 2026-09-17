"use client";

/**
 * /interne/marie-ange — le canal de cadrage avec Marie-Ange.
 *
 * Remplace WhatsApp pour tout ce qui touche au moteur de matching et aux
 * cinq sections du MVP. La page est protegee par le middleware (Basic Auth,
 * meme garde que /admin — voir middleware.ts) : quiconque arrive ici a deja
 * le mot de passe. `/api/liaison/message` revalide le meme mot de passe de
 * son cote, puisque le middleware ne couvre pas /api.
 *
 * Chaque tour est journalise cote serveur (table `liaison_marie_ange`) :
 * Christophe et moi pouvons relire l'echange sans dependre de son telephone.
 */

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LiaisonMarieAngePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, enCours]);

  async function envoyer() {
    const texte = saisie.trim();
    if (!texte || enCours) return;
    setErreur(null);
    setSaisie("");
    const historique = messages;
    const suivant: Message[] = [...messages, { role: "user", content: texte }];
    setMessages(suivant);
    setEnCours(true);
    try {
      const res = await fetch("/api/liaison/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texte, historique }),
      });
      const data = (await res.json()) as { ok: boolean; reponse?: string; raison?: string };
      if (!data.ok || !data.reponse) {
        setErreur(data.raison ?? "erreur_inconnue");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reponse! }]);
    } catch {
      setErreur("reseau");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-heading)",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-body-subtle)" }}>
          Favorable · interne
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Cadrage avec Marie-Ange</div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        {messages.length === 0 ? (
          <p style={{ color: "var(--text-body-subtle)", fontSize: 14, lineHeight: 1.5 }}>
            Écris ici ce que tu veux dire sur le moteur, une clé d&apos;API, une réponse du matching — n&apos;importe
            quoi de technique. Chaque section du MVP (Timeline, Ma vie, Match, Vela, Profil) a une fonction précise ;
            si ton message en mélange plusieurs ou dévie de son objectif, tu seras recadrée avant qu&apos;on aille
            plus loin.
          </p>
        ) : null}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "var(--bg-brand)" : "var(--bg-secondary)",
                color: m.role === "user" ? "var(--text-on-brand)" : "var(--text-heading)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {enCours ? (
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-body-subtle)" }}>…</div>
        ) : null}

        {erreur ? (
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--danger)" }}>
            Ça n&apos;est pas parti ({erreur}). Réessaie.
          </div>
        ) : null}

        <div ref={finRef} />
      </div>

      <div style={{ borderTop: "1px solid var(--border-light)", padding: 16 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
          <textarea
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyer();
              }
            }}
            placeholder="Écris ton message…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              borderRadius: 10,
              border: "1px solid var(--border-light)",
              background: "var(--bg-secondary)",
              color: "var(--text-heading)",
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={envoyer}
            disabled={enCours || !saisie.trim()}
            style={{
              borderRadius: 10,
              border: "none",
              background: "var(--bg-brand)",
              color: "var(--text-on-brand)",
              padding: "0 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: enCours || !saisie.trim() ? 0.5 : 1,
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
