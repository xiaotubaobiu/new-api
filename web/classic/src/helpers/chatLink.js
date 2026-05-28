const LOBEHUB_PREVIEW_HOST = 'chat-preview.lobehub.com';
const LOCAL_LOBEHUB_HOST = '127.0.0.1';

function normalizeServerAddress(serverAddress) {
  return String(serverAddress || '').replace(/\/+$/, '');
}

function normalizeApiKey(key) {
  if (!key) return '';
  return key.startsWith('sk-') ? key : `sk-${key}`;
}

function shouldEncodeLobeHubSettings(url) {
  return (
    url.searchParams.has('settings') &&
    (url.hostname === LOBEHUB_PREVIEW_HOST || url.hostname === LOCAL_LOBEHUB_HOST)
  );
}

export function buildChatIframeUrl(templateUrl, key, serverAddress) {
  if (!templateUrl || !key || !serverAddress) return '';

  const normalizedAddress = normalizeServerAddress(serverAddress);
  const normalizedKey = normalizeApiKey(key);
  const replaced = templateUrl
    .replaceAll('{address}', normalizedAddress)
    .replaceAll('{key}', normalizedKey);

  try {
    const url = new URL(replaced);
    if (!shouldEncodeLobeHubSettings(url)) {
      return replaced;
    }

    const rawSettings = url.searchParams.get('settings');
    if (!rawSettings) {
      return url.toString();
    }

    const settings = JSON.parse(rawSettings);
    if (settings?.keyVaults?.openai?.baseURL) {
      settings.keyVaults.openai.baseURL = settings.keyVaults.openai.baseURL.replace(
        /\/\/v1$/,
        '/v1',
      );
    }
    if (settings?.keyVaults?.openai?.apiKey) {
      settings.keyVaults.openai.apiKey = normalizeApiKey(
        settings.keyVaults.openai.apiKey,
      );
    }

    url.searchParams.set('settings', JSON.stringify(settings));
    return url.toString();
  } catch {
    return replaced;
  }
}
