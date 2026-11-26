import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, ShieldCheckIcon, CheckIcon, ArrowRightIcon, MapPinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Surrogacy Support for Intended Parents in Lagos | Zizo Surrogacy',
  description:
    'Comprehensive surrogacy coordination for intended parents in Lagos, Nigeria. Confidential surrogate matching, partner fertility clinic alignment, and independent legal safeguards.',
  alternates: {
    canonical: `${siteConfig.url}/intended-parents/`,
  },
};

export default function IntendedParentsPage() {
  const serviceSchema = generateServiceSchema(
    'Intended Parent Surrogacy Coordination',
    'Comprehensive, ethical gestational surrogacy support for intended parents in Lagos, Nigeria, including confidential surrogate matching and clinic coordination.',
    'intended-parents'
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'For Intended Parents', url: `${siteConfig.url}/intended-parents/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'For Intended Parents' }]} />

      {/* =====================================================================
          1. INTENDED PARENT HERO SPLIT
          ===================================================================== */}
      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap">
          <div className="hero-grid">
            
            <div className="flex flex-col gap-6">
              <span className="label-mono label-mono-inverse w-fit">Intended Parent Program</span>
              <h1 className="display-hero text-white">
                Ethical, protected surrogacy support for intended parents in Lagos.
              </h1>
              <p className="text-lg text-inverse-muted leading-relaxed font-light">
                We guide couples, individuals, and diaspora families through verified gestational surrogate matching, independent legal representation, and clinical coordination with accredited Lagos fertility centers.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
                  <CalendarIcon size={18} />
                  <span>Schedule Discovery Call</span>
                </Link>
                <WhatsAppLink audience="intendedParent" variant="quiet" showPhoneFallback />
              </div>

              <div className="pt-4 border-t-dark flex items-center gap-2 text-xs text-muted">
                <MapPinIcon size={14} className="text-accent" />
                <span>Kernel St, Bode Thomas, Surulere &bull; Private intake with Chizaram Ata</span>
              </div>
            </div>

            <div>
              <div className="photo-frame aspect-hero shadow-2xl border">
                <img
                  src="/images/consultation-clinic.jpg"
                  alt="Clinical intake consultation environment for intended parents"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BOUNDARY & RESPONSIBILITY MATRIX
          ===================================================================== */}
      <section className="section-screen bg-page border-b-subtle">
        <div className="wrap">
          <div className="max-w-2xl mb-12">
            <span className="label-mono label-mono-warm mb-3">Role Separation</span>
            <h2 className="display-section text-primary">
              Clear boundaries: Agency coordination vs. clinical practice
            </h2>
            <p className="mt-3 text-secondary text-lg leading-relaxed">
              To ensure ethical safety, Zizo strictly separates personal case management from licensed medical and legal responsibilities.
            </p>
          </div>

          <div className="grid-2">
            <div className="p-8 rounded-lg bg-warm" style={{ border: '1px solid rgba(171,84,38,0.2)' }}>
              <div className="flex items-center gap-2 text-accent font-semibold text-base mb-6">
                <ShieldCheckIcon size={20} className="text-accent" />
                <span>What Zizo Coordinates Directly</span>
              </div>
              <ul className="space-y-4 text-sm text-primary">
                <li className="flex items-start gap-3">
                  <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                  <span>Comprehensive surrogate identity, background, and address vetting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                  <span>Psychological evaluation coordination with qualified fertility counselors</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                  <span>Independent reproductive attorney referrals for binding agreements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                  <span>Dedicated case manager overseeing all prenatal scan appointments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                  <span>Strict confidentiality and mutual anonymity safeguards</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg bg-soft border">
              <div className="flex items-center gap-2 text-primary font-semibold text-base mb-6">
                <ShieldCheckIcon size={20} className="text-muted" />
                <span>What Licensed Partners Provide</span>
              </div>
              <ul className="space-y-4 text-sm text-secondary">
                <li className="flex items-start gap-3">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', marginTop: '6px', flexShrink: 0 }} />
                  <span>Medical screening, hormonal profiles, and infectious disease tests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', marginTop: '6px', flexShrink: 0 }} />
                  <span>IVF cycles, egg retrieval, fertilization, and embryo transfer procedures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', marginTop: '6px', flexShrink: 0 }} />
                  <span>Obstetric care, routine ultrasound scans, and clinical monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', marginTop: '6px', flexShrink: 0 }} />
                  <span>Hospital labor, delivery care, and newborn medical clearance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', marginTop: '6px', flexShrink: 0 }} />
                  <span>Independent legal advice and parental order court filings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. INTENDED PARENT JOURNEY: STEP BY STEP
          ===================================================================== */}
      <section className="section-screen bg-soft border-b-subtle">
        <div className="wrap max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="label-mono label-mono-warm mb-3">The Journey</span>
            <h2 className="display-section text-primary">
              The intended parent path: Step by step
            </h2>
            <p className="mt-3 text-secondary">
              Clear progression from confidential intake through clinical milestones to welcoming your child.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Confidential Discovery Consultation',
                body: 'We discuss your family-building history, timeline, and preferences. No clinical or health records are required for this initial call.',
              },
              {
                num: '2',
                title: 'Surrogate Profile Presentation',
                body: 'Review pre-screened gestational carrier profiles matching your cultural, emotional, and logistical expectations.',
              },
              {
                num: '3',
                title: 'Medical Clearance & Legal Contract Finalization',
                body: 'Your chosen surrogate undergoes rigorous clinical screening at an accredited Lagos clinic. Independent legal counsel finalizes surrogacy contracts before any medical procedures begin.',
              },
              {
                num: '4',
                title: 'Embryo Transfer & Pregnancy Milestone Updates',
                body: 'Embryo transfer occurs at the partner clinic. Your dedicated Zizo case manager provides structured updates after every scan and prenatal checkup.',
              },
              {
                num: '5',
                title: 'Delivery & Welcoming Your Child',
                body: 'Hospital delivery logistics and legal documentation assistance to ensure a smooth, dignified homecoming.',
              },
            ].map((step) => (
              <div key={step.num} className="card-interactive p-6 bg-white flex items-start gap-5">
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-warm)', color: 'var(--action-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'monospace', flexShrink: 0 }}>
                  {step.num}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Intended Parent CTA Card */}
          <div className="mt-12 p-8 rounded-xl bg-white border text-center flex flex-col items-center gap-4">
            <h3 className="text-2xl font-medium text-primary">
              Begin with a Confidential Conversation
            </h3>
            <p className="text-sm text-secondary max-w-lg leading-relaxed">
              Book a call with founder Chizaram Ata to review current availability, partner fertility clinics, and timelines.
            </p>
            <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
              <span>Schedule Intended Parent Consultation</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
