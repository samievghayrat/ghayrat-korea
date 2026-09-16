// Read-only access: this client cannot call bidding, account or payment endpoints.
export const AL_ORIGIN = 'https://alkorea.kr';

export class ALKoreaClient {
  #cookies = new Map();
  #username;
  #password;
  constructor(username, password) {
    if (!username || !password) throw new Error('AL Korea credentials are not configured');
    this.#username = username;
    this.#password = password;
  }

  async #request(path, options = {}) {
    const url = new URL(path, AL_ORIGIN);
    if (url.origin !== AL_ORIGIN || !['/page/login.php', '/ajax/login.php', '/page/exhibition.php'].includes(url.pathname)) {
      throw new Error('Only read-only catalogue and login endpoints are allowed');
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, {
        ...options, redirect: 'manual', signal: AbortSignal.timeout(25_000),
        headers: { ...options.headers, Cookie: [...this.#cookies].map(([key, value]) => `${key}=${value}`).join('; ') },
      });
      for (const header of response.headers.getSetCookie()) {
        const pair = header.split(';')[0];
        const equal = pair.indexOf('=');
        if (equal > 0) this.#cookies.set(pair.slice(0, equal), pair.slice(equal + 1));
      }
      if (response.status === 429 && attempt < 2) {
        const seconds = Number(response.headers.get('retry-after') || 5);
        if (!Number.isFinite(seconds) || seconds > 30) throw new Error('AL Korea rate limit: try later');
        await new Promise(resolve => setTimeout(resolve, Math.max(1, seconds) * 1000));
        continue;
      }
      if (!response.ok) throw new Error(`AL Korea request failed (${response.status})`);
      return response;
    }
    throw new Error('AL Korea rate limit: try later');
  }

  async login() {
    await this.#request('/page/login.php');
    const form = new FormData();
    form.set('mode', 'login');
    form.set('id', this.#username);
    form.set('pw', this.#password);
    const response = await this.#request('/ajax/login.php', { method: 'POST', body: form });
    const result = await response.json();
    // The source response also contains profile/debug information: never export it.
    if (result.result !== 'success') throw new Error('AL Korea login failed');
  }

  async catalogue(page = 1) {
    if (!Number.isInteger(page) || page < 1 || page > 500) throw new Error('Invalid catalogue page');
    const response = await this.#request(`/page/exhibition.php?page=${page}&lang=en`);
    return response.text();
  }

  async detail(id) {
    if (!/^\d{1,12}$/.test(String(id))) throw new Error('Invalid vehicle ID');
    const response = await this.#request(`/page/exhibition.php?type=view&id=${id}&lang=en`);
    return response.text();
  }
}

export async function readPrivateCredentials() {
  if (process.env.ALKOREA_USERNAME && process.env.ALKOREA_PASSWORD) {
    return { username: process.env.ALKOREA_USERNAME, password: process.env.ALKOREA_PASSWORD };
  }
  // Used by the local import command. No echo, shell history or credential file.
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  console.log('Private login input ready');
  return new Promise((resolve, reject) => {
    let input = '';
    const read = data => {
      input += data.toString();
      if (!/[\r\n]/.test(input)) return;
      process.stdin.off('data', read);
      process.stdin.pause();
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      try {
        const value = JSON.parse(input.trim());
        input = '';
        if (!value.username || !value.password) throw new Error();
        resolve({ username: value.username, password: value.password });
      } catch { reject(new Error('Provide credentials through environment variables or private JSON input')); }
    };
    process.stdin.on('data', read);
    process.stdin.on('end', () => reject(new Error('Missing credentials')));
  });
}
