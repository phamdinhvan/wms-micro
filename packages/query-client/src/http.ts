export type HttpClientOptions = {
  baseURL?: string;
  getAuthToken?: () => string | undefined;
  appId?: string;
  code?: string;
};

export const createHttp = (opts: HttpClientOptions = {}) => {
  const base = (path: string) =>
    path.startsWith('http') ? path : `${opts.baseURL ?? ''}${path}`;

  const headers = () => {
    const h: Record<string, string> = {'Content-Type': 'application/json'};
    const t = opts.getAuthToken?.();
    if (t) h.Authorization = `Bearer ${t}`;

    // Add app headers if provided
    if (opts.appId) h['X-App-ID'] = opts.appId;
    if (opts.code) h['X-App-Code'] = opts.code;

    return h;
  };

  const get = async <T>(url: string) => {
    const res = await fetch(base(url), {headers: headers()});
    if (!res.ok)
      throw Object.assign(new Error(res.statusText), {status: res.status});
    return (await res.json()) as T;
  };

  const post = async <T>(url: string, body?: any) => {
    const res = await fetch(base(url), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw Object.assign(new Error(res.statusText), {status: res.status});
    return (await res.json()) as T;
  };

  const put = async <T>(url: string, body?: any) => {
    const res = await fetch(base(url), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw Object.assign(new Error(res.statusText), {status: res.status});
    return (await res.json()) as T;
  };

  const del = async <T>(url: string) => {
    const res = await fetch(base(url), {method: 'DELETE', headers: headers()});
    if (!res.ok)
      throw Object.assign(new Error(res.statusText), {status: res.status});
    return (await res.json()) as T;
  };

  return {get, post, put, del};
};

let globalHttp = createHttp();

export const setGlobalHttp = (opts: HttpClientOptions) => {
  globalHttp = createHttp(opts);
};

export {globalHttp as http};
