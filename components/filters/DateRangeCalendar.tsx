"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DateRange = { start: Date | null; end: Date | null };

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Days after this date are not selectable. Defaults to today. */
  maxDate?: Date;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function MonthGrid({
  month,
  value,
  hoverDate,
  maxDate,
  onDayClick,
  onDayHover,
}: {
  month: Date;
  value: DateRange;
  hoverDate: Date | null;
  maxDate: Date;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
}) {
  const today = stripTime(new Date());
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // Monday-first offset for the 1st of the month
  const leadingBlanks = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;

  // While only the start is picked, hovering previews the would-be range.
  const previewEnd =
    value.start && !value.end && hoverDate && hoverDate > value.start ? hoverDate : null;
  const rangeStart = value.start;
  const rangeEnd = value.end ?? previewEnd;

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(month.getFullYear(), month.getMonth(), i + 1)
    ),
  ];

  return (
    <div className="w-full sm:w-64">
      <div className="text-center text-sm font-semibold text-gray-700 mb-3">
        {MONTHS[month.getMonth()]} {month.getFullYear()}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-gray-400 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;

          const disabled = day > maxDate;
          const isStart = sameDay(day, rangeStart);
          const isEnd = sameDay(day, rangeEnd);
          const inRange =
            !!rangeStart && !!rangeEnd && day > rangeStart && day < rangeEnd;
          const isToday = sameDay(day, today);

          let cls =
            "mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ";
          if (disabled) {
            cls += "text-gray-300 cursor-not-allowed";
          } else if (isStart || isEnd) {
            cls += "bg-primary text-white font-semibold cursor-pointer";
          } else if (inRange) {
            cls += "bg-primary/10 text-primary font-medium cursor-pointer";
          } else {
            cls += "text-gray-700 hover:bg-gray-100 cursor-pointer";
            if (isToday) cls += " ring-1 ring-primary/50 font-semibold";
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
              className={cls}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangeCalendar({ value, onChange, maxDate }: Props) {
  const max = stripTime(maxDate ?? new Date());
  // Left pane starts one month back so the right pane shows the current month.
  const [viewMonth, setViewMonth] = useState<Date>(addMonths(startOfMonth(max), -1));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleDayClick = (day: Date) => {
    // No selection yet, a completed range, or clicking before the start all
    // begin a fresh range; otherwise the click completes the current one.
    if (!value.start || value.end || day < value.start) {
      onChange({ start: day, end: null });
    } else {
      onChange({ start: value.start, end: day });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="p-2 rounded-lg border border-gray text-gray-500 hover:text-primary hover:border-primary transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-gray-400">
          Pick a start date, then an end date
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          disabled={addMonths(viewMonth, 2) > max}
          className="p-2 rounded-lg border border-gray text-gray-500 hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:border-gray"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 justify-center">
        <MonthGrid
          month={viewMonth}
          value={value}
          hoverDate={hoverDate}
          maxDate={max}
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
        />
        <MonthGrid
          month={addMonths(viewMonth, 1)}
          value={value}
          hoverDate={hoverDate}
          maxDate={max}
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
        />
      </div>
    </div>
  );
}
