/**
 * Librería de componentes expuesta a los remotes (`centynella_shell/components`).
 *
 * Un remote NUNCA importa de MUI directo ni duplica estos componentes: los consume de aquí,
 * igual que cualquier pantalla del shell importa de `@/components`. Así toda la plataforma
 * comparte un solo sistema de diseño, aunque el código del remote viva en otro repositorio.
 */
export * from '@/components';
