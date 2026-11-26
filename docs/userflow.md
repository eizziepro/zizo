# Zizo Surrogacy — User Flow

**Position in document sequence:** 1 of 7. This flow defines the visitor paths that the SEO structure, schema, technical design, visual design and implementation plan must support.

## Scope and assumptions

The website serves intended parents and prospective surrogate applicants in Lagos, Nigeria. Its two main conversion actions are scheduling a call and starting a WhatsApp chat. The supplied Nexus file is a layout and interaction reference only; its digital-studio content is not used.

The current Zizo homepage is a long single-page experience. Its main “Start Your Journey” action jumps within the page rather than opening a booking flow, and its service links lead to WhatsApp. This user flow introduces clearer audience routing and call scheduling. It does not assume a booking vendor, call duration, fees or appointment availability; Zizo must confirm those before build.

## Primary paths

### A. Intended parent → scheduled call

1. The visitor arrives at Home through search, referral, social media or a direct visit.
2. The hero states what Zizo does, where it operates and who it supports. The visitor selects **For Intended Parents** or **Book a Call**.
3. The intended-parent page explains Zizo’s verified role, process, support boundaries, safeguards and the next step. Claims about clinics, legal services, medical outcomes, cost or international reach appear only if verified and approved.
4. The visitor selects **Book a Call**. The scheduler displays the call type, duration, format, available dates and times, and the Africa/Lagos time zone. If calls are free or paid, this is stated before confirmation.
5. The visitor enters the required booking fields: name, phone number, intended-parent call type, date and time, and contact consent.
6. The system confirms the appointment and shows its date, local time, format, cancellation/rescheduling route and what to expect. If supported, it sends a confirmation and calendar invite, then a reminder.

### B. Surrogate applicant → scheduled call

1. The visitor selects **Become a Surrogate** from Home or the navigation.
2. The page explains the verified first-contact process and answers common questions without making unsupported eligibility, safety, payment or outcome promises.
3. The visitor chooses **Book a Private Call**. The call type is set to surrogate enquiry, and the scheduler displays available times in Africa/Lagos time.
4. The visitor supplies the same minimum required fields: name, phone, call type, date/time and contact consent.
5. A clear confirmation explains who will follow up and how to change the appointment.

The initial booking form must not ask for medical history, diagnoses, test results, fertility records or sensitive family information. If such information is later necessary, it belongs in a secure, separately reviewed process—not the public contact form or analytics.

### C. Either audience → WhatsApp

1. From Home, an audience page, an article or Contact, the visitor selects **Chat on WhatsApp**.
2. The correct organization-approved WhatsApp number opens through a tested `https://wa.me/` link.
3. The message may be prefilled with a simple topic, such as “Hello, I would like to ask about intended-parent support” or “Hello, I would like to ask about becoming a surrogate.” It contains no sensitive personal details.
4. The visitor sends the message in WhatsApp. The website measures the click only; it does not capture the chat contents.

Zizo currently uses different WhatsApp numbers for general and surrogate enquiries. Confirm which numbers remain active, who monitors each one and their response-time promise before launch.

### D. Search or article visitor → relevant action

1. The visitor lands on a service page or Agency Insight from a search result.
2. The page answers the question named in its title and quickly identifies Zizo, its Lagos market and its role.
3. A contextual next step offers **Book a Call** or the relevant WhatsApp conversation.
4. Breadcrumbs and internal links let the visitor reach the related service, audience page, About or Contact area.

## Scheduler fields and behaviors

### Required

- Full name.
- Mobile phone number with country code or country selection.
- Visitor/call type: intended-parent enquiry or surrogate enquiry.
- Available date and time.
- Consent to be contacted about the requested appointment.

### Configurable standard-booking options

Use these only when the selected booking system needs them: email for calendar invitations, detected time zone with an option to confirm/change it, meeting method or location, optional non-sensitive notes, reminder channel, reschedule/cancel controls, and calendar integration. Keep optional fields optional. Avoid adding fields simply because a booking platform supports them.

### Required booking states

The flow must cover: available slots; no available slots; selected slot becoming unavailable; invalid or incomplete fields; booking submission in progress; provider/service failure; confirmed booking; and reschedule/cancellation. When a slot is unavailable, preserve valid form values and offer another time or WhatsApp.

## Navigation and conversion rules

The global navigation should include Home, For Intended Parents, Become a Surrogate, How It Works or Services, Agency Insights, About and Contact. **Book a Call** is the primary action. **WhatsApp** is an alternative, not a confusing duplicate of every primary CTA. On mobile, provide a compact booking action that remains visible without covering content or keyboard focus.

Each service or audience CTA must lead to the matching page, booking type or WhatsApp greeting. Replace generic “Learn More” links that all point to one destination with descriptive labels.

## Measurement events

Track page and CTA location, not the contents of a message or personal form values. Recommended events are `booking_cta_click`, `booking_flow_start`, `booking_slot_selected`, `booking_confirmed`, `booking_error`, `whatsapp_click`, and `insight_read`. Where appropriate, include a non-identifying audience category such as `intended_parent` or `surrogate`; never attach names, phone numbers, medical information or WhatsApp message text.

## UX acceptance criteria

- A first-time visitor can choose the intended-parent or surrogate path from the first screen.
- A visitor can find a booking or WhatsApp action from any major content page.
- Booking shows time zone, call type, duration and format before final confirmation; business details must be supplied.
- Required and optional fields are distinguishable, labels persist when fields are filled, and validation explains how to fix errors.
- The visitor’s entered information survives recoverable booking errors.
- Mobile, keyboard and screen-reader users can complete both contact paths.
- No step implies guaranteed medical, legal or family-building outcomes.
