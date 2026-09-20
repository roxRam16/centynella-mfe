#!/usr/bin/env node
/**
 * Se ejecuta con `npm install` (script `prepare`): activa los hooks de git del repo
 * (`.githooks/`) para que el versionado automático funcione en cualquier clon.
 * Sin carpeta `.git` (p. ej. dentro de Docker) no hace nada.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync('.git')) {
  try {
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
  } catch {
    // git no disponible: los hooks quedan sin activar, pero la instalación no falla
  }
}
