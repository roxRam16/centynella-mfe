const dateTimeFormat = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

/** Fecha y hora legibles en español ("20 sept 2026, 12:45"). `null` → "Nunca". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Nunca';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date);
}
