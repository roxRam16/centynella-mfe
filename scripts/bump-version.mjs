#!/usr/bin/env node
/**
 * Hook `pre-commit`: incrementa la versión de patch UNA vez por ciclo de push.
 *
 * Usa `npm version`, que actualiza a la vez `package.json` y `package-lock.json`
 * (el lock guarda la versión en dos sitios y npm mantiene ambos sincronizados).
 *
 * Omitir en un commit concreto:  SKIP_VERSION_BUMP=1 git commit ...
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { shouldBump } from './version.mjs';

if (process.env.SKIP_VERSION_BUMP) process.exit(0);

const localVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;

/** Versión de package.json en el remoto (rama upstream u origin/main); null si no existe. */
function remoteVersion() {
  for (const ref of ['@{upstream}', 'origin/main']) {
    try {
      const content = execFileSync('git', ['show', `${ref}:package.json`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return JSON.parse(content).version;
    } catch {
      // esa referencia no existe: se prueba la siguiente
    }
  }
  return null;
}

const remote = remoteVersion();

if (!shouldBump(localVersion, remote)) {
  console.log(
    `[versión] ${localVersion} ya está incrementada para este push (remoto: ${remote ?? 'ninguno'}).`,
  );
  process.exit(0);
}

// `shell` en Windows: npm es un .cmd
execFileSync('npm', ['version', 'patch', '--no-git-tag-version'], {
  stdio: ['ignore', 'pipe', 'inherit'],
  shell: process.platform === 'win32',
});
execFileSync('git', ['add', 'package.json', 'package-lock.json']);

const bumped = JSON.parse(readFileSync('package.json', 'utf8')).version;
console.log(`[versión] ${localVersion} → ${bumped} (package.json y package-lock.json)`);
