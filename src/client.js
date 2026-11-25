export class ApiClient {
  constructor({ baseUrl, token, fetchImpl = globalThis.fetch, timeoutMs = 15000 }) {
    this.baseUrl = new URL(baseUrl);
    if (this.baseUrl.protocol !== 'https:' || this.baseUrl.username || this.baseUrl.password) throw new TypeError('Use an HTTPS API URL without credentials');
    if (typeof token !== 'string' || !token.trim()) throw new TypeError('An authorized access token is required');
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) throw new TypeError('Invalid timeout');
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }
  async get(path) {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin || url.username || url.password) throw new TypeError('Cross-origin requests are prohibited');
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + this.token },
      redirect: 'error',
      signal: AbortSignal.timeout(this.timeoutMs)
    });
    if (!response.ok) throw new Error('API returned HTTP ' + response.status);
    return response.json();
  }
}
