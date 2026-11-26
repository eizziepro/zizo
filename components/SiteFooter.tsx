import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { MapPinIcon, PhoneIcon, MessageSquareIcon, ClockIcon } from './Icons';

export function SiteFooter() {
  return (
    <footer className="bg-[var(--black-shade-50)] text-[var(--white-shade-100)] border-t border-[var(--border-inverse)] pt-16 pb-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[var(--border-inverse)]">
          {/* Column 1: Brand & Mission (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold text-xl tracking-tight text-[var(--white-base)]"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center font-bold text-sm">
                Z
              </span>
              <span>{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-[var(--white-shade-100)] leading-relaxed">
              Support for intended parents and surrogate applicants in Lagos, Nigeria. A calm, discreet, and ethically guided reproductive care coordination agency.
            </p>
            <div className="pt-2">
              <Link href="/book-a-call/" className="btn btn-primary text-sm inline-flex">
                Schedule a Consultation
              </Link>
            </div>
          </div>

          {/* Column 2: Navigation Links (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--white-base)] font-mono">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--white-base)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Hours (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--white-base)] font-mono">
              Surulere Headquarters & Contact
            </h3>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPinIcon size={18} className="text-[var(--action-primary)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[var(--white-base)] font-medium">Physical Location:</span>
                  <p className="text-[var(--white-shade-100)]">
                    {siteConfig.location.street}, {siteConfig.location.locality}, {siteConfig.location.city} {siteConfig.location.postalCode}, Nigeria.
                  </p>
                  <a
                    href={siteConfig.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--deep-teal-tint-200)] hover:underline inline-block mt-1"
                  >
                    View on Google Maps &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon size={18} className="text-[var(--action-primary)] shrink-0" />
                <p className="text-[var(--white-shade-100)]">
                  {siteConfig.hours.days}: {siteConfig.hours.times}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <PhoneIcon size={18} className="text-[var(--action-primary)] shrink-0" />
                <div>
                  <span className="text-xs text-[var(--white-shade-150)] block">Intended Parents & General:</span>
                  <a
                    href={`tel:${siteConfig.contact.phoneGeneralRaw}`}
                    className="text-[var(--white-base)] hover:text-[var(--deep-teal-tint-150)] transition-colors"
                  >
                    {siteConfig.contact.phoneGeneral}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquareIcon size={18} className="text-[var(--action-whatsapp)] shrink-0" />
                <div>
                  <span className="text-xs text-[var(--white-shade-150)] block">Surrogate Enquiries Line:</span>
                  <a
                    href={`tel:${siteConfig.contact.phoneSurrogateRaw}`}
                    className="text-[var(--white-base)] hover:text-[var(--deep-teal-tint-150)] transition-colors"
                  >
                    {siteConfig.contact.phoneSurrogate}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Medical Boundary Disclaimer */}
        <div className="py-6 border-b border-[var(--border-inverse)] text-xs text-[var(--white-shade-150)] leading-relaxed">
          <p>
            <strong className="text-[var(--white-shade-100)]">Clinical & Legal Notice: </strong>
            Zizo Surrogacy is an independent care coordination agency. We provide structured surrogate matching, surrogate care support, and agency management. Zizo Surrogacy is not a licensed fertility clinic, hospital, or law firm. All medical screenings, hormonal preparations, IVF procedures, and obstetric deliveries are performed exclusively by accredited partner fertility centers and licensed clinicians. Independent legal agreements are prepared and finalized by qualified legal counsel.
          </p>
        </div>

        {/* Copyright and Bottom Meta */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--white-shade-200)]">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Registered in Lagos, Nigeria. Photography credits: Licensed Creative Commons editorial imagery.</p>
          <div className="flex items-center gap-4">
            <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white-base)]">
              Instagram
            </a>
            <a href={siteConfig.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white-base)]">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
