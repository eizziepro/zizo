import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAvailableSlots,
  getAvailableDatesInMonth,
  hasBookingConflict,
  zonedWallTimeToUtc,
} from './availability';

const SAMPLE_RULES = [
  { staff_id: 'staff-1', weekday: 1, start_time: '09:00', end_time: '12:00', timezone: 'Africa/Lagos' },
  { staff_id: 'staff-1', weekday: 2, start_time: '09:00', end_time: '12:00', timezone: 'Africa/Lagos' },
];

test('zonedWallTimeToUtc converts Africa/Lagos (UTC+1) accurately', () => {
  const utc = zonedWallTimeToUtc('2026-11-16', '09:00', 'Africa/Lagos');
  assert.equal(utc.toISOString(), '2026-11-16T08:00:00.000Z');
});

test('generateAvailableSlots respects minimum notice, exceptions, and existing bookings', () => {
  // Monday 2026-11-16
  const now = new Date('2026-11-15T12:00:00.000Z');
  const existing = [
    {
      id: 'b-1',
      staff_id: 'staff-1',
      start_at: '2026-11-16T08:00:00.000Z', // 09:00 WAT
      end_at: '2026-11-16T08:30:00.000Z',
      status: 'confirmed',
    },
  ];
  const exceptions = [
    {
      staff_id: null,
      date: '2026-11-16',
      start_time: '11:00',
      end_time: '12:00',
      is_blocked: true,
    },
  ];

  const slots = generateAvailableSlots({
    dateStr: '2026-11-16',
    durationMin: 30,
    bufferMin: 10,
    slotIntervalMin: 30,
    minNoticeHours: 12,
    horizonDays: 60,
    dailyCap: 8,
    rules: SAMPLE_RULES,
    exceptions,
    existingBookings: existing,
    now,
  });

  // 09:00 blocked by b-1 (09:00-09:30), 09:30 still conflicts with b-1? No, 09:30 >= 09:30!
  // Wait: if b-1 ends at 08:30Z (09:30 WAT), 09:30 WAT starts at 08:30Z -> no overlap.
  // 11:00 and 11:30 blocked by exception.
  const times = slots.map((s) => s.clinicTime);
  assert.equal(times.includes('09:00'), false);
  assert.equal(times.includes('09:30'), true);
  assert.equal(times.includes('10:00'), true);
  assert.equal(times.includes('10:30'), true);
  assert.equal(times.includes('11:00'), false);
  assert.equal(times.includes('11:30'), false);
});

test('hasBookingConflict ignores cancelled and no_show bookings', () => {
  const start = new Date('2026-11-16T08:00:00.000Z');
  const end = new Date('2026-11-16T08:30:00.000Z');
  assert.equal(
    hasBookingConflict(start, end, [
      { staff_id: 'staff-1', start_at: '2026-11-16T08:00:00.000Z', end_at: '2026-11-16T08:30:00.000Z', status: 'cancelled' },
    ]),
    false
  );
  assert.equal(
    hasBookingConflict(start, end, [
      { staff_id: 'staff-1', start_at: '2026-11-16T08:15:00.000Z', end_at: '2026-11-16T08:45:00.000Z', status: 'confirmed' },
    ]),
    true
  );
});

test('getAvailableDatesInMonth skips blocked full days and non-working weekdays', () => {
  const now = new Date('2026-11-15T12:00:00.000Z');
  const dates = getAvailableDatesInMonth(2026, 11, {
    durationMin: 30,
    bufferMin: 0,
    rules: SAMPLE_RULES,
    exceptions: [{ staff_id: null, date: '2026-11-16', start_time: null, end_time: null, is_blocked: true }],
    existingBookings: [],
    now,
  });
  assert.equal(dates.includes('2026-11-16'), false);
  assert.equal(dates.includes('2026-11-17'), true);
  assert.equal(dates.includes('2026-11-18'), false); // Wednesday has no rule
});
