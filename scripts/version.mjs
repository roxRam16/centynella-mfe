/**
 * Lógica pura del versionado automático (testeable sin tocar git ni npm).
 *
 * Regla: la versión (`package.json` → `version`) sube UN parche por cada "ciclo de push":
 * el primer commit después de un push la incrementa; los siguientes commits, hasta el próximo
 * push, ya la encuentran distinta de la del remoto y no la vuelven a tocar.
 */

/** `0.0.1` → `0.0.2`. Lanza si no es una versión `X.Y.Z` simple. */
export function bumpPatch(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Versión no válida: "${version}" (se espera X.Y.Z)`);
  }
  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

/**
 * ¿Toca incrementar? Sí cuando la versión local es IGUAL a la del remoto (ya se publicó).
 * Sin remoto conocido (primer push) no se toca.
 */
export function shouldBump(local, remote) {
  return remote !== null && remote !== undefined && local === remote;
}
