import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  asideTitle: string;
  asideItems: string[];
  updatedAt: string;
};

export const LegalPageShell: React.FC<LegalPageShellProps> = ({ eyebrow, title, intro, sections, asideTitle, asideItems, updatedAt }) => {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="min-w-0">
            <BrandLogo size="md" useFullLogo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <ChevronLeft size={16} /> Retour a l accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff_0%,#f6f2eb_52%,#eef2ff_100%)] px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{intro}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mise a jour: {updatedAt}</p>
            </div>

            <div className="divide-y divide-slate-100 px-5 sm:px-8">
              {sections.map((section) => (
                <section key={section.title} className="py-7 sm:py-8">
                  <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Synthese</p>
              <h2 className="mt-2 text-lg font-extrabold text-slate-950">{asideTitle}</h2>
              <div className="mt-4 space-y-3">
                {asideItems.map((item) => (
                  <div key={item} className="border border-slate-100 bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Liens utiles</p>
              <div className="mt-4 space-y-3 text-sm">
                <Link to="/about" className="block text-white/82 transition-colors hover:text-white">A propos de Djambo</Link>
                <Link to="/legal" className="block text-white/82 transition-colors hover:text-white">Mentions legales</Link>
                <Link to="/cookies" className="block text-white/82 transition-colors hover:text-white">Cookies et consentement</Link>
                <Link to="/privacy" className="block text-white/82 transition-colors hover:text-white">Confidentialite</Link>
                <Link to="/terms" className="block text-white/82 transition-colors hover:text-white">Conditions d utilisation</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};