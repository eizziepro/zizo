'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon } from './Icons';

export interface TestimonialItem {
  quote: string;
  attribution: string;
  role: string;
  location: string;
  permissionStatus: 'APPROVED' | 'PENDING' | 'REVOKED';
}

const verifiedTestimonials: TestimonialItem[] = [
  {
    quote:
      'When I first considered becoming a surrogate, I had so many fears about how my body would cope and if I’d be treated well. Zizo Surrogacy handled everything with complete respect and privacy. From my first check-in, I was paired with a personal case manager who guided every scan and hospital visit. Everything was anonymous, structured, and professional. I felt protected every single day.',
    attribution: 'B.O.',
    role: 'Gestational Surrogate',
    location: 'Lagos, Nigeria',
    permissionStatus: 'APPROVED',
  },
  {
    quote:
      'Navigating surrogacy can feel emotionally overwhelming and complex. Chizaram and the Zizo team gave us calm reassurance, clear timelines, and unwavering transparency. They coordinated seamlessly with our fertility clinic and made our dream of becoming parents a reality with absolute dignity.',
    attribution: 'Mr. & Mrs. A.',
    role: 'Intended Parents',
    location: 'Lagos, Nigeria',
    permissionStatus: 'APPROVED',
  },
];

export function TestimonialSection() {
  // Filter strictly for approved, consented testimonials
  const activeTestimonials = verifiedTestimonials.filter(
    (t) => t.permissionStatus === 'APPROVED'
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (activeTestimonials.length === 0) {
    return null; // Gracefully render nothing if no testimonials have approved consent
  }

  const current = activeTestimonials[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === activeTestimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section-luxury bg-page border-b-subtle">
      <div className="wrap max-w-4xl">
        <div className="card-architectural bg-warm p-8 md:p-12 text-center flex flex-col items-center">
          <div className="label-mono label-mono-warm mb-6">
            <ShieldCheckIcon size={14} />
            <span>Consented Client Experiences</span>
          </div>

          <div className="relative w-full min-h-[160px] flex items-center justify-center mb-6">
            <blockquote className="text-xl md:text-2xl font-light text-primary leading-relaxed italic max-w-2xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
          </div>

          <div className="flex flex-col items-center gap-1 mb-8">
            <cite className="not-italic font-semibold text-base text-primary">
              {current.attribution}
            </cite>
            <span className="text-xs text-secondary font-mono tracking-wider">
              {current.role} &bull; {current.location}
            </span>
          </div>

          {activeTestimonials.length > 1 && (
            <div className="flex items-center gap-4" aria-label="Testimonial Navigation">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-subtle bg-white text-primary flex items-center justify-center hover:bg-soft transition-colors"
              >
                <ChevronLeftIcon size={18} />
              </button>

              <div className="flex items-center gap-2" aria-hidden="true">
                {activeTestimonials.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-6 bg-[var(--action-primary)]'
                        : 'w-2 bg-[var(--white-shade-100)]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-subtle bg-white text-primary flex items-center justify-center hover:bg-soft transition-colors"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
