import WidgetKit
import SwiftUI

struct Entree: TimelineEntry {
    let date: Date
    let instantane: Instantane?
}

struct Fournisseur: TimelineProvider {
    func placeholder(in context: Context) -> Entree {
        Entree(date: Date(), instantane: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (Entree) -> Void) {
        completion(Entree(date: Date(), instantane: Instantane.lire()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entree>) -> Void) {
        let entree = Entree(date: Date(), instantane: Instantane.lire())
        // On se reveille au prochain minuit : ce qui change dans ce widget, c est
        // le nombre de jours restants, et il ne bouge qu au changement de date.
        // Se rafraichir plus souvent gaspillerait le budget que le systeme
        // accorde, sans rien afficher de different.
        let demain = Calendar.current.startOfDay(for: Date().addingTimeInterval(86_400))
        completion(Timeline(entries: [entree], policy: .after(demain)))
    }
}

/// Convertit « #RRGGBB » en couleur. Rend nil plutot que du magenta de debug si
/// la chaine est abimee : une couleur fausse se remarque moins qu une absente.
func couleurDepuisHexa(_ hexa: String?) -> Color? {
    guard var s = hexa else { return nil }
    if s.hasPrefix("#") { s.removeFirst() }
    guard s.count == 6, let v = Int(s, radix: 16) else { return nil }
    return Color(
        .sRGB,
        red: Double((v >> 16) & 0xFF) / 255,
        green: Double((v >> 8) & 0xFF) / 255,
        blue: Double(v & 0xFF) / 255
    )
}

struct VueWidget: View {
    var entree: Entree
    @Environment(\.widgetFamily) var famille

    var body: some View {
        if let instantane = entree.instantane, let actuelle = instantane.actuelle {
            contenu(actuelle: actuelle, suivante: instantane.suivante)
        } else {
            // Pas encore de resume : l app n a pas ete ouverte depuis
            // l installation du widget. On le dit sans dramatiser.
            VStack(alignment: .leading, spacing: 6) {
                Text("Favorable")
                    .font(.caption).fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Text("Ouvre l'app une fois pour voir ta période ici.")
                    .font(.footnote)
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }

    @ViewBuilder
    func contenu(actuelle: Instantane.Periode, suivante: Instantane.Periode?) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 5) {
                Circle()
                    .fill(couleurDepuisHexa(actuelle.couleur) ?? Color.accentColor)
                    .frame(width: 7, height: 7)
                Text("En ce moment")
                    .font(.caption2).fontWeight(.semibold)
                    .foregroundStyle(.secondary)
            }

            Text(actuelle.titre)
                .font(famille == .systemSmall ? .headline : .title3)
                .fontWeight(.semibold)
                .foregroundStyle(.primary)
                .lineLimit(famille == .systemSmall ? 2 : 1)
                .minimumScaleFactor(0.8)
                .padding(.top, 5)

            if famille != .systemSmall, let sousTitre = actuelle.sousTitre, !sousTitre.isEmpty {
                Text(sousTitre)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .padding(.top, 2)
            }

            Spacer(minLength: 4)

            if let jours = Instantane.joursJusqua(actuelle.fin), jours >= 0 {
                Text(jours == 0 ? "Dernier jour"
                     : jours == 1 ? "Encore 1 jour"
                     : "Encore \(jours) jours")
                    .font(.caption).fontWeight(.medium)
                    .foregroundStyle(.secondary)
            }

            if famille != .systemSmall, let suivante,
               let dans = Instantane.joursJusqua(suivante.debut), dans >= 0 {
                Divider().padding(.vertical, 6)
                HStack(spacing: 5) {
                    Circle()
                        .fill(couleurDepuisHexa(suivante.couleur) ?? Color.secondary)
                        .frame(width: 6, height: 6)
                    Text(suivante.titre)
                        .font(.caption).fontWeight(.medium)
                        .lineLimit(1)
                    Spacer(minLength: 4)
                    Text(dans == 0 ? "demain" : "dans \(dans) j")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

struct FavorableWidget: Widget {
    let kind = "FavorableWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Fournisseur()) { entree in
            if #available(iOS 17.0, *) {
                VueWidget(entree: entree)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                VueWidget(entree: entree).padding()
            }
        }
        .configurationDisplayName("Ta période")
        .description("La période en cours et celle qui vient.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct FavorableWidgetBundle: WidgetBundle {
    var body: some Widget {
        FavorableWidget()
    }
}
