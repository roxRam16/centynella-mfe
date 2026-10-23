/**
 * Proveedores expuestos a los remotes (`centynella_shell/providers`).
 *
 * Solo hacen falta para el modo standalone de un remote (su propio `main.tsx`, sin el shell
 * alrededor): ahí SÍ hay que envolver manualmente con tema + sesión + notificaciones, porque
 * no hay ningún `<ShellLayout>` que ya lo haga. Un remote montado DENTRO del shell (el caso
 * normal) nunca importa esto — ya está envuelto.
 */
export { ThemeProvider } from '@/theme';
export { AuthProvider, ToastProvider } from '@/context';
