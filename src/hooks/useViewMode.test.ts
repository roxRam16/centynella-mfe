import { act, renderHook } from '@testing-library/react';
import { useViewMode } from './useViewMode';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('useViewMode', () => {
  it('empieza en tabla (grid) por defecto', () => {
    const { result } = renderHook(() => useViewMode('users'));

    expect(result.current[0]).toBe('grid');
  });

  it('recuerda la vista elegida por módulo', () => {
    const first = renderHook(() => useViewMode('users'));
    act(() => first.result.current[1]('cards'));
    first.unmount();

    expect(renderHook(() => useViewMode('users')).result.current[0]).toBe('cards');
    expect(renderHook(() => useViewMode('logs')).result.current[0]).toBe('grid');
  });

  it('ignora un valor guardado inválido', () => {
    window.localStorage.setItem('centynella:view:users', 'otra-cosa');

    expect(renderHook(() => useViewMode('users')).result.current[0]).toBe('grid');
  });

  it('sin almacenamiento sigue funcionando en memoria', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const { result } = renderHook(() => useViewMode('users', 'cards'));

    expect(result.current[0]).toBe('cards');
    act(() => result.current[1]('grid'));
    expect(result.current[0]).toBe('grid');
  });
});
