/** Utilidades de texto puras. */

/** Iniciales (máximo 2) a partir de un nombre: "Ana María Pérez" → "AM". Sin nombre → "?". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
