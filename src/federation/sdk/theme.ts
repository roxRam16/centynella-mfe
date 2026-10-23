/**
 * Tema expuesto a los remotes (`centynella_shell/theme`).
 *
 * El tema de MUI (colores de `primary`/`secondary`/tipografía/etc.) ya llega SOLO por contexto:
 * un remote se monta dentro del `<ThemeProvider>` del shell, así que `useTheme()` de MUI ya
 * funciona sin esto. Lo que SÍ hace falta exponer son los tokens propios de la marca que no
 * viven en el tema de MUI (degradados, paleta del menú, radios…), para que un remote pueda
 * usarlos en `sx` igual que el shell.
 */
export { palette } from '@/theme/palette';
export { elevation, fontFamily, fontFamilyDisplay, radius, spacing } from '@/theme/tokens';
