const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function monthNameToIndex(monthName: string): number {
  const idx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthName.trim().toLowerCase()
  );
  return idx === -1 ? new Date().getMonth() : idx;
}

export function monthIndexToName(index: number): string {
  return MONTH_NAMES[((index % 12) + 12) % 12];
}

export function dayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

/** Returns all dates in a given month/year that fall on a specific weekday (0=Sun..6=Sat). */
export function getDatesForWeekday(
  year: number,
  monthIndex: number,
  weekday: number
): Date[] {
  const dates: Date[] = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    if (d.getDay() === weekday) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** "04 Jul" style short label used in the main table's date column. */
export function formatShortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const mon = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${day} ${mon}`;
}

/** "02.07.26" style label used in footer date chips. */
export function formatDotDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const mon = String(date.getMonth() + 1).padStart(2, '0');
  const yr = String(date.getFullYear()).slice(-2);
  return `${day}.${mon}.${yr}`;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function sortByIsoDate<T extends { isoDate: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}
