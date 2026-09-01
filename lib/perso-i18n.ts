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
  "fiche.categorie":  { fr:"Catégorie", en:"Category", es:"Categoría", de:"Kategorie", it:"Categoria", pt:"Categoria", nl:"Categorie", ja:"カテゴリー", zh:"类别", ar:"الفئة" },
  "fiche.duree":      { fr:"Durée", en:"Duration", es:"Duración", de:"Dauer", it:"Durata", pt:"Duração", nl:"Duur", ja:"期間", zh:"时长", ar:"المدة" },
  "fiche.fenetre":    { fr:"Fenêtre", en:"Window", es:"Ventana", de:"Zeitfenster", it:"Finestra", pt:"Janela", nl:"Venster", ja:"期間の幅", zh:"窗口", ar:"النافذة" },
  "fiche.intensite":  { fr:"Intensité", en:"Intensity", es:"Intensidad", de:"Intensität", it:"Intensità", pt:"Intensidade", nl:"Intensiteit", ja:"強さ", zh:"强度", ar:"الشدّة" },
  "fiche.pic":        { fr:"Pic d'intensité", en:"Peak intensity", es:"Pico de intensidad", de:"Höhepunkt", it:"Picco d'intensità", pt:"Pico de intensidade", nl:"Piek", ja:"強さのピーク", zh:"强度峰值", ar:"ذروة الشدّة" },
  "fiche.plus":       { fr:"Plus de détails", en:"More details", es:"Más detalles", de:"Mehr Details", it:"Altri dettagli", pt:"Mais detalhes", nl:"Meer details", ja:"詳細をみる", zh:"更多详情", ar:"مزيد من التفاصيل" },
  "fiche.preparer":   { fr:"Pour te préparer", en:"To prepare", es:"Para prepararte", de:"Zur Vorbereitung", it:"Per prepararti", pt:"Para te preparares", nl:"Om je voor te bereiden", ja:"備えるために", zh:"为此做准备", ar:"للاستعداد" },
  "fiche.schema":     { fr:"Schéma", en:"Pattern", es:"Patrón", de:"Muster", it:"Schema", pt:"Padrão", nl:"Patroon", ja:"パターン", zh:"模式", ar:"النمط" },
  "fiche.combines":   { fr:"Signaux combinés", en:"Combined signals", es:"Señales combinadas", de:"Kombinierte Signale", it:"Segnali combinati", pt:"Sinais combinados", nl:"Gecombineerde signalen", ja:"重なるシグナル", zh:"叠加信号", ar:"إشارات مجتمعة" },
  "fiche.passe":      { fr:"passé", en:"past", es:"pasado", de:"vergangen", it:"passato", pt:"passado", nl:"voorbij", ja:"過去", zh:"已过去", ar:"ماضٍ" },
  "fiche.eclipse":    { fr:"Éclipse", en:"Eclipse", es:"Eclipse", de:"Finsternis", it:"Eclissi", pt:"Eclipse", nl:"Eclips", ja:"食", zh:"食相", ar:"خسوف" },
  "compat.astuce":    { fr:"Astuce : restez appuyé sur une connexion pour la modifier ou la supprimer", en:"Tip: press and hold a connection to edit or remove it", es:"Consejo: mantén pulsada una conexión para editarla o eliminarla", de:"Tipp: Verbindung gedrückt halten, um sie zu ändern oder zu löschen", it:"Suggerimento: tieni premuta una connessione per modificarla o eliminarla", pt:"Dica: mantém premida uma ligação para a editar ou remover", nl:"Tip: houd een verbinding ingedrukt om te bewerken of verwijderen", ja:"ヒント：つながりを長押しすると編集・削除できます", zh:"提示：长按一个连接可修改或删除", ar:"نصيحة: اضغط مطوّلاً على اتصال لتعديله أو حذفه" },
  "compat.entrer_code":{ fr:"Entrer un code reçu", en:"Enter a code you received", es:"Introducir un código recibido", de:"Erhaltenen Code eingeben", it:"Inserisci un codice ricevuto", pt:"Introduzir um código recebido", nl:"Een ontvangen code invoeren", ja:"受け取ったコードを入力", zh:"输入收到的代码", ar:"أدخل رمزاً استلمته" },
  "invite.voir":      { fr:"Voir tes fenêtres de timing", en:"See your timing windows", es:"Ver vuestras ventanas de timing", de:"Eure Zeitfenster ansehen", it:"Vedi le vostre finestre", pt:"Ver as vossas janelas", nl:"Bekijk jullie vensters", ja:"ふたりのタイミングを見る", zh:"查看你们的时机窗口", ar:"اطّلع على نوافذ التوقيت" },
  "invite.liees":     { fr:"Vos timelines sont liées. Dites-nous quel type de relation c'est.", en:"Your timelines are linked. Tell us what kind of relationship this is.", es:"Vuestras líneas están unidas. Dinos qué tipo de relación es.", de:"Eure Timelines sind verbunden. Sag uns, um welche Beziehung es geht.", it:"Le vostre timeline sono collegate. Dicci che tipo di relazione è.", pt:"As vossas timelines estão ligadas. Diz-nos que tipo de relação é.", nl:"Jullie tijdlijnen zijn verbonden. Vertel ons om wat voor relatie het gaat.", ja:"タイムラインがつながりました。どんな関係か教えてください。", zh:"你们的时间线已连接。告诉我们这是什么关系。", ar:"ارتبط مساراكما الزمنيان. أخبرنا بنوع العلاقة." },
  "garde.aucun":      { fr:"Aucun signal détecté", en:"No signal detected", es:"No se detectó señal", de:"Kein Signal erkannt", it:"Nessun segnale rilevato", pt:"Nenhum sinal detetado", nl:"Geen signaal gevonden", ja:"シグナルが見つかりません", zh:"未检测到信号", ar:"لم يتم رصد إشارة" },
  "garde.reessayer":  { fr:"Réessayer", en:"Try again", es:"Reintentar", de:"Erneut versuchen", it:"Riprova", pt:"Tentar de novo", nl:"Opnieuw proberen", ja:"もう一度", zh:"重试", ar:"أعد المحاولة" },
  // La proposition PARLE DE LA PERSONNE, pas du produit. « Debloque ton timing
  // complet » decrit une fonctionnalite ; « une periode Carriere s ouvre dans
  // 23 jours » decrit sa vie. Le second se lit, le premier se saute.
  // Le moment de conversion. Quelqu un vient de toucher une periode A VENIR :
  // il veut savoir ce qui l attend. L ancien texte repondait « Personnalisation
  // premium — des analyses IA illimitees, taillees pour ton profil », c est-a-
  // dire le nom d une fonctionnalite et la technologie qui la produit. Personne
  // ne veut d analyses illimitees ; on veut savoir ce qui arrive.
  "flou.titre":      { fr:"Ce qui t'attend, en détail", en:"What's coming, in detail", es:"Lo que te espera, en detalle", de:"Was auf dich zukommt, im Detail", it:"Cosa ti aspetta, nel dettaglio", pt:"O que te espera, em detalhe", nl:"Wat je te wachten staat, in detail", ja:"これから起きることを、詳しく", zh:"即将到来的一切，细节尽在", ar:"ما ينتظرك، بالتفصيل" },
  "flou.titre_date": { fr:"Ce qui t'attend le {d}", en:"What's coming on {d}", es:"Lo que te espera el {d}", de:"Was dich am {d} erwartet", it:"Cosa ti aspetta il {d}", pt:"O que te espera a {d}", nl:"Wat je te wachten staat op {d}", ja:"{d} に何が起きるか", zh:"{d} 会发生什么", ar:"ما ينتظرك في {d}" },
  "flou.sous":       { fr:"Comment cette période agit, ce qu'elle demande, et quoi en faire.", en:"How this period works, what it asks of you, and what to do with it.", es:"Cómo actúa este periodo, qué te pide y qué hacer con él.", de:"Wie diese Phase wirkt, was sie verlangt, und was du damit anfängst.", it:"Come agisce questo periodo, cosa richiede e cosa farne.", pt:"Como este período atua, o que pede e o que fazer com ele.", nl:"Hoe deze periode werkt, wat ze vraagt, en wat je ermee doet.", ja:"この時期がどう働き、何を求め、どう活かすか。", zh:"这段时期如何作用、要求什么、以及如何应对。", ar:"كيف تعمل هذه الفترة، وماذا تتطلب، وكيف تستفيد منها." },
  "vente.titre":     { fr:"Une période {d} s'ouvre dans {n} jours", en:"A {d} period opens in {n} days", es:"Un periodo de {d} se abre en {n} días", de:"Eine {d}-Phase beginnt in {n} Tagen", it:"Un periodo {d} si apre tra {n} giorni", pt:"Um período de {d} abre daqui a {n} dias", nl:"Een {d}-periode begint over {n} dagen", ja:"{n}日後に「{d}」の時期が始まります", zh:"{n} 天后将开启一段「{d}」时期", ar:"تبدأ فترة {d} بعد {n} يوماً" },
  "vente.demain":    { fr:"Une période {d} s'ouvre demain", en:"A {d} period opens tomorrow", es:"Un periodo de {d} se abre mañana", de:"Eine {d}-Phase beginnt morgen", it:"Un periodo {d} si apre domani", pt:"Um período de {d} abre amanhã", nl:"Een {d}-periode begint morgen", ja:"明日「{d}」の時期が始まります", zh:"明天将开启一段「{d}」时期", ar:"تبدأ فترة {d} غداً" },
  "vente.duree":     { fr:"{n} semaines. Tu sauras quoi en faire.", en:"{n} weeks. You'll know what to do with it.", es:"{n} semanas. Sabrás qué hacer con ellas.", de:"{n} Wochen. Du wirst wissen, was du damit anfängst.", it:"{n} settimane. Saprai cosa farne.", pt:"{n} semanas. Vais saber o que fazer com elas.", nl:"{n} weken. Je zult weten wat je ermee doet.", ja:"{n}週間。どう使うかが分かります。", zh:"{n} 周。你会知道该怎么用。", ar:"{n} أسابيع. ستعرف كيف تستفيد منها." },
  "notif.cadence_bloquee": { fr:"Active les notifications ci-dessus pour choisir leur fréquence.", en:"Turn on notifications above to choose how often.", es:"Activa las notificaciones arriba para elegir su frecuencia.", de:"Aktiviere oben die Benachrichtigungen, um die Häufigkeit zu wählen.", it:"Attiva le notifiche qui sopra per scegliere la frequenza.", pt:"Ativa as notificações acima para escolher a frequência.", nl:"Zet meldingen hierboven aan om de frequentie te kiezen.", ja:"上で通知をオンにすると頻度を選べます。", zh:"先在上方开启通知，即可选择频率。", ar:"فعّل الإشعارات أعلاه لاختيار وتيرتها." },
  // Les ecrans 2 et 3 de l onboarding ILLUSTRENT le produit : la frise et les
  // planetes y sont dessinees, pas calculees, et pour cause — on n a pas encore
  // demande la date de naissance. Le dessin est legitime ; l affirmation
  // « TON signal est actif » ne l etait pas. Ce mot le dit.
  // Les trois crans ne disaient rien de ce qu on reçoit. « L essentiel »,
  // « Equilibre », « Tout » sont des etiquettes, pas des informations : on ne
  // pouvait pas choisir en connaissance de cause. Ces lignes disent l espacement
  // reel, tel que lib/push-planification.ts l applique.
  "cadence.aucune_nom":   { fr:"Aucune", en:"None", es:"Ninguna", de:"Keine", it:"Nessuna", pt:"Nenhuma", nl:"Geen", ja:"なし", zh:"关闭", ar:"لا شيء" },
  "cadence.aucune":       { fr:"Rien ne t'est envoyé. Tu peux réactiver quand tu veux.", en:"Nothing is sent to you. You can turn it back on anytime.", es:"No se te envía nada. Puedes reactivarlo cuando quieras.", de:"Dir wird nichts gesendet. Du kannst es jederzeit wieder einschalten.", it:"Non ti viene inviato nulla. Puoi riattivare quando vuoi.", pt:"Nada te é enviado. Podes reativar quando quiseres.", nl:"Er wordt niets gestuurd. Je kunt het altijd weer aanzetten.", ja:"何も送信されません。いつでも再開できます。", zh:"不会向你发送任何内容。随时可以重新开启。", ar:"لن يُرسل إليك شيء. يمكنك إعادة التفعيل متى شئت." },
  "cadence.essentiel": { fr:"Seulement les périodes marquées. Au plus une toutes les 3 semaines.", en:"Only the strong periods. At most one every 3 weeks.", es:"Solo los periodos marcados. Como máximo uno cada 3 semanas.", de:"Nur die starken Phasen. Höchstens eine alle 3 Wochen.", it:"Solo i periodi marcati. Al massimo uno ogni 3 settimane.", pt:"Só os períodos marcados. No máximo um a cada 3 semanas.", nl:"Alleen de sterke periodes. Hoogstens één per 3 weken.", ja:"強い時期だけ。最大で3週間に1回。", zh:"仅限显著周期。最多每三周一次。", ar:"الفترات القوية فقط. مرة كل ثلاثة أسابيع كحد أقصى." },
  "cadence.normal":    { fr:"Les périodes qui comptent. Au plus une par semaine.", en:"The periods that matter. At most one a week.", es:"Los periodos que cuentan. Como máximo uno por semana.", de:"Die Phasen, die zählen. Höchstens eine pro Woche.", it:"I periodi che contano. Al massimo uno a settimana.", pt:"Os períodos que contam. No máximo um por semana.", nl:"De periodes die tellen. Hoogstens één per week.", ja:"意味のある時期。最大で週に1回。", zh:"重要的周期。最多每周一次。", ar:"الفترات المهمة. مرة أسبوعياً كحد أقصى." },
  "cadence.tout":      { fr:"Chaque entrée et sortie de période. Au plus une tous les 2 jours.", en:"Every period start and end. At most one every 2 days.", es:"Cada inicio y fin de periodo. Como máximo uno cada 2 días.", de:"Jeder Phasenbeginn und jedes Ende. Höchstens eine alle 2 Tage.", it:"Ogni inizio e fine di periodo. Al massimo uno ogni 2 giorni.", pt:"Cada início e fim de período. No máximo um a cada 2 dias.", nl:"Elk begin en einde van een periode. Hoogstens één per 2 dagen.", ja:"時期の始まりと終わりすべて。最大で2日に1回。", zh:"每个周期的开始与结束。最多每两天一次。", ar:"كل بداية ونهاية فترة. مرة كل يومين كحد أقصى." },
  "demo.exemple":    { fr:"Exemple", en:"Example", es:"Ejemplo", de:"Beispiel", it:"Esempio", pt:"Exemplo", nl:"Voorbeeld", ja:"例", zh:"示例", ar:"مثال" },
  "demo.planete":    { fr:"{planet} porte un signal", en:"{planet} carries a signal", es:"{planet} lleva una señal", de:"{planet} tragt ein Signal", it:"{planet} porta un segnale", pt:"{planet} carrega um sinal", nl:"{planet} draagt een signaal", ja:"{planet} はシグナルを運びます", zh:"{planet} 承载一个信号", ar:"{planet} يحمل إشارة" },
  "demo.ton_rythme": { fr:"Voici à quoi ressemble un rythme", en:"This is what a rhythm looks like", es:"Así se ve un ritmo", de:"So sieht ein Rhythmus aus", it:"Ecco come appare un ritmo", pt:"É assim que um ritmo se parece", nl:"Zo ziet een ritme eruit", ja:"リズムはこう見えます", zh:"节奏看起来是这样", ar:"هكذا يبدو الإيقاع" },
  "achat.echec":     { fr:"L'achat n'a pas abouti. Rien ne t'a été facturé.", en:"The purchase didn't go through. You haven't been charged.", es:"La compra no se completó. No se te ha cobrado nada.", de:"Der Kauf ist nicht zustande gekommen. Dir wurde nichts berechnet.", it:"L'acquisto non è andato a buon fine. Non ti è stato addebitato nulla.", pt:"A compra não foi concluída. Não foste cobrado.", nl:"De aankoop is niet gelukt. Er is niets in rekening gebracht.", ja:"購入は完了しませんでした。請求は発生していません。", zh:"购买未完成，未向你收费。", ar:"لم تكتمل عملية الشراء. لم يتم خصم أي مبلغ." },
  "achat.restaure":  { fr:"Achats restaurés", en:"Purchases restored", es:"Compras restauradas", de:"Käufe wiederhergestellt", it:"Acquisti ripristinati", pt:"Compras restauradas", nl:"Aankopen hersteld", ja:"購入を復元しました", zh:"已恢复购买", ar:"تمت استعادة المشتريات" },
  "relation.partner":   { fr:"Partenaire", en:"Partner", es:"Pareja", de:"Partner:in", it:"Partner", pt:"Parceiro", nl:"Partner", ja:"パートナー", zh:"伴侣", ar:"شريك" },
  "relation.friend":    { fr:"Ami·e", en:"Friend", es:"Amigo/a", de:"Freund:in", it:"Amico/a", pt:"Amigo/a", nl:"Vriend(in)", ja:"友人", zh:"朋友", ar:"صديق" },
  "relation.family":    { fr:"Famille", en:"Family", es:"Familia", de:"Familie", it:"Famiglia", pt:"Família", nl:"Familie", ja:"家族", zh:"家人", ar:"عائلة" },
  "relation.colleague": { fr:"Collègue", en:"Colleague", es:"Colega", de:"Kolleg:in", it:"Collega", pt:"Colega", nl:"Collega", ja:"同僚", zh:"同事", ar:"زميل" },
  "compat.suppression": { fr:"Suppression…", en:"Deleting…", es:"Eliminando…", de:"Wird gelöscht…", it:"Eliminazione…", pt:"A eliminar…", nl:"Verwijderen…", ja:"削除中…", zh:"删除中…", ar:"جارٍ الحذف…" },
  "compat.maintiens":    { fr:"Maintiens pour confirmer", en:"Hold to confirm", es:"Mantén para confirmar", de:"Halten zum Bestätigen", it:"Tieni premuto per confermare", pt:"Mantém para confirmar", nl:"Houd vast om te bevestigen", ja:"長押しで確定", zh:"长按确认", ar:"اضغط مطولاً للتأكيد" },
  "compat.maintenir":    { fr:"Maintenir pour supprimer", en:"Hold to delete", es:"Mantén para eliminar", de:"Halten zum Löschen", it:"Tieni premuto per eliminare", pt:"Mantém para eliminar", nl:"Houd vast om te verwijderen", ja:"長押しで削除", zh:"长按删除", ar:"اضغط مطولاً للحذف" },
  "compat.partager_code":{ fr:"Partager ton code", en:"Share your code", es:"Comparte tu código", de:"Teile deinen Code", it:"Condividi il tuo codice", pt:"Partilha o teu código", nl:"Deel je code", ja:"コードを共有", zh:"分享你的代码", ar:"شارك رمزك" },
  "compat.entrez_code":  { fr:"Entrez leur code", en:"Enter their code", es:"Introduce su código", de:"Gib ihren Code ein", it:"Inserisci il loro codice", pt:"Introduz o código deles", nl:"Voer hun code in", ja:"相手のコードを入力", zh:"输入对方的代码", ar:"أدخل رمزهم" },
  "compat.invitez_comparer": { fr:"Invite quelqu'un à comparer vos rythmes", en:"Invite someone to compare your rhythms", es:"Invita a alguien a comparar vuestros ritmos", de:"Lade jemanden ein, eure Rhythmen zu vergleichen", it:"Invita qualcuno a confrontare i vostri ritmi", pt:"Convida alguém para comparar os vossos ritmos", nl:"Nodig iemand uit om jullie ritmes te vergelijken", ja:"リズムを比べる相手を招待", zh:"邀请他人比较你们的节奏", ar:"ادعُ شخصاً لمقارنة إيقاعيكما" },
  "timeline.maintenant": { fr:"Maintenant", en:"Now", es:"Ahora", de:"Jetzt", it:"Ora",
                   pt:"Agora", nl:"Nu", ja:"現在", zh:"当前", ar:"الآن" },
  "edit.annuler":{ fr:"Annuler", en:"Cancel", es:"Cancelar", de:"Abbrechen", it:"Annulla",
                   pt:"Cancelar", nl:"Annuleren", ja:"キャンセル", zh:"取消", ar:"إلغاء" },

  // ── Les quatorze corps du ciel ──────────────────────────────────────────
  //
  // Ces noms vivaient dans lib/domain-config.tsx, en francais, servis aux dix
  // langues : quelqu un qui a choisi le japonais lisait « Saturne » sur ses
  // periodes. Ce sont des noms astronomiques, pas du contenu interpretatif —
  // chaque langue a le sien depuis des siecles, on le reprend tel quel.
  "planete.soleil":          { fr:"Soleil", en:"Sun", es:"Sol", de:"Sonne", it:"Sole",
                               pt:"Sol", nl:"Zon", ja:"太陽", zh:"太阳", ar:"الشمس" },
  "planete.lune":            { fr:"Lune", en:"Moon", es:"Luna", de:"Mond", it:"Luna",
                               pt:"Lua", nl:"Maan", ja:"月", zh:"月亮", ar:"القمر" },
  "planete.mercure":         { fr:"Mercure", en:"Mercury", es:"Mercurio", de:"Merkur", it:"Mercurio",
                               pt:"Mercúrio", nl:"Mercurius", ja:"水星", zh:"水星", ar:"عطارد" },
  "planete.venus":           { fr:"Vénus", en:"Venus", es:"Venus", de:"Venus", it:"Venere",
                               pt:"Vénus", nl:"Venus", ja:"金星", zh:"金星", ar:"الزهرة" },
  "planete.mars":            { fr:"Mars", en:"Mars", es:"Marte", de:"Mars", it:"Marte",
                               pt:"Marte", nl:"Mars", ja:"火星", zh:"火星", ar:"المريخ" },
  "planete.jupiter":         { fr:"Jupiter", en:"Jupiter", es:"Júpiter", de:"Jupiter", it:"Giove",
                               pt:"Júpiter", nl:"Jupiter", ja:"木星", zh:"木星", ar:"المشتري" },
  "planete.saturne":         { fr:"Saturne", en:"Saturn", es:"Saturno", de:"Saturn", it:"Saturno",
                               pt:"Saturno", nl:"Saturnus", ja:"土星", zh:"土星", ar:"زحل" },
  "planete.uranus":          { fr:"Uranus", en:"Uranus", es:"Urano", de:"Uranus", it:"Urano",
                               pt:"Urano", nl:"Uranus", ja:"天王星", zh:"天王星", ar:"أورانوس" },
  "planete.neptune":         { fr:"Neptune", en:"Neptune", es:"Neptuno", de:"Neptun", it:"Nettuno",
                               pt:"Neptuno", nl:"Neptunus", ja:"海王星", zh:"海王星", ar:"نبتون" },
  "planete.pluton":          { fr:"Pluton", en:"Pluto", es:"Plutón", de:"Pluto", it:"Plutone",
                               pt:"Plutão", nl:"Pluto", ja:"冥王星", zh:"冥王星", ar:"بلوتو" },
  "planete.noeud_nord":      { fr:"Nœud Nord", en:"North Node", es:"Nodo Norte", de:"Nordknoten", it:"Nodo Nord",
                               pt:"Nodo Norte", nl:"Noordknoop", ja:"北ノード", zh:"北交点", ar:"العقدة الشمالية" },
  "planete.noeud_sud":       { fr:"Nœud Sud", en:"South Node", es:"Nodo Sur", de:"Südknoten", it:"Nodo Sud",
                               pt:"Nodo Sul", nl:"Zuidknoop", ja:"南ノード", zh:"南交点", ar:"العقدة الجنوبية" },
  "planete.eclipse_solaire": { fr:"Éclipse solaire", en:"Solar eclipse", es:"Eclipse solar", de:"Sonnenfinsternis", it:"Eclissi solare",
                               pt:"Eclipse solar", nl:"Zonsverduistering", ja:"日食", zh:"日食", ar:"كسوف شمسي" },
  "planete.eclipse_lunaire": { fr:"Éclipse lunaire", en:"Lunar eclipse", es:"Eclipse lunar", de:"Mondfinsternis", it:"Eclissi lunare",
                               pt:"Eclipse lunar", nl:"Maansverduistering", ja:"月食", zh:"月食", ar:"خسوف قمري" },

  // ── Les douze domaines de vie ───────────────────────────────────────────
  //
  // Meme faute que pour les planetes, dans le meme fichier : « Identité »,
  // « Argent », « Couple » etaient poses en dur dans houseConfig.
  //
  // Les mots repris sont EXACTEMENT ceux de lib/maisons-i18n.ts, qui les
  // traduisait deja pour les notifications. Un domaine ne peut pas s appeler
  // autrement sur l ecran verrouille et dans l app.
  "maison.1":  { fr:"Identité", en:"Identity", es:"Identidad", de:"Identität", it:"Identità",
                 pt:"Identidade", nl:"Identiteit", ja:"自分", zh:"自我", ar:"الذات" },
  "maison.2":  { fr:"Argent", en:"Money", es:"Dinero", de:"Geld", it:"Denaro",
                 pt:"Dinheiro", nl:"Geld", ja:"お金", zh:"金钱", ar:"المال" },
  "maison.3":  { fr:"Communication", en:"Communication", es:"Comunicación", de:"Kommunikation", it:"Comunicazione",
                 pt:"Comunicação", nl:"Communicatie", ja:"つながり", zh:"沟通", ar:"التواصل" },
  "maison.4":  { fr:"Foyer", en:"Home", es:"Hogar", de:"Zuhause", it:"Casa",
                 pt:"Lar", nl:"Thuis", ja:"家庭", zh:"家庭", ar:"البيت" },
  "maison.5":  { fr:"Créativité", en:"Creativity", es:"Creatividad", de:"Kreativität", it:"Creatività",
                 pt:"Criatividade", nl:"Creativiteit", ja:"創造", zh:"创造", ar:"الإبداع" },
  "maison.6":  { fr:"Quotidien", en:"Daily life", es:"Día a día", de:"Alltag", it:"Quotidiano",
                 pt:"Quotidiano", nl:"Dagelijks leven", ja:"日常", zh:"日常", ar:"اليومي" },
  "maison.7":  { fr:"Couple", en:"Partnership", es:"Pareja", de:"Partnerschaft", it:"Coppia",
                 pt:"Relação", nl:"Relatie", ja:"パートナー", zh:"伴侣", ar:"الشراكة" },
  "maison.8":  { fr:"Transformations", en:"Transformation", es:"Transformación", de:"Wandlung", it:"Trasformazione",
                 pt:"Transformação", nl:"Transformatie", ja:"変容", zh:"转变", ar:"التحوّل" },
  "maison.9":  { fr:"Horizon", en:"Horizon", es:"Horizonte", de:"Horizont", it:"Orizzonte",
                 pt:"Horizonte", nl:"Horizon", ja:"視野", zh:"视野", ar:"الأفق" },
  "maison.10": { fr:"Carrière", en:"Career", es:"Carrera", de:"Beruf", it:"Carriera",
                 pt:"Carreira", nl:"Carrière", ja:"仕事", zh:"事业", ar:"المسار المهني" },
  "maison.11": { fr:"Réseau", en:"Network", es:"Red", de:"Netzwerk", it:"Rete",
                 pt:"Rede", nl:"Netwerk", ja:"仲間", zh:"人脉", ar:"الشبكة" },
  "maison.12": { fr:"Intériorité", en:"Inner life", es:"Interioridad", de:"Innenleben", it:"Interiorità",
                 pt:"Interioridade", nl:"Innerlijk", ja:"内面", zh:"内在", ar:"الحياة الداخلية" },

  // ── Force d une fenetre (TierBadge) ─────────────────────────────────────
  // PEAK / CLEAR / SUBTLE dans le code, « Fort / Clair / Subtil » a l ecran —
  // en francais seul, sur la pastille qui dit a quel point une periode compte.
  "intensite.fort":   { fr:"Fort", en:"Strong", es:"Fuerte", de:"Stark", it:"Forte",
                        pt:"Forte", nl:"Sterk", ja:"強い", zh:"强", ar:"قوي" },
  "intensite.clair":  { fr:"Clair", en:"Clear", es:"Claro", de:"Klar", it:"Chiaro",
                        pt:"Claro", nl:"Helder", ja:"明確", zh:"清晰", ar:"واضح" },
  "intensite.subtil": { fr:"Subtil", en:"Subtle", es:"Sutil", de:"Subtil", it:"Sottile",
                        pt:"Subtil", nl:"Subtiel", ja:"かすか", zh:"微弱", ar:"خفيف" },

  // ── Repartition des signaux par niveau, en fin de balayage ──────────────
  // Se lit apres un nombre : « 142 subtils ». Minuscule voulue.
  "niveau.subtil":  { fr:"subtils", en:"subtle", es:"sutiles", de:"subtil", it:"sottili",
                      pt:"subtis", nl:"subtiel", ja:"かすか", zh:"微弱", ar:"خفيفة" },
  "niveau.notable": { fr:"notables", en:"notable", es:"notables", de:"bemerkenswert", it:"notevoli",
                      pt:"notáveis", nl:"opvallend", ja:"目立つ", zh:"明显", ar:"ملحوظة" },
  "niveau.majeur":  { fr:"majeurs", en:"major", es:"mayores", de:"groß", it:"maggiori",
                      pt:"maiores", nl:"groot", ja:"大きい", zh:"重大", ar:"كبيرة" },
  "niveau.pic":     { fr:"pics", en:"peak", es:"picos", de:"Höhepunkte", it:"picchi",
                      pt:"picos", nl:"pieken", ja:"ピーク", zh:"高峰", ar:"ذروة" },

  // ── Ecran de preparation, apres la saisie de naissance ──────────────────
  // Le premier contenu que quelqu un lit du produit une fois inscrit. Il etait
  // en anglais pour les dix langues.
  "prep.titre":       { fr:"Préparation de ton signal personnel", en:"Preparing your personal signal", es:"Preparando tu señal personal", de:"Dein persönliches Signal wird vorbereitet", it:"Preparazione del tuo segnale personale",
                        pt:"A preparar o teu sinal pessoal", nl:"Je persoonlijke signaal wordt voorbereid", ja:"あなたのシグナルを準備中", zh:"正在准备你的个人信号", ar:"جارٍ تحضير إشارتك الشخصية" },
  "prep.sous":        { fr:"On lit tes signaux planétaires et on construit ta timeline.", en:"We're reading your planetary signals and building your momentum timeline.", es:"Estamos leyendo tus señales planetarias y construyendo tu línea de tiempo.", de:"Wir lesen deine Planetensignale und bauen deine Zeitleiste.", it:"Stiamo leggendo i tuoi segnali planetari e costruendo la tua timeline.",
                        pt:"Estamos a ler os teus sinais planetários e a construir a tua timeline.", nl:"We lezen je planetaire signalen en bouwen je tijdlijn.", ja:"あなたの惑星シグナルを読み取り、タイムラインを組み立てています。", zh:"我们正在读取你的行星信号并构建你的时间线。", ar:"نقرأ إشاراتك الكوكبية ونبني خطك الزمني." },
  "prep.signaux":     { fr:"{n} signaux repérés sur toute ta vie", en:"{n} signals mapped across your lifetime", es:"{n} señales localizadas a lo largo de tu vida", de:"{n} Signale über dein ganzes Leben erfasst", it:"{n} segnali individuati lungo tutta la tua vita",
                        pt:"{n} sinais mapeados ao longo da tua vida", nl:"{n} signalen in kaart gebracht over je hele leven", ja:"人生全体で{n}件のシグナルを検出", zh:"在你的一生中定位了 {n} 个信号", ar:"رُصدت {n} إشارة على امتداد حياتك" },
  "prep.reconnais":   { fr:"Tu les reconnais ?", en:"Do you recognize these?", es:"¿Los reconoces?", de:"Erkennst du sie wieder?", it:"Li riconosci?",
                        pt:"Reconheces estes?", nl:"Herken je deze?", ja:"心当たりはありますか？", zh:"你认得这些吗？", ar:"هل تتعرّف عليها؟" },
  "prep.passe_forts": { fr:"Tes périodes passées les plus fortes", en:"Your strongest past periods", es:"Tus periodos pasados más fuertes", de:"Deine stärksten vergangenen Phasen", it:"I tuoi periodi passati più forti",
                        pt:"Os teus períodos passados mais fortes", nl:"Je sterkste periodes uit het verleden", ja:"これまででいちばん強かった時期", zh:"你过去最强的时期", ar:"أقوى فتراتك الماضية" },

  // ── Garde d entree de l app ─────────────────────────────────────────────
  "garde.connexion_perdue": { fr:"Connexion perdue", en:"Connection lost", es:"Conexión perdida", de:"Verbindung verloren", it:"Connessione persa",
                              pt:"Ligação perdida", nl:"Verbinding verbroken", ja:"接続が切れました", zh:"连接已断开", ar:"انقطع الاتصال" },

  // ── Le centre de messages ───────────────────────────────────────────────
  //
  // Le briefing s affichait en deux cartes superposees a la timeline, chacune
  // avec sa croix. Il tombe desormais dans une boite qu on ouvre. Voir
  // lib/messages.ts pour la regle : rien ne se superpose, rien a fermer.
  "messages.titre":     { fr:"Messages", en:"Messages", es:"Mensajes", de:"Nachrichten", it:"Messaggi",
                          pt:"Mensagens", nl:"Berichten", ja:"メッセージ", zh:"消息", ar:"الرسائل" },
  "messages.vide":      { fr:"Rien pour le moment.", en:"Nothing yet.", es:"Nada por ahora.", de:"Noch nichts.", it:"Ancora nulla.",
                          pt:"Nada por enquanto.", nl:"Nog niets.", ja:"まだ何もありません。", zh:"暂时没有内容。", ar:"لا شيء بعد." },
  "messages.vide_sous": { fr:"Ton signal du jour arrivera ici.", en:"Your daily signal will land here.", es:"Tu señal del día llegará aquí.", de:"Dein Tagessignal erscheint hier.", it:"Il tuo segnale del giorno arriverà qui.",
                          pt:"O teu sinal do dia chegará aqui.", nl:"Je signaal van de dag komt hier.", ja:"その日のシグナルはここに届きます。", zh:"你当天的信号会出现在这里。", ar:"ستصلك إشارة يومك هنا." },
  "messages.ouvrir":    { fr:"Ouvrir les messages", en:"Open messages", es:"Abrir mensajes", de:"Nachrichten öffnen", it:"Apri i messaggi",
                          pt:"Abrir mensagens", nl:"Berichten openen", ja:"メッセージを開く", zh:"打开消息", ar:"فتح الرسائل" },
  "messages.jour":      { fr:"Aujourd\u2019hui", en:"Today", es:"Hoy", de:"Heute", it:"Oggi",
                          pt:"Hoje", nl:"Vandaag", ja:"今日", zh:"今天", ar:"اليوم" },
  "messages.periode":   { fr:"En ce moment", en:"Right now", es:"Ahora mismo", de:"Gerade jetzt", it:"In questo momento",
                          pt:"Neste momento", nl:"Op dit moment", ja:"現在", zh:"此刻", ar:"في الوقت الحالي" },
  "messages.notif":     { fr:"Notification", en:"Notification", es:"Notificación", de:"Mitteilung", it:"Notifica",
                          pt:"Notificação", nl:"Melding", ja:"通知", zh:"通知", ar:"إشعار" },
  "messages.hier":      { fr:"Hier", en:"Yesterday", es:"Ayer", de:"Gestern", it:"Ieri",
                          pt:"Ontem", nl:"Gisteren", ja:"昨日", zh:"昨天", ar:"أمس" },

  // ── Les deux ecrans d erreur ────────────────────────────────────────────
  //
  // Ils s affichaient en anglais aux dix langues. Ce sont les seuls ecrans que
  // quelqu un voit quand tout le reste a echoue : les laisser dans une langue
  // qu il ne lit pas, c est ajouter une panne a une panne.
  "erreur.titre":      { fr:"Quelque chose n'a pas fonctionné", en:"Something went wrong", es:"Algo no ha funcionado", de:"Etwas ist schiefgelaufen", it:"Qualcosa non ha funzionato",
                         pt:"Algo correu mal", nl:"Er ging iets mis", ja:"問題が発生しました", zh:"出了点问题", ar:"حدث خطأ ما" },
  "erreur.corps":      { fr:"Une erreur inattendue s'est produite. Réessaie.", en:"An unexpected error occurred. Please try again.", es:"Se ha producido un error inesperado. Vuelve a intentarlo.", de:"Ein unerwarteter Fehler ist aufgetreten. Versuche es erneut.", it:"Si è verificato un errore imprevisto. Riprova.",
                         pt:"Ocorreu um erro inesperado. Tenta novamente.", nl:"Er is een onverwachte fout opgetreden. Probeer het opnieuw.", ja:"予期しないエラーが発生しました。もう一度お試しください。", zh:"发生了意外错误，请重试。", ar:"حدث خطأ غير متوقع. حاول مرة أخرى." },
  "erreur.reessayer":  { fr:"Réessayer", en:"Try again", es:"Reintentar", de:"Erneut versuchen", it:"Riprova",
                         pt:"Tentar de novo", nl:"Opnieuw proberen", ja:"再試行", zh:"重试", ar:"إعادة المحاولة" },
  "erreur.introuvable":{ fr:"Cette page n'existe pas.", en:"This page doesn't exist.", es:"Esta página no existe.", de:"Diese Seite existiert nicht.", it:"Questa pagina non esiste.",
                         pt:"Esta página não existe.", nl:"Deze pagina bestaat niet.", ja:"このページは存在しません。", zh:"此页面不存在。", ar:"هذه الصفحة غير موجودة." },
  "erreur.accueil":    { fr:"Retour à l'accueil", en:"Back to home", es:"Volver al inicio", de:"Zurück zur Startseite", it:"Torna alla home", 
                         pt:"Voltar ao início", nl:"Terug naar start", ja:"ホームに戻る", zh:"返回首页", ar:"العودة إلى الرئيسية" },

  // ── Phrases restees en dur dans les ecrans de l app ─────────────────────
  "capsule.suivante":  { fr:"Ta prochaine période se forme", en:"Your next momentum is forming", es:"Tu próximo periodo se está formando", de:"Deine nächste Phase entsteht", it:"Il tuo prossimo periodo si sta formando",
                         pt:"O teu próximo período está a formar-se", nl:"Je volgende periode vormt zich", ja:"次の時期が形になりつつあります", zh:"你的下一个时期正在成形", ar:"فترتك القادمة تتشكّل" },
  "accueil.deja_occupe":{ fr:"Mais le ciel, lui, était déjà à l'œuvre.", en:"But the planets were already busy.", es:"Pero el cielo ya estaba en marcha.", de:"Doch der Himmel war bereits am Werk.", it:"Ma il cielo era già all'opera.",
                         pt:"Mas o céu já estava a trabalhar.", nl:"Maar de hemel was al aan het werk.", ja:"けれど空はすでに動いていました。", zh:"但天空早已在运作。", ar:"لكن السماء كانت تعمل بالفعل." },
  "profil.graphique":  { fr:"Graphique de toute ta vie", en:"Full timeline chart", es:"Gráfico de toda tu vida", de:"Diagramm deines ganzen Lebens", it:"Grafico di tutta la tua vita",
                         pt:"Gráfico de toda a tua vida", nl:"Grafiek van je hele leven", ja:"人生全体のチャート", zh:"完整人生图表", ar:"مخطط حياتك الكاملة" },
  "partage.rythme":    { fr:"Quel est ton rythme ?", en:"What's your rhythm?", es:"¿Cuál es tu ritmo?", de:"Was ist dein Rhythmus?", it:"Qual è il tuo ritmo?",
                         pt:"Qual é o teu ritmo?", nl:"Wat is jouw ritme?", ja:"あなたのリズムは？", zh:"你的节奏是什么？", ar:"ما هو إيقاعك؟" },
  "accueil.ton_rythme":{ fr:"Voici ton rythme.", en:"This is your rhythm.", es:"Este es tu ritmo.", de:"Das ist dein Rhythmus.", it:"Questo è il tuo ritmo.",
                         pt:"Este é o teu ritmo.", nl:"Dit is jouw ritme.", ja:"これがあなたのリズムです。", zh:"这就是你的节奏。", ar:"هذا هو إيقاعك." },
  "fiche.dans_ta_vie": { fr:"Dans ta vie", en:"In your life", es:"En tu vida", de:"In deinem Leben", it:"Nella tua vita",
                         pt:"Na tua vida", nl:"In jouw leven", ja:"あなたの人生で", zh:"在你的人生中", ar:"في حياتك" },
  "prep.toi":              { fr:"Toi", en:"You", es:"Tú", de:"Du", it:"Tu",
                             pt:"Tu", nl:"Jij", ja:"あなた", zh:"你", ar:"أنت" },
  // La carte de partage. Ces quatre libelles etaient en francais pour les dix
  // langues, sur une image DESTINEE A ETRE PUBLIEE. Le controle des traductions
  // ne les voyait pas : ils vivent dans une expression ternaire, pas dans du
  // JSX nu.
  "partage.partager":  { fr:"Partager", en:"Share", es:"Compartir", de:"Teilen", it:"Condividi",
                         pt:"Partilhar", nl:"Delen", ja:"シェア", zh:"分享", ar:"مشاركة" },
  "partage.en_cours":  { fr:"Partage en cours…", en:"Sharing…", es:"Compartiendo…", de:"Wird geteilt…", it:"Condivisione…",
                         pt:"A partilhar…", nl:"Delen…", ja:"シェア中…", zh:"正在分享…", ar:"جارٍ المشاركة…" },
  "partage.copier":    { fr:"Copier le lien", en:"Copy link", es:"Copiar enlace", de:"Link kopieren", it:"Copia link",
                         pt:"Copiar ligação", nl:"Link kopiëren", ja:"リンクをコピー", zh:"复制链接", ar:"نسخ الرابط" },
  "partage.copie":     { fr:"Copié !", en:"Copied!", es:"¡Copiado!", de:"Kopiert!", it:"Copiato!",
                         pt:"Copiado!", nl:"Gekopieerd!", ja:"コピーしました！", zh:"已复制！", ar:"تم النسخ!" },
  "fiche.prevu":           { fr:"Prévu", en:"Planned", es:"Previsto", de:"Geplant", it:"Previsto",
                             pt:"Previsto", nl:"Gepland", ja:"予定", zh:"预计", ar:"مقرر" },
  "fiche.ce_signal":       { fr:"Ce signal", en:"This signal", es:"Esta señal", de:"Dieses Signal", it:"Questo segnale",
                             pt:"Este sinal", nl:"Dit signaal", ja:"このシグナル", zh:"这个信号", ar:"هذه الإشارة" },
  "timeline.chargement":   { fr:"Chargement de ta timeline…", en:"Loading your timeline…", es:"Cargando tu línea de tiempo…", de:"Deine Timeline wird geladen…", it:"Caricamento della tua timeline…",
                             pt:"A carregar a tua linha do tempo…", nl:"Je tijdlijn wordt geladen…", ja:"タイムラインを読み込んでいます…", zh:"正在加载你的时间线…", ar:"جارٍ تحميل مخططك الزمني…" },
  "timeline.construction": { fr:"Construction de ta timeline…", en:"Building your timeline…", es:"Construyendo tu línea de tiempo…", de:"Deine Timeline wird erstellt…", it:"Costruzione della tua timeline…",
                             pt:"A construir a tua linha do tempo…", nl:"Je tijdlijn wordt opgebouwd…", ja:"タイムラインを作成しています…", zh:"正在构建你的时间线…", ar:"جارٍ بناء مخططك الزمني…" },
  "accueil.pas_encore": { fr:"Tu ne marchais même pas encore.", en:"You weren't even crawling yet.", es:"Todavía ni gateabas.", de:"Du bist noch nicht einmal gekrabbelt.", it:"Non gattonavi nemmeno ancora.",
                          pt:"Ainda nem gatinhavas.", nl:"Je kroop nog niet eens.", ja:"まだハイハイもしていませんでした。", zh:"那时你还不会爬。", ar:"لم تكن قد بدأت الحبو بعد." },
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
