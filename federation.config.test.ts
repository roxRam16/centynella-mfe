import { describe, expect, it } from 'vitest';
import { parseRemotes } from './federation.config';

describe('parseRemotes', () => {
  it('devuelve un objeto vacío cuando no hay remotes', () => {
    expect(parseRemotes(undefined)).toEqual({});
    expect(parseRemotes('')).toEqual({});
    expect(parseRemotes('  ,  ')).toEqual({});
  });

  it('parsea un remote', () => {
    expect(parseRemotes('inventory@http://localhost:5174/remoteEntry.js')).toEqual({
      inventory: {
        type: 'module',
        name: 'inventory',
        entry: 'http://localhost:5174/remoteEntry.js',
      },
    });
  });

  it('parsea varios remotes ignorando espacios', () => {
    const remotes = parseRemotes(
      ' inventory@http://a/remoteEntry.js , orders@http://b/remoteEntry.js ',
    );
    expect(Object.keys(remotes)).toEqual(['inventory', 'orders']);
    expect(remotes.orders.entry).toBe('http://b/remoteEntry.js');
  });

  it.each(['sin-arroba', '@http://sin-nombre', 'sin-url@'])(
    'rechaza el formato inválido "%s"',
    (raw) => {
      expect(() => parseRemotes(raw)).toThrow(/VITE_REMOTES inválido/);
    },
  );
});
