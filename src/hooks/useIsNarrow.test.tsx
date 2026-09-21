import { act, render, screen } from '@testing-library/react';
import { useIsNarrow } from './useIsNarrow';

function Probe() {
  const [ref, narrow] = useIsNarrow(500);
  return (
    <div ref={ref} data-testid="box">
      {narrow ? 'angosto' : 'ancho'}
    </div>
  );
}

describe('useIsNarrow', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sin ResizeObserver asume que hay espacio', () => {
    render(<Probe />);

    expect(screen.getByTestId('box')).toHaveTextContent('ancho');
  });

  it('cambia según el ancho medido del elemento', () => {
    let notify: (width: number) => void = () => undefined;
    class FakeObserver {
      constructor(callback: ResizeObserverCallback) {
        notify = (width) =>
          callback([{ contentRect: { width } } as ResizeObserverEntry], this as never);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    render(<Probe />);

    act(() => notify(320));
    expect(screen.getByTestId('box')).toHaveTextContent('angosto');

    act(() => notify(900));
    expect(screen.getByTestId('box')).toHaveTextContent('ancho');
  });
});
