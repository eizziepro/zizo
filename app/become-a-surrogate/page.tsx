import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, ShieldCheckIcon, HeartHandshakeIcon, CheckIcon, ChevronRightIcon, ArrowRightIcon, MapPinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Surrogate Enquiries in Lagos, Nigeria | Zizo Surrogacy',
  description:
    'Information and private intake for prospective gestational surrogates in Lagos. Dignified care, personal case management, and complete privacy protection.',
  alternates: {
    canonical: `${siteConfig.url}/become-a-surrogate/`,
  },
};

export default function BecomeASurrogatePage() {
  const serviceSchema = generateServiceSchema(
    'Gestational Surrogate Support Program',
    'Dignified, confidential care coordination and personal case management for prospective gestational surrogate mothers in Lagos, Nigeria.',
    'become-a-surrogate'
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Become a Surrogate', url: `${siteConfig.url}/become-a-surrogate/` },
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

      <Breadcrumbs items={[{ name: 'Become a Surrogate' }]} />

      {/* =====================================================================
          1. SURROGATE HERO SPLIT (taste-skill House Rule 3 & 6)
          ===================================================================== */}
      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap">
          <div className="hero-grid">
            
            <div className="flex flex-col gap-6">
              <span className="label-mono label-mono-inverse w-fit">Surrogate Care Program</span>
              <h1 className="display-hero text-white">
                Dignified, confidential care for prospective surrogates in Lagos.
              </h1>
              <p className="text-lg text-inverse-muted leading-relaxed font-light">
                Carrying a child for an intended family is a profound commitment. At Zizo Surrogacy, we safeguard your health, your autonomy, and your emotional well-being with personal, 24/7 care coordination.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
                  <CalendarIcon size={18} />
                  <span>Schedule Private Call</span>
                </Link>
                <WhatsAppLink audience="surrogate" variant="quiet" showPhoneFallback />
              </div>

              <div className="pt-4 border-t-dark flex items-center gap-2 text-xs text-muted">
                <ShieldCheckIcon size={14} className="text-accent" />
                <span>Independent attorney advocacy &bull; Private living allowance &bull; Total medical coverage</span>
              </div>
            </div>

            <div>
              <div className="photo-frame aspect-hero shadow-2xl border">
                <img
                  src="/images/surrogate-care.jpg"
                  alt="Dignified maternal care support for gestational surrogate mothers"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. THE SURROGATE CARE PLEDGE
          ===================================================================== */}
      <section className="section-screen bg-page border-b-subtle">
        <div className="wrap">
          <div className="max-w-2xl mb-12">
            <span className="label-mono label-mono-warm mb-3 inline-block">Our Commitment to You</span>
            <h2 className="display-section text-primary">
              The Zizo surrogate care pledge
            </h2>
            <p className="mt-3 text-secondary text-lg leading-relaxed">
              We never treat surrogacy as a commercial transaction. Your physical safety, personal dignity, and legal autonomy are our highest priorities.
            </p>
          </div>

          <div className="grid-3">
            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <ShieldCheckIcon size={28} className="text-accent mb-4" />
                <h3 className="text-xl font-medium text-primary mb-3">
                  Total Privacy & Anonymity
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Your identity is strictly protected. We facilitate mutual anonymity protocols so you can undergo your journey with complete peace of mind and discretion.
                </p>
              </div>
            </div>

            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <HeartHandshakeIcon size={28} className="text-accent mb-4" />
                <h3 className="text-xl font-medium text-primary mb-3">
                  Dedicated Personal Case Manager
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  You are paired with an experienced female coordinator who accompanies you to all medical checkups, assists with hospital appointments, and provides 24/7 care.
                </p>
              </div>
            </div>

            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <CheckIcon size={28} className="text-accent mb-4" />
                <h3 className="text-xl font-medium text-primary mb-3">
                  Independent Legal Counsel
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  You are represented by your own independent family law attorney (paid for via escrow) to ensure your rights and compensation schedules are fully protected before cycle start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. ELIGIBILITY CRITERIA & PROCESS
          ===================================================================== */}
      <section className="section-screen bg-soft border-b-subtle">
        <div className="wrap max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="label-mono label-mono-warm mb-3 inline-block">Candidate Standards</span>
            <h2 className="display-section text-primary">
              Surrogate eligibility criteria
            </h2>
            <p className="mt-3 text-secondary">
              To safeguard both the surrogate mother and child, our accredited clinical partners enforce clear baseline requirements.
            </p>
          </div>

          <div className="card-interactive p-8 bg-white mb-12">
            <ul className="grid-2 text-sm text-primary">
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Ages 21 to 38 years with documented prior healthy delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Non-smoker and no history of recreational drug or alcohol abuse</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Stable home environment and verifiable Lagos residence</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Healthy Body Mass Index (BMI) within normal clinical range</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Clear infectious disease markers and uterine ultrasound clearance</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon size={18} className="text-accent shrink-0 mt-1" />
                <span>Emotional readiness confirmed by licensed fertility counselor</span>
              </li>
            </ul>
          </div>

          {/* Surrogate CTA */}
          <div className="p-8 rounded-xl bg-white border border-subtle shadow-sm text-center flex flex-col items-center gap-4">
            <h3 className="text-2xl font-medium text-primary">
              Have Questions? Chat Discreetly with Our Team
            </h3>
            <p className="text-sm text-secondary max-w-lg leading-relaxed">
              We answer all questions regarding compensation schedules, living arrangements, medical screening, and legal protection with complete confidentiality.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
                <span>Schedule Confidential Call</span>
                <ArrowRightIcon size={16} />
              </Link>
              <WhatsAppLink audience="surrogate" variant="primary" showPhoneFallback />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
