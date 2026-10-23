/**
 * Doble del remote `centynella_clientes` para las pruebas del shell (Vitest no ejecuta el
 * plugin de Module Federation: ver alias condicional en `vite.config.ts`). Las pruebas que
 * necesiten otro remote lo inyectan vía la prop `remotes` de `AppRoutes`/`ShellLayout`; este
 * doble solo evita que `import('centynella_clientes/App')` rompa el análisis estático de Vite.
 */
export default function CentynellaClientesAppMock() {
  return <p>Clientes (remote de prueba)</p>;
}
