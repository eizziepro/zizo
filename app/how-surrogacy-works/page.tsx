import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, ShieldCheckIcon, CheckIcon, ChevronRightIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'How Surrogacy Works in Nigeria | Zizo Surrogacy',
  description:
    'A step-by-step overview of the surrogacy journey in Lagos, Nigeria. Understand agency coordination, clinical IVF procedures, and independent legal protections.',
  alternates: {
    canonical: `${siteConfig.url}/how-surrogacy-works/`,
  },
};

export default function HowSurrogacyWorksPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'How It Works', url: `${siteConfig.url}/how-surrogacy-works/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'How Surrogacy Works' }]} />

      {/* Hero Header */}
      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap max-w-4xl">
          <span className="label-mono label-mono-inverse mb-4 inline-block">Process &amp; Boundaries</span>
          <h1 className="display-hero text-white mb-4">
            How gestational surrogacy works in Lagos, Nigeria.
          </h1>
          <p className="text-lg text-inverse-muted leading-relaxed mb-8 font-light">
            Surrogacy is a collaborative journey that brings together intended parents, gestational carriers, licensed reproductive clinicians, and legal professionals. Here is a clear breakdown of each phase and who manages it.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
              <CalendarIcon size={18} />
              <span>Schedule a Planning Call</span>
            </Link>
            <WhatsAppLink audience="intendedParent" variant="quiet" showPhoneFallback />
          </div>
        </div>
      </section>

      {/* 5-Stage Timeline */}
      <section className="section-padding bg-[var(--surface-page)]">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold text-[var(--black-shade-150)] mb-8">
            The 5 Milestone Stages
          </h2>

          <div className="space-y-6">
            {[
              {
                stage: 'Stage 01',
                title: 'Confidential Consultation & Family Planning',
                lead: 'Managed by: Zizo Surrogacy Team',
                desc: 'We review your goals, previous fertility treatments, and timelines. We explain program costs, partner fertility clinics, and ethical protocols. No medical files or sensitive diagnosis forms are required to start.',
              },
              {
                stage: 'Stage 02',
                title: 'Surrogate Matching & Personal Alignment',
                lead: 'Managed by: Zizo Surrogacy Team',
                desc: 'We facilitate mutual matching between intended parents and pre-screened surrogates. We prioritize background vetting, psychological preparedness, cultural compatibility, and shared values.',
              },
              {
                stage: 'Stage 03',
                title: 'Clinical Medical Clearance & Legal Contracts',
                lead: 'Managed by: Partner Fertility Hospitals & Independent Legal Counsel',
                desc: 'The matched surrogate completes thorough physical exams, bloodwork, and pelvic ultrasound at an accredited Lagos fertility hospital. Simultaneously, independent reproductive attorneys draft and execute legally binding surrogacy agreements.',
              },
              {
                stage: 'Stage 04',
                title: 'IVF Cycle, Embryo Transfer & Prenatal Monitoring',
                lead: 'Managed by: Partner Fertility Specialists & Zizo Case Manager',
                desc: 'The partner clinic performs the embryo transfer procedure. Following confirmed pregnancy, your Zizo personal case manager coordinates all prenatal visits, routine ultrasound scans, and nutritional support.',
              },
              {
                stage: 'Stage 05',
                title: 'Hospital Delivery & Family Homecoming',
                lead: 'Managed by: Hospital Obstetric Team, Legal Counsel & Zizo',
                desc: 'The child is delivered at an accredited hospital. Legal documentation and parental orders are finalized, allowing you to welcome your baby home with total legal and emotional security.',
              },
            ].map((item) => (
              <div key={item.stage} className="p-6 rounded-lg bg-[var(--white-base)] border border-[var(--border-default)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--action-primary)]">
                    {item.stage}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {item.lead}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--black-shade-150)] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsibility Breakdown Table */}
      <section className="section-padding bg-[var(--surface-soft)] border-t border-[var(--border-subtle)]">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--black-shade-150)] mb-2">
              Who is Responsible for What?
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Full transparency of roles protects all parties legally and medically.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[var(--black-shade-150)]">
                  <th className="py-3 px-4 font-semibold">Responsibility Domain</th>
                  <th className="py-3 px-4 font-semibold">Responsible Party</th>
                  <th className="py-3 px-4 font-semibold">Key Functions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">Care Coordination</td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--action-primary)]">Zizo Surrogacy</td>
                  <td className="py-3.5 px-4">Surrogate background vetting, case management, scan scheduling, personal check-ins.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">Clinical Procedures</td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--black-shade-150)]">Partner Fertility Hospitals</td>
                  <td className="py-3.5 px-4">Hormone evaluations, IVF cycles, embryo transfers, ultrasound scans, obstetric delivery.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">Legal Protections</td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--black-shade-150)]">Independent Attorneys</td>
                  <td className="py-3.5 px-4">Drafting surrogacy contracts, parental rights documentation, court registration filings.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 p-6 rounded-xl bg-[var(--white-base)] border border-[var(--border-default)] text-center flex flex-col items-center gap-3">
            <h3 className="text-lg font-semibold text-[var(--black-shade-150)]">
              Have Specific Questions About Your Situation?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-lg">
              Every family journey is unique. Connect directly with our team in Surulere, Lagos.
            </p>
            <Link href="/book-a-call/" className="btn btn-primary text-sm mt-1">
              <span>Book a Planning Consultation</span>
              <ChevronRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
