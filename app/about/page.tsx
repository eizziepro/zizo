import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, MapPinIcon, ShieldCheckIcon, HeartHandshakeIcon, ArrowRightIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About Zizo Surrogacy | Leadership & Mission | Lagos, Nigeria',
  description:
    'Learn about Zizo Surrogacy, founder Chizaram Ata, and our commitment to ethical, dignified reproductive care coordination in Surulere, Lagos, Nigeria.',
  alternates: {
    canonical: `${siteConfig.url}/about/`,
  },
};

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'About', url: `${siteConfig.url}/about/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'About' }]} />

      {/* =====================================================================
          1. ABOUT HERO SPLIT (taste-skill House Rule 3 & 6)
          ===================================================================== */}
      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap">
          <div className="hero-grid">
            
            <div className="flex flex-col gap-6">
              <span className="label-mono label-mono-inverse w-fit">About Zizo Surrogacy</span>
              <h1 className="display-hero text-white">
                Helping families grow with dignity, empathy, and discretion.
              </h1>
              <p className="text-lg text-inverse-muted leading-relaxed font-light">
                Established in Lagos, Nigeria, Zizo Surrogacy provides intended parents, gestational carriers, and ovum donors with a structured, transparent, and legally protected pathway through assisted reproduction.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
                  <CalendarIcon size={18} />
                  <span>Schedule Consultation</span>
                </Link>
                <Link href="/contact/" className="btn btn-ghost-inverse text-base px-5 py-3-5">
                  <span>Visit Our Lagos Office</span>
                </Link>
              </div>

              <div className="pt-4 border-t-dark flex items-center gap-2 text-xs text-muted">
                <MapPinIcon size={14} className="text-accent" />
                <span>Kernel St, Bode Thomas St, Surulere, Lagos 101241</span>
              </div>
            </div>

            <div>
              <div className="photo-frame aspect-portrait shadow-2xl border">
                <img
                  src="/images/founder-chizaram.jpg"
                  alt="Founder Chizaram Ata, reproductive health care coordinator in Lagos"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. LEADERSHIP PROFILE
          ===================================================================== */}
      <section className="section-screen bg-page border-b-subtle">
        <div className="wrap max-w-4xl">
          <div className="card-interactive p-8 bg-warm border">
            <span className="label-mono bg-white text-primary mb-4 inline-block">
              Founder & Lead Coordinator
            </span>
            <h2 className="display-section text-primary mb-6">
              Chizaram Ata
            </h2>
            <div className="space-y-4 text-base text-primary leading-relaxed">
              <p>
                At the heart of Zizo Surrogacy is founder <strong className="font-semibold">Chizaram Ata</strong>, a reproductive health coordinator with over 12 years of hands-on experience in reproductive healthcare governance and maternal wellness management.
              </p>
              <p>
                Her commitment to connecting intended parents with vetted gestational carriers and donors is matched only by her dedication to maintaining confidentiality, structure, and emotional support at every step. Chizaram brings a calming presence and rigorous ethical standards to every case managed by the agency.
              </p>
              <p>
                Her hands-on approach ensures that every intended parent, surrogate, and donor is treated not merely with care, but with profound respect, privacy, and continuous communication from initial discovery through delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. VISION, MISSION & VALUES
          ===================================================================== */}
      <section className="section-screen bg-soft border-b-subtle">
        <div className="wrap max-w-4xl">
          <div className="grid-2 mb-12">
            <div className="card-interactive p-8 bg-white">
              <span className="font-mono text-xs font-semibold uppercase text-accent block mb-3">
                Our Vision
              </span>
              <h3 className="text-xl font-medium text-primary mb-3">
                Leading with Integrity Across Africa
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                To be the most trusted partner in reproductive care coordination, recognized for ethical excellence, complete transparency, and patient advocacy across Nigeria and the diaspora.
              </p>
            </div>

            <div className="card-interactive p-8 bg-white">
              <span className="font-mono text-xs font-semibold uppercase text-accent block mb-3">
                Our Mission
              </span>
              <h3 className="text-xl font-medium text-primary mb-3">
                Safe, Seamless Family Building
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                To provide safe, transparent, and dignified support to intended parents, surrogates, and donors, ensuring smooth, evidence-based care coordination throughout their entire reproductive journey.
              </p>
            </div>
          </div>

          <div className="card-interactive p-8 bg-white text-center flex flex-col items-center gap-4">
            <h3 className="text-2xl font-medium text-primary">
              Speak with Founder Chizaram Ata
            </h3>
            <p className="text-sm text-secondary max-w-lg leading-relaxed">
              We welcome intended parents and surrogate candidates to our Surulere office for a confidential discussion.
            </p>
            <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
              <span>Schedule Private Consultation</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
