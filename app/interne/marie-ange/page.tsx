"use client";

/**
 * /interne/marie-ange — le canal de cadrage avec Marie-Ange.
 *
 * Remplace WhatsApp pour tout ce qui touche au moteur de matching et aux
 * cinq sections du MVP. La page est protegee par le middleware (Basic Auth,
 * meme garde que /admin — voir middleware.ts) : quiconque arrive ici a deja
 * le mot de passe.
 *
 * LE CHOIX DE SECTION EST OBLIGATOIRE, AVANT LE PREMIER MOT
 *
 * Demande de Christophe le 18/09/2026 : une bottom nav IDENTIQUE a celle de
 * l app (memes icones, flowbite-react-icons/outline — voir BottomNav.tsx),
 * pas un choix generique. Au clic : le VRAI ecran (capture reelle,
 * public/interne/*.png, prise sur le couple de test Christophe/Patricia),
 * sa proposition de valeur, et un mot sur ce qui marche ou pas en ce
 * moment. Le choix part ensuite avec chaque message envoye a l API
 * (`section`), qui n a donc plus a le deviner.
 *
 * Chaque tour est journalise cote serveur (table `liaison_marie_ange`) :
 * Christophe et moi pouvons relire l'echange sans dependre de son telephone.
 */

import { useEffect, useRef, useState } from "react";
import { Heart, Clock, User, MessageDots, ChartMixed } from "flowbite-react-icons/outline";

interface Message {
  role: "user" | "assistant" | "systeme";
  content: string;
}

/**
 * Memes textes que SECTIONS dans app/api/liaison/message/route.ts et que
 * CADRAGE-MARIE-ANGE.md. Garder les trois synchronises.
 */
const SECTIONS: {
  id: string;
  label: string;
  Icone: typeof Clock;
  capture: string;
  valeur: string;
  etat: string;
}[] = [
  {
    id: "timeline",
    label: "Timeline",
    Icone: Clock,
    capture: "/interne/timeline.png",
    valeur: "Deep digging — l'exploration en détail de tout ce qui se passe dans une vie, catégorie par catégorie. Pas un résumé.",
    etat: "Stable, pas touché récemment.",
  },
  {
    id: "ma_vie",
    label: "Ma vie",
    Icone: ChartMixed,
    capture: "/interne/ma-vie.png",
    valeur: "L'inverse de Timeline — une vue d'ensemble rapide, lisible en quelques secondes, d'une identité astrologique entière.",
    etat: "Vient d'être refaite (17/09) — la nouvelle branche plein écran est en ligne, encore fraîche.",
  },
  {
    id: "match",
    label: "Match",
    Icone: Heart,
    capture: "/interne/match.png",
    valeur: "Pas une fonction de rencontre : un levier de croissance interne. Elle transforme quelqu'un qui a déjà téléchargé l'app en quelqu'un qui en fait télécharger d'autres. Se juge sur les invitations générées, pas sur la richesse du contenu.",
    etat: "C'est très probablement là-dessus qu'on a besoin de toi : le moteur de matching vient d'être corrigé et branché (17-18/09). Un bug connu et non lié à ton moteur : l'ouverture d'un rapport précis renvoie parfois une erreur serveur (digest DYNAMIC_SERVER_USAGE) — à corriger côté app, pas côté API.",
  },
  {
    id: "vela",
    label: "Vela",
    Icone: MessageDots,
    capture: "/interne/vela.png",
    valeur: "Le substitut à une consultation d'astrologue payante (~80 €). Se juge sur la vitesse et la justesse d'une conversation, pas sur un rapport à lire.",
    etat: "Stable, pas touché récemment.",
  },
  {
    id: "profil",
    label: "Profil",
    Icone: User,
    capture: "/interne/profil.png",
    valeur: "Des réglages, dont un seul compte vraiment côté business : les notifications push (le levier de rétention).",
    etat: "Stable, pas touché récemment.",
  },
];

export default function LiaisonMarieAngePage() {
  const [section, setSection] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // La jauge de complétude : demandée par Christophe le 18/09/2026 pour que
  // rien ne soit "pris" tant que ce n'est pas 100 — remise à zéro à chaque
  // choix de section, mise à jour par le score que le modèle rend lui-même
  // à chaque tour (voir app/api/liaison/message/route.ts).
  const [completude, setCompletude] = useState(0);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, enCours, section]);

  function choisirSection(id: string) {
    const s = SECTIONS.find((s) => s.id === id);
    if (!s) return;
    setSection(id);
    setCompletude(0);
    setMessages((m) => [
      ...m,
      { role: "systeme", content: `${s.label} — ${s.valeur}\n\nÉtat actuel : ${s.etat}` },
    ]);
  }

  async function envoyer() {
    const texte = saisie.trim();
    if (!texte || enCours || !section) return;
    setErreur(null);
    setSaisie("");
    // L historique envoye au modele ne porte que les tours user/assistant :
    // les rappels de proposition de valeur sont un repere ecran, pas un
    // echange a rejouer dans la conversation.
    const historique = messages
      .filter((m): m is Message & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    const suivant: Message[] = [...messages, { role: "user", content: texte }];
    setMessages(suivant);
    setEnCours(true);
    try {
      const res = await fetch("/api/liaison/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texte, historique, section }),
      });
      const data = (await res.json()) as { ok: boolean; reponse?: string; completude?: number; raison?: string };
      if (!data.ok || !data.reponse) {
        setErreur(data.raison ?? "erreur_inconnue");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reponse! }]);
      if (typeof data.completude === "number") setCompletude(data.completude);
    } catch {
      setErreur("reseau");
    } finally {
      setEnCours(false);
    }
  }

  const sectionActuelle = SECTIONS.find((s) => s.id === section);

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

        {section ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-body-subtle)", marginBottom: 4 }}>
              <span>Précision de la demande</span>
              <span style={{ fontWeight: 700, color: completude >= 100 ? "var(--bg-brand)" : "var(--text-body-subtle)" }}>
                {completude}%{completude >= 100 ? " — prise en compte" : ""}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--bg-secondary)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${completude}%`,
                  background: "var(--bg-brand)",
                  transition: "width 400ms ease",
                }}
              />
            </div>
          </div>
        ) : null}
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 100px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        {!section ? (
          <p style={{ color: "var(--text-body-subtle)", fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>
            De quelle section tu veux parler ? Choisis un onglet ci-dessous, comme dans l&apos;app — ça évite qu&apos;on se trompe de sujet en cours de route.
          </p>
        ) : null}

        {section ? (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 4 }}>
            <img
              src={sectionActuelle!.capture}
              alt={`Écran ${sectionActuelle!.label}`}
              style={{ width: 130, borderRadius: 12, border: "1px solid var(--border-light)", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }} />
          </div>
        ) : null}

        {messages.map((m, i) =>
          m.role === "systeme" ? (
            <div
              key={i}
              style={{
                marginTop: 16,
                marginBottom: 4,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                background: "var(--bg-brand-soft)",
                color: "var(--text-body-subtle)",
                border: "1px dashed var(--border-light)",
              }}
            >
              {m.content}
            </div>
          ) : (
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
          ),
        )}

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

      {section ? (
        <div style={{ borderTop: "1px solid var(--border-light)", padding: "12px 16px" }}>
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
              placeholder={`Écris ton message sur ${sectionActuelle?.label}…`}
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
      ) : null}

      {/* La bottom nav — memes cinq icones que l app, toujours visible pour
          pouvoir changer de section en cours de route. */}
      <div
        style={{
          borderTop: "1px solid var(--border-light)",
          background: "var(--bg-secondary)",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 4px",
        }}
      >
        {SECTIONS.map((s) => {
          const actif = s.id === section;
          const Icone = s.Icone;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => choisirSection(s.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                padding: "4px 10px",
                cursor: "pointer",
                color: actif ? "var(--bg-brand)" : "var(--text-body-subtle)",
              }}
            >
              <Icone style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, fontWeight: actif ? 700 : 500 }}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
