import {
  ApiError,
  apiFetch,
  setAuthToken,
  setOnUnauthorized,
} from '@/services/api/client';

const mockedFetch = globalThis.fetch as jest.Mock;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('apiFetch', () => {
  afterEach(() => {
    setAuthToken(null);
    setOnUnauthorized(null);
    mockedFetch.mockReset();
  });

  it('triggers the global unauthorized handler on 401 by default', async () => {
    const handler = jest.fn();
    setOnUnauthorized(handler);
    mockedFetch.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }));

    await expect(apiFetch('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('skips the global unauthorized handler when skipAuthHandler is true', async () => {
    const handler = jest.fn();
    setOnUnauthorized(handler);
    mockedFetch.mockResolvedValueOnce(
      jsonResponse(401, { message: 'invalid credentials' }),
    );

    await expect(
      apiFetch('/auth/login', { skipAuthHandler: true }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it('tags the resulting ApiError with skipAuthHandler so cache handlers also skip', async () => {
    setOnUnauthorized(jest.fn());
    mockedFetch.mockResolvedValueOnce(jsonResponse(403, { message: 'nope' }));

    let caught: unknown;
    try {
      await apiFetch('/auth/login', { skipAuthHandler: true });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).status).toBe(403);
    expect((caught as ApiError).skipAuthHandler).toBe(true);
  });

  it('still throws ApiError tagged with skipAuthHandler=false on a normal 401', async () => {
    setOnUnauthorized(jest.fn());
    mockedFetch.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }));

    let caught: unknown;
    try {
      await apiFetch('/auth/me');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).skipAuthHandler).toBe(false);
  });
});
