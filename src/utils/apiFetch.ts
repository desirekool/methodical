export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${options?.method || 'GET'} ${url} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res;
}
