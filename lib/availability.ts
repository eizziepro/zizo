export interface AvailabilityRule {
  id?: string;
  staff_id: string;
  weekday: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  timezone: string;
}

export interface AvailabilityException {
  id?: string;
  staff_id: string | null;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM or null for full day
  end_time: string | null;
  is_blocked: number | boolean;
  note?: string;
}

export interface ExistingBooking {
  id?: string;
  staff_id: string;
  start_at: string; // ISO UTC
  end_at: string; // ISO UTC
  status: string;
}

export interface TimeSlot {
  startAt: string;
  endAt: string;
  clinicTime: string;
  clinicDate: string;
  staffId: string;
}

export const CLINIC_TIMEZONE = 'Africa/Lagos';

function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') {
      map[p.type] = parseInt(p.value, 10);
    }
  }
  const hour = map.hour === 24 ? 0 : map.hour;
  const asUtc = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

export function zonedWallTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const [hh, mm] = timeStr.split(':').map((n) => parseInt(n, 10));
  const approxUtc = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const offsetMin = getTimeZoneOffsetMinutes(timeZone, approxUtc);
  const corrected = new Date(approxUtc.getTime() - offsetMin * 60000);
  const offsetCheck = getTimeZoneOffsetMinutes(timeZone, corrected);
  if (offsetCheck !== offsetMin) {
    return new Date(approxUtc.getTime() - offsetCheck * 60000);
  }
  return corrected;
}

export function getWeekdayInZone(dateStr: string, timeZone = CLINIC_TIMEZONE): number {
  const midDayUtc = zonedWallTimeToUtc(dateStr, '12:00', timeZone);
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(midDayUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekdayStr] ?? 0;
}

export function getDateStringInZone(date: Date, timeZone = CLINIC_TIMEZONE): string {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return dtf.format(date);
}

export function hasBookingConflict(
  startAt: Date,
  endAt: Date,
  existingBookings: ExistingBooking[],
  staffId?: string,
  ignoreBookingId?: string
): boolean {
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();
  return existingBookings.some((b) => {
    if (ignoreBookingId && b.id === ignoreBookingId) return false;
    if (b.status === 'cancelled' || b.status === 'no_show') return false;
    if (staffId && b.staff_id !== staffId) return false;
    const bStart = new Date(b.start_at).getTime();
    const bEnd = new Date(b.end_at).getTime();
    return startMs < bEnd && endMs > bStart;
  });
}

export interface SlotGenerationParams {
  dateStr: string;
  durationMin: number;
  bufferMin: number;
  slotIntervalMin?: number;
  minNoticeHours?: number;
  horizonDays?: number;
  dailyCap?: number;
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  existingBookings: ExistingBooking[];
  now?: Date;
}

export function generateAvailableSlots(params: SlotGenerationParams): TimeSlot[] {
  const {
    dateStr,
    durationMin,
    bufferMin,
    slotIntervalMin = 30,
    minNoticeHours = 12,
    horizonDays = 60,
    dailyCap = 8,
    rules,
    exceptions,
    existingBookings,
    now = new Date(),
  } = params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];

  const todayClinic = getDateStringInZone(now, CLINIC_TIMEZONE);
  if (dateStr < todayClinic) return [];

  const maxDate = new Date(now.getTime() + horizonDays * 86400 * 1000);
  const maxDateClinic = getDateStringInZone(maxDate, CLINIC_TIMEZONE);
  if (dateStr > maxDateClinic) return [];

  // Global full-day block check
  const globalFullDayBlocked = exceptions.some(
    (ex) =>
      ex.date === dateStr &&
      !ex.staff_id &&
      Boolean(ex.is_blocked) &&
      (!ex.start_time || !ex.end_time)
  );
  if (globalFullDayBlocked) return [];

  // Daily booking cap check (all active bookings on that clinic date)
  const dayStartUtc = zonedWallTimeToUtc(dateStr, '00:00', CLINIC_TIMEZONE).getTime();
  const dayEndUtc = dayStartUtc + 86400 * 1000;
  const activeCountToday = existingBookings.filter((b) => {
    if (b.status === 'cancelled' || b.status === 'no_show') return false;
    const t = new Date(b.start_at).getTime();
    return t >= dayStartUtc && t < dayEndUtc;
  }).length;
  if (activeCountToday >= dailyCap) return [];

  const weekday = getWeekdayInZone(dateStr, CLINIC_TIMEZONE);
  const minNoticeUtcMs = now.getTime() + minNoticeHours * 3600 * 1000;

  // Group rules by staff_id
  const staffIds = Array.from(new Set(rules.map((r) => r.staff_id)));
  const slots: TimeSlot[] = [];

  for (const staffId of staffIds) {
    const staffRules = rules.filter((r) => r.staff_id === staffId && r.weekday === weekday);
    if (staffRules.length === 0) continue;

    const staffFullDayBlock = exceptions.some(
      (ex) =>
        ex.date === dateStr &&
        ex.staff_id === staffId &&
        Boolean(ex.is_blocked) &&
        (!ex.start_time || !ex.end_time)
    );
    if (staffFullDayBlock) continue;

    const partialBlocks = exceptions
      .filter(
        (ex) =>
          ex.date === dateStr &&
          (!ex.staff_id || ex.staff_id === staffId) &&
          Boolean(ex.is_blocked) &&
          ex.start_time &&
          ex.end_time
      )
      .map((ex) => ({
        startMin: parseHHMM(ex.start_time!),
        endMin: parseHHMM(ex.end_time!),
      }));

    for (const rule of staffRules) {
      const tz = rule.timezone || CLINIC_TIMEZONE;
      const ruleStartMin = parseHHMM(rule.start_time);
      const ruleEndMin = parseHHMM(rule.end_time);

      for (
        let curMin = ruleStartMin;
        curMin + durationMin <= ruleEndMin;
        curMin += slotIntervalMin
      ) {
        const slotEndWithBufferMin = curMin + durationMin + bufferMin;
        const hh = pad2(Math.floor(curMin / 60));
        const mm = pad2(curMin % 60);
        const timeStr = `${hh}:${mm}`;

        const blockedByException = partialBlocks.some(
          (blk) => curMin < blk.endMin && curMin + durationMin > blk.startMin
        );
        if (blockedByException) continue;

        const slotStartUtc = zonedWallTimeToUtc(dateStr, timeStr, tz);
        if (slotStartUtc.getTime() < minNoticeUtcMs) continue;

        const slotEndUtc = new Date(slotStartUtc.getTime() + durationMin * 60000);
        const slotBlockEndUtc = new Date(
          slotStartUtc.getTime() + (slotEndWithBufferMin - curMin) * 60000
        );

        if (hasBookingConflict(slotStartUtc, slotBlockEndUtc, existingBookings, staffId)) {
          continue;
        }

        // Avoid duplicate identical start times across multiple staff by taking the first available staff
        const isoStart = slotStartUtc.toISOString();
        if (!slots.some((s) => s.startAt === isoStart)) {
          slots.push({
            startAt: isoStart,
            endAt: slotEndUtc.toISOString(),
            clinicTime: timeStr,
            clinicDate: dateStr,
            staffId,
          });
        }
      }
    }
  }

  slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
  return slots;
}

export function getAvailableDatesInMonth(
  year: number,
  month1Based: number,
  params: Omit<SlotGenerationParams, 'dateStr'>
): string[] {
  const daysInMonth = new Date(Date.UTC(year, month1Based, 0)).getUTCDate();
  const available: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad2(month1Based)}-${pad2(d)}`;
    const daySlots = generateAvailableSlots({ ...params, dateStr });
    if (daySlots.length > 0) {
      available.push(dateStr);
    }
  }
  return available;
}
