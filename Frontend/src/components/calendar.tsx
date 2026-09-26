'use client';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useState } from 'react';
export function Calendar({ checkedDates }: { checkedDates: string[] }) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = date.getFullYear(),
    month = date.getMonth();
  const start = (date.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return (
    <section className="panel calendar-panel">
      <div className="section-heading">
        <h2>Your consistency, visualized.</h2>
        <span className="calendar-flame">
          <Flame size={17} />
        </span>
      </div>
      <div className="calendar-month">
        <strong>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
        <div>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => setOffset((o) => o - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            disabled={offset >= 0}
            onClick={() => setOffset((o) => o + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={`label${i}`} className="day-label">
            {d}
          </span>
        ))}
        {Array.from({ length: start }, (_, i) => (
          <span key={`blank${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const day = i + 1;
          const now = offset === 0 && day === today.getDate();
          const active = checkedDates.includes(
            `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          );
          return (
            <span
              key={day}
              className={`calendar-day ${now ? 'today' : ''} ${active ? 'active' : ''}`}
              aria-label={`${date.toLocaleDateString('en-US', { month: 'long' })} ${day}${active ? ', checked in' : ''}${now ? ', today' : ''}`}
            >
              {active ? <Flame size={16} /> : day}
            </span>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span>
          <i />
          Checked in
        </span>
        <span>
          <i />
          Today
        </span>
        <span>One day at a time.</span>
      </div>
    </section>
  );
}
