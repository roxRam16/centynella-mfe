import { bumpPatch, shouldBump } from './version.mjs';

describe('bumpPatch', () => {
  it.each([
    ['0.0.1', '0.0.2'],
    ['0.0.9', '0.0.10'],
    ['1.4.99', '1.4.100'],
  ])('%s → %s', (version, expected) => {
    expect(bumpPatch(version)).toBe(expected);
  });

  it.each(['1.0', 'v1.0.0', '1.0.0-beta', '', 'abc'])('rechaza "%s"', (version) => {
    expect(() => bumpPatch(version)).toThrow(/Versión no válida/);
  });
});

describe('shouldBump (una vez por ciclo de push)', () => {
  it('incrementa cuando la versión local ya es la del remoto (ya se publicó)', () => {
    expect(shouldBump('0.0.1', '0.0.1')).toBe(true);
  });

  it('no vuelve a incrementar si ya cambió desde el último push', () => {
    expect(shouldBump('0.0.2', '0.0.1')).toBe(false);
  });

  it('no incrementa si no hay remoto (primer push)', () => {
    expect(shouldBump('0.0.1', null)).toBe(false);
    expect(shouldBump('0.0.1', undefined)).toBe(false);
  });
});
