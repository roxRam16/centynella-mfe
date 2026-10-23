/**
 * Hooks expuestos a los remotes (`centynella_shell/hooks`).
 *
 * `useAuth` y `useToast` leen contexto de React (`AuthProvider`/`ToastProvider`) que el shell
 * ya monta una sola vez por encima de todo, remotes incluidos — por eso un remote los puede usar
 * tal cual, sin envolver nada él mismo.
 */
export { useAsyncResource } from '@/hooks/useAsyncResource';
export type { AsyncState } from '@/hooks/useAsyncResource';
export { useAuth } from '@/hooks/useAuth';
export { useDebouncedValue } from '@/hooks/useDebouncedValue';
export { useToast } from '@/hooks/useToast';
