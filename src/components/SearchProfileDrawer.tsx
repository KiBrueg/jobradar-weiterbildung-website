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

  const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

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
    <Drawer open={!!course} onClose={onClose} title="Suchprofil fuer passende Einstiegsstellen" subtitle={course.name} width="max-w-xl"
      footer={<><button className="btn-ghost" onClick={onClose}><X className="h-4 w-4" /> Abbrechen</button><button className="btn-primary" onClick={handleSave}><Save className="h-4 w-4" /> Speichern</button></>}>
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-3.5 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-800 leading-relaxed">Coaches bearbeiten nicht die Stellen selbst, sondern die Kriterien, welche Stellen fuer diesen Kurs relevant sind.</p>
        </div>
        <div><label className="label">Zielberufe / Job Titles</label><textarea className="textarea" value={targetTitles} onChange={(e) => setTargetTitles(e.target.value)} placeholder={'Junior Data Analyst\nBI Analyst'} /></div>
        <div><label className="label">Keywords / Skills</label><textarea className="textarea" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={'SQL\nExcel\nPower BI'} /></div>
      </div>
    </Drawer>
  );
}
