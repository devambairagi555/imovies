
export const api = async (path, method = 'GET', body) => {
  const token = localStorage.getItem('token');

  const response = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

export const fmt = (t) =>
  new Date(t).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
