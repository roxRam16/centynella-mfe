const dateTimeFormat = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

const timestampFormat = new Intl.DateTimeFormat('es', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

/** Fecha y hora con segundos (bitácora): "20/9/26, 13:14:05". */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : timestampFormat.format(date);
}

/** Fecha y hora legibles en español ("20 sept 2026, 12:45"). `null` → "Nunca". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Nunca';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date);
}
