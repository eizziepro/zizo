import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, ShieldCheckIcon, CheckIcon, ChevronRightIcon, ArrowRightIcon, MapPinIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Egg Donation Services in Lagos, Nigeria | Zizo Surrogacy',
  description:
    'Ethical egg donation and ovum donor coordination in Lagos. Screened donor profiles, cultural compatibility, and clinical oversight at accredited Nigerian fertility centers.',
  alternates: {
    canonical: `${siteConfig.url}/egg-donation/`,
  },
};

export default function EggDonationPage() {
  const serviceSchema = generateServiceSchema(
    'Egg Donation & Ovum Donor Coordination',
    'Ethical, confidential ovum donor matching and screening coordination for intended parents and compassionate donors in Lagos, Nigeria.',
    'egg-donation'
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Egg Donation', url: `${siteConfig.url}/egg-donation/` },
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

      <Breadcrumbs items={[{ name: 'Egg Donation' }]} />

      {/* =====================================================================
          1. EGG DONATION HERO SPLIT (taste-skill House Rule 3 & 6)
          ===================================================================== */}
      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap">
          <div className="hero-grid">
            
            <div className="flex flex-col gap-6">
              <span className="label-mono label-mono-inverse w-fit">Ovum Donor Program</span>
              <h1 className="display-hero text-white">
                Compassionate, screened egg donation services in Lagos.
              </h1>
              <p className="text-lg text-inverse-muted leading-relaxed font-light">
                We facilitate ethical, confidential egg donation coordination connecting intended parents with thoroughly profiled donors, while prioritizing donor health, mutual respect, and clinical excellence.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
                  <CalendarIcon size={18} />
                  <span>Schedule Donor Call</span>
                </Link>
                <WhatsAppLink audience="eggDonation" variant="quiet" showPhoneFallback />
              </div>

              <div className="pt-4 border-t-dark flex items-center gap-2 text-xs text-muted">
                <ShieldCheckIcon size={14} className="text-accent" />
                <span>Genetic carrier testing &bull; Confidential anonymity &bull; Accredited clinic retrieval</span>
              </div>
            </div>

            <div>
              <div className="photo-frame aspect-hero shadow-2xl border">
                <img
                  src="/images/egg-donation.jpg"
                  alt="Clinical laboratory and compassionate ovum donor coordination"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. DUAL INTAKE PATHS
          ===================================================================== */}
      <section className="section-screen bg-page border-b-subtle">
        <div className="wrap">
          <div className="max-w-2xl mb-12">
            <span className="label-mono label-mono-warm mb-3 inline-block">Two Perspectives</span>
            <h2 className="display-section text-primary">
              Support for both intended families and prospective donors
            </h2>
            <p className="mt-3 text-secondary text-lg leading-relaxed">
              Every cycle is handled with complete ethical dignity and medical oversight at accredited Lagos centers.
            </p>
          </div>

          <div className="grid-2">
            {/* For Parents */}
            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                  For Intended Parents
                </span>
                <h3 className="text-2xl font-medium text-primary mb-3">
                  Selecting a Screened Donor Profile
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  We maintain a confidential roster of thoroughly profiled ovum donors. Profiles include comprehensive background details, physical traits, educational achievements, and verified family health histories.
                </p>
                <ul className="space-y-3 text-sm text-primary mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Genetic & infectious disease pre-screening</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Cultural and physical trait compatibility matching</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Partner clinic coordination for cycle synchronization</span>
                  </li>
                </ul>
              </div>
              <Link href="/book-a-call/" className="btn btn-secondary w-full justify-between">
                <span>Inquire About Donor Matching</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>

            {/* For Donors */}
            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                  For Prospective Donors
                </span>
                <h3 className="text-2xl font-medium text-primary mb-3">
                  Becoming an Egg Donor
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Help a family fulfill their dream of parenthood while receiving comprehensive medical care, independent psychological counseling, and guaranteed fair compensation for your dedication.
                </p>
                <ul className="space-y-3 text-sm text-primary mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Ages 20 to 29 in excellent documented health</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Full hormonal evaluation and fertility assessment at zero cost</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0" />
                    <span>Prompt, secure escrow disbursement upon cycle completion</span>
                  </li>
                </ul>
              </div>
              <Link href="/book-a-call/" className="btn btn-secondary w-full justify-between">
                <span>Apply as an Egg Donor</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CLINICAL GOVERNANCE
          ===================================================================== */}
      <section className="section-screen bg-soft border-b-subtle">
        <div className="wrap max-w-4xl text-center">
          <span className="label-mono label-mono-warm mb-3 inline-block">Clinical Safety</span>
          <h2 className="display-section text-primary mb-4">
            Cycle governance at accredited fertility centers
          </h2>
          <p className="text-base text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            All medication protocols, ovarian monitoring, and egg retrieval procedures are conducted exclusively by licensed reproductive endocrinologists at our partner clinics in Lagos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/book-a-call/" className="btn btn-primary text-base px-8 py-3-5">
              <span>Schedule Private Consultation</span>
              <ArrowRightIcon size={16} />
            </Link>
            <WhatsAppLink audience="eggDonation" variant="quiet" showPhoneFallback />
          </div>
        </div>
      </section>
    </>
  );
}
