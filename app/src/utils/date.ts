const DAY = 24 * 60 * 60 * 1000;

/** Date locale au format AAAA-MM-JJ (clé du défi quotidien, échéances de révision). */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return dayKey(new Date(date.getTime() + days * DAY));
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / DAY);
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const longFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatToday(date: Date = new Date()): string {
  const s = dateFmt.format(date).replace(/^(\w+) 1 /, '$1 1er ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return Number.isNaN(d.getTime()) ? iso : longFmt.format(d);
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = daysBetween(dayKey(d), dayKey(now));
  if (diff <= 0) return 'Aujourd’hui';
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff} jours`;
  return shortFmt.format(d);
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  return h >= 18 || h < 5 ? 'Bonsoir' : 'Bonjour';
}
