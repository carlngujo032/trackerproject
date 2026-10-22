const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'partlog_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new Error(data?.error || 'Something went wrong. Try again.');
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),

  listProjects: () => request('/projects'),
  createProject: (title) => request('/projects', { method: 'POST', body: { title } }),
  getProject: (id) => request(`/projects/${id}`),
  renameProject: (id, title) => request(`/projects/${id}`, { method: 'PUT', body: { title } }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  addItem: (pid, body) => request(`/projects/${pid}/items`, { method: 'POST', body }),
  updateItem: (pid, iid, body) => request(`/projects/${pid}/items/${iid}`, { method: 'PUT', body }),
  deleteItem: (pid, iid) => request(`/projects/${pid}/items/${iid}`, { method: 'DELETE' }),
};
