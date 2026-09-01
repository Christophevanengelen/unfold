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

  // ── Saisie du lieu de naissance ─────────────────────────────────────────
  "lieu.recherche": { fr:"Recherche…", en:"Searching…", es:"Buscando…", de:"Suche…", it:"Ricerca…",
                      pt:"A procurar…", nl:"Zoeken…", ja:"検索中…", zh:"搜索中…", ar:"جارٍ البحث…" },
  "lieu.aucune":    { fr:"Aucune ville trouvée. Vérifie l'orthographe.", en:"No city found. Check the spelling.", es:"Ciudad no encontrada. Revisa la ortografía.", de:"Keine Stadt gefunden. Prüfe die Schreibweise.", it:"Nessuna città trovata. Controlla l'ortografia.",
                      pt:"Cidade não encontrada. Verifica a ortografia.", nl:"Geen stad gevonden. Controleer de spelling.", ja:"都市が見つかりません。つづりをご確認ください。", zh:"未找到城市。请检查拼写。", ar:"لم يتم العثور على مدينة. تحقّق من الإملاء." },
  "lieu.echec":     { fr:"Connexion indisponible. Réessaie.", en:"Connection unavailable. Try again.", es:"Conexión no disponible. Inténtalo de nuevo.", de:"Keine Verbindung. Versuch es erneut.", it:"Connessione non disponibile. Riprova.",
                      pt:"Ligação indisponível. Tenta de novo.", nl:"Geen verbinding. Probeer opnieuw.", ja:"接続できません。もう一度お試しください。", zh:"连接不可用。请重试。", ar:"الاتصال غير متاح. حاول مجدداً." },
  "lieu.confirme":  { fr:"Lieu confirmé", en:"Place confirmed", es:"Lugar confirmado", de:"Ort bestätigt", it:"Luogo confermato",
                      pt:"Local confirmado", nl:"Plaats bevestigd", ja:"場所を確認しました", zh:"地点已确认", ar:"تم تأكيد المكان" },

  // ── Balayage du moteur, pendant la preparation ──────────────────────────
  "scan.pluton":     { fr:"Cycles profonds de Pluton", en:"Pluto deep cycles", es:"Ciclos profundos de Plutón", de:"Tiefe Pluto-Zyklen", it:"Cicli profondi di Plutone",
                       pt:"Ciclos profundos de Plutão", nl:"Diepe Pluto-cycli", ja:"冥王星の深い周期", zh:"冥王星深层周期", ar:"دورات بلوتو العميقة" },
  "scan.pluton.d":   { fr:"périodes de transformation", en:"transformation periods", es:"periodos de transformación", de:"Phasen der Wandlung", it:"periodi di trasformazione",
                       pt:"períodos de transformação", nl:"transformatieperioden", ja:"変容の時期", zh:"转变时期", ar:"فترات التحوّل" },
  "scan.neptune":    { fr:"Phases de dissolution de Neptune", en:"Neptune dissolve phases", es:"Fases de disolución de Neptuno", de:"Neptuns Auflösungsphasen", it:"Fasi di dissoluzione di Nettuno",
                       pt:"Fases de dissolução de Neptuno", nl:"Neptunus' oplossende fasen", ja:"海王星の溶解期", zh:"海王星消融阶段", ar:"مراحل الذوبان لنبتون" },
  "scan.neptune.d":  { fr:"fenêtres d'intuition", en:"intuition windows", es:"ventanas de intuición", de:"Fenster der Intuition", it:"finestre di intuizione",
                       pt:"janelas de intuição", nl:"intuïtievensters", ja:"直感が開く時", zh:"直觉窗口", ar:"نوافذ الحدس" },
  "scan.uranus":     { fr:"Percées d'Uranus", en:"Uranus breakthrough", es:"Rupturas de Urano", de:"Uranus-Durchbrüche", it:"Svolte di Urano",
                       pt:"Ruturas de Urano", nl:"Uranus-doorbraken", ja:"天王星の突破", zh:"天王星突破", ar:"اختراقات أورانوس" },
  "scan.uranus.d":   { fr:"moments de libération", en:"liberation moments", es:"momentos de liberación", de:"Momente der Befreiung", it:"momenti di liberazione",
                       pt:"momentos de libertação", nl:"bevrijdende momenten", ja:"解放の瞬間", zh:"解放时刻", ar:"لحظات التحرّر" },
  "scan.saturne":    { fr:"Épreuves de structure de Saturne", en:"Saturn structure tests", es:"Pruebas de estructura de Saturno", de:"Saturns Strukturproben", it:"Prove di struttura di Saturno",
                       pt:"Provas de estrutura de Saturno", nl:"Saturnus' structuurtests", ja:"土星の構造テスト", zh:"土星结构考验", ar:"اختبارات البنية لزحل" },
  "scan.saturne.d":  { fr:"jalons de maturité", en:"maturity checkpoints", es:"hitos de madurez", de:"Reifepunkte", it:"tappe di maturità",
                       pt:"marcos de maturidade", nl:"rijpingsmomenten", ja:"成熟の節目", zh:"成熟节点", ar:"محطات النضج" },
  "scan.jupiter":    { fr:"Portes d'expansion de Jupiter", en:"Jupiter expansion gates", es:"Puertas de expansión de Júpiter", de:"Jupiters Tore der Ausdehnung", it:"Porte di espansione di Giove",
                       pt:"Portas de expansão de Júpiter", nl:"Jupiters expansiepoorten", ja:"木星の拡大の扉", zh:"木星扩展之门", ar:"بوابات التوسّع للمشتري" },
  "scan.jupiter.d":  { fr:"occasions de croissance", en:"growth opportunities", es:"oportunidades de crecimiento", de:"Wachstumschancen", it:"occasioni di crescita",
                       pt:"oportunidades de crescimento", nl:"groeikansen", ja:"成長の機会", zh:"成长机会", ar:"فرص النمو" },
  "scan.eclipse":    { fr:"Séries d'éclipses", en:"Eclipse axis series", es:"Series de eclipses", de:"Finsternis-Serien", it:"Serie di eclissi",
                       pt:"Séries de eclipses", nl:"Eclipsreeksen", ja:"食のシリーズ", zh:"食相系列", ar:"سلاسل الخسوف" },
  "scan.eclipse.d":  { fr:"points de bascule", en:"turning points", es:"puntos de inflexión", de:"Wendepunkte", it:"punti di svolta",
                       pt:"pontos de viragem", nl:"kantelpunten", ja:"転換点", zh:"转折点", ar:"نقاط التحوّل" },
  "scan.zr":         { fr:"Pics de zodiacal releasing", en:"Zodiacal releasing peaks", es:"Picos de zodiacal releasing", de:"Höhepunkte des Zodiacal Releasing", it:"Picchi di zodiacal releasing",
                       pt:"Picos de zodiacal releasing", nl:"Pieken van zodiacal releasing", ja:"ゾディアカル・リリーシングの頂点", zh:"黄道释放高峰", ar:"ذروات الإطلاق البروجي" },
  "scan.zr.d":       { fr:"marqueurs de chapitre de vie", en:"life chapter markers", es:"marcadores de capítulo de vida", de:"Marker für Lebenskapitel", it:"segnalibri dei capitoli di vita",
                       pt:"marcadores de capítulo de vida", nl:"markeringen van levenshoofdstukken", ja:"人生の章の目印", zh:"人生篇章标记", ar:"علامات فصول الحياة" },
  "scan.retro":      { fr:"Stations rétrogrades", en:"Station retrogrades", es:"Estaciones retrógradas", de:"Rückläufige Stationen", it:"Stazioni retrograde",
                       pt:"Estações retrógradas", nl:"Retrograde stations", ja:"逆行のステーション", zh:"逆行留点", ar:"محطات التراجع" },
  "scan.retro.d":    { fr:"périodes de révision", en:"revision periods", es:"periodos de revisión", de:"Phasen der Revision", it:"periodi di revisione",
                       pt:"períodos de revisão", nl:"herzieningsperioden", ja:"見直しの時期", zh:"复盘时期", ar:"فترات المراجعة" },
  "scan.converge":   { fr:"Convergences de cycles", en:"Cycle convergences", es:"Convergencias de ciclos", de:"Zyklus-Konvergenzen", it:"Convergenze di cicli",
                       pt:"Convergências de ciclos", nl:"Cyclusconvergenties", ja:"周期の重なり", zh:"周期交汇", ar:"تقاطعات الدورات" },
  "prep.cta":        { fr:"Voir mon signal", en:"See my signal", es:"Ver mi señal", de:"Mein Signal ansehen", it:"Vedi il mio segnale",
                       pt:"Ver o meu sinal", nl:"Bekijk mijn signaal", ja:"シグナルを見る", zh:"查看我的信号", ar:"عرض إشارتي" },
  "scan.converge.d": { fr:"fenêtres d'intensité maximale", en:"peak intensity windows", es:"ventanas de máxima intensidad", de:"Fenster höchster Intensität", it:"finestre di massima intensità",
                       pt:"janelas de intensidade máxima", nl:"vensters van piekintensiteit", ja:"強度が最も高まる時", zh:"强度峰值窗口", ar:"نوافذ الذروة" },

  // ── Proposition d activer les notifications ─────────────────────────────
  "notif.titre":   { fr:"Te prévenir quand une période s'ouvre ?", en:"Want a heads-up when a period opens?", es:"¿Te avisamos cuando se abra un periodo?", de:"Sollen wir dich melden, wenn eine Phase beginnt?", it:"Vuoi un avviso quando si apre un periodo?",
                     pt:"Queres ser avisado quando um período abrir?", nl:"Een seintje als er een periode begint?", ja:"時期の始まりをお知らせしますか？", zh:"周期开始时要提醒你吗？", ar:"هل نُنبّهك عند بدء فترة؟" },
  "notif.corps":   { fr:"Une alerte à l'entrée et à la sortie de chaque période, avec sa durée, son domaine et son intensité. Une par semaine au maximum, jamais avant 8 h ni après 21 h.", en:"One alert when a period starts and ends, with its length, its area of life and its intensity. Once a week at most, never before 8am or after 9pm.", es:"Un aviso al empezar y al terminar cada periodo, con su duración, su ámbito y su intensidad. Una vez por semana como máximo, nunca antes de las 8 ni después de las 21.", de:"Eine Meldung zu Beginn und Ende jeder Phase, mit Dauer, Lebensbereich und Intensität. Höchstens einmal pro Woche, nie vor 8 und nie nach 21 Uhr.", it:"Un avviso all'inizio e alla fine di ogni periodo, con durata, ambito e intensità. Al massimo una volta a settimana, mai prima delle 8 né dopo le 21.",
                     pt:"Um aviso no início e no fim de cada período, com a duração, a área e a intensidade. No máximo uma vez por semana, nunca antes das 8h nem depois das 21h.", nl:"Eén melding bij het begin en einde van elke periode, met duur, levensgebied en intensiteit. Hooguit één keer per week, nooit voor 8 of na 21 uur.", ja:"時期の始まりと終わりに一度ずつ、期間・分野・強さをお知らせします。週に最大1回、8時前と21時以降は送りません。", zh:"每个周期开始和结束时各提醒一次，附上时长、领域与强度。每周最多一次，不会在早8点前或晚9点后发送。", ar:"تنبيه عند بداية كل فترة ونهايتها، مع مدتها ومجالها وشدّتها. مرة واحدة أسبوعياً كحد أقصى، ولا شيء قبل الثامنة صباحاً أو بعد التاسعة مساءً." },
  "notif.oui":     { fr:"Me prévenir", en:"Notify me", es:"Avisarme", de:"Benachrichtige mich", it:"Avvisami",
                     pt:"Avisar-me", nl:"Waarschuw me", ja:"知らせてもらう", zh:"提醒我", ar:"نبّهني" },
  "notif.plus_tard": { fr:"Pas maintenant", en:"Not now", es:"Ahora no", de:"Jetzt nicht", it:"Non ora",
                     pt:"Agora não", nl:"Niet nu", ja:"あとで", zh:"暂不", ar:"ليس الآن" },
  "notif.reglages": { fr:"Tu pourras changer d'avis dans ton profil.", en:"You can change your mind in your profile.", es:"Puedes cambiar de opinión en tu perfil.", de:"Du kannst es jederzeit im Profil ändern.", it:"Puoi cambiare idea nel tuo profilo.",
                     pt:"Podes mudar de ideias no teu perfil.", nl:"Je kunt dit altijd in je profiel wijzigen.", ja:"あとからプロフィールで変更できます。", zh:"你可以随时在个人资料中更改。", ar:"يمكنك تغيير رأيك من ملفك الشخصي." },

  // ── Edition des donnees de naissance, depuis le profil ──────────────────
  "edit.titre":  { fr:"Tes données de naissance", en:"Your birth details", es:"Tus datos de nacimiento", de:"Deine Geburtsdaten", it:"I tuoi dati di nascita",
                   pt:"Os teus dados de nascimento", nl:"Je geboortegegevens", ja:"出生情報", zh:"你的出生信息", ar:"بيانات ميلادك" },
  "edit.sous":   { fr:"Toute correction relance le calcul de ta timeline.", en:"Any change recomputes your timeline.", es:"Cualquier cambio recalcula tu línea de tiempo.", de:"Jede Änderung berechnet deine Timeline neu.", it:"Ogni modifica ricalcola la tua timeline.",
                   pt:"Qualquer alteração recalcula a tua timeline.", nl:"Elke wijziging herberekent je tijdlijn.", ja:"変更するとタイムラインを計算し直します。", zh:"任何修改都会重新计算你的时间线。", ar:"أي تعديل يعيد حساب مسارك الزمني." },
  "edit.cta":    { fr:"Enregistrer", en:"Save", es:"Guardar", de:"Speichern", it:"Salva",
                   pt:"Guardar", nl:"Opslaan", ja:"保存", zh:"保存", ar:"حفظ" },
  // ── Compatibilite : tout un domaine du produit servi en francais seul ────
  "compat.chargement":   { fr:"Chargement", en:"Loading", es:"Cargando", de:"Wird geladen", it:"Caricamento", pt:"A carregar", nl:"Laden", ja:"読み込み中", zh:"加载中", ar:"جارٍ التحميل" },
  "compat.nouveau_nom":  { fr:"Nouveau nom", en:"New name", es:"Nuevo nombre", de:"Neuer Name", it:"Nuovo nome", pt:"Novo nome", nl:"Nieuwe naam", ja:"新しい名前", zh:"新名称", ar:"اسم جديد" },
  "compat.annuler":      { fr:"Annuler", en:"Cancel", es:"Cancelar", de:"Abbrechen", it:"Annulla", pt:"Cancelar", nl:"Annuleren", ja:"キャンセル", zh:"取消", ar:"إلغاء" },
  "compat.enregistrer":  { fr:"Enregistrer", en:"Save", es:"Guardar", de:"Speichern", it:"Salva", pt:"Guardar", nl:"Opslaan", ja:"保存", zh:"保存", ar:"حفظ" },
  "compat.type_relation":{ fr:"Type de relation", en:"Relationship type", es:"Tipo de relación", de:"Art der Beziehung", it:"Tipo di relazione", pt:"Tipo de relação", nl:"Soort relatie", ja:"関係の種類", zh:"关系类型", ar:"نوع العلاقة" },
  "compat.retour":       { fr:"Retour", en:"Back", es:"Volver", de:"Zurück", it:"Indietro", pt:"Voltar", nl:"Terug", ja:"戻る", zh:"返回", ar:"رجوع" },
  "compat.irreversible": { fr:"Le rapport ne sera plus visible. Action irréversible.", en:"The report will no longer be visible. This cannot be undone.", es:"El informe dejará de estar visible. Acción irreversible.", de:"Der Bericht ist danach nicht mehr sichtbar. Nicht rückgängig zu machen.", it:"Il rapporto non sarà più visibile. Azione irreversibile.", pt:"O relatório deixará de estar visível. Ação irreversível.", nl:"Het rapport is daarna niet meer zichtbaar. Onomkeerbaar.", ja:"レポートは表示されなくなります。取り消せません。", zh:"报告将不再可见。此操作无法撤销。", ar:"لن يعود التقرير مرئياً. لا يمكن التراجع." },
  "compat.renommer":     { fr:"Renommer", en:"Rename", es:"Renombrar", de:"Umbenennen", it:"Rinomina", pt:"Renomear", nl:"Hernoemen", ja:"名前を変更", zh:"重命名", ar:"إعادة تسمية" },
  "compat.modifier_rel": { fr:"Modifier la relation", en:"Change relationship", es:"Cambiar la relación", de:"Beziehung ändern", it:"Modifica la relazione", pt:"Alterar a relação", nl:"Relatie wijzigen", ja:"関係を変更", zh:"修改关系", ar:"تعديل العلاقة" },
  "compat.partager_rap": { fr:"Partager le rapport", en:"Share the report", es:"Compartir el informe", de:"Bericht teilen", it:"Condividi il rapporto", pt:"Partilhar o relatório", nl:"Rapport delen", ja:"レポートを共有", zh:"分享报告", ar:"مشاركة التقرير" },
  "compat.supprimer":    { fr:"Supprimer la connexion", en:"Remove the connection", es:"Eliminar la conexión", de:"Verbindung entfernen", it:"Elimina la connessione", pt:"Remover a ligação", nl:"Verbinding verwijderen", ja:"つながりを削除", zh:"删除连接", ar:"حذف الاتصال" },
  "compat.inviter":      { fr:"Inviter", en:"Invite", es:"Invitar", de:"Einladen", it:"Invita", pt:"Convidar", nl:"Uitnodigen", ja:"招待", zh:"邀请", ar:"دعوة" },
  "compat.introuvable":  { fr:"Connexion introuvable", en:"Connection not found", es:"Conexión no encontrada", de:"Verbindung nicht gefunden", it:"Connessione non trovata", pt:"Ligação não encontrada", nl:"Verbinding niet gevonden", ja:"つながりが見つかりません", zh:"未找到连接", ar:"لم يتم العثور على الاتصال" },
  "compat.partiel":      { fr:"Signal partiel — certaines données sont en cache", en:"Partial signal — some data is cached", es:"Señal parcial — algunos datos están en caché", de:"Teilsignal — einige Daten stammen aus dem Cache", it:"Segnale parziale — alcuni dati sono in cache", pt:"Sinal parcial — alguns dados estão em cache", nl:"Gedeeltelijk signaal — sommige gegevens komen uit de cache", ja:"部分的なシグナル — 一部はキャッシュです", zh:"信号不完整 — 部分数据来自缓存", ar:"إشارة جزئية — بعض البيانات مخزّنة مؤقتاً" },
  "compat.actif":        { fr:"Actif maintenant", en:"Active now", es:"Activo ahora", de:"Jetzt aktiv", it:"Attivo ora", pt:"Ativo agora", nl:"Nu actief", ja:"いま活発", zh:"当前活跃", ar:"نشِط الآن" },
  "compat.bientot":      { fr:"Bientôt", en:"Soon", es:"Pronto", de:"Bald", it:"Presto", pt:"Em breve", nl:"Binnenkort", ja:"まもなく", zh:"即将", ar:"قريباً" },
  "compat.calme":        { fr:"Calme", en:"Quiet", es:"Tranquilo", de:"Ruhig", it:"Calmo", pt:"Calmo", nl:"Rustig", ja:"静か", zh:"平静", ar:"هادئ" },
  "compat.calme_mois":   { fr:"Calme ce mois", en:"Quiet this month", es:"Tranquilo este mes", de:"Ruhig diesen Monat", it:"Calmo questo mese", pt:"Calmo este mês", nl:"Rustig deze maand", ja:"今月は静か", zh:"本月平静", ar:"هادئ هذا الشهر" },
  "compat.vous":         { fr:"Vous", en:"You", es:"Tú", de:"Du", it:"Tu", pt:"Tu", nl:"Jij", ja:"あなた", zh:"你", ar:"أنت" },
  "compat.ensemble":     { fr:"À faire ensemble", en:"To do together", es:"Para hacer juntos", de:"Gemeinsam zu tun", it:"Da fare insieme", pt:"Para fazer juntos", nl:"Samen te doen", ja:"一緒にすること", zh:"一起做的事", ar:"لتفعلاه معاً" },
  "compat.invitez":      { fr:"Invitez quelqu'un pour commencer", en:"Invite someone to get started", es:"Invita a alguien para empezar", de:"Lade jemanden ein, um zu starten", it:"Invita qualcuno per iniziare", pt:"Convida alguém para começar", nl:"Nodig iemand uit om te beginnen", ja:"誰かを招待して始めましょう", zh:"邀请一个人开始", ar:"ادعُ شخصاً للبدء" },
  "compat.connecter":    { fr:"Connecter", en:"Connect", es:"Conectar", de:"Verbinden", it:"Connetti", pt:"Ligar", nl:"Verbinden", ja:"つなぐ", zh:"连接", ar:"اتصال" },
  "compat.suppression": { fr:"Suppression…", en:"Deleting…", es:"Eliminando…", de:"Wird gelöscht…", it:"Eliminazione…", pt:"A eliminar…", nl:"Verwijderen…", ja:"削除中…", zh:"删除中…", ar:"جارٍ الحذف…" },
  "compat.maintiens":    { fr:"Maintiens pour confirmer", en:"Hold to confirm", es:"Mantén para confirmar", de:"Halten zum Bestätigen", it:"Tieni premuto per confermare", pt:"Mantém para confirmar", nl:"Houd vast om te bevestigen", ja:"長押しで確定", zh:"长按确认", ar:"اضغط مطولاً للتأكيد" },
  "compat.maintenir":    { fr:"Maintenir pour supprimer", en:"Hold to delete", es:"Mantén para eliminar", de:"Halten zum Löschen", it:"Tieni premuto per eliminare", pt:"Mantém para eliminar", nl:"Houd vast om te verwijderen", ja:"長押しで削除", zh:"长按删除", ar:"اضغط مطولاً للحذف" },
  "compat.partager_code":{ fr:"Partager votre code", en:"Share your code", es:"Comparte tu código", de:"Teile deinen Code", it:"Condividi il tuo codice", pt:"Partilha o teu código", nl:"Deel je code", ja:"コードを共有", zh:"分享你的代码", ar:"شارك رمزك" },
  "compat.entrez_code":  { fr:"Entrez leur code", en:"Enter their code", es:"Introduce su código", de:"Gib ihren Code ein", it:"Inserisci il loro codice", pt:"Introduz o código deles", nl:"Voer hun code in", ja:"相手のコードを入力", zh:"输入对方的代码", ar:"أدخل رمزهم" },
  "compat.invitez_comparer": { fr:"Invitez quelqu'un à comparer vos rythmes", en:"Invite someone to compare your rhythms", es:"Invita a alguien a comparar vuestros ritmos", de:"Lade jemanden ein, eure Rhythmen zu vergleichen", it:"Invita qualcuno a confrontare i vostri ritmi", pt:"Convida alguém para comparar os vossos ritmos", nl:"Nodig iemand uit om jullie ritmes te vergelijken", ja:"リズムを比べる相手を招待", zh:"邀请他人比较你们的节奏", ar:"ادعُ شخصاً لمقارنة إيقاعيكما" },
  "timeline.maintenant": { fr:"Maintenant", en:"Now", es:"Ahora", de:"Jetzt", it:"Ora",
                   pt:"Agora", nl:"Nu", ja:"現在", zh:"当前", ar:"الآن" },
  "edit.annuler":{ fr:"Annuler", en:"Cancel", es:"Cancelar", de:"Abbrechen", it:"Annulla",
                   pt:"Cancelar", nl:"Annuleren", ja:"キャンセル", zh:"取消", ar:"إلغاء" },
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
