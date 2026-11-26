import React from 'react';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BookingForm } from '@/components/BookingForm';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import {
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  MessageSquareIcon,
  CheckIcon,
} from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Book a Call with Zizo Surrogacy | Lagos, Nigeria',
  description:
    'Schedule a confidential private consultation with Zizo Surrogacy in Lagos. Select your appointment type, date, and meeting format (Phone, Google Meet, Zoom).',
  alternates: {
    canonical: `${siteConfig.url}/book-a-call/`,
  },
};

export default async function BookACallPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; step?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialCallType = (['intended_parent', 'surrogate', 'egg_donation'].includes(resolvedParams.type || '')
    ? resolvedParams.type
    : 'intended_parent') as 'intended_parent' | 'surrogate' | 'egg_donation';
  const initialStep = resolvedParams.step ? Math.min(Math.max(parseInt(resolvedParams.step, 10) || 1, 1), 4) : 1;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Book a Call', url: `${siteConfig.url}/book-a-call/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'Book a Call' }]} />

      {/* Header Banner */}
      <section className="bg-soft py-10 md:py-14 border-b-subtle text-center">
        <div className="wrap max-w-3xl">
          <span className="label-mono label-mono-warm mb-3">
            Complimentary Private Consultation
          </span>
          <h1 className="display-section text-primary mb-3">
            Schedule a confidential call
          </h1>
          <p className="text-base text-secondary font-light leading-relaxed max-w-2xl mx-auto">
            Connect directly with our senior care coordination team in Surulere, Lagos. Choose your pathway, meeting format, and click an available date on the calendar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 mt-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon size={16} className="text-accent" />
              <span>Strict confidentiality guaranteed</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ClockIcon size={16} className="text-accent" />
              <span>Africa/Lagos WAT Calendar</span>
            </span>
            <span>&bull;</span>
            <span>Zero medical history required</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Scheduler Section */}
      <section className="section-luxury bg-page">
        <div className="wrap">
          <div className="booking-layout-grid">
            
            {/* Left Column: Consultation Briefing & Office Presence */}
            <div className="booking-info-col space-y-6">
              <div className="card-architectural bg-white p-6 space-y-4">
                <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block">
                  Private Consultation Desk
                </span>
                <h2 className="text-xl font-medium text-primary">
                  What to expect during your intake call
                </h2>
                <p className="text-xs md:text-sm text-secondary leading-relaxed">
                  Every family-building journey begins with a private conversation. We listen to your goals, outline verified clinical pathways, and explain independent Nigerian legal safeguards.
                </p>

                <ul className="space-y-3 text-xs md:text-sm text-primary pt-2">
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-0.5" />
                    <span><strong>100% Free &amp; Confidential:</strong> Zero financial obligation or public disclosure.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-0.5" />
                    <span><strong>Experienced Guidance:</strong> Led by coordinator Chizaram Ata with 12+ years experience.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-0.5" />
                    <span><strong>No Health Data Required:</strong> We do not ask for or store medical records in this form.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-0.5" />
                    <span><strong>Verified Partners:</strong> We work exclusively with certified Lagos clinics and family attorneys.</span>
                  </li>
                </ul>
              </div>

              {/* Physical Lagos Office Card */}
              <div className="card-architectural bg-warm p-6 space-y-3 text-xs text-secondary">
                <div className="flex items-center gap-2 text-accent font-semibold font-mono uppercase tracking-wider text-xs">
                  <MapPinIcon size={16} />
                  <span>Surulere Headquarters</span>
                </div>
                <p className="text-primary font-medium">
                  {siteConfig.location.street}, {siteConfig.location.locality}, {siteConfig.location.city} {siteConfig.location.postalCode}, Lagos, Nigeria.
                </p>
                <p className="text-muted text-xs">
                  In-person consultations are arranged by appointment. Virtual calls available via Phone, Google Meet, or Zoom worldwide.
                </p>
                <div className="pt-2 border-t-subtle flex items-center justify-between">
                  <span className="text-muted">Telephone:</span>
                  <a href={`tel:${siteConfig.contact.phoneGeneralRaw}`} className="font-semibold text-primary hover:text-accent">
                    {siteConfig.contact.phoneGeneral}
                  </a>
                </div>
              </div>

              {/* Direct WhatsApp Prompt */}
              <div className="p-4 rounded-xl border border-[rgba(37,211,102,0.3)] bg-[rgba(37,211,102,0.04)] text-xs text-secondary flex items-start gap-3">
                <MessageSquareIcon size={20} className="text-[#25d366] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-primary block mb-0.5">Prefer messaging first?</span>
                  <p className="mb-2">Our Lagos coordination team monitors WhatsApp during consultation hours.</p>
                  <a
                    href={siteConfig.whatsapp.general.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#128c7e] hover:underline"
                  >
                    Start a WhatsApp conversation &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: The Clickable Interactive Form */}
            <div className="booking-form-col">
              <BookingForm initialCallType={initialCallType} initialStep={initialStep} />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
