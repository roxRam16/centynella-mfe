import { getHealth } from './healthService';
import * as httpClient from './httpClient';

describe('getHealth', () => {
  it('consulta /health en la URL base configurada', async () => {
    const payload = {
      status: 'ok',
      service: 'centynella-core',
      version: '0.1.0',
      timestamp: 'now',
    };
    const spy = vi.spyOn(httpClient, 'httpGet').mockResolvedValue(payload);
    const controller = new AbortController();

    await expect(getHealth(controller.signal)).resolves.toEqual(payload);
    expect(spy).toHaveBeenCalledWith('http://api.test/health', controller.signal);
  });
});
