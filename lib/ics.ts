export interface IcsEventInput {
  uid: string;
  startAt: string;
  endAt: string;
  summary: string;
  description: string;
  location: string;
  organizerEmail: string;
  organizerName?: string;
  attendeeEmail: string;
  attendeeName: string;
}

export function formatIcsUtc(isoDate: string): string {
  const d = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}` +
    `Z`
  );
}

export function generateGoogleCalendarUrl(input: {
  startAt: string;
  endAt: string;
  summary: string;
  description: string;
  location: string;
}): string {
  const dtStart = formatIcsUtc(input.startAt);
  const dtEnd = formatIcsUtc(input.endAt);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.summary,
    dates: `${dtStart}/${dtEnd}`,
    details: input.description,
    location: input.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function escapeIcsText(val: string): string {
  return (val || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function generateIcsContent(input: IcsEventInput): string {
  const nowStamp = formatIcsUtc(new Date().toISOString());
  const dtStart = formatIcsUtc(input.startAt);
  const dtEnd = formatIcsUtc(input.endAt);
  const orgName = escapeIcsText(input.organizerName || 'Zizo Donor and Surrogacy');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zizo Donor and Surrogacy//Consultation Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(input.uid)}@zizodonorandsurrogacy.com`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(input.summary)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
    `LOCATION:${escapeIcsText(input.location)}`,
    `ORGANIZER;CN="${orgName}":mailto:${input.organizerEmail}`,
    `ATTENDEE;CN="${escapeIcsText(input.attendeeName)}";RSVP=TRUE:mailto:${input.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
