/**
 * Decoupled Booking Provider Adapter — Zizo Surrogacy
 * Supports standard scheduling lifecycle with zero health/medical data fields.
 */

export interface BookingSlot {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm format e.g. "10:00"
  displayTime: string;// "10:00 AM (WAT)"
  available: boolean;
}

export interface BookingSubmission {
  fullName: string;
  phoneNumber: string;
  email?: string;
  callType: 'intended_parent' | 'surrogate' | 'egg_donation';
  meetingFormat: 'phone' | 'google_meet' | 'zoom';
  date: string;
  slot: string;
  timezone: string;
  contactConsent: boolean;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  confirmationMessage?: string;
  error?: string;
}

export interface BookingProvider {
  getAvailableSlots(date: string, timezone: string): Promise<BookingSlot[]>;
  createBooking(submission: BookingSubmission): Promise<BookingResult>;
}

/**
 * Mock Booking Provider
 * Generates realistic Africa/Lagos time slots for development and fallback modes.
 */
export class MockBookingProvider implements BookingProvider {
  async getAvailableSlots(date: string, _timezone: string): Promise<BookingSlot[]> {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    const selectedDate = new Date(date);
    const day = selectedDate.getDay();

    // Weekend = no slots (Monday-Friday only)
    if (day === 0 || day === 6) {
      return [];
    }

    return [
      { id: `${date}-1000`, date, time: '10:00', displayTime: '10:00 AM', available: true },
      { id: `${date}-1130`, date, time: '11:30', displayTime: '11:30 AM', available: true },
      { id: `${date}-1400`, date, time: '14:00', displayTime: '02:00 PM', available: true },
      { id: `${date}-1530`, date, time: '15:30', displayTime: '03:30 PM', available: true },
      { id: `${date}-1630`, date, time: '16:30', displayTime: '04:30 PM', available: true },
    ];
  }

  async createBooking(submission: BookingSubmission): Promise<BookingResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Basic server-boundary validation
    if (!submission.fullName || !submission.phoneNumber || !submission.contactConsent) {
      return {
        success: false,
        error: 'Please provide all required fields and confirm contact consent.',
      };
    }

    const bookingId = `ZIZO-${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      bookingId,
      confirmationMessage: `Your confidential consultation has been confirmed for ${submission.date} at ${submission.slot} (Africa/Lagos time). Our coordinator will contact you via ${submission.meetingFormat}.`,
    };
  }
}

// Active singleton provider instance
export const bookingProvider: BookingProvider = new MockBookingProvider();
