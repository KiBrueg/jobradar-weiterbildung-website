import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileBarChart,
  GraduationCap,
  LockKeyhole,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { goKontakt } from '@/App';
import { courses, documents, leads, profileForCourse, schools } from '@/data/mock';

const tariff = {
  plan: 'Pilot Portal',
  price: '490 € / Monat',
  validUntil: 'Pilotphase · monatlich kuendbar',
  included: [
    'bis 2 Kurse im Pilot',
    '4 Suchlaeufe pro Monat',
    'gepruefte Matches statt Rohdaten',
    'Schulreport als HTML/CSV/PDF-Vorlage',
    'AEnderungswuensche ueber Freigabeprozess',
  ],
};

function statusLabel(status: string) {
  if (status === 'Approved') return 'Freigegeben';
  if (status === 'QA Needed') return 'In Pruefung';
  if (status === 'Candidate') return 'Kandidat';
  return 'Nicht sichtbar';
}

export default function SchoolPortalPage() {
  const activeSchools = schools.filter((s) => s.status === 'active');
  const [selectedSchoolId, setSelectedSchoolId] = useState(activeSchools[0]?.id ?? 1);
  const selectedSchool = schools.find((s) => s.id === selectedSchoolId) ?? activeSchools[0];

  const schoolCourses = useMemo(
    () => courses.filter((c) => c.schoolId === selectedSchoolId && c.status !== 'archived'),
    [selectedSchoolId]
  );
  const schoolCourseIds = new Set(schoolCourses.map((c) => c.id));
  const visibleMatches = leads.filter((l) => schoolCourseIds.has(l.courseId) && l.status === 'Approved');
  const qaCount = leads.filter((l) => schoolCourseIds.has(l.courseId) && l.status !== 'Rejected' && l.status !== 'Approved').length;
  const schoolDocs = documents.filter((d) => d.schoolId === selectedSchoolId && d.access !== 'private');
  const activeProfiles = schoolCourses.filter((c) => !!profileForCourse(c.id)).length;

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-x-hidden">
      <PublicHeader />
      <main id="main-content" role="main">
        <section className="relative overflow-hidden border-b border-ink-200/60 bg-white">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-20">
            <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Schulportal Demo · read-only · keine internen Kosten
                </span>
                <h1 className="mt-6 font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-balance">
                  Ein sicherer Blick auf <span className="text-brand-700">Ihre Kurse, Matches und Reports</span>
                </h1>
                <p className="mt-5 text-lg text-ink-600 leading-relaxed max-w-2xl">
                  Diese Portalansicht zeigt, was ein Bildungstraeger sehen soll: eigene Kurse, freigegebene Matches,
                  Tarif-Leistung und Reports — keine Parserkosten, keine Rohdaten, keine Daten anderer Schulen.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => goKontakt()} className="btn-primary text-base px-5 py-3">
                    Pilotzugang anfragen
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a href="#matches" className="btn-secondary text-base px-5 py-3">
                    Matches ansehen
                  </a>
                </div>
              </div>

              <div className="card p-6 shadow-lift">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Demo-Schule</p>
                    <h2 className="font-display text-xl font-semibold mt-1">{selectedSchool?.name}</h2>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-white">
                    <School className="h-6 w-6" />
                  </span>
                </div>
                <label className="label">Schulansicht wechseln</label>
                <select
                  className="input mb-5"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(Number(e.target.value))}
                >
                  {activeSchools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-ink-50 p-4 border border-ink-100">
                    <div className="text-2xl font-semibold tabular-nums">{schoolCourses.length}</div>
                    <div className="text-xs text-ink-500 mt-1">Kurse</div>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-4 border border-ink-100">
                    <div className="text-2xl font-semibold tabular-nums">{activeProfiles}</div>
                    <div className="text-xs text-ink-500 mt-1">Suchprofile</div>
                  </div>
                  <div className="rounded-xl bg-accent-50 p-4 border border-accent-100">
                    <div className="text-2xl font-semibold tabular-nums text-accent-700">{visibleMatches.length}</div>
                    <div className="text-xs text-accent-700/80 mt-1">freigegeben</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                    <div className="text-2xl font-semibold tabular-nums text-amber-700">{qaCount}</div>
                    <div className="text-xs text-amber-700/80 mt-1">in Pruefung</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-semibold">Tarif & Leistung</h2>
              </div>
              <div className="rounded-xl bg-ink-900 text-white p-5 mb-5">
                <div className="text-sm text-white/60">{tariff.plan}</div>
                <div className="mt-1 font-display text-2xl font-semibold">{tariff.price}</div>
                <div className="mt-1 text-xs text-white/50">{tariff.validUntil}</div>
              </div>
              <ul className="space-y-3">
                {tariff.included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">Kurse & Suchprofile</h2>
                  <p className="text-sm text-ink-500 mt-1">Nur die Kurse der ausgewaehlten Schule.</p>
                </div>
                <BookOpen className="h-5 w-5 text-ink-300" />
              </div>
              <div className="table-wrap" role="region" aria-label="Kurse der Schule" tabIndex={0}>
                <table>
                  <thead>
                    <tr><th>Kurs</th><th>Thema</th><th>Suchprofil</th><th>Score</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {schoolCourses.map((course) => {
                      const profile = profileForCourse(course.id);
                      return (
                        <tr key={course.id}>
                          <td className="font-medium text-ink-900">{course.name}</td>
                          <td>{course.topic}</td>
                          <td>{profile ? `${profile.activeQueries} aktive Queries` : 'noch nicht bereit'}</td>
                          <td>{course.score}%</td>
                          <td><span className="chip capitalize">{course.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="matches" className="bg-white border-y border-ink-200/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Freigegebene Matches</h2>
                <p className="mt-2 text-ink-600 max-w-2xl">
                  Schulen sehen nur gepruefte Treffer. Kandidaten in QA, abgelehnte Treffer und interne Notizen bleiben intern.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <Eye className="h-3.5 w-3.5" />
                school-visible only
              </span>
            </div>
            <div className="card p-2">
              <div className="table-wrap" role="region" aria-label="Freigegebene Matches" tabIndex={0}>
                <table>
                  <thead>
                    <tr><th>Rolle</th><th>Unternehmen</th><th>Kurs</th><th>Fit</th><th>Status</th><th>Warum passend</th></tr>
                  </thead>
                  <tbody>
                    {visibleMatches.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-ink-400 py-8">Noch keine freigegebenen Matches fuer diese Schule.</td></tr>
                    )}
                    {visibleMatches.map((lead) => {
                      const course = courses.find((c) => c.id === lead.courseId);
                      return (
                        <tr key={lead.id}>
                          <td className="font-medium text-ink-900">{lead.title}</td>
                          <td>{lead.company}</td>
                          <td>{course?.name ?? '—'}</td>
                          <td>{lead.score}%</td>
                          <td><span className="chip">{statusLabel(lead.status)}</span></td>
                          <td className="text-sm text-ink-600 max-w-md">{lead.whyFit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <FileBarChart className="h-5 w-5 text-brand-600" />
                <h2 className="font-display text-lg font-semibold">Reports & Dokumente</h2>
              </div>
              <div className="space-y-3">
                {schoolDocs.length === 0 && <p className="text-sm text-ink-500">Noch keine schulfreigegebenen Dokumente.</p>}
                {schoolDocs.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                    <div>
                      <div className="font-medium text-ink-900">{doc.name}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{doc.type} · Zugriff: {doc.access}</div>
                    </div>
                    <button onClick={() => goKontakt()} className="btn-ghost text-xs px-3 py-2">
                      <Download className="h-3.5 w-3.5" /> Report anfragen
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 bg-ink-900 text-white">
              <LockKeyhole className="h-7 w-7 text-white/70 mb-4" />
              <h2 className="font-display text-lg font-semibold">Was bewusst verborgen bleibt</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>keine internen Parser-/LLM-/n8n-Kosten</li>
                <li>keine Rohdaten oder Scraping-Logs</li>
                <li>keine Daten anderer Schulen</li>
                <li>keine Credentials, Prompts oder Admin-Links</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16">
          <div className="card p-8 md:p-10 text-center">
            <GraduationCap className="h-9 w-9 text-brand-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Pilotportal fuer Ihre Schule vorbereiten?</h2>
            <p className="mt-3 text-ink-600 max-w-xl mx-auto">
              Fuer echte Kundenzugaenge wird diese Ansicht mit einem privaten Zugang und nur schulbezogenen Daten ausgeliefert.
            </p>
            <button onClick={() => goKontakt()} className="btn-primary mt-6 text-base px-5 py-3">
              Zugang anfragen
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
