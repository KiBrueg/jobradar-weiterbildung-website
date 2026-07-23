import { Star, FileText, ClipboardList, BarChart3 } from 'lucide-react';
import { IconCard } from './ui';

const sources = [
  { icon: Star, title: 'Google Unternehmensprofil', text: 'Sobald ein oeffentliches Unternehmensprofil und echte Bewertungen vorhanden sind, koennen ausgewaehlte Bewertungen verlinkt werden.', accent: 'brand' as const },
  { icon: ClipboardList, title: 'Pilotprojekt-Feedback', text: 'Nach einem Testlauf mit Bildungstraegern koennen freigegebene Aussagen als Kundenstimmen ergaenzt werden.', accent: 'accent' as const },
  { icon: FileText, title: 'Case Studies', text: 'Kurze Fallstudien pro Kursprofil: Ausgangslage, Rechercheumfang, gefundene Stellen, Nutzen fuer Coaching.', accent: 'cyanx' as const },
  { icon: BarChart3, title: 'Interne Evaluation', text: 'Feedback von Coaches und Kurskoordination zu Relevanz, Zeitersparnis und Reportqualitaet.', accent: 'ink' as const },
];

export default function FutureReviewSources() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {sources.map((s, i) => (
        <div key={s.title} style={{ animationDelay: `${i * 70}ms` }}>
          <IconCard icon={s.icon} title={s.title} accent={s.accent}>{s.text}</IconCard>
        </div>
      ))}
    </div>
  );
}
