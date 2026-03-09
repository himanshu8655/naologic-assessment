import { Injectable } from '@angular/core';
import { Timescale, TimelineColumn } from '../models/work-order.models';

export const COL_WIDTH: Record<Timescale, number> = {
  Hour: 58,
  Day: 44,
  Week: 92,
  Month: 100,
};

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
  today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ── Snap helpers ──────────────────────────────────────────────
  startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  startOfWeek(d: Date): Date {
    const r = new Date(d);
    r.setDate(r.getDate() - r.getDay());
    r.setHours(0, 0, 0, 0);
    return r;
  }

  startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  startOfHour(d: Date): Date {
    const r = new Date(d);
    r.setMinutes(0, 0, 0);
    return r;
  }

  // ── Step functions ─────────────────────────────────────────────
  addMonths(d: Date, n: number): Date {
    const r = new Date(d);
    r.setMonth(r.getMonth() + n);
    return r;
  }

  addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  addHours(d: Date, n: number): Date {
    const r = new Date(d);
    r.setHours(r.getHours() + n);
    return r;
  }

  nextPeriod(d: Date, ts: Timescale): Date {
    switch (ts) {
      case 'Month':
        return this.addMonths(d, 1);
      case 'Week':
        return this.addDays(d, 7);
      case 'Day':
        return this.addDays(d, 1);
      case 'Hour':
        return this.addHours(d, 1);
    }
  }

  // ── ISO helpers ────────────────────────────────────────────────
  parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  // ── Column label formatters ────────────────────────────────────
  formatLabel(d: Date, ts: Timescale): string {
    switch (ts) {
      case 'Month':
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'Week': {
        const end = this.addDays(d, 6);
        return (
          d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' – ' +
          end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
      }
      case 'Day':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'Hour':
        return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    }
  }

  currentPeriodLabel(ts: Timescale): string {
    const map: Record<Timescale, string> = {
      Month: 'Current month',
      Week: 'Current week',
      Day: 'Today',
      Hour: 'Now',
    };
    return map[ts];
  }

  // ── Build timeline columns ─────────────────────────────────────
  buildColumns(ts: Timescale): TimelineColumn[] {
    const t = this.today();
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (ts) {
      case 'Month':
        rangeStart = this.addMonths(this.startOfMonth(t), -3);
        rangeEnd = this.addMonths(this.startOfMonth(t), 9);
        break;
      case 'Week':
        rangeStart = this.addDays(this.startOfWeek(t), -4 * 7);
        rangeEnd = this.addDays(this.startOfWeek(t), 16 * 7);
        break;
      case 'Day':
        rangeStart = this.addDays(this.startOfDay(t), -14);
        rangeEnd = this.addDays(this.startOfDay(t), 28);
        break;
      case 'Hour':
        rangeStart = this.addHours(this.startOfHour(new Date()), -12);
        rangeEnd = this.addHours(this.startOfHour(new Date()), 36);
        break;
    }

    const cols: TimelineColumn[] = [];
    let cur = new Date(rangeStart);
    const now = ts === 'Hour' ? new Date() : t;

    while (cur < rangeEnd) {
      const next = this.nextPeriod(cur, ts);
      const isCurrentPeriod = now >= cur && now < next;
      const todayFraction = isCurrentPeriod
        ? (now.getTime() - cur.getTime()) / (next.getTime() - cur.getTime())
        : 0;

      cols.push({
        date: new Date(cur),
        label: this.formatLabel(cur, ts),
        isCurrentPeriod,
        todayFraction,
        width: COL_WIDTH[ts],
      });
      cur = next;
    }

    return cols;
  }

  // ── Date → pixel position ─────────────────────────────────────
  /**
   * Given timeline range [rangeStart, rangeEnd] and total pixel width,
   * returns the pixel X offset for a given date.
   */
  dateToX(date: Date, rangeStart: Date, rangeEnd: Date, totalWidth: number): number {
    const span = rangeEnd.getTime() - rangeStart.getTime();
    const pos = date.getTime() - rangeStart.getTime();
    return (pos / span) * totalWidth;
  }

  /**
   * Given pixel X offset, returns the corresponding date.
   */
  xToDate(x: number, rangeStart: Date, rangeEnd: Date, totalWidth: number): Date {
    const span = rangeEnd.getTime() - rangeStart.getTime();
    return new Date(rangeStart.getTime() + (x / totalWidth) * span);
  }

  snapToStart(d: Date, ts: Timescale): Date {
    switch (ts) {
      case 'Month':
        return this.startOfMonth(d);
      case 'Week':
        return this.startOfWeek(d);
      case 'Day':
        return this.startOfDay(d);
      case 'Hour':
        return this.startOfHour(d);
    }
  }
}
