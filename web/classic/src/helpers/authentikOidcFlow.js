/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export const AUTHENTIK_SELF_SERVICE_ENROLLMENT_FLOW_SLUG =
  'self-service-enrollment';
export const AUTHENTIK_USER_PORTAL_URL =
  'https://auth.000328.xyz/if/user/';
export const NEWAPI_CONSOLE_PATH = '/console';

const OAUTH_CALLBACK_REDIRECT_TARGET_PREFIX =
  'newapi_oauth_callback_redirect_target:';

export function buildOIDCAuthorizationUrl({
  authorizationEndpoint,
  clientId,
  redirectUri,
  state,
  scope = 'openid profile email',
}) {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  return url;
}

export function buildAuthentikFlowContinueUrl(authorizationUrl, flowSlug) {
  const enrollmentUrl = new URL(
    `/if/flow/${flowSlug}/`,
    authorizationUrl.origin,
  );
  const nextTarget = `${authorizationUrl.pathname}?${authorizationUrl.searchParams.toString()}`;
  enrollmentUrl.searchParams.set('next', nextTarget);
  return enrollmentUrl;
}

export function storeOAuthCallbackRedirectTarget(state, target) {
  if (!state || !target || typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    `${OAUTH_CALLBACK_REDIRECT_TARGET_PREFIX}${state}`,
    target,
  );
}

export function consumeOAuthCallbackRedirectTarget(
  state,
  fallback = NEWAPI_CONSOLE_PATH,
) {
  if (!state || typeof sessionStorage === 'undefined') return fallback;
  const key = `${OAUTH_CALLBACK_REDIRECT_TARGET_PREFIX}${state}`;
  const target = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return target || fallback;
}

export function navigateToOAuthCallbackTarget(navigate, target) {
  if (/^https?:\/\//i.test(target)) {
    window.location.assign(target);
    return;
  }
  navigate(target || NEWAPI_CONSOLE_PATH);
}
