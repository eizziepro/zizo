import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { MapPinIcon, PhoneIcon, MessageSquareIcon, ClockIcon, CalendarIcon, ArrowRightIcon, ShieldCheckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Contact Zizo Surrogacy | Surulere, Lagos, Nigeria',
  description:
    'Reach Zizo Surrogacy in Surulere, Lagos. Connect directly by phone, WhatsApp, or schedule a confidential consultation.',
  alternates: {
    canonical: `${siteConfig.url}/contact/`,
  },
};

export default function ContactPage() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Contact', url: `${siteConfig.url}/contact/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'Contact' }]} />

      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap max-w-4xl">
          <span className="label-mono label-mono-inverse mb-4 inline-block">Direct Contact</span>
          <h1 className="display-hero text-white mb-4">
            Connect with our team in Surulere, Lagos.
          </h1>
          <p className="text-lg text-inverse-muted leading-relaxed font-light mb-8">
            Whether you are exploring surrogacy as an intended parent, considering becoming a gestational surrogate, or inquiring about egg donation, we provide confidential and compassionate guidance.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/book-a-call/" className="btn btn-primary text-base px-6 py-3-5">
              <CalendarIcon size={18} />
              <span>Schedule a Consultation</span>
            </Link>
            <WhatsAppLink audience="intendedParent" variant="quiet" showPhoneFallback />
          </div>
        </div>
      </section>

      <section className="section-screen bg-page border-b-subtle">
        <div className="wrap max-w-4xl">
          <div className="grid-2 mb-12">
            
            {/* Phone & Office Card */}
            <div className="card-interactive p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-medium text-primary mb-6">
                  Official Channels
                </h2>

                <div className="space-y-6 text-sm">
                  <div className="flex items-start gap-3">
                    <PhoneIcon size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      <strong className="block text-primary">Intended Parents Line:</strong>
                      <a href={`tel:${siteConfig.contact.phoneGeneralRaw}`} className="text-base text-accent font-semibold hover:underline">
                        {siteConfig.contact.phoneGeneral}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PhoneIcon size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      <strong className="block text-primary">Surrogate Enquiries Line:</strong>
                      <a href={`tel:${siteConfig.contact.phoneSurrogateRaw}`} className="text-base text-accent font-semibold hover:underline">
                        {siteConfig.contact.phoneSurrogate}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      <strong className="block text-primary">Operating Hours:</strong>
                      <span className="text-secondary">{siteConfig.hours.days}: {siteConfig.hours.times}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPinIcon size={20} className="text-accent shrink-0 mt-1" />
                    <div>
                      <strong className="block text-primary">Physical Location:</strong>
                      <span className="text-secondary leading-relaxed block mb-2">
                        {siteConfig.location.formattedAddress}
                      </span>
                      <a
                        href={siteConfig.location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>View on Google Maps</span>
                        <ArrowRightIcon size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Consultation */}
            <div className="card-interactive p-8 bg-warm border flex flex-col justify-between">
              <div>
                <span className="label-mono bg-white text-primary mb-4 inline-block">
                  Direct Messenger
                </span>
                <h2 className="text-2xl font-medium text-primary mb-4">
                  Chat via WhatsApp
                </h2>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  For immediate, discreet answers regarding fees, timelines, or eligibility criteria, speak directly with our Lagos coordination desk on WhatsApp.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white border">
                    <span className="text-xs font-semibold text-primary block mb-1">
                      For Intended Parents:
                    </span>
                    <WhatsAppLink audience="intendedParent" variant="primary" showPhoneFallback={false} />
                  </div>

                  <div className="p-4 rounded-lg bg-white border">
                    <span className="text-xs font-semibold text-primary block mb-1">
                      For Prospective Surrogates:
                    </span>
                    <WhatsAppLink audience="surrogate" variant="primary" showPhoneFallback={false} />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex items-center gap-2 text-xs text-muted">
                <ShieldCheckIcon size={16} className="text-accent" />
                <span>Zero clinical history collected over chat &bull; Total discretion</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
