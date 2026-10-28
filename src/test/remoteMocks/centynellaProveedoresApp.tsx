/**
 * Doble del remote `centynella_proveedores` para las pruebas del shell (Vitest no ejecuta el
 * plugin de Module Federation: ver alias condicional en `vite.config.ts`). Las pruebas que
 * necesiten otro remote lo inyectan vía la prop `remotes` de `AppRoutes`/`ShellLayout`; este
 * doble solo evita que `import('centynella_proveedores/App')` rompa el análisis estático de Vite.
 */
export default function CentynellaProveedoresAppMock() {
  return <p>Proveedores (remote de prueba)</p>;
}
