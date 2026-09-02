"use client";

/**
 * L ecran ou l on passe de gratuit a payant.
 *
 * Il vit dans la mise en page de l app (zones sures, theme) et porte ses
 * propres traductions, en dix langues, plus bas dans ce fichier. Stripe recoit
 * la langue pour que sa page de paiement s affiche dans la bonne.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QU IL ETAIT, ET POURQUOI IL A ETE REFAIT LE 01/09/2026
 *
 * Un tableau comparatif : deux cartes cote a cote, huit cases a cocher, un
 * bouton inerte « Ton plan actuel » a la meilleure place de l ecran. Verdict
 * de Christophe : « ce n est pas du 10 etoiles, c est un tableau de prix SaaS
 * generique ».
 *
 * Le defaut de fond n etait pas esthetique. Cet ecran ne s ouvre presque
 * jamais tout seul : il s ouvre parce que quelqu un vient de toucher le voile
 * pose sur UNE date de sa vie. Il ne le savait pas, et vendait donc un
 * abonnement anonyme a quelqu un qui venait de poser une question precise.
 *
 * Ce qui a change :
 *
 *   1. La date regardee ouvre l ecran, en toutes lettres. Elle arrive par
 *      components/demo/PremiumTeaserContext.tsx, que PremiumBlur remplit au
 *      moment ou le mur se dresse.
 *   2. Une seule offre visible. Comparer deux colonnes, c est deja hesiter ;
 *      le gratuit devient une phrase, en bas, pas une carte concurrente.
 *   3. Trois lignes de ce qu on RECOIT, a la place de huit cases a cocher.
 *      Plus de « delineation », plus de « momentum » : personne ne sait ce
 *      que c est, et un mot qu on ne comprend pas ne donne envie de rien.
 *   4. Le bouton nomme le resultat — « Ouvrir le 22 Oct 2026 » — pas l acte
 *      commercial.
 *
 * CE QUI N A PAS BOUGE
 *
 *   - Les montants viennent de lib/billing/features.ts, source unique, qui
 *     doit correspondre a App Store Connect et au prestataire de paiement.
 *   - Les mentions legales europeennes en pied de page, obligatoires.
 *   - Le prix, la duree et le renouvellement restent lisibles AVANT l achat,
 *     comme Apple l exige : c est la ligne d engagement sous le montant.
 *   - Sur iOS on n affiche jamais nos propres constantes de prix : Apple
 *     convertit, arrondit et applique la fiscalite locale.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft } from "flowbite-react-icons/outline";
import { useAuth } from "@/lib/auth-context";
import { AuthSheet } from "@/components/demo/AuthSheet";
import { isIOSBundle } from "@/lib/platform";
import { PLANS, PLAN_UNIQUE, PLAN_PAR_DEFAUT, economieAnnuelle } from "@/lib/billing/features";
import { verifierCode, CLE_ACCES } from "@/lib/coupons";
import { perso } from "@/lib/perso-i18n";
import { t, type Locale } from "@/lib/i18n-demo";
import { apiFetch } from "@/lib/api-client";
import { disponible, preparer, offres, acheter, type OffreAchat } from "@/lib/achats";
import { declencheurEnAttente } from "@/components/demo/PremiumTeaserContext";
import { useLocale } from "@/lib/use-locale";

// ─── Textes de la page, dix langues ──────────────────────────────────────
interface Textes {
  reprise: string;          // sur-titre au-dessus de la date regardee
  sous_date: string;        // la phrase qui suit la date, quand on la connait
  titre: string;            // titre quand on ne la connait pas
  sous: string;
  gains: string[];          // trois, jamais plus
  gains_sous: string[];
  mensuel: string;
  annuel: string;
  economie: string;         // « {x} € de moins sur l annee »
  par_mois: string;
  // Prix + duree + renouvellement, AVANT l achat. Sans clause d essai : la
  // decision du 02/09/2026 (DECISIONS.md) n en prevoit aucun, et App Store
  // Connect n en aura pas. Promettre un essai absent est un refus Apple et
  // une pratique trompeuse au sens du droit de la consommation.
  engagement: string;
  engagement_an: string;
  bouton_date: string;      // « Ouvrir le {d} »
  bouton: string;
  gratuit: string;          // ce qu on garde sans payer, une phrase
  code_lien: string;
  code_champ: string;
  code_valider: string;
  code_ouvert: string;
  retour: string;
  ios_bloque: string;
  mentions: string[];       // obligatoires, web uniquement
}

const PAGE_COPY: Record<Locale, Textes> = {
  fr: {
    reprise: "Tu regardais",
    sous_date: "Ta timeline l'a déjà calculé. Elle ne te l'a pas encore lu.",
    titre: "Ta timeline ne s'arrête pas à aujourd'hui.",
    sous: "Les trois prochaines années sont déjà calculées. Elles attendent.",
    gains: [
      "Les trois prochaines années, période par période",
      "Le sens de chaque période, écrit pour ta situation",
      "Un mot le jour où une bonne fenêtre s'ouvre",
    ],
    gains_sous: [
      "Quand ça pousse, quand ça freine, et jusqu'à quand.",
      "Sur n'importe quelle date, autant de fois que tu veux.",
      "Et chaque matin, ce que la journée porte.",
    ],
    mensuel: "Mensuel", annuel: "Annuel",
    economie: "{x} € de moins sur l'année",
    par_mois: "/mois",
    engagement: "{x} € par mois. Annulable à tout moment.",
    engagement_an: "{x} € par an. Annulable à tout moment.",
    bouton_date: "Ouvrir le {d}",
    bouton: "Commencer les 7 jours gratuits",
    gratuit: "Sans rien payer, tu gardes ton signal du jour, tout ton passé et tes connexions.",
    code_lien: "J'ai un code",
    code_champ: "CODE",
    code_valider: "Valider",
    code_ouvert: "C'est ouvert. On y retourne…",
    retour: "Retour",
    ios_bloque: "Disponible dans la version Pro de l'app",
    mentions: [
      "Renouvellement automatique. Annulable à tout moment depuis ton compte.",
      "Droit de rétractation 14 jours (Article 16, Directive 2011/83/UE).",
      "Prix TTC, TVA incluse selon ton pays de résidence.",
    ],
  },
  en: {
    reprise: "You were looking at",
    sous_date: "Your timeline has already worked it out. It just hasn't read it to you.",
    titre: "Your timeline doesn't stop at today.",
    sous: "The next three years are already worked out. They're waiting.",
    gains: [
      "The next three years, period by period",
      "What each period means, written for your situation",
      "A word on the day a good window opens",
    ],
    gains_sous: [
      "When it pushes, when it holds you back, and until when.",
      "On any date, as many times as you want.",
      "And every morning, what the day carries.",
    ],
    mensuel: "Monthly", annuel: "Annual",
    economie: "€{x} less over the year",
    par_mois: "/month",
    engagement: "€{x} per month. Cancel anytime.",
    engagement_an: "€{x} per year. Cancel anytime.",
    bouton_date: "Open {d}",
    bouton: "Start the 7 free days",
    gratuit: "Paying nothing, you keep your signal of the day, all your past, and your connections.",
    code_lien: "I have a code",
    code_champ: "CODE",
    code_valider: "Apply",
    code_ouvert: "It's open. Taking you back…",
    retour: "Back",
    ios_bloque: "Available in the Pro version of the app",
    mentions: [
      "Auto-renews. Cancel anytime from your account.",
      "14-day right of withdrawal (EU Directive 2011/83/EU, Art. 16).",
      "VAT included based on your country of residence.",
    ],
  },
  es: {
    reprise: "Estabas mirando",
    sous_date: "Tu línea de tiempo ya lo ha calculado. Solo que aún no te lo ha leído.",
    titre: "Tu línea de tiempo no se detiene hoy.",
    sous: "Los próximos tres años ya están calculados. Te esperan.",
    gains: [
      "Los próximos tres años, periodo a periodo",
      "Qué significa cada periodo, escrito para tu situación",
      "Un aviso el día en que se abre una buena ventana",
    ],
    gains_sous: [
      "Cuándo empuja, cuándo frena y hasta cuándo.",
      "En cualquier fecha, tantas veces como quieras.",
      "Y cada mañana, lo que trae el día.",
    ],
    mensuel: "Mensual", annuel: "Anual",
    economie: "{x} € menos al año",
    par_mois: "/mes",
    engagement: "{x} € al mes. Cancela cuando quieras.",
    engagement_an: "{x} € al año. Cancela cuando quieras.",
    bouton_date: "Abrir el {d}",
    bouton: "Empezar los 7 días gratis",
    gratuit: "Sin pagar nada, conservas tu señal del día, todo tu pasado y tus conexiones.",
    code_lien: "Tengo un código",
    code_champ: "CÓDIGO",
    code_valider: "Aplicar",
    code_ouvert: "Está abierto. Volvemos…",
    retour: "Atrás",
    ios_bloque: "Disponible en la versión Pro de la app",
    mentions: [
      "Renovación automática. Cancela cuando quieras desde tu cuenta.",
      "Derecho de desistimiento de 14 días (Directiva UE 2011/83/UE, Art. 16).",
      "IVA incluido según tu país de residencia.",
    ],
  },
  pt: {
    reprise: "Estavas a ver",
    sous_date: "A tua timeline já o calculou. Só ainda não to leu.",
    titre: "A tua timeline não pára em hoje.",
    sous: "Os próximos três anos já estão calculados. Estão à espera.",
    gains: [
      "Os próximos três anos, período a período",
      "O que cada período significa, escrito para a tua situação",
      "Um aviso no dia em que se abre uma boa janela",
    ],
    gains_sous: [
      "Quando empurra, quando trava, e até quando.",
      "Em qualquer data, tantas vezes quantas quiseres.",
      "E todas as manhãs, o que o dia traz.",
    ],
    mensuel: "Mensal", annuel: "Anual",
    economie: "menos {x} € no ano",
    par_mois: "/mês",
    engagement: "{x} € por mês. Cancela quando quiseres.",
    engagement_an: "{x} € por ano. Cancela quando quiseres.",
    bouton_date: "Abrir o {d}",
    bouton: "Começar os 7 dias grátis",
    gratuit: "Sem pagar nada, ficas com o teu sinal do dia, todo o teu passado e as tuas ligações.",
    code_lien: "Tenho um código",
    code_champ: "CÓDIGO",
    code_valider: "Aplicar",
    code_ouvert: "Está aberto. Voltamos…",
    retour: "Voltar",
    ios_bloque: "Disponível na versão Pro do app",
    mentions: [
      "Renovação automática. Cancele quando quiser pela sua conta.",
      "Direito de retratação de 14 dias (Diretiva UE 2011/83/UE, Art. 16).",
      "Imposto incluído conforme seu país de residência.",
    ],
  },
  de: {
    reprise: "Du hast dir angesehen",
    sous_date: "Deine Zeitleiste hat ihn längst berechnet. Vorgelesen hat sie ihn dir noch nicht.",
    titre: "Deine Zeitleiste hört nicht heute auf.",
    sous: "Die nächsten drei Jahre sind bereits berechnet. Sie warten.",
    gains: [
      "Die nächsten drei Jahre, Phase für Phase",
      "Was jede Phase bedeutet, für deine Lage geschrieben",
      "Ein Hinweis an dem Tag, an dem sich ein gutes Fenster öffnet",
    ],
    gains_sous: [
      "Wann es schiebt, wann es bremst, und bis wann.",
      "Zu jedem Datum, so oft du willst.",
      "Und jeden Morgen, was der Tag bringt.",
    ],
    mensuel: "Monatlich", annuel: "Jährlich",
    economie: "{x} € weniger im Jahr",
    par_mois: "/Monat",
    engagement: "{x} € pro Monat. Jederzeit kündbar.",
    engagement_an: "{x} € pro Jahr. Jederzeit kündbar.",
    bouton_date: "Den {d} öffnen",
    bouton: "Die 7 Gratistage starten",
    gratuit: "Ohne zu zahlen behältst du dein Tagessignal, deine ganze Vergangenheit und deine Verbindungen.",
    code_lien: "Ich habe einen Code",
    code_champ: "CODE",
    code_valider: "Einlösen",
    code_ouvert: "Offen. Wir gehen zurück…",
    retour: "Zurück",
    ios_bloque: "Verfügbar in der Pro-Version der App",
    mentions: [
      "Automatische Verlängerung. Jederzeit über dein Konto kündbar.",
      "14-tägiges Widerrufsrecht (EU-Richtlinie 2011/83/EU, Art. 16).",
      "MwSt. inklusive je nach Wohnsitzland.",
    ],
  },
  it: {
    reprise: "Stavi guardando",
    sous_date: "La tua timeline l'ha già calcolato. Solo che non te l'ha ancora letto.",
    titre: "La tua timeline non si ferma a oggi.",
    sous: "I prossimi tre anni sono già calcolati. Ti aspettano.",
    gains: [
      "I prossimi tre anni, periodo per periodo",
      "Cosa significa ogni periodo, scritto per la tua situazione",
      "Un avviso il giorno in cui si apre una buona finestra",
    ],
    gains_sous: [
      "Quando spinge, quando frena, e fino a quando.",
      "Su qualsiasi data, tutte le volte che vuoi.",
      "E ogni mattina, cosa porta la giornata.",
    ],
    mensuel: "Mensile", annuel: "Annuale",
    economie: "{x} € in meno sull'anno",
    par_mois: "/mese",
    engagement: "{x} € al mese. Annullabile in qualsiasi momento.",
    engagement_an: "{x} € all'anno. Annullabile in qualsiasi momento.",
    bouton_date: "Aprire il {d}",
    bouton: "Iniziare i 7 giorni gratis",
    gratuit: "Senza pagare nulla, tieni il tuo segnale del giorno, tutto il tuo passato e le tue connessioni.",
    code_lien: "Ho un codice",
    code_champ: "CODICE",
    code_valider: "Applica",
    code_ouvert: "È aperto. Torniamo…",
    retour: "Indietro",
    ios_bloque: "Disponibile nella versione Pro dell'app",
    mentions: [
      "Rinnovo automatico. Annulla quando vuoi dal tuo account.",
      "Diritto di recesso di 14 giorni (Direttiva UE 2011/83/UE, Art. 16).",
      "IVA inclusa secondo il tuo paese di residenza.",
    ],
  },
  nl: {
    reprise: "Je keek naar",
    sous_date: "Je tijdlijn heeft het al berekend. Alleen nog niet aan je voorgelezen.",
    titre: "Je tijdlijn stopt niet bij vandaag.",
    sous: "De komende drie jaar zijn al berekend. Ze wachten.",
    gains: [
      "De komende drie jaar, periode voor periode",
      "Wat elke periode betekent, geschreven voor jouw situatie",
      "Een bericht op de dag dat een goed venster opengaat",
    ],
    gains_sous: [
      "Wanneer het duwt, wanneer het remt, en tot wanneer.",
      "Op elke datum, zo vaak je wilt.",
      "En elke ochtend, wat de dag brengt.",
    ],
    mensuel: "Maandelijks", annuel: "Jaarlijks",
    economie: "€{x} minder op jaarbasis",
    par_mois: "/maand",
    engagement: "€{x} per maand. Altijd opzegbaar.",
    engagement_an: "€{x} per jaar. Altijd opzegbaar.",
    bouton_date: "{d} openen",
    bouton: "De 7 gratis dagen starten",
    gratuit: "Zonder te betalen houd je je signaal van de dag, je hele verleden en je verbindingen.",
    code_lien: "Ik heb een code",
    code_champ: "CODE",
    code_valider: "Toepassen",
    code_ouvert: "Open. We gaan terug…",
    retour: "Terug",
    ios_bloque: "Beschikbaar in de Pro-versie van de app",
    mentions: [
      "Automatische verlenging. Altijd opzegbaar via je account.",
      "14-daags herroepingsrecht (EU-richtlijn 2011/83/EU, art. 16).",
      "BTW inbegrepen volgens je woonland.",
    ],
  },
  ja: {
    reprise: "見ていたのは",
    sous_date: "タイムラインはもう計算しています。まだあなたに読まれていないだけです。",
    titre: "タイムラインは今日で終わりません。",
    sous: "これからの3年間はすでに算出済み。待っているだけです。",
    gains: [
      "これからの3年間を、時期ごとに",
      "それぞれの時期の意味を、あなたの状況に合わせて",
      "良いタイミングが開く日に、ひとこと",
    ],
    gains_sous: [
      "いつ進み、いつ止まり、いつまで続くか。",
      "どの日付でも、何度でも。",
      "そして毎朝、その日が持つもの。",
    ],
    mensuel: "月額", annuel: "年額",
    economie: "年間 {x} € おトク",
    par_mois: "/月",
    engagement: "月 {x} €。いつでも解約できます。",
    engagement_an: "年 {x} €。いつでも解約できます。",
    bouton_date: "{d} を開く",
    bouton: "無料の7日間を始める",
    gratuit: "支払わなくても、その日のシグナル、過去のすべて、つながりはそのままです。",
    code_lien: "コードを持っています",
    code_champ: "コード",
    code_valider: "適用",
    code_ouvert: "開きました。戻ります…",
    retour: "戻る",
    ios_bloque: "アプリのProバージョンで利用可能",
    mentions: [
      "自動更新。アカウントからいつでもキャンセル可能。",
      "14日間の撤回権 (EU指令2011/83/EU、第16条)。",
      "居住国に応じたVAT込み。",
    ],
  },
  zh: {
    reprise: "你刚才在看",
    sous_date: "你的时间线早就算好了，只是还没读给你听。",
    titre: "你的时间线不止于今天。",
    sous: "未来三年已经算好，正在等你。",
    gains: [
      "未来三年，逐段呈现",
      "每段时期意味着什么，为你的处境而写",
      "好时机开启的那天，会有一句提醒",
    ],
    gains_sous: [
      "什么时候推着你走，什么时候拖住你，持续到几时。",
      "任意日期，想看多少次都可以。",
      "还有每天早上，这一天带来什么。",
    ],
    mensuel: "按月", annuel: "按年",
    economie: "一年少付 {x} €",
    par_mois: "/月",
    engagement: "每月 {x} €。随时可取消。",
    engagement_an: "每年 {x} €。随时可取消。",
    bouton_date: "打开 {d}",
    bouton: "开始这 7 天免费",
    gratuit: "一分不付，你仍然保有当天的信号、全部过往和你的连接。",
    code_lien: "我有代码",
    code_champ: "代码",
    code_valider: "使用",
    code_ouvert: "已开启，正在返回…",
    retour: "返回",
    ios_bloque: "在应用的Pro版本中可用",
    mentions: [
      "自动续订。可随时从您的账户取消。",
      "14天退款权 (欧盟指令2011/83/EU, 第16条)。",
      "根据您的居住国包含增值税。",
    ],
  },
  ar: {
    reprise: "كنت تنظر إلى",
    sous_date: "خطك الزمني حسبه بالفعل. لم يقرأه لك بعد فقط.",
    titre: "خطك الزمني لا يتوقف عند اليوم.",
    sous: "السنوات الثلاث القادمة محسوبة بالفعل. إنها بانتظارك.",
    gains: [
      "السنوات الثلاث القادمة، فترة بفترة",
      "معنى كل فترة، مكتوب لوضعك أنت",
      "كلمة في اليوم الذي تنفتح فيه نافذة جيدة",
    ],
    gains_sous: [
      "متى تدفعك، ومتى تكبحك، وإلى متى.",
      "في أي تاريخ، وبقدر ما تشاء.",
      "وكل صباح، ما يحمله اليوم.",
    ],
    mensuel: "شهري", annuel: "سنوي",
    economie: "أقل بـ {x} € في السنة",
    par_mois: "/شهر",
    engagement: "{x} € شهرياً. يمكن الإلغاء في أي وقت.",
    engagement_an: "{x} € سنوياً. يمكن الإلغاء في أي وقت.",
    bouton_date: "افتح {d}",
    bouton: "ابدأ الأيام السبعة المجانية",
    gratuit: "دون أن تدفع شيئاً، تحتفظ بإشارة يومك وكل ماضيك واتصالاتك.",
    code_lien: "لديّ رمز",
    code_champ: "الرمز",
    code_valider: "تطبيق",
    code_ouvert: "تم الفتح. نعود…",
    retour: "رجوع",
    ios_bloque: "متاح في الإصدار Pro من التطبيق",
    mentions: [
      "تجديد تلقائي. إلغاء في أي وقت من حسابك.",
      "حق الانسحاب لمدة 14 يوماً (التوجيه الأوروبي 2011/83/EU, المادة 16).",
      "ضريبة القيمة المضافة مدرجة حسب بلد إقامتك.",
    ],
  },
};

/** Un montant, ecrit comme on l ecrit en Europe : 5,99 et pas 5.99. */
function euros(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export default function DemoPricingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">(PLAN_UNIQUE ?? PLAN_PAR_DEFAUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const locale = useLocale();
  const ios = isIOSBundle();
  // Les offres telles que le MAGASIN les annonce. On n affiche jamais nos
  // propres constantes de prix sur iOS : Apple convertit, arrondit et applique
  // la fiscalite locale, donc un prix ecrit en dur finit par mentir.
  const [offresIOS, setOffresIOS] = useState<OffreAchat[]>([]);
  const [achatEnCours, setAchatEnCours] = useState(false);
  const achatPossible = disponible();

  /**
   * LA PERIODE QUI A DECLENCHE LE MUR.
   *
   * C est la seule chose qui separe cet ecran d un tableau de prix.
   *
   * Lue apres le montage et pas pendant le rendu : sessionStorage n existe pas
   * au rendu serveur, et la lire directement donnerait un premier rendu
   * different du second — le titre changerait sous les yeux de la personne.
   * Lue une seule fois : la valeur ne bouge pas pendant la visite.
   */
  const [quand, setQuand] = useState<string | null>(null);
  useEffect(() => {
    setQuand(declencheurEnAttente()?.quand ?? null);
  }, []);

  useEffect(() => {
    if (!achatPossible || !user?.id) return;
    let vivant = true;
    void preparer(user.id).then((ok) => {
      if (!ok || !vivant) return;
      void offres().then((o) => { if (vivant) setOffresIOS(o); });
    });
    return () => { vivant = false; };
  }, [achatPossible, user?.id]);

  async function lancerAchat(idPaquet: string) {
    setAchatEnCours(true);
    const r = await acheter(idPaquet);
    setAchatEnCours(false);
    // « annule » n est pas une erreur : la personne a decide, on ne la punit
    // pas d avoir decide. Seul un vrai echec merite un message.
    if (r === "ok") {
      // On ne depose pas la personne en haut de la timeline. Elle a paye pour
      // voir une periode PRECISE : on l y ramene, revelee. C est le seul moment
      // ou l argent doit se transformer en quelque chose de visible, et il ne
      // se passait rien.
      router.replace("/app/timeline");
    }
    else if (r === "echec") // Le message dit ce qui compte quand un paiement rate : que rien n a
      // ete facture. C est la premiere question que se pose quelqu un.
      setError(perso("achat.echec", locale));
  }

  // Code d acces
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

  const tryCoupon = async () => {
    const etat = await verifierCode(couponCode);
    if (etat === "ok") {
      try { localStorage.setItem(CLE_ACCES, "true"); } catch {}
      setCouponSuccess(true);
      setTimeout(() => router.replace("/app/timeline"), 1000);
    } else {
      // « inactif » n est pas « inconnu » : aucun code n existe dans cet
      // environnement, et dire a la personne de verifier son orthographe la
      // rend responsable d une panne qui ne lui appartient pas.
      setCouponError(perso(etat === "inactif" ? "code.inactif" : "code.inconnu", locale));
    }
  };

  const c = PAGE_COPY[locale] ?? PAGE_COPY.en;

  // L economie se CALCULE. La page annonçait « -25% » ecrit en dur dans les dix
  // langues alors que 39,99 contre 5,99 x 12 fait 44 % : un chiffre faux sur un
  // ecran de prix, et faux dans le mauvais sens — on se vendait moins bien
  // qu on ne l etait.
  const eco = useMemo(() => economieAnnuelle(), []);
  const parMoisEnAnnuel = PLANS.annual.priceEUR / 12;

  const handleCheckout = async (plan: "monthly" | "annual") => {
    if (ios) return;                                  // pas de paiement web sur iOS
    if (!isAuthenticated) {
      // Il faut un compte d abord : on ouvre la feuille, la personne reessaie.
      setAuthOpen(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan, locale }),
      });
      if (res.status === 401) {
        setAuthOpen(true);
        return;
      }
      if (!res.ok) throw new Error(t("auth.error_generic", locale));
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error_generic", locale));
      setLoading(false);
    }
  };

  // Le bouton nomme le RESULTAT quand on le connait. « Ouvrir le 22 Oct 2026 »
  // dit ce qui se passe apres le clic ; « Demarrer 7 jours gratuits » dit ce
  // qu on fait, pas ce qu on obtient.
  const libelleBouton = quand ? c.bouton_date.replace("{d}", quand) : c.bouton;

  return (
    <div className="min-h-full px-5 pb-12 pt-2" style={{ background: "var(--bg-primary)" }}>
      {/* Puce de retour */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
        style={{
          // Regle 3 : --accent-purple pose sur une tuile faite du MEME
          // --accent-purple converge — 3,64 en theme clair. --text-brand est
          // la valeur derivee de la meme famille : 5,85.
          color: "var(--text-brand)",
          background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
        }}
      >
        <ChevronLeft size={14} />
        {c.retour}
      </button>

      {/* ── L en-tete ─────────────────────────────────────────────────────
          Quand on connait la date regardee, C EST ELLE le titre. Un premier
          jet la mettait en grand PUIS la repetait mot pour mot dans le titre
          juste dessous — « 22 Oct 2026 » suivi de « Le 22 Oct 2026 est deja
          dans ta timeline ». Vu a l ecran, ca fait bafouiller la page et ca
          repousse le bouton d autant.

          Le filet d un pixel est du decor : aucun seuil de contraste a
          respecter, et il n ajoute pas une couche de matiere sur le fond.
      */}
      {quand ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-6 text-center"
        >
          <p
            className="text-[10px] font-semibold uppercase"
            style={{ color: "var(--text-body-subtle)", letterSpacing: "0.16em" }}
          >
            {c.reprise}
          </p>
          <h1
            className="font-display mt-1.5 text-[32px] font-bold leading-none"
            style={{ color: "var(--text-heading)", letterSpacing: -0.8 }}
          >
            {quand}
          </h1>
          <div
            className="mx-auto mt-3.5 h-px w-10"
            aria-hidden="true"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 32%, transparent)" }}
          />
          <p
            className="mx-auto mt-3.5 max-w-[19rem] text-[13px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)" }}
          >
            {c.sous_date}
          </p>
        </motion.div>
      ) : (
        <div className="mb-6 text-center">
          <h1
            className="font-display text-[24px] font-bold leading-tight"
            style={{ color: "var(--text-heading)", letterSpacing: -0.5 }}
          >
            {c.titre}
          </h1>
          <p
            className="mx-auto mt-2.5 max-w-md text-[13px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)" }}
          >
            {c.sous}
          </p>
        </div>
      )}

      {/* ── Ce qu on recoit ───────────────────────────────────────────────
          Trois lignes, sans cases a cocher et sans tuile : une case a cocher
          appelle la comparaison, et huit cases a cocher font une grille
          d achat B2B. Un numero, une promesse, une precision.
      */}
      <div className="mx-auto mb-6 max-w-md space-y-3.5">
        {c.gains.map((g, i) => (
          <motion.div
            key={g}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.3, ease: "easeOut" }}
            className="flex gap-3"
          >
            <span
              className="font-display mt-px shrink-0 text-[11px] font-bold tabular-nums"
              style={{ color: "var(--text-brand)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--text-heading)" }}>
                {g}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--text-body-subtle)" }}>
                {c.gains_sous[i]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mensuel / annuel — web uniquement, iOS affiche les prix du magasin */}
      {!ios && !PLAN_UNIQUE && (
        <div className="mb-4 flex justify-center">
          <div
            className="flex rounded-full p-1"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }}
          >
            {(["monthly", "annual"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setBilling(plan)}
                className="rounded-full px-5 py-2 text-[12px] font-semibold transition-all"
                style={{
                  // Paire de la regle 2. --accent-purple n est pas un fond de
                  // bouton : sous du blanc il vaut 4,46 en clair. --bg-brand
                  // est la meme couleur ramenee au-dessus du seuil.
                  background: billing === plan ? "var(--bg-brand)" : "transparent",
                  color: billing === plan ? "var(--text-on-brand)" : "var(--text-body-subtle)",
                }}
              >
                {plan === "monthly" ? c.mensuel : (
                  <span className="flex items-center gap-1.5">
                    {c.annuel}
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: "color-mix(in srgb, var(--text-succes) 18%, transparent)", color: "var(--text-succes)" }}
                    >
                      −{eco.pourcent} %
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* L economie, en euros, quand l annuel est choisi.

          Pas d animation de sortie, meme raison que le prix : une ligne qui
          sort en douceur est une ligne qui peut rester coincee. « 31,89 € de
          moins sur l annee » suspendue au-dessus d un tarif mensuel serait une
          affirmation fausse sur un ecran de paiement. Elle disparait net. */}
      {billing === "annual" && !ios && !PLAN_UNIQUE && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mb-4 text-center text-[12px] font-semibold"
          style={{ color: "var(--text-succes)" }}
        >
          {c.economie.replace("{x}", euros(eco.euros))}
        </motion.p>
      )}

      {/* ── L offre, seule ────────────────────────────────────────────────
          Une seule carte. La comparaison a deux colonnes transformait la
          decision « est-ce que j ouvre ma timeline » en decision « lequel des
          deux », et la colonne gratuite portait un bouton inerte « Ton plan
          actuel » a la meilleure place de l ecran.

          La matiere de la carte — l aplat de marque et son elevation — est
          celle d avant, inchangee.

          Les textes secondaires sont en --text-on-brand plein. La paire
          --bg-brand / --text-on-brand ne passe qu a 4,53 en clair : elle n a
          AUCUNE marge pour etre diluee. La hierarchie se fait par la taille et
          la graisse, jamais par l opacite.
      */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-md rounded-2xl p-5"
        style={{
          background: "var(--bg-brand)",
          boxShadow:
            "0 0 40px color-mix(in srgb, var(--accent-purple) 30%, transparent), 0 12px 28px rgba(0,0,0,0.18)",
        }}
      >
        {/* Le prix. Cache sur iOS : c est le magasin qui l annonce.

            AUCUN AnimatePresence ICI, ET C EST DELIBERE.

            Deux versions ont ete essayees et regardees a l ecran :

              popLayout — sort du flux l element qui s en va. Les deux blocs
                n ont pas la meme hauteur, donc le bloc sortant tombait HORS
                de la carte, par-dessus la phrase du gratuit, le lien de code
                et les mentions legales.

              wait — attend la fin de l animation de sortie avant de monter
                l entrant. Propre a l oeil, mais le PRIX AFFICHE se met alors
                a dependre d une animation : onglet en arriere-plan, vue
                native mise en veille, mouvement reduit — l animation ne
                s acheve pas et la carte continue d annoncer l ancien tarif
                alors que l autre est selectionne. Constate : basculer sur
                annuel laissait « 5,99 € par mois » a l ecran.

            Sur un ecran de paiement, un montant ne se negocie pas avec une
            animation. Une cle qui change remonte le bloc, il apparait en
            fondu, rien ne sort : le prix est juste des la premiere image,
            meme si plus rien ne bouge. */}
        {ios ? (
          <p className="text-[15px] font-semibold text-[color:var(--text-on-brand)]">
            {t("premium.trial_pitch", locale)}
          </p>
        ) : (
          <motion.div
            key={billing}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <p className="text-[28px] font-bold leading-none text-[color:var(--text-on-brand)]">
              {euros(billing === "monthly" ? PLANS.monthly.priceEUR : parMoisEnAnnuel)} €
              <span className="text-[12px] font-normal text-[color:var(--text-on-brand)]">
                {c.par_mois}
              </span>
            </p>
            {/* Prix, duree et renouvellement lisibles AVANT l achat. Apple
                l exige, le droit europeen aussi, et quelqu un qui s engage a
                le droit de savoir a quoi. */}
            <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--text-on-brand)]">
              {(billing === "monthly" ? c.engagement : c.engagement_an)
                .replace("{x}", euros(billing === "monthly" ? PLANS.monthly.priceEUR : PLANS.annual.priceEUR))}
            </p>
          </motion.div>
        )}

        {/* Le bouton */}
        {ios ? (
          offresIOS.length > 0 ? (
            // Un vrai bouton par offre, au prix que le MAGASIN annonce.
            // Avant, cette place portait un texte fixe — « Disponible dans la
            // version Pro de l app » — alors qu on est deja dans l app, sur
            // l ecran des prix. Une impasse qui n offrait rien.
            <div className="mt-4 space-y-2">
              {offresIOS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => void lancerAchat(o.id)}
                  disabled={achatEnCours}
                  className="w-full rounded-xl py-3 text-[13px] font-bold transition-opacity disabled:opacity-60"
                  style={{ background: "var(--text-on-brand)", color: "var(--bg-brand)" }}
                >
                  {achatEnCours ? "…" : o.prix}
                </button>
              ))}
            </div>
          ) : (
            // Tant que les produits ne sont pas crees dans App Store Connect
            // et declares dans RevenueCat, il n y a rien a vendre. On le dit
            // sans faire croire qu une action est possible.
            <p
              className="mt-4 w-full rounded-xl py-2.5 text-center text-[12px] font-semibold"
              style={{
                background: "color-mix(in srgb, var(--bg-brand) 18%, transparent)",
                color: "var(--text-brand)",
              }}
            >
              {c.ios_bloque}
            </p>
          )
        ) : (
          <button
            onClick={() => handleCheckout(billing)}
            disabled={loading}
            className="mt-4 w-full rounded-xl px-3 py-3 text-[13px] font-bold transition-opacity disabled:opacity-60"
            // La paire de marque prise a l envers : le bouton est pose sur
            // l aplat de la carte, pas sur le fond de page, donc ses deux
            // couleurs sont celles de la paire, echangees. Le rapport de
            // contraste ne depend pas du sens.
            style={{ background: "var(--text-on-brand)", color: "var(--bg-brand)" }}
          >
            {loading ? "..." : libelleBouton}
          </button>
        )}
      </motion.div>

      {/* ── Le gratuit ────────────────────────────────────────────────────
          Une phrase, sous l offre. Il etait une carte a egalite avec l offre
          payante, coiffee d un bouton inerte « Ton plan actuel » : on occupait
          le haut de la page pour rappeler a quelqu un ce qu il a deja.

          Il reste dit, parce que le taire ferait croire que tout se ferme.
      */}
      <p
        className="mx-auto mt-4 max-w-md text-center text-[11px] leading-relaxed"
        style={{ color: "var(--text-body-subtle)" }}
      >
        {c.gratuit}
      </p>

      {/* Erreur */}
      {error && (
        <p className="mt-4 text-center text-[12px] font-medium" style={{ color: "var(--text-erreur)" }}>
          {error}
        </p>
      )}

      {/* Code d acces */}
      <div className="mt-6 text-center">
        {!showCoupon && !couponSuccess && (
          <button
            type="button"
            onClick={() => setShowCoupon(true)}
            className="text-[12px] transition-opacity hover:opacity-70"
            style={{ color: "var(--text-body-subtle)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {c.code_lien}
          </button>
        )}

        <AnimatePresence>
          {showCoupon && !couponSuccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div className="mx-auto mt-3 max-w-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && tryCoupon()}
                    placeholder={c.code_champ}
                    autoFocus
                    className="flex-1 rounded-xl px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider outline-none"
                    style={{
                      background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
                      // Le code tape par la personne, sur une tuile de la meme
                      // couleur : c est la saisie elle-meme qui etait a 3,64.
                      color: "var(--text-brand)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={tryCoupon}
                    className="rounded-xl px-4 py-2.5 text-[12px] font-bold"
                    style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
                  >
                    {c.code_valider}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-[11px]" style={{ color: "var(--text-erreur)" }}>{couponError}</p>
                )}
              </div>
            </motion.div>
          )}

          {couponSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-[13px] font-semibold"
              style={{ color: "var(--text-brand)" }}
            >
              {c.code_ouvert}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Mentions legales europeennes — OBLIGATOIRES, web uniquement.
          Sur iOS c est Apple qui les porte dans sa propre feuille d achat. */}
      {!ios && (
        <div className="mx-auto mt-6 max-w-md space-y-1.5 text-center text-[10px] leading-relaxed" style={{ color: "var(--text-body-subtle)", opacity: 0.8 }}>
          {c.mentions.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      {/* Feuille de connexion */}
      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
