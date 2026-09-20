import { publishAuthEvent, subscribeAuthEvents } from './authChannel';

/** BroadcastChannel mínimo en memoria: conecta las instancias con el mismo nombre. */
class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];
  onmessage: ((message: MessageEvent) => void) | null = null;
  closed = false;

  constructor(readonly name: string) {
    FakeBroadcastChannel.instances.push(this);
  }

  postMessage(data: unknown) {
    for (const other of FakeBroadcastChannel.instances) {
      if (other !== this && !other.closed && other.name === this.name) {
        other.onmessage?.({ data } as MessageEvent);
      }
    }
  }

  close() {
    this.closed = true;
  }
}

describe('authChannel', () => {
  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('entrega a los suscriptores los eventos publicados por otra pestaña', () => {
    const handler = vi.fn();
    subscribeAuthEvents(handler);

    publishAuthEvent('logout');

    expect(handler).toHaveBeenCalledWith('logout');
  });

  it('deja de escuchar al cancelar la suscripción', () => {
    const handler = vi.fn();
    const unsubscribe = subscribeAuthEvents(handler);
    unsubscribe();

    publishAuthEvent('login');

    expect(handler).not.toHaveBeenCalled();
  });

  it('no falla si el navegador no soporta BroadcastChannel', () => {
    vi.stubGlobal('BroadcastChannel', undefined);

    expect(() => publishAuthEvent('logout')).not.toThrow();
    expect(() => subscribeAuthEvents(() => {})()).not.toThrow();
  });
});
