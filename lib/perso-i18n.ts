/**
 * Les mots d interface, groupes par concept, dans les dix langues.
 *
 * Au depart ceux de l ecran de personnalisation, puis ceux des ecrans qui en
 * avaient besoin — l ecran « aucune donnee » des rapports, par exemple.
 *
 * Pourquoi un fichier a part plutot qu un groupe de plus dans i18n-demo.ts :
 * la-bas, les dix versions d une meme phrase sont separees de huit cents
 * lignes. Personne ne compare jamais la ligne 172 et la ligne 1180, donc une
 * traduction fausse y reste invisible pour toujours. Ici, les dix versions d un
 * mot se lisent cote a cote : la mise en page fait le controle qualite.
 *
 * Ce que cet ecran demandait avant : « En transition », « Salarie », « C est
 * flou » — du francais servi aux dix langues, sur les questions les plus
 * intimes du produit (phase de vie, situation amoureuse, niveau de stress).
 *
 * Deux choix de vocabulaire, volontaires :
 *
 *   - « Amour » n est PAS « Couple ». La maison 7 et lib/domain-config.tsx
 *     disent « Couple » parce qu elles decrivent une configuration de theme.
 *     Ici on demande ce qui COMPTE pour la personne, et quelqu un de
 *     celibataire peut mettre l amour en priorite. Les deux mots designent
 *     deux choses, ils restent distincts.
 *   - « Logement » n est PAS « Foyer » (maison 4). L un est la question du toit,
 *     l autre celle de la famille et des racines.
 *
 * Partout ailleurs, le mot repris est celui de lib/maisons-i18n.ts — Argent,
 * Carriere, Creativite — pour qu un meme concept ne change pas de nom d un
 * ecran a l autre.
 *
 * L anglais du produit est americain (« personalize ») : donc « Stabilize ».
 */

import type { Locale } from "@/lib/i18n-demo";

type Traduction = Record<Locale, string>;

const MOTS: Record<string, Traduction> = {
  // ── Phase de vie ────────────────────────────────────────────────────────
  "phase.stable":         { fr:"Stable", en:"Stable", es:"Estable", de:"Stabil", it:"Stabile",
                            pt:"Estável", nl:"Stabiel", ja:"安定", zh:"稳定", ar:"مستقرّة" },
  "phase.transition":     { fr:"En transition", en:"In transition", es:"En transición", de:"Im Übergang", it:"In transizione",
                            pt:"Em transição", nl:"In overgang", ja:"過渡期", zh:"过渡期", ar:"مرحلة انتقال" },
  "phase.crisis":         { fr:"En crise", en:"In crisis", es:"En crisis", de:"In der Krise", it:"In crisi",
                            pt:"Em crise", nl:"In crisis", ja:"危機のなか", zh:"危机中", ar:"في أزمة" },
  "phase.reconstruction": { fr:"Reconstruction", en:"Rebuilding", es:"Reconstrucción", de:"Wiederaufbau", it:"Ricostruzione",
                            pt:"Reconstrução", nl:"Heropbouw", ja:"立て直し", zh:"重建", ar:"إعادة بناء" },
  "phase.expansion":      { fr:"Expansion", en:"Expansion", es:"Expansión", de:"Aufbruch", it:"Espansione",
                            pt:"Expansão", nl:"Expansie", ja:"拡大", zh:"扩展", ar:"توسّع" },

  // ── Situation professionnelle ───────────────────────────────────────────
  "travail.employee":          { fr:"Salarié", en:"Employed", es:"Empleado", de:"Angestellt", it:"Dipendente",
                                 pt:"Empregado", nl:"In loondienst", ja:"会社員", zh:"受雇", ar:"موظّف" },
  "travail.freelance":         { fr:"Freelance", en:"Freelance", es:"Autónomo", de:"Freiberuflich", it:"Freelance",
                                 pt:"Freelancer", nl:"Freelance", ja:"フリーランス", zh:"自由职业", ar:"عمل حر" },
  "travail.entrepreneur":      { fr:"Entrepreneur", en:"Founder", es:"Emprendedor", de:"Unternehmer", it:"Imprenditore",
                                 pt:"Empreendedor", nl:"Ondernemer", ja:"起業家", zh:"创业者", ar:"ريادة أعمال" },
  "travail.student":           { fr:"Étudiant", en:"Student", es:"Estudiante", de:"Studierend", it:"Studente",
                                 pt:"Estudante", nl:"Student", ja:"学生", zh:"学生", ar:"طالب" },
  "travail.job_seeking":       { fr:"En recherche", en:"Job seeking", es:"En búsqueda", de:"Auf Jobsuche", it:"In cerca",
                                 pt:"À procura", nl:"Werkzoekend", ja:"求職中", zh:"求职中", ar:"أبحث عن عمل" },
  "travail.career_transition": { fr:"En transition pro", en:"Career change", es:"Cambio profesional", de:"Berufswechsel", it:"Cambio carriera",
                                 pt:"Mudança de carreira", nl:"Loopbaanwissel", ja:"転職期", zh:"转行中", ar:"تغيير مهني" },

  // ── Situation relationnelle ─────────────────────────────────────────────
  "relation.single":          { fr:"Célibataire", en:"Single", es:"Soltero", de:"Single", it:"Single",
                                pt:"Solteiro", nl:"Alleenstaand", ja:"独身", zh:"单身", ar:"أعزب" },
  "relation.in_relationship": { fr:"En couple", en:"In a relationship", es:"En pareja", de:"In Beziehung", it:"In coppia",
                                pt:"Numa relação", nl:"In een relatie", ja:"パートナーあり", zh:"有伴侣", ar:"في علاقة" },
  "relation.unclear":         { fr:"C'est flou", en:"It's unclear", es:"Es confuso", de:"Unklar", it:"Non è chiaro",
                                pt:"É confuso", nl:"Onduidelijk", ja:"曖昧", zh:"说不清", ar:"غير واضح" },
  "relation.separation":      { fr:"Séparation", en:"Separating", es:"Separación", de:"Trennung", it:"Separazione",
                                pt:"Separação", nl:"Scheiding", ja:"別れの時期", zh:"分离中", ar:"انفصال" },
  "relation.other":           { fr:"Autre", en:"Other", es:"Otro", de:"Anderes", it:"Altro",
                                pt:"Outro", nl:"Anders", ja:"その他", zh:"其他", ar:"غير ذلك" },

  // ── Priorites ───────────────────────────────────────────────────────────
  "priorite.love":                 { fr:"Amour", en:"Love", es:"Amor", de:"Liebe", it:"Amore",
                                     pt:"Amor", nl:"Liefde", ja:"愛", zh:"爱情", ar:"الحب" },
  "priorite.career":               { fr:"Carrière", en:"Career", es:"Carrera", de:"Beruf", it:"Carriera",
                                     pt:"Carreira", nl:"Carrière", ja:"仕事", zh:"事业", ar:"المسار المهني" },
  "priorite.money":                { fr:"Argent", en:"Money", es:"Dinero", de:"Geld", it:"Denaro",
                                     pt:"Dinheiro", nl:"Geld", ja:"お金", zh:"金钱", ar:"المال" },
  "priorite.family":               { fr:"Famille", en:"Family", es:"Familia", de:"Familie", it:"Famiglia",
                                     pt:"Família", nl:"Familie", ja:"家族", zh:"家人", ar:"العائلة" },
  "priorite.health_energy":        { fr:"Santé & énergie", en:"Health & energy", es:"Salud y energía", de:"Gesundheit & Energie", it:"Salute ed energia",
                                     pt:"Saúde e energia", nl:"Gezondheid & energie", ja:"健康と体力", zh:"健康与精力", ar:"الصحة والطاقة" },
  "priorite.creativity":           { fr:"Créativité", en:"Creativity", es:"Creatividad", de:"Kreativität", it:"Creatività",
                                     pt:"Criatividade", nl:"Creativiteit", ja:"創造", zh:"创造", ar:"الإبداع" },
  "priorite.home":                 { fr:"Logement", en:"Housing", es:"Vivienda", de:"Wohnen", it:"Abitazione",
                                     pt:"Habitação", nl:"Woning", ja:"住まい", zh:"居所", ar:"السكن" },
  "priorite.friends_network":      { fr:"Amis & réseau", en:"Friends & network", es:"Amigos y red", de:"Freunde & Netzwerk", it:"Amici e rete",
                                     pt:"Amigos e rede", nl:"Vrienden & netwerk", ja:"友人と人脈", zh:"朋友与人脉", ar:"الأصدقاء والشبكة" },
  "priorite.meaning_spirituality": { fr:"Sens & spiritualité", en:"Meaning & spirituality", es:"Sentido y espiritualidad", de:"Sinn & Spiritualität", it:"Senso e spiritualità",
                                     pt:"Sentido e espiritualidade", nl:"Zin & spiritualiteit", ja:"意味と精神性", zh:"意义与灵性", ar:"المعنى والروحانية" },

  // ── Style de guidance : libelle puis description ────────────────────────
  "style.direct":           { fr:"Direct", en:"Direct", es:"Directo", de:"Direkt", it:"Diretto",
                              pt:"Direto", nl:"Direct", ja:"率直", zh:"直接", ar:"مباشر" },
  "style.direct.desc":      { fr:"Net et sans détour", en:"Clear and to the point", es:"Claro y sin rodeos", de:"Klar und ohne Umschweife", it:"Netto e senza giri di parole",
                              pt:"Claro e sem rodeios", nl:"Helder en zonder omwegen", ja:"はっきり、遠回しにしない", zh:"干脆，不绕弯", ar:"واضح وبلا مواربة" },
  "style.reassuring":       { fr:"Rassurant", en:"Reassuring", es:"Tranquilizador", de:"Beruhigend", it:"Rassicurante",
                              pt:"Tranquilizador", nl:"Geruststellend", ja:"安心感", zh:"安抚", ar:"مطمئن" },
  "style.reassuring.desc":  { fr:"Doux et contenant", en:"Gentle and steady", es:"Suave y contenedor", de:"Sanft und haltgebend", it:"Dolce e contenitivo",
                              pt:"Suave e acolhedor", nl:"Zacht en houvast gevend", ja:"穏やかで支えになる", zh:"温和而稳定", ar:"لطيف ومُسانِد" },
  "style.inspiring":        { fr:"Inspirant", en:"Inspiring", es:"Inspirador", de:"Inspirierend", it:"Ispirante",
                              pt:"Inspirador", nl:"Inspirerend", ja:"高める", zh:"激励", ar:"مُلهِم" },
  "style.inspiring.desc":   { fr:"Mobilisateur et visionnaire", en:"Energizing and forward-looking", es:"Movilizador y visionario", de:"Mitreißend und vorausschauend", it:"Mobilitante e visionario",
                              pt:"Mobilizador e visionário", nl:"Meeslepend en vooruitkijkend", ja:"前を向かせる", zh:"鼓舞并着眼未来", ar:"محفّز وبعيد النظر" },
  "style.pragmatic":        { fr:"Pragmatique", en:"Pragmatic", es:"Pragmático", de:"Pragmatisch", it:"Pragmatico",
                              pt:"Pragmático", nl:"Pragmatisch", ja:"実践的", zh:"务实", ar:"عملي" },
  "style.pragmatic.desc":   { fr:"Concret et actionnable", en:"Concrete and actionable", es:"Concreto y accionable", de:"Konkret und umsetzbar", it:"Concreto e attuabile",
                              pt:"Concreto e acionável", nl:"Concreet en uitvoerbaar", ja:"具体的で実行できる", zh:"具体可执行", ar:"ملموس وقابل للتنفيذ" },

  // ── Niveau de stress ────────────────────────────────────────────────────
  "stress.low":    { fr:"Calme", en:"Calm", es:"Tranquilo", de:"Ruhig", it:"Calmo",
                     pt:"Calmo", nl:"Rustig", ja:"落ち着いている", zh:"平静", ar:"هادئ" },
  "stress.medium": { fr:"Modéré", en:"Moderate", es:"Moderado", de:"Mittel", it:"Moderato",
                     pt:"Moderado", nl:"Gemiddeld", ja:"ふつう", zh:"中等", ar:"متوسط" },
  "stress.high":   { fr:"Élevé", en:"High", es:"Alto", de:"Hoch", it:"Alto",
                     pt:"Alto", nl:"Hoog", ja:"高い", zh:"偏高", ar:"مرتفع" },

  // ── Objectif du moment ──────────────────────────────────────────────────
  "objectif.stabilize": { fr:"Stabiliser", en:"Stabilize", es:"Estabilizar", de:"Stabilisieren", it:"Stabilizzare",
                          pt:"Estabilizar", nl:"Stabiliseren", ja:"安定させる", zh:"稳住", ar:"الاستقرار" },
  "objectif.clarify":   { fr:"Clarifier", en:"Clarify", es:"Clarificar", de:"Klären", it:"Chiarire",
                          pt:"Clarificar", nl:"Verhelderen", ja:"はっきりさせる", zh:"理清", ar:"التوضيح" },
  "objectif.advance":   { fr:"Avancer", en:"Move forward", es:"Avanzar", de:"Vorankommen", it:"Avanzare",
                          pt:"Avançar", nl:"Vooruit", ja:"前に進む", zh:"前进", ar:"التقدّم" },
  "objectif.protect":   { fr:"Protéger", en:"Protect", es:"Proteger", de:"Schützen", it:"Proteggere",
                          pt:"Proteger", nl:"Beschermen", ja:"守る", zh:"守护", ar:"الحماية" },
  "objectif.change":    { fr:"Changer", en:"Change", es:"Cambiar", de:"Verändern", it:"Cambiare",
                          pt:"Mudar", nl:"Veranderen", ja:"変える", zh:"改变", ar:"التغيير" },

  // ── Intitules des groupes de champs ─────────────────────────────────────
  "groupe.phase":     { fr:"Phase de vie", en:"Life phase", es:"Fase de vida", de:"Lebensphase", it:"Fase di vita",
                        pt:"Fase de vida", nl:"Levensfase", ja:"人生の局面", zh:"人生阶段", ar:"مرحلة الحياة" },
  "groupe.travail":   { fr:"Situation pro", en:"Work situation", es:"Situación laboral", de:"Berufliche Situation", it:"Situazione lavorativa",
                        pt:"Situação profissional", nl:"Werksituatie", ja:"仕事の状況", zh:"工作状况", ar:"الوضع المهني" },
  "groupe.relation":  { fr:"Situation relationnelle", en:"Relationship status", es:"Situación sentimental", de:"Beziehungsstatus", it:"Situazione sentimentale",
                        pt:"Situação afetiva", nl:"Relatiestatus", ja:"パートナーの状況", zh:"感情状况", ar:"الحالة العاطفية" },
  "groupe.priorites": { fr:"Tes priorités", en:"Your priorities", es:"Tus prioridades", de:"Deine Prioritäten", it:"Le tue priorità",
                        pt:"As tuas prioridades", nl:"Je prioriteiten", ja:"大切にしたいこと", zh:"你的优先事项", ar:"أولوياتك" },
  "groupe.style":     { fr:"Style", en:"Style", es:"Estilo", de:"Stil", it:"Stile",
                        pt:"Estilo", nl:"Stijl", ja:"伝え方", zh:"风格", ar:"الأسلوب" },
  "groupe.stress":    { fr:"Stress actuel", en:"Current stress", es:"Estrés actual", de:"Aktueller Stress", it:"Stress attuale",
                        pt:"Stress atual", nl:"Huidige stress", ja:"いまの負担", zh:"当前压力", ar:"التوتر الحالي" },
  "groupe.objectif":  { fr:"Objectif actuel", en:"Current goal", es:"Objetivo actual", de:"Aktuelles Ziel", it:"Obiettivo attuale",
                        pt:"Objetivo atual", nl:"Huidig doel", ja:"いまの目標", zh:"当前目标", ar:"الهدف الحالي" },
  "champ.libre":      { fr:"Ou en quelques mots...", en:"Or in a few words...", es:"O en pocas palabras...", de:"Oder in wenigen Worten...", it:"O in poche parole...",
                        pt:"Ou em poucas palavras...", nl:"Of in een paar woorden...", ja:"または、ひとことで...", zh:"或用几个字说...", ar:"أو بكلمات قليلة..." },

  // ── Titres, sous-titres et boutons ──────────────────────────────────────
  "ecran1.titre":  { fr:"Personnalise tes interprétations", en:"Personalize your readings", es:"Personaliza tus lecturas", de:"Deine Deutungen anpassen", it:"Personalizza le tue letture",
                     pt:"Personaliza as tuas leituras", nl:"Personaliseer je duidingen", ja:"読み解きを自分に合わせる", zh:"让解读贴近你", ar:"خصّص قراءاتك" },
  "ecran1.sous":   { fr:"Pour que les insights correspondent à ta vie.", en:"So the readings match your actual life.", es:"Para que las lecturas encajen con tu vida.", de:"Damit die Deutungen zu deinem Leben passen.", it:"Perché le letture corrispondano alla tua vita.",
                     pt:"Para que as leituras correspondam à tua vida.", nl:"Zodat de duidingen bij je leven passen.", ja:"実際のあなたの生活に合うように。", zh:"让解读贴合你的真实生活。", ar:"لكي تناسب القراءات حياتك فعلاً." },
  "ecran2.titre":  { fr:"Comment tu veux être guidé", en:"How you want to be guided", es:"Cómo quieres que te guiemos", de:"Wie du begleitet werden willst", it:"Come vuoi essere guidato",
                     pt:"Como queres ser guiado", nl:"Hoe je begeleid wilt worden", ja:"どう伝えてほしいか", zh:"你希望被如何引导", ar:"كيف تريد أن نرشدك" },
  "ecran2.sous":   { fr:"On adapte le ton à ta façon de recevoir les messages.", en:"We match the tone to how you take things in.", es:"Adaptamos el tono a cómo recibes los mensajes.", de:"Wir passen den Ton daran an, wie du Dinge aufnimmst.", it:"Adattiamo il tono al modo in cui ricevi i messaggi.",
                     pt:"Adaptamos o tom à forma como recebes as mensagens.", nl:"We stemmen de toon af op hoe jij dingen opneemt.", ja:"受け取りやすい伝え方に合わせます。", zh:"我们会按你接收信息的方式调整语气。", ar:"نُكيّف النبرة مع طريقتك في تلقّي الرسائل." },
  "bouton.suivant":{ fr:"Suivant", en:"Next", es:"Siguiente", de:"Weiter", it:"Avanti",
                     pt:"Seguinte", nl:"Volgende", ja:"次へ", zh:"下一步", ar:"التالي" },
  "bouton.partir": { fr:"C'est parti", en:"Let's go", es:"Vamos", de:"Los geht's", it:"Si parte",
                     pt:"Vamos lá", nl:"We gaan", ja:"はじめる", zh:"开始吧", ar:"لنبدأ" },

  // ── Ecran « aucune donnee » des rapports ────────────────────────────────
  "vide.titre":  { fr:"Aucune donnée trouvée", en:"No data found", es:"No se encontraron datos", de:"Keine Daten gefunden", it:"Nessun dato trovato",
                   pt:"Nenhum dado encontrado", nl:"Geen gegevens gevonden", ja:"データが見つかりません", zh:"未找到数据", ar:"لا توجد بيانات" },
  "vide.sous":   { fr:"Génère ton {x} depuis le site.", en:"Generate your {x} from the website.", es:"Genera tu {x} desde el sitio.", de:"Erstelle dein {x} auf der Website.", it:"Genera il tuo {x} dal sito.",
                   pt:"Gera o teu {x} a partir do site.", nl:"Genereer je {x} via de website.", ja:"{x} はサイトから作成できます。", zh:"请在网站上生成你的 {x}。", ar:"أنشئ {x} من الموقع." },
  "vide.retour": { fr:"Retour à Favorable", en:"Back to Favorable", es:"Volver a Favorable", de:"Zurück zu Favorable", it:"Torna a Favorable",
                   pt:"Voltar ao Favorable", nl:"Terug naar Favorable", ja:"Favorable に戻る", zh:"返回 Favorable", ar:"العودة إلى Favorable" },

  // ── Codes d acces ───────────────────────────────────────────────────────
  "code.inconnu": { fr:"Ce code n'est pas reconnu.", en:"This code isn't recognized.", es:"Este código no se reconoce.", de:"Dieser Code wird nicht erkannt.", it:"Questo codice non è riconosciuto.",
                    pt:"Este código não é reconhecido.", nl:"Deze code wordt niet herkend.", ja:"このコードは認識できません。", zh:"无法识别此代码。", ar:"هذا الرمز غير معروف." },
  "code.inactif": { fr:"Les codes d'accès ne sont pas actifs pour le moment. Ce n'est pas toi.", en:"Access codes aren't active right now. It's not you.", es:"Los códigos de acceso no están activos ahora. No es culpa tuya.", de:"Zugangscodes sind derzeit nicht aktiv. Es liegt nicht an dir.", it:"I codici di accesso non sono attivi al momento. Non dipende da te.",
                    pt:"Os códigos de acesso não estão ativos de momento. Não és tu.", nl:"Toegangscodes zijn nu niet actief. Het ligt niet aan jou.", ja:"アクセスコードは現在有効ではありません。あなたのせいではありません。", zh:"访问代码当前未启用。不是你的问题。", ar:"رموز الدخول غير مفعّلة حالياً. الأمر ليس منك." },
};

/**
 * Le mot dans la langue demandee. Retombe sur l anglais si la traduction manque
 * pour une langue : un mot dans la mauvaise langue reste un mot.
 *
 * Une cle INCONNUE, elle, renverrait « phase.stbale » dans une liste de choix —
 * un echec qui ressemble a un fonctionnement. On ne peut pas l attraper ici a
 * l execution sans casser l ecran, donc c est scripts/verifier-traductions.mjs
 * qui verifie, a la compilation, que chaque cle appelee dans le code existe
 * bien dans MOTS. Cette fonction fait confiance a ce controle.
 */
export function perso(cle: string, locale: Locale): string {
  const m = MOTS[cle];
  if (!m) return cle;
  return m[locale] || m.en;
}

/** Ce que le verificateur de traductions compte. */
export const CLES_PERSO = Object.keys(MOTS);
