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

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Heart, Clock, User, MessageDots, ChartMixed } from "flowbite-react-icons/outline";

interface Message {
  role: "user" | "assistant" | "systeme";
  content: string;
}

/**
 * Memes zones que ZONES dans app/api/liaison/message/route.ts — demande par
 * Christophe le 18/09/2026 : qu'elle puisse designer un bloc precis de
 * l'ecran, pas juste la section entiere. Garder les deux synchronises.
 */
const ZONES: Record<string, string[]> = {
  timeline: ["Capsule d'une période", "Repère \"maintenant\"", "Bascule vue chronologique / liste", "Score d'intensité (1-4)", "Domaine de vie affiché"],
  ma_vie: ["La branche/fleuve plein écran", "Un chapitre mis en évidence", "Échelle vie entière", "Échelle année", "Échelle mois"],
  match: ["Score de compatibilité (tête)", "Carte lien (bond)", "Carte tempérament", "Carte entente (mutualUnderstanding)", "Carte étincelle (attraction)", "Ce que chacun apporte (gift)", "Qui mène (boss)", "Carte à partager"],
  vela: ["Le message tapé par l'utilisateur", "La réponse rédigée par Vela", "La récupération du contexte moteur", "L'historique de conversation"],
  profil: ["Données de naissance", "Apparence (thème)", "Langue", "Notifications push", "Abonnement"],
};

/**
 * Le decompte de pression — demande par Christophe le 18/09/2026 : ce
 * playbook se remplit progressivement (la jauge de completude), et il veut
 * une echeance visible pour que ca avance. 30 jours a partir du lancement du
 * canal, pas de blocage d'acces derriere — juste une urgence croissante a
 * l'ecran, dans le meme esprit que "pas de protection, on n'est pas une
 * banque".
 */
const DATE_LANCEMENT = new Date("2026-09-18T00:00:00");
const JOURS_ALLOUES = 30;

function joursRestants(): number {
  const echeance = new Date(DATE_LANCEMENT);
  echeance.setDate(echeance.getDate() + JOURS_ALLOUES);
  const diffMs = echeance.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
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
  /** null pour Profil : aucun endpoint du moteur de Marie-Ange n'y est implique. */
  endpoint: string | null;
  /**
   * Le detail feature-par-feature, demande par Christophe le 18/09/2026 :
   * une story utilisateur, puis ce que l'ecran contient reellement — pour
   * qu'elle comprenne l'environnement avant de parler de son API.
   */
  story: string;
  fonctionnalites: string[];
}[] = [
  {
    id: "timeline",
    label: "Timeline",
    Icone: Clock,
    capture: "/interne/timeline.png",
    valeur: "Deep digging — l'exploration en détail de tout ce qui se passe dans une vie, catégorie par catégorie. Pas un résumé.",
    etat: "Stable, pas touché récemment.",
    endpoint: "toctoc-year.php — relayé par /api/toctoc",
    story: "En tant qu'utilisateur, je veux voir tout de suite ce qui se passe dans ma vie en ce moment, et pourquoi, sans avoir à chercher.",
    fonctionnalites: [
      "Capsules verticales, une par période, positionnées dans le temps",
      "Force/intensité de chaque période, et domaine de vie concerné (carrière, couple, argent, créativité…)",
      "Un repère \"maintenant\" toujours visible",
      "Bascule entre vue chronologique et vue liste",
      "Défilement libre dans le passé et le futur proche",
    ],
  },
  {
    id: "ma_vie",
    label: "Ma vie",
    Icone: ChartMixed,
    capture: "/interne/ma-vie.png",
    valeur: "L'inverse de Timeline — une vue d'ensemble rapide, lisible en quelques secondes, d'une identité astrologique entière.",
    etat: "Vient d'être refaite (17/09) — la nouvelle branche plein écran est en ligne, encore fraîche.",
    endpoint: "zodiacal-releasing.php — relayé par /api/chapitres",
    story: "En tant qu'utilisateur, je veux voir la forme entière de mon parcours de vie en un seul geste, sans naviguer période par période.",
    fonctionnalites: [
      "Une branche/fleuve plein écran, de la naissance à aujourd'hui",
      "Toutes les périodes majeures d'une vie, condensées en un seul dessin",
      "Les chapitres les plus longs mis en évidence",
      "Trois échelles de lecture : vie entière, année, mois",
      "Aucune interaction requise : ça se lit d'un coup d'œil",
    ],
  },
  {
    id: "match",
    label: "Match",
    Icone: Heart,
    capture: "/interne/match.png",
    valeur: "Pas une fonction de rencontre : un levier de croissance interne. Elle transforme quelqu'un qui a déjà téléchargé l'app en quelqu'un qui en fait télécharger d'autres. Se juge sur les invitations générées, pas sur la richesse du contenu.",
    etat: "C'est très probablement là-dessus qu'on a besoin de toi : le moteur de matching vient d'être corrigé et branché (17-18/09). Un bug connu et non lié à ton moteur : l'ouverture d'un rapport précis renvoie parfois une erreur serveur (digest DYNAMIC_SERVER_USAGE) — à corriger côté app, pas côté API.",
    endpoint: "POST /api/match — documenté dans API-MATCHING.md et match.md",
    story: "En tant qu'utilisateur, je veux comparer mon thème à celui d'un proche pour comprendre ce qui se joue entre nous — et je suis naturellement incité à l'inviter sur l'app pour le faire.",
    fonctionnalites: [
      "Liste des connexions déjà établies, avec un code d'invitation à partager",
      "Rapport de compatibilité : un score de tête, puis plusieurs dimensions distinctes (jamais fusionnées)",
      "Lien (bond), tempérament, entente, étincelle — quatre lectures séparées, jamais une seule note globale",
      "Qui mène, ce que chacun apporte à l'autre (dans les deux sens)",
      "Une carte à partager, générée et envoyée en image",
    ],
  },
  {
    id: "vela",
    label: "Vela",
    Icone: MessageDots,
    capture: "/interne/vela.png",
    valeur: "Le substitut à une consultation d'astrologue payante (~80 €). Se juge sur la vitesse et la justesse d'une conversation, pas sur un rapport à lire.",
    etat: "Stable, pas touché récemment.",
    endpoint: "toctoc-boudin-detail.php et toctoc-app-short.php — relayés par /api/openai/astrologue/message",
    story: "En tant qu'utilisateur, je veux poser une question précise sur ma vie et recevoir une réponse humaine, immédiate, comme si je parlais à un astrologue — jamais un rapport à lire.",
    fonctionnalites: [
      "Chat conversationnel en langage courant, jamais de jargon technique",
      "Compréhension de la question posée avant d'aller chercher une donnée",
      "Récupération des vrais signaux du moteur (transits, périodes actives) avant de répondre",
      "Réponse rédigée en 4 temps : ce qui se passe, d'où ça vient, ce que ça change, la prochaine date",
      "Historique de conversation conservé sur l'appareil",
    ],
  },
  {
    id: "profil",
    label: "Profil",
    Icone: User,
    capture: "/interne/profil.png",
    valeur: "Des réglages, dont un seul compte vraiment côté business : les notifications push (le levier de rétention).",
    etat: "Stable, pas touché récemment.",
    endpoint: null,
    story: "En tant qu'utilisateur, je veux gérer mes informations et mes préférences à un seul endroit — ce n'est pas un écran de contenu, c'est un tiroir utilitaire.",
    fonctionnalites: [
      "Données de naissance (date, heure, lieu)",
      "Apparence : thème clair ou sombre",
      "Langue (10 langues supportées)",
      "Notifications push — le seul réglage qui compte vraiment côté business",
      "Abonnement, et revoir le guide de démarrage",
    ],
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
  // Plein ecran de la capture au clic — demande par Christophe le 18/09/2026
  // pour qu'elle comprenne bien dans quel environnement elle se trouve.
  const [captureAgrandie, setCaptureAgrandie] = useState(false);
  // La zone precise de l'ecran visee — demande par Christophe le 18/09/2026 :
  // remise a zero a chaque changement de section, envoyee avec chaque message.
  const [zone, setZone] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const fichierRef = useRef<HTMLInputElement>(null);
  const jours = joursRestants();

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, enCours, section]);

  /**
   * Changer de section REMPLACE la conversation, elle ne s'y ajoute pas —
   * bug trouve par Christophe le 18/09/2026 : Timeline puis Ma vie puis
   * Match empilaient les trois blocs au lieu de montrer un seul ecran a la
   * fois. Cote API, un changement de section a aussi le meme effet : les
   * anciens messages ne partent plus dans l'historique du nouveau sujet,
   * puisque `messages` (donc `historique`, derive dessus) repart a zero.
   */
  function choisirSection(id: string) {
    const s = SECTIONS.find((s) => s.id === id);
    if (!s) return;
    setSection(id);
    setCompletude(0);
    setCaptureAgrandie(false);
    setZone(null);
    const ligneEndpoint = s.endpoint
      ? `Endpoint de ton moteur concerné : ${s.endpoint}`
      : "Aucun endpoint de ton moteur n'est concerné ici — si ta remarque touche l'API, ce n'est pas la bonne section.";
    const ligneFonctionnalites = s.fonctionnalites.map((f) => `• ${f}`).join("\n");
    setMessages([
      {
        role: "systeme",
        content: `${s.label} — ${s.valeur}\n\n${s.story}\n\nCe que contient l'écran :\n${ligneFonctionnalites}\n\nÉtat actuel : ${s.etat}\n\n${ligneEndpoint}`,
      },
    ]);
  }

  /**
   * Envoie un texte donne — partage par la saisie manuelle ET par
   * l'import d'un fichier .md (voir importerBriefing), pour que les deux
   * chemins passent par la meme logique (historique, zone, jauge).
   */
  async function envoyerTexte(texte: string) {
    if (!texte || enCours || !section) return;
    setErreur(null);
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
        body: JSON.stringify({ message: texte, historique, section, zone }),
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

  function envoyer() {
    const texte = saisie.trim();
    setSaisie("");
    void envoyerTexte(texte);
  }

  /**
   * Import d'un briefing .md prepare par SA propre IA — demande par
   * Christophe le 18/09/2026 : un echange entre deux IA (celle-ci, et la
   * sienne), pas juste un chat humain. Le fichier entier devient son
   * message, avec un marqueur clair pour que le modele sache que c'est un
   * briefing structure et non une phrase tapee a la volee.
   */
  async function importerBriefing(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier || !section) return;
    const contenu = await fichier.text();
    await envoyerTexte(`Briefing importé (fichier ${fichier.name}, préparé avec son IA) :\n\n${contenu}`);
  }

  /**
   * Telecharge l'echange en cours en .md — demande par Christophe le
   * 18/09/2026 : le lien retour de la boucle IA a IA, pour qu'elle puisse
   * redonner cet echange a sa propre IA et obtenir le prochain briefing.
   * Genere en local, sans appel serveur : tout est deja dans `messages`.
   */
  function telechargerEchange() {
    if (!sectionActuelle) return;
    const lignes: string[] = [
      `# Échange avec Claude (Favorable) — ${sectionActuelle.label}`,
      "",
      `**Section :** ${sectionActuelle.label}`,
    ];
    if (zone) lignes.push(`**Zone précisée :** ${zone}`);
    lignes.push(`**Complétude estimée par Claude :** ${completude}%`, "", `## Proposition de valeur de cet écran`, sectionActuelle.valeur);
    if (sectionActuelle.endpoint) lignes.push("", `**Endpoint concerné :** ${sectionActuelle.endpoint}`);
    lignes.push("", `## Échange`);
    for (const m of messages) {
      if (m.role === "systeme") continue;
      lignes.push(`**${m.role === "user" ? "Marie-Ange" : "Claude (Favorable)"} :** ${m.content}`, "");
    }
    lignes.push(
      "---",
      "Donne ce fichier à ton IA pour qu'elle prépare la suite (un nouveau .md, avec le même format), puis importe-le ici.",
    );
    const blob = new Blob([lignes.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echange-favorable-${section}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sectionActuelle = SECTIONS.find((s) => s.id === section);
  const aEchange = messages.some((m) => m.role === "user" || m.role === "assistant");

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

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 700,
            color: jours <= 7 ? "var(--danger)" : jours <= 14 ? "var(--warning)" : "var(--text-body-subtle)",
          }}
        >
          {jours > 0
            ? `Ce playbook se remplit au fur et à mesure — il reste ${jours} jour${jours > 1 ? "s" : ""} pour le finaliser.`
            : "Le délai des 30 jours est dépassé — ce cadrage doit se finaliser maintenant."}
        </div>

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
          <div style={{ marginBottom: 4 }}>
            <button
              type="button"
              onClick={() => setCaptureAgrandie(true)}
              style={{ background: "none", border: "none", padding: 0, cursor: "zoom-in", display: "block" }}
              aria-label={`Agrandir l'écran ${sectionActuelle!.label}`}
            >
              <img
                src={sectionActuelle!.capture}
                alt={`Écran ${sectionActuelle!.label}`}
                style={{ width: 260, borderRadius: 16, border: "1px solid var(--border-light)" }}
              />
            </button>
            <p style={{ marginTop: 6, fontSize: 11, color: "var(--text-body-subtle)" }}>
              Touche l&apos;écran pour l&apos;agrandir.
            </p>
          </div>
        ) : null}

        {section && ZONES[section] ? (
          <div style={{ marginTop: 14, marginBottom: 4 }}>
            <p style={{ fontSize: 11, color: "var(--text-body-subtle)", marginBottom: 6 }}>
              Zone précise de l&apos;écran (facultatif) :
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ZONES[section].map((z) => {
                const actif = z === zone;
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(actif ? null : z)}
                    style={{
                      borderRadius: 999,
                      border: "1px solid " + (actif ? "var(--bg-brand)" : "var(--border-light)"),
                      background: actif ? "var(--bg-brand)" : "var(--bg-secondary)",
                      color: actif ? "var(--text-on-brand)" : "var(--text-body-subtle)",
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: actif ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {section ? (
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--bg-secondary)",
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--text-body-subtle)",
            }}
          >
            <p style={{ margin: 0, marginBottom: 8 }}>
              Cet échange se passe entre deux IA : celle-ci (côté Favorable) et la tienne, à toi. Le plus efficace : demande à ta propre IA
              de préparer un fichier <strong>.md</strong> avec ta question précise, importe-le ici, puis télécharge l&apos;échange en .md pour le
              redonner à ta propre IA et préparer la suite.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                ref={fichierRef}
                type="file"
                accept=".md,text/markdown"
                onChange={importerBriefing}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fichierRef.current?.click()}
                style={{
                  borderRadius: 8,
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-primary)",
                  color: "var(--text-heading)",
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Importer un briefing .md
              </button>
              <button
                type="button"
                onClick={telechargerEchange}
                disabled={!aEchange}
                style={{
                  borderRadius: 8,
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-primary)",
                  color: "var(--text-heading)",
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: aEchange ? "pointer" : "not-allowed",
                  opacity: aEchange ? 1 : 0.5,
                }}
              >
                Télécharger l&apos;échange en .md
              </button>
            </div>
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
              placeholder={`Écris ton message sur ${sectionActuelle?.label}${zone ? ` — zone : ${zone}` : ""}…`}
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

      {/* Plein ecran de la capture — pour qu'elle comprenne bien dans quel
          environnement elle se trouve avant de parler de l'API. */}
      {captureAgrandie && sectionActuelle ? (
        <button
          type="button"
          onClick={() => setCaptureAgrandie(false)}
          aria-label="Fermer l'écran agrandi"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--site-voile-modale)",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
            zIndex: 50,
          }}
        >
          <img
            src={sectionActuelle.capture}
            alt={`Écran ${sectionActuelle.label} en plein écran`}
            style={{ maxWidth: "min(90vw, 480px)", maxHeight: "80vh", borderRadius: 20, border: "1px solid var(--border-light)" }}
          />
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-on-brand)" }}>
            Touche n&apos;importe où pour refermer.
          </p>
        </button>
      ) : null}
    </div>
  );
}
