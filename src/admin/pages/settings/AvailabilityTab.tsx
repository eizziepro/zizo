import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Select } from '../../components/untitledui/Select';
import { Toggle } from '../../components/untitledui/Toggle';
import { Button } from '../../components/untitledui/Button';
import { Badge } from '../../components/untitledui/Badge';
import { Plus, Trash01, Calendar } from '@untitledui/icons';

interface DaySchedule {
  weekday: number;
  name: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { weekday: 1, name: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { weekday: 2, name: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { weekday: 3, name: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { weekday: 4, name: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { weekday: 5, name: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
  { weekday: 6, name: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00' },
  { weekday: 0, name: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00' },
];

export const AvailabilityTab: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [minNoticeHours, setMinNoticeHours] = useState('24');
  const [horizonDays, setHorizonDays] = useState('30');
  const [slotIntervalMin, setSlotIntervalMin] = useState('30');
  const [dailyCap, setDailyCap] = useState('8');

  // Exceptions list (blocked dates)
  const [exceptions, setExceptions] = useState<Array<{ id: string; date: string; note: string }>>([
    { id: '1', date: '2026-12-25', note: 'Christmas Day' },
    { id: '2', date: '2026-12-26', note: 'Boxing Day' },
    { id: '3', date: '2027-01-01', note: 'New Year Day' },
  ]);
  const [newExceptionDate, setNewExceptionDate] = useState('');
  const [newExceptionNote, setNewExceptionNote] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleDayToggle = (weekday: number, enabled: boolean) => {
    setSchedule((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, enabled } : d))
    );
  };

  const handleTimeChange = (weekday: number, field: 'startTime' | 'endTime', val: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, [field]: val } : d))
    );
  };

  const handleAddException = () => {
    if (!newExceptionDate) return;
    setExceptions((prev) => [
      ...prev,
      { id: 'ex-' + Date.now(), date: newExceptionDate, note: newExceptionNote || 'Clinic Holiday' },
    ]);
    setNewExceptionDate('');
    setNewExceptionNote('');
  };

  const handleRemoveException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await logAction({
        action: 'UPDATE_AVAILABILITY_RULES',
        tableName: 'availability_rules',
        diff: { timezone, minNoticeHours, horizonDays, schedule, exceptions },
      });
      toast('Availability Rules Saved', 'Working hours and appointment slots were updated.', 'success');
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save rules.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate 14-day live preview slots
  const previewDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const weekday = d.getDay();
    const dayConfig = schedule.find((s) => s.weekday === weekday);
    const dateStr = d.toISOString().split('T')[0];
    const isBlocked = exceptions.some((e) => e.date === dateStr);

    return {
      date: dateStr,
      formattedDate: d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      isOpen: dayConfig?.enabled && !isBlocked,
      hours: dayConfig?.enabled && !isBlocked ? `${dayConfig.startTime} - ${dayConfig.endTime}` : 'Closed',
    };
  });

  return (
    <form onSubmit={handleSave} className="space-y-8 w-full text-left">
      {/* Clinic Working Hours Table */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="text-base font-semibold text-[#17191A]">Weekly Working Hours</h3>
          <p className="text-xs text-[#5D5E5F] mt-0.5">
            Define daily consultation hours. Times are calculated in Africa/Lagos (WAT, UTC+1).
          </p>
        </div>

        <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px] overflow-hidden">
          {schedule.map((day) => (
            <div
              key={day.weekday}
              className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                day.enabled ? 'bg-white' : 'bg-[#FAF9F6]/60'
              }`}
            >
              <div className="w-32">
                <Toggle
                  checked={day.enabled}
                  onChange={(val) => handleDayToggle(day.weekday, val)}
                  label={day.name}
                />
              </div>

              {day.enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => handleTimeChange(day.weekday, 'startTime', e.target.value)}
                    className="border border-[#E1E0DD] rounded px-2 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
                  />
                  <span className="text-xs text-[#5D5E5F]">to</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => handleTimeChange(day.weekday, 'endTime', e.target.value)}
                    className="border border-[#E1E0DD] rounded px-2 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
                  />
                </div>
              ) : (
                <span className="text-xs text-[#969594] italic">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Policies */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <h3 className="text-base font-semibold text-[#17191A]">Booking Horizons &amp; Slot Intervals</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Advance Notice (Hours)"
            type="number"
            min={1}
            value={minNoticeHours}
            onChange={(e) => setMinNoticeHours(e.target.value)}
            helperText="Prevents same-day or last-minute surprise bookings."
          />
          <Input
            label="Booking Horizon (Days)"
            type="number"
            min={1}
            value={horizonDays}
            onChange={(e) => setHorizonDays(e.target.value)}
            helperText="Maximum days into the future clients can book."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Slot Interval"
            value={slotIntervalMin}
            onChange={(e) => setSlotIntervalMin(e.target.value)}
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes (Standard)' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '60 minutes' },
            ]}
          />
          <Input
            label="Daily Appointment Cap"
            type="number"
            min={1}
            value={dailyCap}
            onChange={(e) => setDailyCap(e.target.value)}
            helperText="Maximum consultations allowed per coordinator per day."
          />
        </div>
      </div>

      {/* Exception Dates / Holidays */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-semibold text-[#17191A]">Blocked Dates &amp; Clinic Holidays</h3>
        <p className="text-xs text-[#5D5E5F]">
          Specific dates when consultations are entirely blocked or closed.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="date"
            value={newExceptionDate}
            onChange={(e) => setNewExceptionDate(e.target.value)}
            className="border border-[#E1E0DD] rounded-[8px] px-3 py-2 text-xs text-[#17191A] bg-white w-full sm:w-auto"
          />
          <input
            type="text"
            placeholder="Reason / Note (e.g. National Holiday)"
            value={newExceptionNote}
            onChange={(e) => setNewExceptionNote(e.target.value)}
            className="border border-[#E1E0DD] rounded-[8px] px-3 py-2 text-xs text-[#17191A] bg-white flex-1 w-full"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddException}
            iconLeading={<Plus className="w-3.5 h-3.5" />}
          >
            Add Exception
          </Button>
        </div>

        <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px]">
          {exceptions.map((ex) => (
            <div key={ex.id} className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium text-[#17191A]">{ex.date}</span>
                <span className="text-[#5D5E5F]">— {ex.note}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveException(ex.id)}
                className="text-[#D92D20] hover:bg-[#FDF2F2] p-1.5 rounded transition-colors"
                aria-label={`Remove exception ${ex.date}`}
              >
                <Trash01 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 14-Day Live Preview */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#17645F]" />
          <h3 className="text-base font-semibold text-[#17191A]">14-Day Live Availability Preview</h3>
        </div>
        <p className="text-xs text-[#5D5E5F]">
          Client-facing appointment slot readiness for the upcoming two weeks.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {previewDays.map((d) => (
            <div
              key={d.date}
              className={`p-2.5 rounded-[8px] border text-center space-y-1 ${
                d.isOpen
                  ? 'border-[#C5D8D7] bg-[#E2ECEB]/20 text-[#17191A]'
                  : 'border-[#E1E0DD] bg-[#FAF9F6] text-[#969594]'
              }`}
            >
              <p className="text-[11px] font-semibold">{d.formattedDate}</p>
              <Badge variant={d.isOpen ? 'success' : 'gray'} size="sm">
                {d.isOpen ? 'Available' : 'Closed'}
              </Badge>
              <p className="text-[10px] font-mono text-[#5D5E5F]">{d.hours}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSaving}>
          Save Availability Settings
        </Button>
      </div>
    </form>
  );
};
