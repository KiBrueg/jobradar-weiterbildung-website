import { useEffect, useState } from 'react';
import { Save, GitPullRequestArrow, X, Info } from 'lucide-react';
import { Drawer } from '@/components/ui';
import type { Course, SearchProfile } from '@/data/mock';

interface Props {
  course: Course | null;
  profile: SearchProfile | undefined;
  onClose: () => void;
  onSave: (p: SearchProfile) => void;
  onRequestChange: () => void;
}

export default function SearchProfileDrawer({ course, profile, onClose, onSave, onRequestChange }: Props) {
  const [targetTitles, setTargetTitles] = useState('');
  const [skills, setSkills] = useState('');
  const [locationRules, setLocationRules] = useState('');
  const [languageRules, setLanguageRules] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [sourceQueries, setSourceQueries] = useState('');
  const [coachNote, setCoachNote] = useState('');

  useEffect(() => {
    if (!course) return;
    const p = profile;
    setTargetTitles(p?.targetTitles.join('\n') ?? '');
    setSkills(p?.skills.join('\n') ?? '');
    setLocationRules(p?.locationRules ?? '');
    setLanguageRules(p?.languageRules ?? '');
    setExclusions(p?.exclusions.join('\n') ?? '');
    setSourceQueries(p?.sourceQueries.join('\n') ?? '');
    setCoachNote(p?.coachNote ?? '');
  }, [course, profile]);

  if (!course) return null;

  const toLines = (s: string) =>
    s.split('\n').map((l) => l.trim()).filter(Boolean);

  const handleSave = () => {
    const updated: SearchProfile = {
      id: profile?.id ?? Date.now(),
      courseId: course.id,
      targetTitles: toLines(targetTitles),
      skills: toLines(skills),
      locationRules,
      languageRules,
      exclusions: toLines(exclusions),
      sourceQueries: toLines(sourceQueries),
      coachNote,
      status: profile?.status ?? 'active',
      activeQueries: toLines(sourceQueries).length,
      lastChanged: 'gerade eben',
      hasOpenChange: profile?.hasOpenChange ?? false,
    };
    onSave(updated);
  };

  return (
    <Drawer
      open={!!course}
      onClose={onClose}
      title="Suchprofil fuer passende Einstiegsstellen"
      subtitle={course.name}
      width="max-w-xl"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            <X className="h-4 w-4" /> Abbrechen
          </button>
          <button className="btn-secondary" onClick={onRequestChange}>
            <GitPullRequestArrow className="h-4 w-4" /> AEnderung als Request senden
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save className="h-4 w-4" /> Speichern
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-3.5 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-800 leading-relaxed">
            Coaches bearbeiten nicht die Stellen selbst, sondern die Kriterien, welche Stellen fuer diesen Kurs relevant sind.
          </p>
        </div>

        <div>
          <label className="label">Zielberufe / Job Titles</label>
          <textarea
            className="textarea"
            value={targetTitles}
            onChange={(e) => setTargetTitles(e.target.value)}
            placeholder={'Junior Data Analyst\nBI Analyst\nReporting Analyst'}
          />
          <p className="mt-1 text-xs text-ink-400">Ein Titel pro Zeile.</p>
        </div>

        <div>
          <label className="label">Keywords / Skills</label>
          <textarea
            className="textarea"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={'SQL\nExcel\nPower BI\nPython basics'}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Standortregeln</label>
            <input className="input" value={locationRules} onChange={(e) => setLocationRules(e.target.value)} placeholder="Remote + Berlin/Hamburg" />
          </div>
          <div>
            <label className="label">Sprachregeln</label>
            <input className="input" value={languageRules} onChange={(e) => setLanguageRules(e.target.value)} placeholder="German B1+ or English C1" />
          </div>
        </div>

        <div>
          <label className="label">Ausschluesse / Red Flags</label>
          <textarea
            className="textarea"
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            placeholder={'Senior\nLead\nManager\n5+ years\non-site only'}
          />
        </div>

        <div>
          <label className="label">Source Queries</label>
          <textarea
            className="textarea"
            value={sourceQueries}
            onChange={(e) => setSourceQueries(e.target.value)}
            placeholder={'junior data analyst remote\nBI analyst berlin entry'}
          />
          <p className="mt-1 text-xs text-ink-400">Diese Queries werden an die Job-Quellen gesendet.</p>
        </div>

        <div>
          <label className="label">Coach Note</label>
          <textarea
            className="textarea"
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            placeholder="Fokus auf Einsteiger mit AZAV-nahem Profil."
          />
        </div>
      </div>
    </Drawer>
  );
}
