'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { bookingProvider, BookingSlot } from '@/lib/booking-provider';
import { siteConfig } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import {
  CheckIcon,
  CalendarIcon,
  PhoneIcon,
  MessageSquareIcon,
  VideoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MapPinIcon,
} from './Icons';

interface BookingFormProps {
  initialCallType?: 'intended_parent' | 'surrogate' | 'egg_donation';
  initialStep?: number;
}

type CallType = 'intended_parent' | 'surrogate' | 'egg_donation';
type MeetingFormat = 'phone' | 'google_meet' | 'zoom';

export function BookingForm({ initialCallType = 'intended_parent', initialStep = 1 }: BookingFormProps) {
  // Wizard Step: 1 = Journey, 2 = Format, 3 = Date & Slot, 4 = Contact Details, 5 = Confirmed
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  // Selections
  const [callType, setCallType] = useState<CallType>(initialCallType);
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>('phone');

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Calculate default selected date: next available weekday
  const getNextWeekdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getNextWeekdayString());
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Form Inputs
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactConsent, setContactConsent] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Load available time slots whenever selectedDate changes
  useEffect(() => {
    let isMounted = true;
    async function loadSlots() {
      setIsLoadingSlots(true);
      setErrorMessage(null);
      try {
        const availableSlots = await bookingProvider.getAvailableSlots(selectedDate, 'Africa/Lagos');
        if (isMounted) {
          setSlots(availableSlots);
          if (availableSlots.length > 0) {
            setSelectedSlot(availableSlots[0].displayTime);
          } else {
            setSelectedSlot('');
          }
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Unable to load appointment slots. Please choose another date or connect on WhatsApp.');
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Calendar Navigation
  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    // Convert so Monday = 0, Sunday = 6
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{
      dateString: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      isPast: boolean;
      isToday: boolean;
    }> = [];

    // Empty cells before first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({
        dateString: '',
        dayNum: 0,
        isCurrentMonth: false,
        isWeekend: false,
        isPast: true,
        isToday: false,
      });
    }

    // Days in current month
    const todayStr = today.toISOString().split('T')[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateString = `${year}-${mStr}-${dStr}`;

      // Consider past if before today
      const isPast = dateString < todayStr;
      const isToday = dateString === todayStr;

      days.push({
        dateString,
        dayNum: d,
        isCurrentMonth: true,
        isWeekend,
        isPast,
        isToday,
      });
    }

    return days;
  }, [calendarMonth, today]);

  // Format date helper for human reading
  const formatReadableDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const [y, m, d] = isoDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const monthLabel = calendarMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please provide your mobile phone number for consultation confirmation.');
      return;
    }
    if (!contactConsent) {
      setErrorMessage('Please confirm contact consent regarding this appointment request.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Please select an available consultation time slot.');
      return;
    }

    setIsSubmitting(true);
    trackEvent({ name: 'booking_flow_start', audience: callType });

    try {
      const result = await bookingProvider.createBooking({
        fullName,
        phoneNumber,
        email: email.trim() || undefined,
        callType,
        meetingFormat,
        date: selectedDate,
        slot: selectedSlot,
        timezone: 'Africa/Lagos',
        contactConsent,
      });

      if (result.success && result.bookingId) {
        setConfirmedBookingId(result.bookingId);
        setCurrentStep(5);
        trackEvent({ name: 'booking_confirmed', audience: callType });
      } else {
        setErrorMessage(result.error || 'Booking could not be finalized. Please reach out directly on WhatsApp.');
        trackEvent({ name: 'booking_error', errorType: 'submission_failed' });
      }
    } catch {
      setErrorMessage('A network error occurred. Please contact our Surulere desk directly via WhatsApp.');
      trackEvent({ name: 'booking_error', errorType: 'network_exception' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper names
  const callTypeLabels: Record<CallType, string> = {
    intended_parent: 'Intended Parents Program',
    surrogate: 'Prospective Surrogate Program',
    egg_donation: 'Egg & Ovum Donation',
  };

  const meetingFormatLabels: Record<MeetingFormat, { title: string; desc: string; icon: typeof PhoneIcon }> = {
    phone: {
      title: 'Phone Call (Voice)',
      desc: 'Direct coordinator call to your mobile number (Nigeria or international roaming).',
      icon: PhoneIcon,
    },
    google_meet: {
      title: 'Google Meet (HD Video)',
      desc: 'Encrypted virtual meeting room link delivered directly to your email.',
      icon: VideoIcon,
    },
    zoom: {
      title: 'Zoom Video Conference',
      desc: 'Private video consultation room with screen-sharing for document reviews.',
      icon: VideoIcon,
    },
  };

  // =========================================================================
  // STEP 5: CONFIRMATION VIEW
  // =========================================================================
  if (currentStep === 5 && confirmedBookingId) {
    return (
      <div className="card-architectural bg-warm p-8 md:p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center shadow-lg">
          <CheckIcon size={32} />
        </div>

        <div>
          <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-2">
            Appointment Confirmed &bull; Confidential
          </span>
          <h2 className="text-2xl md:text-3xl font-medium text-primary mb-3">
            Your Private Consultation is Scheduled
          </h2>
          <p className="text-sm md:text-base text-secondary leading-relaxed max-w-lg mx-auto">
            Thank you, <strong className="font-semibold text-primary">{fullName}</strong>. A senior reproductive care coordinator has reserved your confidential consultation slot.
          </p>
        </div>

        {/* Confirmed Details Badge */}
        <div className="card-architectural bg-white text-left w-full p-6 text-sm text-secondary space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-subtle">
            <span className="text-xs font-mono uppercase text-muted font-semibold">Reference ID:</span>
            <span className="font-mono font-bold text-accent text-base">{confirmedBookingId}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
            <div>
              <span className="text-muted block text-xs">Consultation Pathway:</span>
              <span className="font-semibold text-primary">{callTypeLabels[callType]}</span>
            </div>
            <div>
              <span className="text-muted block text-xs">Meeting Method:</span>
              <span className="font-semibold text-primary">{meetingFormatLabels[meetingFormat].title}</span>
            </div>
            <div>
              <span className="text-muted block text-xs">Confirmed Date:</span>
              <span className="font-semibold text-primary">{formatReadableDate(selectedDate)}</span>
            </div>
            <div>
              <span className="text-muted block text-xs">Time & Timezone:</span>
              <span className="font-semibold text-primary">{selectedSlot} (Africa/Lagos WAT)</span>
            </div>
          </div>
          <div className="pt-2 text-xs text-muted border-t-subtle">
            <strong>Headquarters Desk:</strong> Kernel St, Bode Thomas, Surulere, Lagos &bull; +234 902 494 4961
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`${siteConfig.whatsapp[callType === 'surrogate' ? 'surrogate' : 'intendedParent'].url}&text=${encodeURIComponent(`Hello Zizo Surrogacy, I have scheduled consultation ${confirmedBookingId}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp w-full sm:w-auto px-6 py-3"
          >
            <MessageSquareIcon size={18} />
            <span>Open in WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setConfirmedBookingId(null);
              setCurrentStep(1);
            }}
            className="btn btn-secondary w-full sm:w-auto px-6 py-3"
          >
            <span>Book Another Appointment</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEPS 1-4: INTERACTIVE CLICKABLE SCHEDULER WIZARD
  // =========================================================================
  return (
    <div className="card-architectural bg-white p-6 md:p-10 max-w-3xl mx-auto shadow-sm">
      {/* Interactive Clickable Step Header */}
      <nav className="booking-stepper" aria-label="Booking Progress">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`stepper-step ${currentStep === 1 ? 'is-active' : ''} ${currentStep > 1 ? 'is-completed' : ''}`}
        >
          <span className="stepper-badge">{currentStep > 1 ? '✓' : '1'}</span>
          <span>1. Pathway</span>
        </button>

        <span className="text-muted text-xs">&rarr;</span>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`stepper-step ${currentStep === 2 ? 'is-active' : ''} ${currentStep > 2 ? 'is-completed' : ''}`}
        >
          <span className="stepper-badge">{currentStep > 2 ? '✓' : '2'}</span>
          <span>2. Method</span>
        </button>

        <span className="text-muted text-xs">&rarr;</span>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`stepper-step ${currentStep === 3 ? 'is-active' : ''} ${currentStep > 3 ? 'is-completed' : ''}`}
        >
          <span className="stepper-badge">{currentStep > 3 ? '✓' : '3'}</span>
          <span>3. Date & Time</span>
        </button>

        <span className="text-muted text-xs">&rarr;</span>

        <button
          type="button"
          onClick={() => selectedSlot && setCurrentStep(4)}
          disabled={!selectedSlot}
          className={`stepper-step ${currentStep === 4 ? 'is-active' : ''}`}
        >
          <span className="stepper-badge">4</span>
          <span>4. Details</span>
        </button>
      </nav>

      <form onSubmit={handleSubmit}>
        {/* ===================================================================
            STEP 1: SELECT CARE PATHWAY
            =================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-1">
                Step 1 of 4 &bull; Consultation Focus
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-primary">
                Which reproductive care pathway fits your journey?
              </h2>
              <p className="text-sm text-secondary mt-1">
                Select your focus area so our senior coordinator can prepare relevant clinical and legal guidelines.
              </p>
            </div>

            <div className="choice-card-grid">
              {/* Option 1: Intended Parents */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCallType('intended_parent')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCallType('intended_parent')}
                className={`choice-card ${callType === 'intended_parent' ? 'is-selected' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-base text-primary">
                    For Intended Parents
                  </span>
                  {callType === 'intended_parent' && (
                    <span className="w-5 h-5 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center">
                      <CheckIcon size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Confidential surrogate pairing, clinical protocol alignment at certified Lagos fertility centers, and independent legal escrow agreements.
                </p>
                <span className="text-xs font-mono text-accent mt-3 font-medium">
                  Intended Parent Program &rarr;
                </span>
              </div>

              {/* Option 2: Surrogate Enquiry */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCallType('surrogate')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCallType('surrogate')}
                className={`choice-card ${callType === 'surrogate' ? 'is-selected' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-base text-primary">
                    For Prospective Surrogates
                  </span>
                  {callType === 'surrogate' && (
                    <span className="w-5 h-5 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center">
                      <CheckIcon size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Dignified maternal care, complete privacy, independent attorney representation, and transparent living allowances across Nigeria.
                </p>
                <span className="text-xs font-mono text-accent mt-3 font-medium">
                  Become a Surrogate &rarr;
                </span>
              </div>

              {/* Option 3: Egg Donation */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCallType('egg_donation')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCallType('egg_donation')}
                className={`choice-card ${callType === 'egg_donation' ? 'is-selected' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-base text-primary">
                    Egg & Ovum Donation Support
                  </span>
                  {callType === 'egg_donation' && (
                    <span className="w-5 h-5 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center">
                      <CheckIcon size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Strict genetic screening, psychological readiness counseling, and cycle coordination at accredited reproductive hospitals.
                </p>
                <span className="text-xs font-mono text-accent mt-3 font-medium">
                  Donor & Recipient Program &rarr;
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-primary px-7 py-3 text-sm font-semibold"
              >
                <span>Continue to Meeting Method</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 2: SELECT MEETING FORMAT & CONFIRM TIMEZONE
            =================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-1">
                Step 2 of 4 &bull; Meeting Format
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-primary">
                How would you prefer to conduct your consultation?
              </h2>
              <p className="text-sm text-secondary mt-1">
                Choose the communication channel that offers you the most privacy and comfort.
              </p>
            </div>

            <div className="choice-card-grid">
              {(['phone', 'google_meet', 'zoom'] as MeetingFormat[]).map((fmt) => {
                const info = meetingFormatLabels[fmt];
                const Icon = info.icon;
                const isSelected = meetingFormat === fmt;
                return (
                  <div
                    key={fmt}
                    role="button"
                    tabIndex={0}
                    onClick={() => setMeetingFormat(fmt)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setMeetingFormat(fmt)}
                    className={`choice-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-md ${isSelected ? 'bg-[var(--action-primary)] text-white' : 'bg-soft text-accent'}`}>
                          <Icon size={18} />
                        </span>
                        <span className="font-semibold text-sm md:text-base text-primary">
                          {info.title}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center">
                          <CheckIcon size={12} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed pl-9">
                      {info.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Consultation Parameters Strip */}
            <div className="card-architectural bg-warm p-4 text-xs text-secondary flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
              <span className="flex items-center gap-2">
                <ClockIcon size={14} className="text-accent" />
                <span>Duration: <strong>30 Minutes</strong> (Complimentary)</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPinIcon size={14} className="text-accent" />
                <span>Timezone: <strong>Africa/Lagos (WAT GMT+1)</strong></span>
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheckIcon size={14} className="text-accent" />
                <span>100% Confidential Consultation</span>
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary px-5 py-2.5 text-xs font-semibold"
              >
                <ChevronLeftIcon size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-primary px-7 py-3 text-sm font-semibold"
              >
                <span>Continue to Date & Time</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 3: INTERACTIVE VISUAL CALENDAR & TIME SLOTS
            =================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-1">
                Step 3 of 4 &bull; Calendar Availability
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-primary">
                Select your preferred consultation date and time
              </h2>
              <p className="text-sm text-secondary mt-1">
                Click a weekday on the calendar to view available Africa/Lagos coordinator time slots.
              </p>
            </div>

            {/* Visual Interactive Calendar Widget */}
            <div className="calendar-widget">
              <div className="calendar-header">
                <div>
                  <h3 className="font-semibold text-base text-primary">
                    {monthLabel}
                  </h3>
                  <span className="text-xs text-muted font-mono">
                    WAT (West Africa Time, Lagos)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous Month"
                    className="calendar-nav-btn"
                  >
                    <ChevronLeftIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next Month"
                    className="calendar-nav-btn"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="calendar-grid mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                  <div key={d} className="calendar-day-label">
                    {d}
                  </div>
                ))}
              </div>

              {/* Interactive Day Tiles */}
              <div className="calendar-grid">
                {calendarDays.map((day, idx) => {
                  if (!day.dateString) {
                    return <div key={`empty-${idx}`} aria-hidden="true" />;
                  }

                  const isSelected = selectedDate === day.dateString;
                  const isClickable = !day.isPast && !day.isWeekend;

                  return (
                    <button
                      key={day.dateString}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => setSelectedDate(day.dateString)}
                      className={`calendar-day-tile ${isSelected ? 'is-selected' : ''} ${day.isWeekend ? 'is-weekend' : ''} ${day.isPast ? 'is-disabled' : ''} ${day.isToday ? 'is-today' : ''}`}
                      title={day.isWeekend ? 'Consultations available Monday-Friday' : day.dateString}
                    >
                      <span>{day.dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Time Slot Chooser */}
              <div className="time-slots-container">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary font-mono">
                    Available Time Slots on {formatReadableDate(selectedDate)}:
                  </span>
                  <span className="text-xs text-muted">
                    Africa/Lagos WAT
                  </span>
                </div>

                {isLoadingSlots ? (
                  <div className="py-6 text-center text-xs text-muted">
                    Loading coordinator calendar availability...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 rounded-md bg-soft text-xs text-secondary text-center">
                    No online slots open for this date. Please click another weekday or reach out via WhatsApp.
                  </div>
                ) : (
                  <div className="slot-pills-grid">
                    {slots.map((slot) => {
                      const isSlotActive = selectedSlot === slot.displayTime;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot.displayTime)}
                          className={`slot-pill ${isSlotActive ? 'is-selected' : ''}`}
                        >
                          <ClockIcon size={14} />
                          <span>{slot.displayTime}</span>
                          {isSlotActive && <CheckIcon size={14} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary px-5 py-2.5 text-xs font-semibold"
              >
                <ChevronLeftIcon size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(4)}
                className="btn btn-primary px-7 py-3 text-sm font-semibold"
              >
                <span>Continue to Contact Details</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            STEP 4: CONTACT DETAILS & CONSENT (Zero medical info required)
            =================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider block mb-1">
                Step 4 of 4 &bull; Contact Details
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-primary">
                Finalize your confidential consultation
              </h2>
              <p className="text-sm text-secondary mt-1">
                Provide your contact details so our coordinator can connect with you at your chosen appointment time.
              </p>
            </div>

            {/* Live Interactive Booking Summary Badge */}
            <div className="booking-summary-card">
              <div className="flex items-center justify-between pb-3 border-b-subtle mb-3">
                <span className="text-xs font-mono font-semibold uppercase text-accent tracking-wider">
                  Consultation Summary
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Change Date/Time
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                <div>
                  <span className="text-muted block text-xs">Pathway:</span>
                  <span className="font-semibold text-primary">{callTypeLabels[callType]}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Meeting Method:</span>
                  <span className="font-semibold text-primary">{meetingFormatLabels[meetingFormat].title}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Scheduled Date:</span>
                  <span className="font-semibold text-primary">{formatReadableDate(selectedDate)}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Time:</span>
                  <span className="font-semibold text-primary">{selectedSlot} (WAT)</span>
                </div>
              </div>
            </div>

            {/* Strict Non-Medical Contact Fields */}
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label font-medium">
                  Full Name <span className="text-accent">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. Chidinma Okonkwo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label font-medium">
                  Mobile / WhatsApp Phone Number <span className="text-accent">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  placeholder="+234 801 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                />
                <span className="text-xs text-muted block mt-1">
                  Include international dialing code if outside Nigeria (e.g. +44, +1, +234).
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label font-medium">
                  Email Address <span className="text-muted font-normal">(Optional, for Calendar Invitation)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="pt-2">
                <label className="form-checkbox-label flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={contactConsent}
                    onChange={(e) => setContactConsent(e.target.checked)}
                    className="form-checkbox mt-1 shrink-0"
                  />
                  <span className="text-xs text-secondary leading-relaxed">
                    I consent to Zizo Surrogacy contacting me by telephone, WhatsApp, or email strictly regarding this confidential consultation request. (We never share personal information with third parties, and no medical records are stored.)
                  </span>
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-xs border border-red-200" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-secondary px-5 py-2.5 text-xs font-semibold"
              >
                <ChevronLeftIcon size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3.5 text-base font-semibold shadow-md"
              >
                <CalendarIcon size={18} />
                <span>{isSubmitting ? 'Confirming Appointment...' : 'Schedule Private Consultation'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Resilient Fallback Strip */}
      <div className="mt-8 pt-6 border-t-subtle text-center text-xs text-secondary">
        <p className="mb-2">Need an alternative time or prefer immediate WhatsApp messaging?</p>
        <div className="flex flex-wrap justify-center items-center gap-3">
          <a
            href={siteConfig.whatsapp[callType === 'surrogate' ? 'surrogate' : 'intendedParent'].url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline inline-flex items-center gap-1.5"
          >
            <MessageSquareIcon size={14} />
            <span>Chat on WhatsApp</span>
          </a>
          <span className="text-muted">&bull;</span>
          <a
            href={`tel:${siteConfig.contact.phoneGeneralRaw}`}
            className="font-medium text-accent hover:underline inline-flex items-center gap-1.5"
          >
            <PhoneIcon size={14} />
            <span>Direct Call: {siteConfig.contact.phoneGeneral}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
