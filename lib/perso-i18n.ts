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
  "compat.forte_maintenant": { fr:"Moment fort maintenant", en:"Strong moment right now", es:"Momento fuerte ahora", de:"Starker Moment jetzt", it:"Momento forte ora", pt:"Momento forte agora", nl:"Sterk moment nu", ja:"いま強い時期", zh:"此刻正强", ar:"لحظة قوية الآن" },
  "compat.accord_clair":     { fr:"Accord clair en cours", en:"Clear agreement under way", es:"Acuerdo claro en curso", de:"Klare Übereinstimmung", it:"Accordo chiaro in corso", pt:"Acordo claro em curso", nl:"Duidelijke overeenkomst", ja:"はっきり噛み合っている", zh:"明显契合", ar:"توافق واضح جارٍ" },
  "compat.accord_subtil":    { fr:"Accord discret en cours", en:"Quiet agreement under way", es:"Acuerdo discreto en curso", de:"Leise Übereinstimmung", it:"Accordo discreto in corso", pt:"Acordo discreto em curso", nl:"Stille overeenkomst", ja:"ゆるやかに噛み合っている", zh:"微妙契合", ar:"توافق خفيف جارٍ" },
  "compat.forte_quand":      { fr:"Moment fort {quand}", en:"Strong moment {quand}", es:"Momento fuerte {quand}", de:"Starker Moment {quand}", it:"Momento forte {quand}", pt:"Momento forte {quand}", nl:"Sterk moment {quand}", ja:"{quand}に強い時期", zh:"{quand}有强烈时刻", ar:"لحظة قوية {quand}" },
  "compat.accord_clair_quand":{ fr:"Accord clair {quand}", en:"Clear agreement {quand}", es:"Acuerdo claro {quand}", de:"Klare Übereinstimmung {quand}", it:"Accordo chiaro {quand}", pt:"Acordo claro {quand}", nl:"Duidelijke overeenkomst {quand}", ja:"{quand}にはっきり噛み合う", zh:"{quand}明显契合", ar:"توافق واضح {quand}" },
  "compat.accord_quand":     { fr:"Accord {quand}", en:"Agreement {quand}", es:"Acuerdo {quand}", de:"Übereinstimmung {quand}", it:"Accordo {quand}", pt:"Acordo {quand}", nl:"Overeenkomst {quand}", ja:"{quand}に噛み合う", zh:"{quand}契合", ar:"توافق {quand}" },
  "compat.q_aujourdhui":     { fr:"aujourd'hui", en:"today", es:"hoy", de:"heute", it:"oggi", pt:"hoje", nl:"vandaag", ja:"今日", zh:"今天", ar:"اليوم" },
  "compat.q_demain":         { fr:"demain", en:"tomorrow", es:"mañana", de:"morgen", it:"domani", pt:"amanhã", nl:"morgen", ja:"明日", zh:"明天", ar:"غداً" },
  "compat.q_dans_j":         { fr:"dans {n} j", en:"in {n} d", es:"en {n} d", de:"in {n} T", it:"tra {n} g", pt:"em {n} d", nl:"over {n} d", ja:"{n}日後", zh:"{n}天后", ar:"خلال {n} يوم" },
  "compat.q_en_mois":        { fr:"en {mois}", en:"in {mois}", es:"en {mois}", de:"im {mois}", it:"a {mois}", pt:"em {mois}", nl:"in {mois}", ja:"{mois}", zh:"{mois}", ar:"في {mois}" },
  "compat.signal_indispo":   { fr:"Signal indisponible", en:"Signal unavailable", es:"Señal no disponible", de:"Signal nicht verfügbar", it:"Segnale non disponibile", pt:"Sinal indisponível", nl:"Signaal niet beschikbaar", ja:"信号を取得できません", zh:"信号不可用", ar:"الإشارة غير متاحة" },
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
  "compat.suppr_court": { fr:"Retirer", en:"Remove", es:"Quitar", de:"Entfernen", it:"Rimuovi", pt:"Remover", nl:"Verwijder", ja:"削除", zh:"移除", ar:"إزالة" },
  "compat.plus":      { fr:"Plus", en:"More", es:"Más", de:"Mehr", it:"Altro", pt:"Mais", nl:"Meer", ja:"その他", zh:"更多", ar:"المزيد" },
  "compat.balayer":   { fr:"Balaie une connexion vers la gauche pour la modifier ou la supprimer", en:"Swipe a connection left to edit or remove it", es:"Desliza una conexión a la izquierda para editarla o eliminarla", de:"Wische eine Verbindung nach links, um sie zu ändern oder zu löschen", it:"Scorri una connessione verso sinistra per modificarla o eliminarla", pt:"Desliza uma ligação para a esquerda para a editar ou remover", nl:"Veeg een verbinding naar links om te bewerken of verwijderen", ja:"つながりを左にスワイプすると編集・削除できます", zh:"向左滑动连接即可修改或删除", ar:"اسحب اتصالاً إلى اليسار لتعديله أو حذفه" },
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

  // ── Les notifications d une connexion ──────────────────────────────────
  //
  // Jusqu ici l app ne prevenait que de la vie de la personne seule. Elle
  // previent maintenant de ce qui se passe entre elle et les gens qu elle a
  // gardes, et ce n est pas un reglage global : on ne veut pas savoir la meme
  // chose de sa compagne et d un collegue. Un cran par connexion.
  //
  // Les quatre libelles sont courts parce qu ils tiennent sur une meme rangee
  // de quatre boutons ; la phrase sous la rangee dit ce que le cran envoie
  // REELLEMENT, comme pour la cadence. « Communs » seul n aurait rien dit.
  "notif.connexions": { fr:"Par connexion", en:"Per connection", es:"Por conexión", de:"Pro Verbindung", it:"Per connessione", pt:"Por ligação", nl:"Per verbinding", ja:"つながりごと", zh:"按连接", ar:"حسب كل ارتباط" },
  "notif.connexions_vide": { fr:"Connecte quelqu'un pour régler ce que cette connexion t'annonce.", en:"Connect someone to choose what that connection tells you.", es:"Conecta a alguien para elegir qué te anuncia esa conexión.", de:"Verbinde jemanden, um zu wählen, was diese Verbindung dir meldet.", it:"Collega qualcuno per scegliere cosa ti annuncia quella connessione.", pt:"Liga-te a alguém para escolher o que essa ligação te anuncia.", nl:"Verbind iemand om te kiezen wat die verbinding je meldt.", ja:"誰かとつながると、その相手からの知らせを設定できます。", zh:"先连接某人，就能设置这段连接会告诉你什么。", ar:"اربط شخصاً لتختار ما يخبرك به هذا الارتباط." },
  "notif.cx_aucune": { fr:"Aucune", en:"None", es:"Ninguna", de:"Keine", it:"Nessuna", pt:"Nenhuma", nl:"Geen", ja:"なし", zh:"关闭", ar:"لا شيء" },
  "notif.cx_communs": { fr:"Communs", en:"Shared", es:"Comunes", de:"Gemeinsam", it:"Comuni", pt:"Comuns", nl:"Gedeeld", ja:"共通", zh:"共同", ar:"المشترك" },
  "notif.cx_avec_autre": { fr:"Et eux", en:"And them", es:"Y ellos", de:"Und sie", it:"E loro", pt:"E eles", nl:"En zij", ja:"相手も", zh:"含对方", ar:"وهم" },
  "notif.cx_tout": { fr:"Tout", en:"All", es:"Todo", de:"Alles", it:"Tutto", pt:"Tudo", nl:"Alles", ja:"すべて", zh:"全部", ar:"الكل" },
  "notif.cx_aucune_desc": { fr:"Cette connexion ne t'envoie rien.", en:"This connection sends you nothing.", es:"Esta conexión no te envía nada.", de:"Diese Verbindung sendet dir nichts.", it:"Questa connessione non ti manda nulla.", pt:"Esta ligação não te envia nada.", nl:"Deze verbinding stuurt je niets.", ja:"このつながりからは何も届きません。", zh:"这段连接不会给你发送任何内容。", ar:"هذا الارتباط لا يرسل إليك شيئاً." },
  "notif.cx_communs_desc": { fr:"Seulement les moments forts que vous traversez tous les deux.", en:"Only the strong moments you're both going through.", es:"Solo los momentos fuertes que atravesáis los dos.", de:"Nur die starken Momente, die ihr beide durchlebt.", it:"Solo i momenti forti che attraversate entrambi.", pt:"Só os momentos fortes que atravessam os dois.", nl:"Alleen de sterke momenten die jullie allebei doormaken.", ja:"ふたりが同時に通る、強い時期だけ。", zh:"仅限你们两人共同经历的重要时刻。", ar:"فقط اللحظات القوية التي تمرّان بها معاً." },
  "notif.cx_avec_autre_desc": { fr:"Ces moments, plus ce qui bascule de leur côté.", en:"Those moments, plus what shifts on their side.", es:"Esos momentos, y lo que cambia de su lado.", de:"Diese Momente, plus was sich auf ihrer Seite ändert.", it:"Quei momenti, più ciò che cambia dalla loro parte.", pt:"Esses momentos, e o que muda do lado deles.", nl:"Die momenten, plus wat er bij hen verschuift.", ja:"その時期に加えて、相手の側の変化も。", zh:"这些时刻，再加上对方那边的变化。", ar:"تلك اللحظات، إضافة إلى ما يتغيّر من جهتهم." },
  "notif.cx_tout_desc": { fr:"Tout ce qui précède, et les mois simplement nets.", en:"All of the above, plus the merely clear months.", es:"Todo lo anterior, y los meses simplemente claros.", de:"Alles davon, plus die einfach klaren Monate.", it:"Tutto quanto sopra, più i mesi semplicemente netti.", pt:"Tudo o acima, e os meses simplesmente nítidos.", nl:"Al het bovenstaande, plus de gewoon heldere maanden.", ja:"上のすべてに加えて、はっきりした月も。", zh:"以上全部，再加上信号清晰的月份。", ar:"كل ما سبق، إضافة إلى الأشهر الواضحة فحسب." },
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
  // ── L ecran de match : les mots de la carte ─────────────────────────────
  //
  // Ils etaient tous en dur, en francais, dans ConnectionReport.tsx — dans une
  // app qui tourne en dix langues. Quelqu un en japonais lisait « Passé »,
  // « À venir », « Se comprendre » et « 12 j restants ».
  //
  // Les noms de mois, eux, ne sont pas ici : Intl.DateTimeFormat les connait
  // dans les dix langues, une table de plus serait une table a maintenir.
  "compat.passe":        { fr:"Passé", en:"Past", es:"Pasado", de:"Vorbei", it:"Passato",
                           pt:"Passado", nl:"Voorbij", ja:"過去", zh:"已过", ar:"مضى" },
  "compat.a_venir":      { fr:"À venir", en:"Ahead", es:"Por venir", de:"Kommt noch", it:"In arrivo",
                           pt:"Por vir", nl:"Op komst", ja:"これから", zh:"即将", ar:"قادم" },
  "compat.jours_restants":{ fr:"{n} j restants", en:"{n} days left", es:"quedan {n} d", de:"noch {n} T", it:"{n} g rimasti",
                           pt:"faltam {n} d", nl:"nog {n} d", ja:"残り{n}日", zh:"还剩 {n} 天", ar:"بقي {n} يوم" },
  "compat.dans_jours":   { fr:"dans {n} j", en:"in {n} days", es:"en {n} d", de:"in {n} T", it:"tra {n} g",
                           pt:"daqui a {n} d", nl:"over {n} d", ja:"{n}日後", zh:"{n} 天后", ar:"خلال {n} يوم" },
  "flou.titre_match":    { fr:"Ce que vous traversez en {d}", en:"What you’re both going through in {d}", es:"Lo que atravesáis en {d}", de:"Was ihr im {d} durchlebt", it:"Cosa state attraversando in {d}",
                           pt:"O que atravessam em {d}", nl:"Wat jullie doormaken in {d}", ja:"{d}に二人が通っているもの", zh:"{d}你们正在经历的", ar:"ما تمرّان به في {d}" },
  "compat.rien_marquant":{ fr:"Rien de marquant", en:"Nothing standing out", es:"Nada que destaque", de:"Nichts Auffälliges", it:"Niente di rilevante",
                           pt:"Nada de marcante", nl:"Niets opvallends", ja:"目立つものはなし", zh:"没有突出的信号", ar:"لا شيء بارز" },
  "compat.silence_corps":{ fr:"Pas de signal partagé assez solide ce mois-ci. On préfère se taire qu'inventer.", en:"No shared signal strong enough this month. We'd rather say nothing than make something up.", es:"Ninguna señal compartida lo bastante sólida este mes. Preferimos callar antes que inventar.", de:"Diesen Monat kein gemeinsames Signal, das stark genug wäre. Lieber nichts sagen als etwas erfinden.", it:"Nessun segnale condiviso abbastanza solido questo mese. Meglio tacere che inventare.",
                           pt:"Nenhum sinal partilhado suficientemente sólido este mês. Preferimos calar-nos a inventar.", nl:"Deze maand geen gedeeld signaal dat sterk genoeg is. Liever niets zeggen dan iets verzinnen.", ja:"今月は二人に共通する確かなシグナルがありません。作り話をするより黙ります。", zh:"本月没有足够扎实的共同信号。我们宁可不说，也不编造。", ar:"لا توجد إشارة مشتركة قوية بما يكفي هذا الشهر. نفضّل الصمت على الاختلاق." },
  "compat.cette_annee":  { fr:"Cette année", en:"This year", es:"Este año", de:"Dieses Jahr", it:"Quest'anno",
                           pt:"Este ano", nl:"Dit jaar", ja:"今年", zh:"今年", ar:"هذا العام" },
  "compat.ce_mois":      { fr:"Ce mois", en:"This month", es:"Este mes", de:"Diesen Monat", it:"Questo mese",
                           pt:"Este mês", nl:"Deze maand", ja:"今月", zh:"本月", ar:"هذا الشهر" },
  "compat.chapitre":     { fr:"Chapitre", en:"Chapter", es:"Capítulo", de:"Kapitel", it:"Capitolo",
                           pt:"Capítulo", nl:"Hoofdstuk", ja:"章", zh:"篇章", ar:"فصل" },
  "compat.eclipse":      { fr:"Éclipse", en:"Eclipse", es:"Eclipse", de:"Finsternis", it:"Eclissi",
                           pt:"Eclipse", nl:"Verduistering", ja:"食", zh:"食相", ar:"كسوف" },
  "compat.eclipses":     { fr:"Éclipses", en:"Eclipses", es:"Eclipses", de:"Finsternisse", it:"Eclissi",
                           pt:"Eclipses", nl:"Verduisteringen", ja:"食", zh:"食相", ar:"الكسوفات" },
  "compat.pas_assez":    { fr:"Pas assez de données pour comparer vos rythmes.", en:"Not enough data to compare your rhythms.", es:"No hay datos suficientes para comparar vuestros ritmos.", de:"Zu wenig Daten, um eure Rhythmen zu vergleichen.", it:"Dati insufficienti per confrontare i vostri ritmi.",
                           pt:"Dados insuficientes para comparar os vossos ritmos.", nl:"Te weinig gegevens om jullie ritmes te vergelijken.", ja:"リズムを比べるにはデータが足りません。", zh:"数据不足，无法比较你们的节奏。", ar:"لا توجد بيانات كافية لمقارنة إيقاعيكما." },
  "compat.pas_partage":  { fr:"{n} n'a pas encore partagé ses données de naissance.", en:"{n} hasn't shared their birth details yet.", es:"{n} todavía no ha compartido sus datos de nacimiento.", de:"{n} hat die Geburtsdaten noch nicht geteilt.", it:"{n} non ha ancora condiviso i suoi dati di nascita.",
                           pt:"{n} ainda não partilhou os dados de nascimento.", nl:"{n} heeft de geboortegegevens nog niet gedeeld.", ja:"{n}さんはまだ出生情報を共有していません。", zh:"{n} 还没有分享出生信息。", ar:"لم يشارك {n} بيانات ميلاده بعد." },

  // ── Match : les phrases de repli, quand le modele echoue ou que la personne
  //    n est pas abonnee. C est donc le cas le plus frequent, pas le cas rare.
  //    Elles vivaient dans lib/matching-narratives.ts, en francais et en
  //    anglais seulement, servies telles quelles aux huit autres langues.
  //    Aucun nom de technique ici, dans aucune langue : la planete et la maison
  //    sont des CLEFS, jamais un mot affiche.
  "match.you.saturn.partner":   { fr:"Un besoin de solidifier ce qui compte entre vous", en:"A need to solidify what matters between you", es:"Una necesidad de consolidar lo que importa entre vosotros", de:"Ein Bedürfnis, zu festigen, was zwischen euch zählt", it:"Un bisogno di consolidare ciò che conta tra voi",
                                  pt:"Uma necessidade de consolidar o que importa entre vocês", nl:"Een behoefte om te verstevigen wat tussen jullie telt", ja:"二人のあいだで大切なものを固めたい時期", zh:"想把你们之间重要的东西稳固下来", ar:"حاجة إلى ترسيخ ما يهمّ بينكما" },
  "match.you.saturn.friend":    { fr:"Une envie de structurer vos projets communs", en:"An urge to structure your shared projects", es:"Ganas de estructurar vuestros proyectos comunes", de:"Der Wunsch, eure gemeinsamen Projekte zu strukturieren", it:"Voglia di dare struttura ai vostri progetti comuni",
                                  pt:"Vontade de estruturar os vossos projetos comuns", nl:"Zin om jullie gezamenlijke projecten structuur te geven", ja:"共通の計画を組み立てたくなる時期", zh:"想把共同的计划梳理成形", ar:"رغبة في تنظيم مشاريعكما المشتركة" },
  "match.you.saturn.family":    { fr:"Les responsabilités familiales demandent votre attention", en:"Family responsibilities are asking for your attention", es:"Las responsabilidades familiares piden tu atención", de:"Familiäre Verpflichtungen verlangen deine Aufmerksamkeit", it:"Le responsabilità familiari chiedono la tua attenzione",
                                  pt:"As responsabilidades familiares pedem a tua atenção", nl:"Familieverplichtingen vragen je aandacht", ja:"家族の責任が注意を求めている", zh:"家庭责任需要你的关注", ar:"المسؤوليات العائلية تطلب انتباهك" },
  "match.you.saturn.colleague": { fr:"Le moment de poser des bases solides au travail", en:"The moment to lay solid foundations at work", es:"El momento de sentar bases sólidas en el trabajo", de:"Der Moment, bei der Arbeit ein solides Fundament zu legen", it:"Il momento di porre basi solide al lavoro",
                                  pt:"O momento de lançar bases sólidas no trabalho", nl:"Het moment om op het werk een stevige basis te leggen", ja:"仕事の土台を固める時", zh:"在工作中打好基础的时候", ar:"وقت إرساء أسس متينة في العمل" },

  "match.you.jupiter.partner":   { fr:"L'envie d'avancer ensemble, de voir grand", en:"The urge to move forward together, to think big", es:"Las ganas de avanzar juntos, de pensar a lo grande", de:"Die Lust, gemeinsam voranzugehen und groß zu denken", it:"La voglia di avanzare insieme, di pensare in grande",
                                   pt:"A vontade de avançar juntos, de pensar em grande", nl:"De zin om samen vooruit te gaan, om groot te denken", ja:"一緒に前へ進み、大きく考えたくなる", zh:"想一起向前，把格局放大", ar:"رغبة في التقدّم معاً والتفكير بطموح" },
  "match.you.jupiter.friend":    { fr:"Les opportunités se multiplient dans votre cercle", en:"Opportunities are multiplying in your circle", es:"Las oportunidades se multiplican en tu círculo", de:"Die Gelegenheiten häufen sich in deinem Umfeld", it:"Le opportunità si moltiplicano nella tua cerchia",
                                   pt:"As oportunidades multiplicam-se no teu círculo", nl:"De kansen stapelen zich op in je kring", ja:"身の回りに機会が増えていく", zh:"你的圈子里机会变多", ar:"تتكاثر الفرص في دائرتك" },
  "match.you.jupiter.family":    { fr:"Un élan de générosité et d'expansion familiale", en:"A surge of generosity and family expansion", es:"Un impulso de generosidad y expansión familiar", de:"Ein Schub an Großzügigkeit und familiärer Weitung", it:"Uno slancio di generosità ed espansione familiare",
                                   pt:"Um impulso de generosidade e expansão familiar", nl:"Een golf van vrijgevigheid en familiale verruiming", ja:"寛さが増し、家族の輪が広がる", zh:"一股慷慨与家庭扩展的势头", ar:"اندفاع نحو الكرم واتساع العائلة" },
  "match.you.jupiter.colleague": { fr:"Les portes s'ouvrent pour vos projets communs", en:"Doors are opening for your shared projects", es:"Se abren puertas para vuestros proyectos comunes", de:"Türen öffnen sich für eure gemeinsamen Projekte", it:"Si aprono porte per i vostri progetti comuni",
                                   pt:"Abrem-se portas para os vossos projetos comuns", nl:"Er gaan deuren open voor jullie gezamenlijke projecten", ja:"共同の計画に道が開く", zh:"共同项目的门正在打开", ar:"تنفتح أبواب أمام مشاريعكما المشتركة" },

  "match.you.venus.partner":   { fr:"L'attraction et la douceur reviennent entre vous", en:"Attraction and softness are returning between you", es:"La atracción y la dulzura vuelven entre vosotros", de:"Anziehung und Sanftheit kehren zwischen euch zurück", it:"L'attrazione e la dolcezza tornano tra voi",
                                 pt:"A atração e a doçura voltam entre vocês", nl:"Aantrekking en zachtheid keren tussen jullie terug", ja:"惹かれ合う気持ちと優しさが戻ってくる", zh:"吸引与温柔在你们之间回来了", ar:"يعود الانجذاب واللطف بينكما" },
  "match.you.venus.friend":    { fr:"L'harmonie dans vos échanges est naturelle", en:"Harmony in your exchanges comes naturally", es:"La armonía en vuestros intercambios es natural", de:"Die Harmonie in eurem Austausch stellt sich von selbst ein", it:"L'armonia nei vostri scambi viene naturale",
                                 pt:"A harmonia nas vossas trocas é natural", nl:"De harmonie in jullie contact gaat vanzelf", ja:"やりとりが自然と和やかになる", zh:"你们的交流自然而然地和顺", ar:"الانسجام في تبادلكما يأتي بلا جهد" },
  "match.you.venus.family":    { fr:"Les liens affectifs se renforcent", en:"Emotional bonds are strengthening", es:"Los lazos afectivos se refuerzan", de:"Die emotionalen Bindungen werden stärker", it:"I legami affettivi si rafforzano",
                                 pt:"Os laços afetivos reforçam-se", nl:"De affectieve banden worden sterker", ja:"情の結びつきが強まる", zh:"情感的联结在加强", ar:"تتقوّى الروابط العاطفية" },
  "match.you.venus.colleague": { fr:"Les relations professionnelles s'adoucissent", en:"Professional relationships are softening", es:"Las relaciones profesionales se suavizan", de:"Die beruflichen Beziehungen werden milder", it:"I rapporti professionali si addolciscono",
                                 pt:"As relações profissionais suavizam-se", nl:"De professionele verhoudingen worden milder", ja:"仕事上の関係が和らぐ", zh:"职场关系变得柔和", ar:"تلين العلاقات المهنية" },

  "match.you.mars.partner":   { fr:"Une énergie forte — passion ou friction, selon comment vous la canalisez", en:"A strong energy — passion or friction, depending on how you channel it", es:"Una energía fuerte — pasión o fricción, según cómo la canalicéis", de:"Eine starke Energie — Leidenschaft oder Reibung, je nachdem, wie ihr sie lenkt", it:"Un'energia forte — passione o attrito, secondo come la incanalate",
                               pt:"Uma energia forte — paixão ou atrito, conforme a canalizarem", nl:"Een sterke energie — passie of wrijving, afhankelijk van hoe jullie die richten", ja:"強い勢い — 向け方しだいで情熱にも摩擦にもなる", zh:"一股强劲的能量 — 看你们怎么引导，可能是热情，也可能是摩擦", ar:"طاقة قوية — شغف أو احتكاك، بحسب كيفية توجيهها" },
  "match.you.mars.friend":    { fr:"L'élan d'agir ensemble est puissant", en:"The drive to act together is powerful", es:"El impulso de actuar juntos es potente", de:"Der Antrieb, gemeinsam zu handeln, ist stark", it:"La spinta ad agire insieme è potente",
                               pt:"O impulso de agir juntos é forte", nl:"De drang om samen te handelen is krachtig", ja:"一緒に動きたい勢いが強い", zh:"一起行动的冲劲很足", ar:"الدافع إلى التحرّك معاً قوي" },
  "match.you.mars.family":    { fr:"Les tensions peuvent émerger — canalisez l'énergie", en:"Tensions may surface — channel the energy", es:"Pueden surgir tensiones — canalizad la energía", de:"Spannungen können auftauchen — lenkt die Energie", it:"Possono emergere tensioni — incanalate l'energia",
                               pt:"Podem surgir tensões — canalizem a energia", nl:"Er kunnen spanningen opkomen — richt de energie", ja:"緊張が出やすい — 勢いの向け先を決めて", zh:"可能出现紧张 — 把这股劲用对地方", ar:"قد تظهر توترات — وجّها الطاقة" },
  "match.you.mars.colleague": { fr:"L'impulsion de faire avancer les choses", en:"The impulse to move things forward", es:"El impulso de hacer avanzar las cosas", de:"Der Drang, die Dinge voranzubringen", it:"L'impulso a far avanzare le cose",
                               pt:"O impulso de fazer as coisas avançarem", nl:"De drang om dingen vooruit te duwen", ja:"物事を前へ動かしたくなる", zh:"推动事情向前的冲劲", ar:"اندفاع لدفع الأمور إلى الأمام" },

  "match.you.moon.partner":   { fr:"Les émotions sont à fleur de peau entre vous", en:"Emotions run close to the surface between you", es:"Las emociones están a flor de piel entre vosotros", de:"Die Gefühle liegen zwischen euch dicht unter der Oberfläche", it:"Le emozioni sono a fior di pelle tra voi",
                                pt:"As emoções estão à flor da pele entre vocês", nl:"De emoties liggen tussen jullie dicht aan de oppervlakte", ja:"二人のあいだで感情が表に出やすい", zh:"你们之间的情绪很容易被触动", ar:"المشاعر قريبة من السطح بينكما" },
  "match.you.moon.friend":    { fr:"Un besoin de connexion émotionnelle authentique", en:"A need for authentic emotional connection", es:"Una necesidad de conexión emocional auténtica", de:"Ein Bedürfnis nach echter emotionaler Nähe", it:"Un bisogno di connessione emotiva autentica",
                                pt:"Uma necessidade de ligação emocional autêntica", nl:"Een behoefte aan echte emotionele verbinding", ja:"本音でつながりたくなる", zh:"渴望真实的情感联结", ar:"حاجة إلى تواصل عاطفي صادق" },
  "match.you.moon.family":    { fr:"Les dynamiques familiales profondes remontent", en:"Deep family dynamics are resurfacing", es:"Las dinámicas familiares profundas resurgen", de:"Tiefe Familienmuster kommen wieder hoch", it:"Le dinamiche familiari profonde riaffiorano",
                                pt:"As dinâmicas familiares profundas voltam à superfície", nl:"Diepe familiepatronen komen weer boven", ja:"家族の深いパターンが浮かび上がる", zh:"家庭深层的互动模式浮上来", ar:"تطفو ديناميات عائلية عميقة" },
  "match.you.moon.colleague": { fr:"L'intuition guide vos décisions communes", en:"Intuition is guiding your shared decisions", es:"La intuición guía vuestras decisiones comunes", de:"Die Intuition leitet eure gemeinsamen Entscheidungen", it:"L'intuito guida le vostre decisioni comuni",
                                pt:"A intuição guia as vossas decisões comuns", nl:"Intuïtie stuurt jullie gezamenlijke beslissingen", ja:"共同の判断を直感が導く", zh:"直觉在引导你们的共同决定", ar:"الحدس يوجّه قراراتكما المشتركة" },

  "match.you.sun.partner":   { fr:"Votre identité dans la relation est activée", en:"Your identity within the relationship is activated", es:"Tu identidad dentro de la relación se activa", de:"Deine Identität in der Beziehung wird aktiv", it:"La tua identità nella relazione si attiva",
                               pt:"A tua identidade dentro da relação ativa-se", nl:"Je identiteit binnen de relatie komt in beweging", ja:"関係のなかの自分のあり方が動く", zh:"你在这段关系里的自我被触动", ar:"تتحرّك هويتك داخل العلاقة" },
  "match.you.sun.friend":    { fr:"Votre rôle dans l'amitié se clarifie", en:"Your role in the friendship is becoming clear", es:"Tu papel en la amistad se aclara", de:"Deine Rolle in der Freundschaft klärt sich", it:"Il tuo ruolo nell'amicizia si chiarisce",
                               pt:"O teu papel na amizade torna-se claro", nl:"Je rol in de vriendschap wordt duidelijk", ja:"友情のなかの役割がはっきりしてくる", zh:"你在这份友谊中的位置变清楚了", ar:"يتّضح دورك في الصداقة" },
  "match.you.sun.family":    { fr:"Votre place dans la famille est en mouvement", en:"Your place in the family is in motion", es:"Tu lugar en la familia está en movimiento", de:"Dein Platz in der Familie ist in Bewegung", it:"Il tuo posto in famiglia è in movimento",
                               pt:"O teu lugar na família está em movimento", nl:"Je plek in de familie is in beweging", ja:"家族のなかの立ち位置が動いている", zh:"你在家庭中的位置正在变动", ar:"مكانك في العائلة يتحرّك" },
  "match.you.sun.colleague": { fr:"Votre visibilité professionnelle s'amplifie", en:"Your professional visibility is growing", es:"Tu visibilidad profesional aumenta", de:"Deine berufliche Sichtbarkeit wächst", it:"La tua visibilità professionale cresce",
                               pt:"A tua visibilidade profissional aumenta", nl:"Je zichtbaarheid op het werk groeit", ja:"仕事での存在感が増す", zh:"你在职场的能见度在提升", ar:"يزداد حضورك المهني" },

  "match.you.mercury.partner":   { fr:"Les conversations importantes sont favorisées", en:"Important conversations are favored", es:"Las conversaciones importantes están favorecidas", de:"Wichtige Gespräche haben jetzt Rückenwind", it:"Le conversazioni importanti sono favorite",
                                   pt:"As conversas importantes estão favorecidas", nl:"Belangrijke gesprekken hebben nu wind mee", ja:"大事な話がしやすい時期", zh:"重要的对话此时容易展开", ar:"المحادثات المهمة مواتية الآن" },
  "match.you.mercury.friend":    { fr:"Les échanges d'idées sont amplifiés", en:"The exchange of ideas is amplified", es:"El intercambio de ideas se amplifica", de:"Der Austausch von Ideen verstärkt sich", it:"Lo scambio di idee si amplifica",
                                   pt:"A troca de ideias amplifica-se", nl:"De uitwisseling van ideeën wordt sterker", ja:"考えのやりとりが活発になる", zh:"想法的交流被放大", ar:"يتضاعف تبادل الأفكار" },
  "match.you.mercury.family":    { fr:"La communication familiale est au centre", en:"Family communication is at the center", es:"La comunicación familiar está en el centro", de:"Die Kommunikation in der Familie steht im Mittelpunkt", it:"La comunicazione familiare è al centro",
                                   pt:"A comunicação familiar está no centro", nl:"De communicatie in de familie staat centraal", ja:"家族との連絡が中心になる", zh:"家庭沟通成为焦点", ar:"التواصل العائلي في المركز" },
  "match.you.mercury.colleague": { fr:"Les négociations et les projets avancent", en:"Negotiations and projects are moving forward", es:"Las negociaciones y los proyectos avanzan", de:"Verhandlungen und Projekte kommen voran", it:"Le trattative e i progetti avanzano",
                                   pt:"As negociações e os projetos avançam", nl:"Onderhandelingen en projecten komen vooruit", ja:"交渉も計画も前に進む", zh:"谈判与项目都在推进", ar:"تتقدّم المفاوضات والمشاريع" },

  "match.you.uranus.partner":   { fr:"L'inattendu entre dans votre relation — accueillez la surprise", en:"The unexpected enters your relationship — welcome the surprise", es:"Lo inesperado entra en vuestra relación — acoged la sorpresa", de:"Das Unerwartete tritt in eure Beziehung — lasst die Überraschung zu", it:"L'imprevisto entra nella vostra relazione — accogliete la sorpresa",
                                  pt:"O inesperado entra na vossa relação — acolham a surpresa", nl:"Het onverwachte komt jullie relatie binnen — laat de verrassing toe", ja:"思いがけないことが関係に入ってくる — その驚きを受け止めて", zh:"意外走进你们的关系 — 接住这份惊喜", ar:"يدخل غير المتوقّع علاقتكما — رحّبا بالمفاجأة" },
  "match.you.uranus.friend":    { fr:"Vos liens se réinventent", en:"Your bonds are reinventing themselves", es:"Vuestros lazos se reinventan", de:"Eure Bindungen erfinden sich neu", it:"I vostri legami si reinventano",
                                  pt:"Os vossos laços reinventam-se", nl:"Jullie banden vinden zichzelf opnieuw uit", ja:"つながりの形が作り直される", zh:"你们的联结在重塑", ar:"تُعيد روابطكما ابتكار نفسها" },
  "match.you.uranus.family":    { fr:"Les schémas familiaux se brisent — libération en vue", en:"Family patterns are breaking — liberation ahead", es:"Los patrones familiares se rompen — liberación a la vista", de:"Familienmuster brechen auf — Befreiung in Sicht", it:"Gli schemi familiari si rompono — liberazione in vista",
                                  pt:"Os padrões familiares quebram-se — libertação à vista", nl:"Familiepatronen breken — bevrijding in zicht", ja:"家族のパターンが崩れる — 解放が近い", zh:"家庭的旧模式在打破 — 松绑就在前面", ar:"تتكسّر الأنماط العائلية — تحرّر في الأفق" },
  "match.you.uranus.colleague": { fr:"L'innovation et le changement sont au rendez-vous", en:"Innovation and change are on the agenda", es:"La innovación y el cambio están sobre la mesa", de:"Neuerung und Veränderung stehen an", it:"Innovazione e cambiamento sono all'ordine del giorno",
                                  pt:"A inovação e a mudança estão em cima da mesa", nl:"Vernieuwing en verandering staan op de agenda", ja:"刷新と変化が来ている", zh:"创新与变动摆在眼前", ar:"الابتكار والتغيير على الطاولة" },

  "match.you.neptune.partner":   { fr:"Les frontières se dissolvent — intimité ou confusion", en:"Boundaries are dissolving — intimacy or confusion", es:"Las fronteras se disuelven — intimidad o confusión", de:"Die Grenzen lösen sich auf — Nähe oder Verwirrung", it:"I confini si dissolvono — intimità o confusione",
                                   pt:"As fronteiras dissolvem-se — intimidade ou confusão", nl:"De grenzen lossen op — intimiteit of verwarring", ja:"境界が溶ける — 親密さにも混乱にもなる", zh:"界线在消融 — 可能更亲密，也可能更混乱", ar:"تذوب الحدود — حميمية أو التباس" },
  "match.you.neptune.friend":    { fr:"L'inspiration créative coule entre vous", en:"Creative inspiration flows between you", es:"La inspiración creativa fluye entre vosotros", de:"Kreative Inspiration fließt zwischen euch", it:"L'ispirazione creativa scorre tra voi",
                                   pt:"A inspiração criativa flui entre vocês", nl:"Creatieve inspiratie stroomt tussen jullie", ja:"創作の気が二人のあいだを流れる", zh:"创作的灵感在你们之间流动", ar:"يتدفّق الإلهام الإبداعي بينكما" },
  "match.you.neptune.family":    { fr:"Les liens invisibles se manifestent", en:"Invisible bonds are making themselves felt", es:"Los lazos invisibles se hacen sentir", de:"Unsichtbare Bindungen machen sich bemerkbar", it:"I legami invisibili si fanno sentire",
                                   pt:"Os laços invisíveis fazem-se sentir", nl:"Onzichtbare banden laten zich voelen", ja:"目に見えない結びつきが感じられる", zh:"看不见的牵连显了出来", ar:"تُظهر الروابط الخفية نفسها" },
  "match.you.neptune.colleague": { fr:"La vision partagée se clarifie — ou se brouille", en:"The shared vision is clarifying — or blurring", es:"La visión compartida se aclara — o se difumina", de:"Die gemeinsame Vision klärt sich — oder verschwimmt", it:"La visione condivisa si chiarisce — o si offusca",
                                   pt:"A visão partilhada clarifica-se — ou embacia", nl:"De gedeelde visie wordt helder — of vaag", ja:"共通の見通しがはっきりする — あるいはぼやける", zh:"共同的愿景在变清晰 — 或变模糊", ar:"تتّضح الرؤية المشتركة — أو تزداد ضبابية" },

  "match.you.defaut": { fr:"Un signal actif touche votre vie", en:"An active signal is touching your life", es:"Una señal activa toca tu vida", de:"Ein aktives Signal berührt dein Leben", it:"Un segnale attivo tocca la tua vita",
                        pt:"Um sinal ativo toca a tua vida", nl:"Een actief signaal raakt je leven", ja:"いま動いているシグナルがあなたの生活に触れている", zh:"有一个活跃的信号正触及你的生活", ar:"إشارة نشِطة تمسّ حياتك" },

  // ── Match : le theme commun, par domaine de vie ─────────────────────────
  "match.theme.1.partner":   { fr:"Vos identités évoluent ensemble", en:"Your identities are evolving together", es:"Vuestras identidades evolucionan juntas", de:"Eure Identitäten entwickeln sich gemeinsam", it:"Le vostre identità evolvono insieme",
                               pt:"As vossas identidades evoluem juntas", nl:"Jullie identiteiten ontwikkelen zich samen", ja:"二人の自分像が一緒に変わっていく", zh:"你们的自我在一起变化", ar:"تتطوّر هويتاكما معاً" },
  "match.theme.1.friend":    { fr:"Vous changez tous les deux", en:"You're both changing", es:"Los dos estáis cambiando", de:"Ihr verändert euch beide", it:"State cambiando entrambi",
                               pt:"Estão os dois a mudar", nl:"Jullie veranderen allebei", ja:"二人とも変わりつつある", zh:"你们两个都在改变", ar:"كلاكما يتغيّر" },
  "match.theme.1.family":    { fr:"Chacun redéfinit sa place", en:"Everyone is redefining their place", es:"Cada uno redefine su lugar", de:"Jeder bestimmt seinen Platz neu", it:"Ognuno ridefinisce il proprio posto",
                               pt:"Cada um redefine o seu lugar", nl:"Iedereen bepaalt zijn plek opnieuw", ja:"それぞれが自分の立ち位置を決め直している", zh:"每个人都在重新定位自己", ar:"كلٌّ يعيد تحديد مكانه" },
  "match.theme.1.colleague": { fr:"Vos postures professionnelles bougent", en:"Your professional postures are shifting", es:"Vuestras posturas profesionales se mueven", de:"Eure beruflichen Rollen verschieben sich", it:"Le vostre posizioni professionali si spostano",
                               pt:"As vossas posturas profissionais mexem-se", nl:"Jullie professionele posities schuiven", ja:"仕事での立ち位置が動いている", zh:"你们的职业站位在移动", ar:"تتبدّل مواقعكما المهنية" },

  "match.theme.2.partner":   { fr:"L'argent et les valeurs sont au centre", en:"Money and values are at the center", es:"El dinero y los valores están en el centro", de:"Geld und Werte stehen im Mittelpunkt", it:"Il denaro e i valori sono al centro",
                               pt:"O dinheiro e os valores estão no centro", nl:"Geld en waarden staan centraal", ja:"お金と価値観が中心にある", zh:"金钱与价值观是焦点", ar:"المال والقيم في المركز" },
  "match.theme.2.friend":    { fr:"Vos ressources se rejoignent", en:"Your resources are coming together", es:"Vuestros recursos se juntan", de:"Eure Mittel passen zusammen", it:"Le vostre risorse si incontrano",
                               pt:"Os vossos recursos juntam-se", nl:"Jullie middelen komen samen", ja:"使えるものが噛み合ってくる", zh:"你们的资源正在合到一处", ar:"تلتقي مواردكما" },
  "match.theme.2.family":    { fr:"Les finances familiales sont activées", en:"Family finances are activated", es:"Las finanzas familiares se activan", de:"Die Familienfinanzen werden zum Thema", it:"Le finanze familiari si attivano",
                               pt:"As finanças familiares ativam-se", nl:"De familiefinanciën komen in beweging", ja:"家計のことが動く", zh:"家庭财务被触动", ar:"تتحرّك الأمور المالية العائلية" },
  "match.theme.2.colleague": { fr:"Les enjeux financiers convergent", en:"Financial stakes are converging", es:"Los asuntos financieros convergen", de:"Die finanziellen Fragen laufen zusammen", it:"Le questioni finanziarie convergono",
                               pt:"As questões financeiras convergem", nl:"De financiële belangen komen samen", ja:"お金の論点が重なる", zh:"财务议题交汇在一起", ar:"تتقاطع الرهانات المالية" },

  "match.theme.3.partner":   { fr:"La communication est la clé ce mois-ci", en:"Communication is the key this month", es:"La comunicación es la clave este mes", de:"Kommunikation ist diesen Monat der Schlüssel", it:"La comunicazione è la chiave questo mese",
                               pt:"A comunicação é a chave este mês", nl:"Communicatie is deze maand de sleutel", ja:"今月は話すことが鍵", zh:"本月的关键是沟通", ar:"التواصل هو المفتاح هذا الشهر" },
  "match.theme.3.friend":    { fr:"Vos échanges s'intensifient", en:"Your exchanges are intensifying", es:"Vuestros intercambios se intensifican", de:"Euer Austausch wird dichter", it:"I vostri scambi si intensificano",
                               pt:"As vossas trocas intensificam-se", nl:"Jullie contact wordt intenser", ja:"やりとりが濃くなる", zh:"你们的往来变密", ar:"يتكثّف تبادلكما" },
  "match.theme.3.family":    { fr:"Les conversations importantes arrivent", en:"Important conversations are coming", es:"Llegan conversaciones importantes", de:"Wichtige Gespräche stehen an", it:"Arrivano conversazioni importanti",
                               pt:"Chegam conversas importantes", nl:"Belangrijke gesprekken komen eraan", ja:"大事な話がやってくる", zh:"重要的对话要来了", ar:"محادثات مهمة في الطريق" },
  "match.theme.3.colleague": { fr:"Les projets de communication se rejoignent", en:"Communication projects are coming together", es:"Los proyectos de comunicación se juntan", de:"Kommunikationsprojekte fügen sich", it:"I progetti di comunicazione si incontrano",
                               pt:"Os projetos de comunicação juntam-se", nl:"Communicatieprojecten vallen samen", ja:"発信まわりの計画が噛み合う", zh:"传播类项目正在合流", ar:"تلتقي مشاريع التواصل" },

  "match.theme.4.partner":   { fr:"Votre foyer partagé est en mouvement", en:"Your shared home is in motion", es:"Vuestro hogar compartido está en movimiento", de:"Euer gemeinsames Zuhause ist in Bewegung", it:"La vostra casa comune è in movimento",
                               pt:"O vosso lar comum está em movimento", nl:"Jullie gedeelde thuis is in beweging", ja:"二人の暮らしの場が動いている", zh:"你们共同的家在变动", ar:"بيتكما المشترك في حركة" },
  "match.theme.4.friend":    { fr:"Vos racines résonnent", en:"Your roots resonate", es:"Vuestras raíces resuenan", de:"Eure Wurzeln klingen zusammen", it:"Le vostre radici risuonano",
                               pt:"As vossas raízes ressoam", nl:"Jullie wortels resoneren", ja:"育ちの記憶が響き合う", zh:"你们的根源在共鸣", ar:"تتجاوب جذوركما" },
  "match.theme.4.family":    { fr:"La maison familiale est au centre", en:"The family home is at the center", es:"La casa familiar está en el centro", de:"Das Elternhaus steht im Mittelpunkt", it:"La casa di famiglia è al centro",
                               pt:"A casa de família está no centro", nl:"Het ouderlijk huis staat centraal", ja:"実家のことが中心になる", zh:"家宅是焦点", ar:"بيت العائلة في المركز" },
  "match.theme.4.colleague": { fr:"Les fondations de vos projets bougent", en:"The foundations of your projects are moving", es:"Los cimientos de vuestros proyectos se mueven", de:"Die Grundlagen eurer Projekte verschieben sich", it:"Le fondamenta dei vostri progetti si muovono",
                               pt:"As fundações dos vossos projetos mexem-se", nl:"De fundamenten van jullie projecten schuiven", ja:"計画の土台が動く", zh:"你们项目的根基在移动", ar:"تتحرّك أسس مشاريعكما" },

  "match.theme.5.partner":   { fr:"Romance et créativité sont amplifiées", en:"Romance and creativity are amplified", es:"El romance y la creatividad se amplifican", de:"Romantik und Kreativität verstärken sich", it:"Romanticismo e creatività si amplificano",
                               pt:"O romance e a criatividade amplificam-se", nl:"Romantiek en creativiteit worden versterkt", ja:"ときめきと創作の力が増す", zh:"浪漫与创造力被放大", ar:"يتضاعف الرومانس والإبداع" },
  "match.theme.5.friend":    { fr:"Le plaisir et la légèreté dominent", en:"Pleasure and lightness dominate", es:"El placer y la ligereza dominan", de:"Vergnügen und Leichtigkeit überwiegen", it:"Il piacere e la leggerezza dominano",
                               pt:"O prazer e a leveza dominam", nl:"Plezier en lichtheid overheersen", ja:"楽しさと軽やかさが前に出る", zh:"快乐与轻松占上风", ar:"تغلب المتعة والخفّة" },
  "match.theme.5.family":    { fr:"Les enfants et la joie sont au premier plan", en:"Children and joy are front and center", es:"Los niños y la alegría están en primer plano", de:"Kinder und Freude stehen im Vordergrund", it:"I bambini e la gioia sono in primo piano",
                               pt:"As crianças e a alegria estão em primeiro plano", nl:"Kinderen en vreugde staan vooraan", ja:"子どもと喜びが前面に出る", zh:"孩子与欢乐排在最前面", ar:"الأطفال والفرح في الواجهة" },
  "match.theme.5.colleague": { fr:"La créativité professionnelle explose", en:"Professional creativity is exploding", es:"La creatividad profesional se dispara", de:"Die berufliche Kreativität bricht hervor", it:"La creatività professionale esplode",
                               pt:"A criatividade profissional dispara", nl:"De creativiteit op het werk barst los", ja:"仕事の発想が一気に出てくる", zh:"职业创造力迸发", ar:"ينفجر الإبداع المهني" },

  "match.theme.6.partner":   { fr:"Vos routines quotidiennes se réorganisent ensemble", en:"Your daily routines are reorganizing together", es:"Vuestras rutinas diarias se reorganizan juntas", de:"Eure Alltagsabläufe ordnen sich gemeinsam neu", it:"Le vostre routine quotidiane si riorganizzano insieme",
                               pt:"As vossas rotinas diárias reorganizam-se juntas", nl:"Jullie dagelijkse routines worden samen herschikt", ja:"日々の段取りが一緒に組み直される", zh:"你们的日常安排在一起重排", ar:"يُعاد تنظيم روتينكما اليومي معاً" },
  "match.theme.6.friend":    { fr:"Le quotidien demande des ajustements", en:"Daily life calls for adjustments", es:"El día a día pide ajustes", de:"Der Alltag verlangt Anpassungen", it:"Il quotidiano chiede aggiustamenti",
                               pt:"O dia a dia pede ajustes", nl:"Het dagelijks leven vraagt om bijstellingen", ja:"日常に手直しが要る", zh:"日常需要一些调整", ar:"الحياة اليومية تتطلّب تعديلات" },
  "match.theme.6.family":    { fr:"Les habitudes familiales changent", en:"Family habits are changing", es:"Los hábitos familiares cambian", de:"Familiengewohnheiten ändern sich", it:"Le abitudini familiari cambiano",
                               pt:"Os hábitos familiares mudam", nl:"Familiegewoonten veranderen", ja:"家の習慣が変わる", zh:"家里的习惯在改变", ar:"تتغيّر عادات العائلة" },
  "match.theme.6.colleague": { fr:"L'organisation du travail évolue", en:"Work organization is evolving", es:"La organización del trabajo evoluciona", de:"Die Arbeitsorganisation verändert sich", it:"L'organizzazione del lavoro evolve",
                               pt:"A organização do trabalho evolui", nl:"De werkorganisatie verandert", ja:"仕事の進め方が変わっていく", zh:"工作方式在演变", ar:"يتطوّر تنظيم العمل" },

  "match.theme.7.partner":   { fr:"Votre relation elle-même est activée — période charnière", en:"Your relationship itself is activated — a pivotal period", es:"Vuestra relación misma se activa — periodo bisagra", de:"Eure Beziehung selbst wird aktiv — eine Schlüsselzeit", it:"La vostra relazione stessa si attiva — periodo cardine",
                               pt:"A própria relação ativa-se — período charneira", nl:"Jullie relatie zelf komt in beweging — een scharnierperiode", ja:"関係そのものが動く — 節目の時期", zh:"关系本身被触动 — 转折时期", ar:"العلاقة نفسها تتحرّك — فترة مفصلية" },
  "match.theme.7.friend":    { fr:"L'équilibre de votre amitié est testé", en:"The balance of your friendship is being tested", es:"El equilibrio de vuestra amistad se pone a prueba", de:"Das Gleichgewicht eurer Freundschaft wird geprüft", it:"L'equilibrio della vostra amicizia è messo alla prova",
                               pt:"O equilíbrio da vossa amizade é posto à prova", nl:"Het evenwicht van jullie vriendschap wordt getest", ja:"友情の釣り合いが試される", zh:"你们友谊的平衡正在受考验", ar:"يُختبَر توازن صداقتكما" },
  "match.theme.7.family":    { fr:"Les engagements familiaux sont en jeu", en:"Family commitments are at stake", es:"Los compromisos familiares están en juego", de:"Familiäre Verpflichtungen stehen auf dem Spiel", it:"Gli impegni familiari sono in gioco",
                               pt:"Os compromissos familiares estão em jogo", nl:"Familieverplichtingen staan op het spel", ja:"家族としての約束が問われる", zh:"家庭承诺处在关口", ar:"الالتزامات العائلية على المحكّ" },
  "match.theme.7.colleague": { fr:"Les partenariats professionnels sont au premier plan", en:"Professional partnerships are front and center", es:"Las alianzas profesionales están en primer plano", de:"Berufliche Partnerschaften stehen im Vordergrund", it:"Le partnership professionali sono in primo piano",
                               pt:"As parcerias profissionais estão em primeiro plano", nl:"Zakelijke samenwerkingen staan vooraan", ja:"仕事の組み相手が前面に出る", zh:"职业合作排在最前面", ar:"الشراكات المهنية في الواجهة" },

  "match.theme.8.partner":   { fr:"Une transformation profonde touche votre lien", en:"A deep transformation is touching your bond", es:"Una transformación profunda toca vuestro vínculo", de:"Eine tiefe Wandlung berührt eure Bindung", it:"Una trasformazione profonda tocca il vostro legame",
                               pt:"Uma transformação profunda toca o vosso laço", nl:"Een diepe verandering raakt jullie band", ja:"深い変化が二人の結びつきに触れる", zh:"一场深层转变触及你们的联结", ar:"تحوّل عميق يمسّ رابطكما" },
  "match.theme.8.friend":    { fr:"Ce qui est caché entre vous remonte", en:"What's hidden between you is surfacing", es:"Lo que está oculto entre vosotros sale a la superficie", de:"Was zwischen euch verborgen war, kommt hoch", it:"Ciò che è nascosto tra voi riaffiora",
                               pt:"O que está escondido entre vocês vem à tona", nl:"Wat verborgen was tussen jullie komt boven", ja:"隠れていたことが表に出る", zh:"你们之间藏着的事浮上来", ar:"يطفو ما كان مخفياً بينكما" },
  "match.theme.8.family":    { fr:"Les héritages et les non-dits émergent", en:"Inheritances and unspoken things are emerging", es:"Las herencias y los no dichos emergen", de:"Erbe und Unausgesprochenes kommen ans Licht", it:"Eredità e non detti emergono",
                               pt:"As heranças e os não ditos emergem", nl:"Erfenissen en het onuitgesprokene komen boven", ja:"受け継いだものと言えずにいたことが出てくる", zh:"遗留与未说出口的事浮现", ar:"تظهر المواريث وما لم يُقَل" },
  "match.theme.8.colleague": { fr:"Les enjeux de pouvoir se clarifient", en:"Power dynamics are clarifying", es:"Los juegos de poder se aclaran", de:"Machtverhältnisse werden klarer", it:"I giochi di potere si chiariscono",
                               pt:"Os jogos de poder clarificam-se", nl:"De machtsverhoudingen worden duidelijker", ja:"力関係がはっきりしてくる", zh:"权力关系变得清楚", ar:"تتّضح موازين النفوذ" },

  "match.theme.9.partner":   { fr:"Vos horizons s'élargissent ensemble", en:"Your horizons are widening together", es:"Vuestros horizontes se ensanchan juntos", de:"Eure Horizonte weiten sich gemeinsam", it:"I vostri orizzonti si allargano insieme",
                               pt:"Os vossos horizontes alargam-se juntos", nl:"Jullie horizon verbreedt zich samen", ja:"二人の視野が一緒に広がる", zh:"你们的视野一起变宽", ar:"تتّسع آفاقكما معاً" },
  "match.theme.9.friend":    { fr:"L'aventure et l'apprentissage vous rapprochent", en:"Adventure and learning bring you closer", es:"La aventura y el aprendizaje os acercan", de:"Abenteuer und Lernen bringen euch näher", it:"L'avventura e l'apprendimento vi avvicinano",
                               pt:"A aventura e a aprendizagem aproximam-vos", nl:"Avontuur en leren brengen jullie dichter bij elkaar", ja:"冒険と学びが二人を近づける", zh:"冒险与学习让你们更近", ar:"المغامرة والتعلّم يقرّبانكما" },
  "match.theme.9.family":    { fr:"Les croyances familiales sont questionnées", en:"Family beliefs are being questioned", es:"Las creencias familiares se cuestionan", de:"Familiäre Überzeugungen werden hinterfragt", it:"Le convinzioni familiari sono messe in discussione",
                               pt:"As crenças familiares são questionadas", nl:"Familieovertuigingen worden bevraagd", ja:"家に根づいた考えが問い直される", zh:"家族的信念被质疑", ar:"تُساءَل قناعات العائلة" },
  "match.theme.9.colleague": { fr:"La vision stratégique se met en place", en:"The strategic vision is falling into place", es:"La visión estratégica se asienta", de:"Die strategische Sicht fügt sich zusammen", it:"La visione strategica prende forma",
                               pt:"A visão estratégica assenta", nl:"De strategische visie valt op zijn plek", ja:"長い目の方針が固まってくる", zh:"战略方向逐渐就位", ar:"تتبلور الرؤية الاستراتيجية" },

  "match.theme.10.partner":   { fr:"Vos ambitions se croisent", en:"Your ambitions are crossing paths", es:"Vuestras ambiciones se cruzan", de:"Eure Ambitionen kreuzen sich", it:"Le vostre ambizioni si incrociano",
                                pt:"As vossas ambições cruzam-se", nl:"Jullie ambities kruisen elkaar", ja:"二人の望みが交差する", zh:"你们的抱负交汇", ar:"تتقاطع طموحاتكما" },
  "match.theme.10.friend":    { fr:"Vos réputations s'influencent mutuellement", en:"Your reputations influence each other", es:"Vuestras reputaciones se influyen mutuamente", de:"Eure Rufe beeinflussen einander", it:"Le vostre reputazioni si influenzano a vicenda",
                                pt:"As vossas reputações influenciam-se", nl:"Jullie reputaties beïnvloeden elkaar", ja:"互いの評判が影響し合う", zh:"你们的名声互相影响", ar:"تتأثّر سمعة كلٍّ منكما بالآخر" },
  "match.theme.10.family":    { fr:"Le statut familial est en mouvement", en:"The family status is in motion", es:"El estatus familiar está en movimiento", de:"Der Status der Familie ist in Bewegung", it:"Lo status familiare è in movimento",
                                pt:"O estatuto familiar está em movimento", nl:"De status van de familie is in beweging", ja:"家としての立場が動いている", zh:"家庭的地位在变动", ar:"مكانة العائلة في حركة" },
  "match.theme.10.colleague": { fr:"Vos carrières se rejoignent", en:"Your careers are converging", es:"Vuestras carreras se juntan", de:"Eure Laufbahnen laufen zusammen", it:"Le vostre carriere si incontrano",
                                pt:"As vossas carreiras juntam-se", nl:"Jullie loopbanen komen samen", ja:"二人の仕事の道が重なる", zh:"你们的职业路径正在交汇", ar:"يلتقي مساراكما المهنيان" },

  "match.theme.11.partner":   { fr:"Vos réseaux et projets communs sont activés", en:"Your networks and shared projects are activated", es:"Vuestras redes y proyectos comunes se activan", de:"Eure Netzwerke und gemeinsamen Projekte werden aktiv", it:"Le vostre reti e i progetti comuni si attivano",
                                pt:"As vossas redes e projetos comuns ativam-se", nl:"Jullie netwerken en gezamenlijke projecten komen in beweging", ja:"人脈と共同の計画が動き出す", zh:"你们的人脉与共同项目被启动", ar:"تتحرّك شبكاتكما ومشاريعكما المشتركة" },
  "match.theme.11.friend":    { fr:"Votre cercle social est en effervescence", en:"Your social circle is buzzing", es:"Vuestro círculo social está en ebullición", de:"Euer Freundeskreis brodelt", it:"La vostra cerchia sociale è in fermento",
                                pt:"O vosso círculo social está em efervescência", nl:"Jullie vriendenkring bruist", ja:"交友の輪がにぎやかになる", zh:"你们的社交圈热闹起来", ar:"دائرتكما الاجتماعية تعجّ بالحركة" },
  "match.theme.11.family":    { fr:"Les alliances familiales se renforcent", en:"Family alliances are strengthening", es:"Las alianzas familiares se refuerzan", de:"Familiäre Bündnisse werden stärker", it:"Le alleanze familiari si rafforzano",
                                pt:"As alianças familiares reforçam-se", nl:"Familiebanden worden hechter", ja:"家族どうしの結束が強まる", zh:"家族间的结盟在加强", ar:"تتقوّى التحالفات العائلية" },
  "match.theme.11.colleague": { fr:"Les projets d'équipe prennent forme", en:"Team projects are taking shape", es:"Los proyectos de equipo toman forma", de:"Teamprojekte nehmen Gestalt an", it:"I progetti di squadra prendono forma",
                                pt:"Os projetos de equipa ganham forma", nl:"Teamprojecten krijgen vorm", ja:"チームの計画が形になる", zh:"团队项目开始成形", ar:"تتشكّل مشاريع الفريق" },

  "match.theme.12.partner":   { fr:"Un temps de recul partagé — écoutez le silence ensemble", en:"A shared time of retreat — listen to the silence together", es:"Un tiempo de repliegue compartido — escuchad juntos el silencio", de:"Eine gemeinsame Zeit des Rückzugs — hört zusammen in die Stille", it:"Un tempo di ritiro condiviso — ascoltate insieme il silenzio",
                                pt:"Um tempo de recolhimento partilhado — escutem juntos o silêncio", nl:"Een gedeelde tijd van terugtrekken — luister samen naar de stilte", ja:"二人でひと息つく時期 — 静けさに耳をすませて", zh:"共同的退一步时期 — 一起听听沉默", ar:"وقت انسحاب مشترك — أنصتا معاً إلى الصمت" },
  "match.theme.12.friend":    { fr:"L'introspection vous rapproche", en:"Introspection brings you closer", es:"La introspección os acerca", de:"Die Innenschau bringt euch näher", it:"L'introspezione vi avvicina",
                                pt:"A introspeção aproxima-vos", nl:"Introspectie brengt jullie dichter bij elkaar", ja:"内を見る時間が二人を近づける", zh:"内省让你们更近", ar:"التأمّل الداخلي يقرّب بينكما" },
  "match.theme.12.family":    { fr:"Les dynamiques invisibles se révèlent", en:"Invisible dynamics are revealing themselves", es:"Las dinámicas invisibles se revelan", de:"Unsichtbare Muster zeigen sich", it:"Le dinamiche invisibili si rivelano",
                                pt:"As dinâmicas invisíveis revelam-se", nl:"Onzichtbare patronen komen aan het licht", ja:"見えなかった力学が表れる", zh:"看不见的互动显露出来", ar:"تنكشف الديناميات الخفية" },
  "match.theme.12.colleague": { fr:"Le travail en coulisses porte ses fruits", en:"Behind-the-scenes work is paying off", es:"El trabajo entre bastidores da sus frutos", de:"Die Arbeit hinter den Kulissen zahlt sich aus", it:"Il lavoro dietro le quinte dà i suoi frutti",
                                pt:"O trabalho de bastidores dá frutos", nl:"Het werk achter de schermen werpt vruchten af", ja:"裏方の仕事が実を結ぶ", zh:"幕后的工作开始结果", ar:"يؤتي العمل خلف الكواليس ثماره" },

  "match.theme.defaut": { fr:"Vos rythmes se rejoignent ce mois-ci", en:"Your rhythms come together this month", es:"Vuestros ritmos se juntan este mes", de:"Eure Rhythmen treffen sich diesen Monat", it:"I vostri ritmi si incontrano questo mese",
                          pt:"Os vossos ritmos juntam-se este mês", nl:"Jullie ritmes komen deze maand samen", ja:"今月は二人のリズムが噛み合う", zh:"本月你们的节奏合到一处", ar:"يلتقي إيقاعاكما هذا الشهر" },

  // ── Match : quoi faire, par palier et par relation ──────────────────────
  "match.action.peak.partner":   { fr:"Planifiez un moment fort ensemble. Cette fenêtre est rare — ne la laissez pas passer.", en:"Plan a meaningful moment together. This window is rare — don't let it pass.", es:"Planificad un momento fuerte juntos. Esta ventana es rara — no la dejéis pasar.", de:"Plant einen starken gemeinsamen Moment. Dieses Fenster ist selten — lasst es nicht verstreichen.", it:"Pianificate insieme un momento forte. Questa finestra è rara — non lasciatela passare.",
                                   pt:"Planeiem um momento forte juntos. Esta janela é rara — não a deixem passar.", nl:"Plan samen een sterk moment. Dit venster is zeldzaam — laat het niet voorbijgaan.", ja:"二人で大事な時間を予定に入れて。この機会はめったにない — 逃さないで。", zh:"一起安排一个重要时刻。这样的窗口很少 — 别错过。", ar:"خطّطا للحظة قوية معاً. هذه النافذة نادرة — لا تفوّتاها." },
  "match.action.peak.friend":    { fr:"C'est le moment de faire quelque chose de mémorable ensemble.", en:"This is the moment to do something memorable together.", es:"Es el momento de hacer algo memorable juntos.", de:"Jetzt ist der Moment, gemeinsam etwas Unvergessliches zu tun.", it:"È il momento di fare insieme qualcosa di memorabile.",
                                   pt:"É o momento de fazerem algo memorável juntos.", nl:"Dit is het moment om samen iets onvergetelijks te doen.", ja:"一緒に忘れられないことをする時。", zh:"此刻正适合一起做件难忘的事。", ar:"هذه لحظة القيام بشيء لا يُنسى معاً." },
  "match.action.peak.family":    { fr:"Réunissez-vous. Cette période peut transformer vos liens.", en:"Gather. This period can transform your bonds.", es:"Reuníos. Este periodo puede transformar vuestros lazos.", de:"Kommt zusammen. Diese Zeit kann eure Bindungen verwandeln.", it:"Ritrovatevi. Questo periodo può trasformare i vostri legami.",
                                   pt:"Reúnam-se. Este período pode transformar os vossos laços.", nl:"Kom samen. Deze periode kan jullie banden veranderen.", ja:"顔を合わせて。この時期は結びつきを変えうる。", zh:"聚一聚。这段时期可能改变你们的联结。", ar:"اجتمعا. هذه الفترة قد تُغيّر روابطكما." },
  "match.action.peak.colleague": { fr:"Lancez le projet que vous repoussez. Le moment est le bon.", en:"Launch the project you've been putting off. The timing is right.", es:"Lanzad el proyecto que vais aplazando. El momento es el bueno.", de:"Startet das Projekt, das ihr aufschiebt. Der Zeitpunkt stimmt.", it:"Avviate il progetto che rimandate. Il momento è quello giusto.",
                                   pt:"Lancem o projeto que vão adiando. O momento é o certo.", nl:"Start het project dat jullie uitstellen. Het moment klopt.", ja:"先延ばしにしている計画を始めて。いまがその時。", zh:"把一直拖着的项目启动吧。时机正好。", ar:"أطلِقا المشروع الذي تؤجّلانه. التوقيت مناسب." },

  "match.action.clear.partner":   { fr:"Ouvrez la conversation que vous repoussez. Le terrain est favorable.", en:"Open the conversation you've been postponing. The ground is favorable.", es:"Abrid la conversación que aplazáis. El terreno es favorable.", de:"Beginnt das Gespräch, das ihr aufschiebt. Der Boden ist günstig.", it:"Aprite la conversazione che rimandate. Il terreno è favorevole.",
                                    pt:"Abram a conversa que vão adiando. O terreno é favorável.", nl:"Begin het gesprek dat jullie uitstellen. De bodem is gunstig.", ja:"先延ばしにしている話を始めて。土台は整っている。", zh:"把一直拖着的那段对话打开吧。土壤是有利的。", ar:"افتحا الحديث الذي تؤجّلانه. الأرضية مواتية." },
  "match.action.clear.friend":    { fr:"Proposez une activité ensemble — l'énergie est là.", en:"Suggest doing something together — the energy is there.", es:"Proponed algo juntos — la energía está ahí.", de:"Schlagt etwas Gemeinsames vor — die Energie ist da.", it:"Proponete qualcosa da fare insieme — l'energia c'è.",
                                    pt:"Proponham algo para fazerem juntos — a energia está lá.", nl:"Stel iets voor om samen te doen — de energie is er.", ja:"一緒にできることを誘ってみて — 勢いはある。", zh:"提议一起做点什么 — 劲头是有的。", ar:"اقترحا نشاطاً معاً — الطاقة موجودة." },
  "match.action.clear.family":    { fr:"Prenez le temps de vous appeler ou de vous voir.", en:"Take the time to call or see each other.", es:"Tomaos el tiempo de llamaros o veros.", de:"Nehmt euch die Zeit, euch anzurufen oder zu sehen.", it:"Prendetevi il tempo di sentirvi o vedervi.",
                                    pt:"Arranjem tempo para se ligarem ou verem.", nl:"Neem de tijd om te bellen of elkaar te zien.", ja:"電話するか、会う時間をとって。", zh:"抽时间通个电话或见一面。", ar:"خصّصا وقتاً للاتصال أو اللقاء." },
  "match.action.clear.colleague": { fr:"Mettez-vous d'accord sur les priorités — c'est le bon moment.", en:"Agree on your priorities — this is the right moment.", es:"Poneos de acuerdo en las prioridades — es el momento.", de:"Einigt euch auf die Prioritäten — jetzt ist der richtige Moment.", it:"Mettetevi d'accordo sulle priorità — è il momento giusto.",
                                    pt:"Acertem as prioridades — é o momento certo.", nl:"Word het eens over de prioriteiten — dit is het juiste moment.", ja:"優先順位をすり合わせて — いまがその時。", zh:"把优先级谈定 — 正是时候。", ar:"اتّفقا على الأولويات — هذا هو الوقت المناسب." },

  "match.action.subtle.partner":   { fr:"Restez attentifs aux signaux discrets entre vous.", en:"Stay attentive to the quiet signals between you.", es:"Estad atentos a las señales discretas entre vosotros.", de:"Bleibt aufmerksam für die leisen Signale zwischen euch.", it:"Restate attenti ai segnali discreti tra voi.",
                                     pt:"Fiquem atentos aos sinais discretos entre vocês.", nl:"Blijf alert op de stille signalen tussen jullie.", ja:"二人のあいだの小さな合図に気を配って。", zh:"留意你们之间细微的信号。", ar:"انتبها للإشارات الخفيفة بينكما." },
  "match.action.subtle.friend":    { fr:"Un petit geste peut faire une grande différence.", en:"A small gesture can make a big difference.", es:"Un pequeño gesto puede marcar una gran diferencia.", de:"Eine kleine Geste kann viel bewirken.", it:"Un piccolo gesto può fare una grande differenza.",
                                     pt:"Um pequeno gesto pode fazer uma grande diferença.", nl:"Een klein gebaar kan veel verschil maken.", ja:"小さな一手が大きな違いになる。", zh:"一个小举动可能带来大不同。", ar:"لفتة صغيرة قد تُحدث فرقاً كبيراً." },
  "match.action.subtle.family":    { fr:"Les petites attentions comptent plus que d'habitude.", en:"Small attentions count more than usual.", es:"Los pequeños detalles cuentan más que de costumbre.", de:"Kleine Aufmerksamkeiten zählen mehr als sonst.", it:"Le piccole attenzioni contano più del solito.",
                                     pt:"As pequenas atenções contam mais do que o habitual.", nl:"Kleine attenties tellen meer dan anders.", ja:"ささやかな気づかいがいつもより効く。", zh:"小小的关心此时格外重要。", ar:"اللفتات الصغيرة تُحتسب أكثر من المعتاد." },
  "match.action.subtle.colleague": { fr:"Observez les dynamiques — un ajustement discret peut tout changer.", en:"Watch the dynamics — a discreet adjustment can change everything.", es:"Observad las dinámicas — un ajuste discreto puede cambiarlo todo.", de:"Beobachtet die Dynamik — eine leise Anpassung kann alles ändern.", it:"Osservate le dinamiche — un aggiustamento discreto può cambiare tutto.",
                                     pt:"Observem as dinâmicas — um ajuste discreto pode mudar tudo.", nl:"Let op de dynamiek — een kleine bijstelling kan alles veranderen.", ja:"力の流れを見て — 目立たない調整が全部を変える。", zh:"观察互动的走向 — 一次不动声色的调整就能改变全局。", ar:"راقبا الديناميات — تعديل هادئ قد يغيّر كل شيء." },

  "match.action.defaut": { fr:"Restez attentifs aux signaux.", en:"Stay attentive to the signals.", es:"Estad atentos a las señales.", de:"Bleibt aufmerksam für die Signale.", it:"Restate attenti ai segnali.",
                           pt:"Fiquem atentos aos sinais.", nl:"Blijf alert op de signalen.", ja:"合図に気を配って。", zh:"留意这些信号。", ar:"انتبها للإشارات." },

  // ── Match : pourquoi ce mois compte pour les deux ───────────────────────
  "match.insight.bascule":    { fr:"Vous traversez un tournant en même temps. Ce qui change pour l'un résonne chez l'autre.", en:"You're going through a turning point at the same time. What changes for one resonates in the other.", es:"Atravesáis un punto de inflexión a la vez. Lo que cambia para uno resuena en el otro.", de:"Ihr durchlebt gleichzeitig einen Wendepunkt. Was sich für den einen ändert, klingt beim anderen nach.", it:"State attraversando una svolta nello stesso momento. Ciò che cambia per l'uno risuona nell'altro.",
                                pt:"Atravessam um ponto de viragem ao mesmo tempo. O que muda para um ressoa no outro.", nl:"Jullie gaan tegelijk door een kantelpunt. Wat voor de één verandert, weerklinkt bij de ander.", ja:"同じ時期に二人とも転換点を通っている。片方の変化がもう片方に響く。", zh:"你们同时正处在一个转折点。一方的变化会在另一方回响。", ar:"تمرّان بنقطة تحوّل في الوقت نفسه. ما يتغيّر عند أحدكما يتردّد صداه عند الآخر." },
  "match.insight.rythmes":    { fr:"Vos rythmes de vie convergent. Les grandes lignes de vos trajectoires se rejoignent.", en:"Your life rhythms are converging. The broad lines of your paths are coming together.", es:"Vuestros ritmos de vida convergen. Las grandes líneas de vuestras trayectorias se juntan.", de:"Eure Lebensrhythmen laufen zusammen. Die groben Linien eurer Wege treffen sich.", it:"I vostri ritmi di vita convergono. Le grandi linee dei vostri percorsi si incontrano.",
                                pt:"Os vossos ritmos de vida convergem. As grandes linhas dos vossos percursos juntam-se.", nl:"Jullie levensritmes lopen samen. De grote lijnen van jullie paden komen bij elkaar.", ja:"二人の生活のリズムが近づいている。歩みの大きな筋が重なる。", zh:"你们的生活节奏在靠拢。两条路线的大方向正在交汇。", ar:"يتقارب إيقاعا حياتكما. تلتقي الخطوط العريضة لمساريكما." },
  "match.insight.catalyse":   { fr:"Un tournant chez l'un accélère la transformation chez l'autre.", en:"A turning point in one accelerates the transformation in the other.", es:"Un punto de inflexión en uno acelera la transformación en el otro.", de:"Ein Wendepunkt beim einen beschleunigt die Wandlung beim anderen.", it:"Una svolta nell'uno accelera la trasformazione nell'altro.",
                                pt:"Um ponto de viragem num acelera a transformação no outro.", nl:"Een kantelpunt bij de één versnelt de verandering bij de ander.", ja:"片方の転換がもう片方の変化を早める。", zh:"一方的转折加快了另一方的转变。", ar:"نقطة تحوّل عند أحدكما تُسرّع التحوّل عند الآخر." },
  "match.insight.deux_forts": { fr:"Deux signaux forts en même temps — cette fenêtre est exceptionnelle pour agir ensemble.", en:"Two strong signals at the same time — this window is exceptional for acting together.", es:"Dos señales fuertes a la vez — esta ventana es excepcional para actuar juntos.", de:"Zwei starke Signale zugleich — dieses Fenster ist außergewöhnlich, um gemeinsam zu handeln.", it:"Due segnali forti nello stesso momento — questa finestra è eccezionale per agire insieme.",
                                pt:"Dois sinais fortes ao mesmo tempo — esta janela é excecional para agirem juntos.", nl:"Twee sterke signalen tegelijk — dit venster is uitzonderlijk om samen te handelen.", ja:"強いシグナルが同時に二つ — 一緒に動くには特別な機会。", zh:"两个强信号同时出现 — 这个窗口非常适合一起行动。", ar:"إشارتان قويتان في وقت واحد — نافذة استثنائية للتحرّك معاً." },
  "match.insight.un_fort":    { fr:"Un moment important pour l'un crée une ouverture pour les deux.", en:"An important moment for one creates an opening for both.", es:"Un momento importante para uno abre una puerta para los dos.", de:"Ein wichtiger Moment für den einen öffnet beiden eine Tür.", it:"Un momento importante per l'uno apre uno spiraglio per entrambi.",
                                pt:"Um momento importante para um abre uma porta para os dois.", nl:"Een belangrijk moment voor de één opent een deur voor allebei.", ja:"片方の大事な時が、二人にとっての入口になる。", zh:"一方的重要时刻为两人打开了一个口子。", ar:"لحظة مهمّة لأحدكما تفتح باباً لكليكما." },
  "match.insight.partner":    { fr:"Vos rythmes individuels créent une fenêtre commune. Profitez-en.", en:"Your individual rhythms create a shared window. Make the most of it.", es:"Vuestros ritmos individuales crean una ventana común. Aprovechadla.", de:"Eure eigenen Rhythmen schaffen ein gemeinsames Fenster. Nutzt es.", it:"I vostri ritmi individuali creano una finestra comune. Approfittatene.",
                                pt:"Os vossos ritmos individuais criam uma janela comum. Aproveitem-na.", nl:"Jullie eigen ritmes maken een gedeeld venster. Maak er gebruik van.", ja:"それぞれのリズムが共通の機会をつくっている。生かして。", zh:"各自的节奏造出了一个共同的窗口。好好利用。", ar:"إيقاع كلٍّ منكما يصنع نافذة مشتركة. اغتنماها." },
  "match.insight.friend":     { fr:"L'énergie est là pour renforcer ce qui vous lie.", en:"The energy is there to strengthen what connects you.", es:"La energía está ahí para reforzar lo que os une.", de:"Die Energie ist da, um zu stärken, was euch verbindet.", it:"L'energia c'è per rafforzare ciò che vi lega.",
                                pt:"A energia está lá para reforçar o que vos liga.", nl:"De energie is er om te versterken wat jullie bindt.", ja:"二人をつなぐものを強めるだけの勢いがある。", zh:"有足够的劲头去加固联系你们的东西。", ar:"الطاقة حاضرة لتقوية ما يجمعكما." },
  "match.insight.family":     { fr:"Les circonstances vous rapprochent — même sans le chercher.", en:"Circumstances are bringing you closer — even without trying.", es:"Las circunstancias os acercan — aunque no lo busquéis.", de:"Die Umstände bringen euch näher — auch ohne Absicht.", it:"Le circostanze vi avvicinano — anche senza cercarlo.",
                                pt:"As circunstâncias aproximam-vos — mesmo sem procurarem.", nl:"De omstandigheden brengen jullie dichter bij elkaar — ook zonder dat je het zoekt.", ja:"とくに求めなくても、状況が二人を近づける。", zh:"即使不刻意，境况也在把你们拉近。", ar:"الظروف تقرّب بينكما — حتى دون سعي." },
  "match.insight.colleague":  { fr:"Côté travail, le moment est le même pour vous deux.", en:"On the work side, the moment is the same for you both.", es:"En lo profesional, el momento es el mismo para los dos.", de:"Beruflich ist der Moment für euch beide derselbe.", it:"Sul lavoro, il momento è lo stesso per entrambi.",
                                pt:"No trabalho, o momento é o mesmo para os dois.", nl:"Op werkvlak is het moment voor jullie beiden hetzelfde.", ja:"仕事の面では、二人にとって同じ時期。", zh:"在工作上，你们两人处在同一个时点。", ar:"على صعيد العمل، اللحظة نفسها لكليكما." },

  // ── Match : les titres de fenetre. {mois} vient d Intl, jamais d une table.
  "match.titre.actif":  { fr:"Accord en cours", en:"Agreement under way", es:"Acuerdo en curso", de:"Übereinstimmung im Gange", it:"Accordo in corso",
                          pt:"Acordo em curso", nl:"Overeenkomst gaande", ja:"いま噛み合っている", zh:"此刻契合", ar:"توافق جارٍ" },
  "match.titre.fort":   { fr:"Moment fort — {mois}", en:"Strong moment — {mois}", es:"Momento fuerte — {mois}", de:"Starker Moment — {mois}", it:"Momento forte — {mois}",
                          pt:"Momento forte — {mois}", nl:"Sterk moment — {mois}", ja:"強い時期 — {mois}", zh:"强烈时刻 — {mois}", ar:"لحظة قوية — {mois}" },
  "match.titre.accord": { fr:"Accord — {mois}", en:"Agreement — {mois}", es:"Acuerdo — {mois}", de:"Übereinstimmung — {mois}", it:"Accordo — {mois}",
                          pt:"Acordo — {mois}", nl:"Overeenkomst — {mois}", ja:"噛み合い — {mois}", zh:"契合 — {mois}", ar:"توافق — {mois}" },

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
