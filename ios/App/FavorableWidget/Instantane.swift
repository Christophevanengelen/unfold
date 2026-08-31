import Foundation

/// Ce que l app depose pour le widget, et rien d autre.
///
/// Le widget ne calcule RIEN. Il ne connait ni la date de naissance, ni le
/// theme, ni le moteur : il lit un petit resume que l app a ecrit, et l affiche.
/// C est deliberé — un widget dispose de tres peu de memoire (30 Mo environ) et
/// d aucun reseau garanti ; y refaire le calcul le ferait tuer par le systeme.
struct Instantane: Codable {
    struct Periode: Codable {
        let titre: String
        let sousTitre: String?
        let couleur: String?
        /// AAAA-MM-JJ
        let debut: String?
        let fin: String?
    }

    let actuelle: Periode?
    let suivante: Periode?
    /// Date d ecriture, pour savoir si le resume est vieux.
    let maj: String?

    /// Le magasin partage entre l app et le widget.
    ///
    /// Le groupe doit etre declare dans les droits DES DEUX cibles, sinon la
    /// lecture rend nil sans le moindre message.
    static let groupe = "group.day.favorable.app"

    /// La clef, prefixee.
    ///
    /// Le greffon Preferences de Capacitor prefixe TOUTES ses clefs par
    /// « CapacitorStorage. » avant de les ecrire dans UserDefaults. Lire
    /// « favorable_widget » tout court rendrait nil pour toujours, sans erreur :
    /// c est exactement le genre de detail invisible qui coute une soiree.
    static let clef = "CapacitorStorage.favorable_widget"

    static func lire() -> Instantane? {
        guard let defaults = UserDefaults(suiteName: groupe),
              let brut = defaults.string(forKey: clef),
              let donnees = brut.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(Instantane.self, from: donnees)
    }

    /// Nombre de jours entiers d ici la date donnee. nil si elle est illisible.
    static func joursJusqua(_ jour: String?) -> Int? {
        guard let jour else { return nil }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = TimeZone.current
        guard let cible = f.date(from: String(jour.prefix(10))) else { return nil }
        let aujourdHui = Calendar.current.startOfDay(for: Date())
        return Calendar.current.dateComponents([.day], from: aujourdHui, to: cible).day
    }
}
