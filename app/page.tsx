import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import { generateLocalBusinessSchema } from '@/lib/structured-data';
import { TestimonialSection } from '@/components/TestimonialSection';
import {
  CalendarIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  MessageSquareIcon,
} from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Zizo Surrogacy | Reproductive Care Coordination in Lagos, Nigeria',
  description:
    'Surrogacy and donor care coordination for intended parents and surrogate applicants in Lagos. Directed by reproductive specialist Chizaram Ata with verified fertility clinics.',
};

export default function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* =====================================================================
          1. HERO SECTION (Impeccable Minimalist Split)
          ===================================================================== */}
      <section id="hero" className="hero-screen bg-dark border-b-dark">
        <div className="wrap py-12 md:py-20">
          <div className="hero-grid">
            
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[var(--deep-teal-tint-150)]">
                <span className="w-2 h-2 rounded-full bg-[var(--action-primary)] shrink-0" />
                <span>Surulere, Lagos &bull; Reproductive Care Coordination</span>
              </div>

              <h1 className="display-hero text-white tracking-tight">
                Surrogacy and donor care coordination for intended parents and surrogates in Lagos.
              </h1>

              <p className="text-lg text-inverse-muted font-light leading-relaxed">
                Guided by reproductive specialist <strong className="font-semibold text-white">Chizaram Ata</strong> with 12+ years experience coordinating clinical screening, independent legal agreements, and compassionate surrogate care across Nigeria.
              </p>

              {/* Two Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/book-a-call/" className="btn btn-primary text-base px-7 py-3-5">
                  <CalendarIcon size={18} />
                  <span>Schedule Private Call</span>
                </Link>
                <a
                  href={siteConfig.whatsapp.general.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost-inverse text-base px-6 py-3-5 flex items-center gap-2"
                >
                  <MessageSquareIcon size={18} style={{ color: '#25d366' }} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Trust & Location Strip with Hairline Divider */}
              <div className="pt-6 border-t-dark flex flex-wrap items-center gap-y-3 gap-x-8 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <MapPinIcon size={14} className="text-accent" />
                  <span>Kernel St, Bode Thomas, Surulere</span>
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon size={14} className="text-accent" />
                  <span>Africa/Lagos WAT Consultation Desk</span>
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheckIcon size={14} className="text-accent" />
                  <span>Accredited Clinical & Legal Partners</span>
                </span>
              </div>
            </div>

            {/* Right Column: Curated Real Editorial Photography */}
            <div>
              <div className="photo-frame aspect-hero shadow-2xl border">
                <img
                  src="/images/hero-family.jpg"
                  alt="Intended parents with baby in calm, natural lighting in Lagos"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CORE CARE PATHWAYS (Architectural 3-Column Editorial Grid)
          ===================================================================== */}
      <section id="pathways" className="section-luxury bg-page border-b-subtle">
        <div className="wrap">
          <div className="max-w-2xl mb-14">
            <h2 className="display-section text-primary">
              Three dedicated programs, one standard of confidentiality
            </h2>
            <p className="mt-4 text-secondary text-lg leading-relaxed">
              Family-building in Nigeria requires deliberate coordination. Choose the pathway designed for your journey.
            </p>
          </div>

          <div className="pathways-grid">
            
            {/* Pathway 1: Intended Parents */}
            <div className="card-interactive">
              <div className="photo-frame aspect-card border-b-subtle">
                <img
                  src="/images/consultation-clinic.jpg"
                  alt="Clinical consultation room for intended parents in Lagos"
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                    For Intended Families
                  </span>
                  <h3 className="text-2xl font-medium text-primary mb-3">
                    Intended Parent Program
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    Personalized surrogate matching, clinical protocol alignment at certified Lagos fertility centers, and independent legal safeguards designed to protect your parental rights.
                  </p>
                  <ul className="space-y-2-5 mb-8 text-xs text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Thorough background & psychological screening</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Fixed escrow & transparent expense schedules</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Dedicated prenatal care coordination</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/intended-parents/"
                  className="btn btn-secondary w-full justify-between"
                >
                  <span>Explore Parent Pathway</span>
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>

            {/* Pathway 2: Surrogate Applicants */}
            <div className="card-interactive">
              <div className="photo-frame aspect-card border-b-subtle">
                <img
                  src="/images/surrogate-care.jpg"
                  alt="Maternal care support for surrogate applicants in Lagos"
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                    For Prospective Surrogates
                  </span>
                  <h3 className="text-2xl font-medium text-primary mb-3">
                    Become a Surrogate
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    A dignified, fully supported partnership. We prioritize your health, provide independent legal counsel, secure escrow compensation, and respect your privacy.
                  </p>
                  <ul className="space-y-2-5 mb-8 text-xs text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Independent attorney representation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Comprehensive private obstetric care</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Guaranteed living allowance & medical coverage</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/become-a-surrogate/"
                  className="btn btn-secondary w-full justify-between"
                >
                  <span>View Surrogate Criteria</span>
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>

            {/* Pathway 3: Egg & Ovum Donation */}
            <div className="card-interactive">
              <div className="photo-frame aspect-card border-b-subtle">
                <img
                  src="/images/egg-donation.jpg"
                  alt="Laboratory and clinical care in ovum donation in Lagos"
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                    For Donors & Recipients
                  </span>
                  <h3 className="text-2xl font-medium text-primary mb-3">
                    Egg & Ovum Donation
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    Ethically managed ovum donation with full genetic screening, medical counseling, and cycle coordination at certified Lagos reproductive centers.
                  </p>
                  <ul className="space-y-2-5 mb-8 text-xs text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Strict genetic & infectious disease screening</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Anonymity & privacy safeguards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon size={14} className="text-accent shrink-0" />
                      <span>Accredited fertility clinic partner retrieval</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/egg-donation/"
                  className="btn btn-secondary w-full justify-between"
                >
                  <span>Explore Donor Support</span>
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CONNECTED ARCHITECTURAL STEPPED TIMELINE (Cool Borders & Paddings)
          ===================================================================== */}
      <section id="process" className="section-luxury bg-soft border-b-subtle">
        <div className="wrap">
          <div className="max-w-2xl mb-14">
            <h2 className="display-section text-primary">
              The four verification stages of your surrogacy journey
            </h2>
            <p className="mt-4 text-secondary text-lg leading-relaxed">
              Surrogacy requires structured oversight. We guide every transition so no detail is left unaddressed.
            </p>
          </div>

          {/* Connected Architectural Timeline Grid */}
          <div className="timeline-architecture">
            
            {/* Step 1 */}
            <div className="timeline-step">
              <div>
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-3">
                  Step 01
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  Private Intake & Matching
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Confidential intake consultation in Surulere or via video. We align medical parameters, ethical values, and mutual preferences before pairing.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Duration: 2&ndash;6 weeks
              </div>
            </div>

            {/* Step 2 */}
            <div className="timeline-step">
              <div>
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-3">
                  Step 02
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  Clinical & Psych Screening
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Conducted exclusively at accredited partner fertility clinics. Full uterine evaluation, infectious disease markers, and psychological readiness.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Partner Fertility Hospitals
              </div>
            </div>

            {/* Step 3 */}
            <div className="timeline-step">
              <div>
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-3">
                  Step 03
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  Independent Legal Counsel
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Separate, independent attorneys represent the intended parents and surrogate. Comprehensive contracts, escrow funding, and parentage pathways.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Nigerian Family Lawyers
              </div>
            </div>

            {/* Step 4 */}
            <div className="timeline-step">
              <div>
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-3">
                  Step 04
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  Pregnancy Care & Delivery
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Dedicated care coordinator monitoring prenatal appointments, nutrition, and well-being through safe delivery at accredited Lagos hospitals.
                </p>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Dedicated 24/7 Case Manager
              </div>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link href="/how-surrogacy-works/" className="btn btn-secondary text-sm px-6">
              <span>Read Full Coordination Workflow</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. OPERATIONAL INTEGRITY & BOUNDARIES (Connected Architectural Table)
          ===================================================================== */}
      <section id="boundaries" className="section-luxury bg-page border-b-subtle">
        <div className="wrap">
          <div className="max-w-3xl mb-14">
            <h2 className="display-section text-primary">
              Clear boundaries protect every participant
            </h2>
            <p className="mt-4 text-secondary text-lg leading-relaxed">
              We operate with rigorous transparency. Here is how responsibilities are divided between our agency, accredited fertility clinics, and independent legal counsel.
            </p>
          </div>

          <div className="boundaries-architecture">
            
            {/* Col 1: Zizo Agency */}
            <div className="boundaries-col boundaries-col-featured">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
                  Agency Coordination
                </span>
                <h3 className="text-xl font-medium text-primary mb-6">
                  What Zizo Manages
                </h3>
                <ul className="space-y-4 text-sm text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-1" />
                    <span>Personalized surrogate & intended parent matching</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-1" />
                    <span>Surrogate counseling, living support & care oversight</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-1" />
                    <span>Coordination across clinic appointments & attorneys</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-accent shrink-0 mt-1" />
                    <span>Escrow accounting & scheduled disbursements</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Surulere Headquarters Team
              </div>
            </div>

            {/* Col 2: Fertility Clinics */}
            <div className="boundaries-col">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-muted tracking-wider block mb-2">
                  Clinical Procedures
                </span>
                <h3 className="text-xl font-medium text-primary mb-6">
                  Accredited Fertility Clinics
                </h3>
                <ul className="space-y-4 text-sm text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Hormonal protocols, egg retrieval & sperm preparation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Embryo creation, ICSI, and embryo transfer procedures</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Clinical pregnancy confirmation blood tests & scans</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Obstetric care and hospital delivery management</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Licensed Lagos Hospitals
              </div>
            </div>

            {/* Col 3: Independent Legal */}
            <div className="boundaries-col">
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-muted tracking-wider block mb-2">
                  Legal Advocacy
                </span>
                <h3 className="text-xl font-medium text-primary mb-6">
                  Independent Legal Counsel
                </h3>
                <ul className="space-y-4 text-sm text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Separate legal representation for surrogate and parents</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Gestational surrogacy agreements under Nigerian law</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Parentage orders and post-birth birth certificate filing</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-muted shrink-0 mt-1" />
                    <span>Review of legal escrow contracts and indemnities</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-8 border-t text-xs text-muted font-mono">
                Independent Bar Members
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FOUNDER LEADERSHIP & PHYSICAL LAGOS PRESENCE
          ===================================================================== */}
      <section id="leadership" className="section-luxury bg-soft border-b-subtle">
        <div className="wrap">
          <div className="split-grid items-center">
            
            {/* Founder Portrait */}
            <div>
              <div className="photo-frame aspect-portrait shadow-xl border">
                <img
                  src="/images/founder-chizaram.jpg"
                  alt="Founder Chizaram Ata, reproductive health care coordinator in Lagos"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Founder Story & Core Principle */}
            <div className="flex flex-col gap-6">
              <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider">
                Leadership & Philosophy
              </span>
              <h2 className="display-section text-primary">
                Guided by 12+ years of reproductive care coordination
              </h2>
              <div className="space-y-4 text-base text-secondary leading-relaxed">
                <p>
                  Zizo Surrogacy was established by <strong className="font-semibold text-primary">Chizaram Ata</strong> to bring calm, dignified, and legally protected surrogacy management to families in Nigeria and the diaspora.
                </p>
                <div className="p-5 rounded-xl bg-warm border border-[rgba(171,84,38,0.2)] text-primary">
                  <p className="font-medium text-sm leading-relaxed italic">
                    &ldquo;Our core operating principle is complete ethical transparency without medical over-promising. We safeguard every surrogate, respect every intended parent, and coordinate only with verified clinical centers.&rdquo;
                  </p>
                </div>
                <p>
                  We coordinate private, in-person consultations at our office on Kernel Street, Bode Thomas, Surulere, as well as secure virtual sessions for clients across Nigeria and abroad.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href="/about/" className="btn btn-primary text-sm px-6 py-3">
                  <span>Learn About Our Philosophy</span>
                  <ChevronRightIcon size={16} />
                </Link>
                <Link href="/contact/" className="btn btn-secondary text-sm px-6 py-3">
                  <span>Visit Our Lagos Office</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          6. TESTIMONIALS (Authentic, Discreet Client Stories)
          ===================================================================== */}
      <TestimonialSection />

      {/* =====================================================================
          7. AGENCY INSIGHTS & LEGAL PRECEDENTS (Magazine-Grade Grid)
          ===================================================================== */}
      <section id="insights" className="section-luxury bg-page border-b-subtle">
        <div className="wrap">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <h2 className="display-section text-primary">
                Legal and clinical insights for Lagos families
              </h2>
              <p className="mt-3 text-secondary text-lg leading-relaxed max-w-xl">
                Authoritative guidance on Nigerian assisted reproduction law, surrogate rights, and consultation prep.
              </p>
            </div>
            <Link href="/insights/" className="btn btn-secondary text-sm shrink-0">
              <span>View All Briefs</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          <div className="insights-grid">
            
            <article className="card-interactive p-8">
              <div>
                <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider block mb-2">
                  Legal Analysis &bull; 6 min read
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  <Link href="/insights/legal-framework-surrogacy-nigeria/" className="hover:text-[var(--action-primary)]">
                    Legal Framework for Surrogacy in Nigeria: 2026 Guidelines
                  </Link>
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  How Nigerian family courts handle gestational agreements, parentage orders, and birth registration without federal legislation.
                </p>
              </div>
              <Link href="/insights/legal-framework-surrogacy-nigeria/" className="text-sm font-semibold text-accent flex items-center gap-2 hover:underline">
                <span>Read Analysis</span>
                <ArrowRightIcon size={14} />
              </Link>
            </article>

            <article className="card-interactive p-8">
              <div>
                <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider block mb-2">
                  Surrogate Welfare &bull; 5 min read
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  <Link href="/insights/surrogate-care-and-privacy-standards-lagos/" className="hover:text-[var(--action-primary)]">
                    Surrogate Care and Privacy Standards in Lagos
                  </Link>
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Medical dignity, independent legal counsel, living allowances, and confidentiality protocols for gestational surrogates.
                </p>
              </div>
              <Link href="/insights/surrogate-care-and-privacy-standards-lagos/" className="text-sm font-semibold text-accent flex items-center gap-2 hover:underline">
                <span>Read Standards</span>
                <ArrowRightIcon size={14} />
              </Link>
            </article>

            <article className="card-interactive p-8">
              <div>
                <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider block mb-2">
                  Intended Parents &bull; 4 min read
                </span>
                <h3 className="text-xl font-medium text-primary mb-3">
                  <Link href="/insights/how-to-prepare-for-first-surrogacy-consultation/" className="hover:text-[var(--action-primary)]">
                    How to Prepare for Your First Surrogacy Consultation
                  </Link>
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Essential questions, clinical records to assemble, and realistic expectations for your initial intake discussion.
                </p>
              </div>
              <Link href="/insights/how-to-prepare-for-first-surrogacy-consultation/" className="text-sm font-semibold text-accent flex items-center gap-2 hover:underline">
                <span>Read Checklist</span>
                <ArrowRightIcon size={14} />
              </Link>
            </article>

          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CALL TO ACTION / PRIVATE INTAKE (Minimalist High-Contrast Block)
          ===================================================================== */}
      <section className="section-luxury bg-dark text-white border-t-dark">
        <div className="wrap text-center max-w-3xl">
          <span className="text-xs font-mono font-semibold uppercase text-[var(--deep-teal-tint-150)] tracking-wider block mb-3">
            Confidential Consultation Desk
          </span>
          <h2 className="display-section text-white mb-4">
            Begin with a quiet, private consultation in Surulere
          </h2>
          <p className="text-lg text-inverse-muted leading-relaxed mb-8">
            Speak directly with our team in Lagos. We answer your questions, outline timelines, and explain clinical partner options with zero obligation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/book-a-call/" className="btn btn-primary text-base px-8 py-3-5">
              <CalendarIcon size={18} />
              <span>Schedule Private Call</span>
            </Link>
            <a
              href={siteConfig.whatsapp.general.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-inverse text-base px-6 py-3-5 flex items-center gap-2"
            >
              <MessageSquareIcon size={18} style={{ color: '#25d366' }} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
