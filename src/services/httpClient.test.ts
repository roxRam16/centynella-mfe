import { HttpError, httpGet } from './httpClient';

describe('httpGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve el JSON de una respuesta exitosa', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ hola: 'mundo' }) });
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(httpGet('http://api.test/x', controller.signal)).resolves.toEqual({
      hola: 'mundo',
    });
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/x', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
  });

  it('lanza HttpError con el status cuando la respuesta no es 2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' }),
    );

    const error = await httpGet('http://api.test/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(503);
    expect((error as HttpError).message).toBe('HTTP 503 Service Unavailable');
  });
});
