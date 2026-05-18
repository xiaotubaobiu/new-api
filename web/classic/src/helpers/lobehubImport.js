export function normalizeNewAPIToken(token) {
  const trimmed = String(token || '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('sk-') ? trimmed : `sk-${trimmed}`;
}

export function normalizeNewAPIBaseURL(baseURL) {
  return String(baseURL || '')
    .trim()
    .replace(/\/+$/, '');
}

export function normalizeLobeHubURL(chatLink) {
  return String(chatLink || '')
    .trim()
    .replace(/\/+$/, '');
}

export function buildLobeHubNewAPIImportSettings({ token, baseURL }) {
  return {
    keyVaults: {
      newapi: {
        apiKey: normalizeNewAPIToken(token),
        baseURL: normalizeNewAPIBaseURL(baseURL),
      },
    },
  };
}

export function buildLobeHubNewAPIImportUrl({ chatLink, token, baseURL }) {
  const lobeHubURL = normalizeLobeHubURL(chatLink);
  const settings = buildLobeHubNewAPIImportSettings({ token, baseURL });
  return `${lobeHubURL}/?settings=${encodeURIComponent(JSON.stringify(settings))}`;
}
