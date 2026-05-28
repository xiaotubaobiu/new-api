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

import { describe, expect, it } from 'vitest';

import {
  AUTHENTIK_USER_PORTAL_URL,
  AUTHENTIK_SELF_SERVICE_ENROLLMENT_FLOW_SLUG,
  buildAuthentikFlowContinueUrl,
  buildOIDCAuthorizationUrl,
  consumeOAuthCallbackRedirectTarget,
  NEWAPI_CONSOLE_PATH,
  storeOAuthCallbackRedirectTarget,
} from '../../helpers/authentikOidcFlow';

describe('authentikOidcFlow', () => {
  it('builds the standard OIDC authorization URL', () => {
    const url = buildOIDCAuthorizationUrl({
      authorizationEndpoint:
        'https://auth.000328.xyz:2053/application/o/authorize/',
      clientId: 'newapi',
      redirectUri: 'https://matrix.000328.xyz:2053/oauth/oidc',
      state: 'abc123',
    });

    expect(url.toString()).toBe(
      'https://auth.000328.xyz:2053/application/o/authorize/?client_id=newapi&redirect_uri=https%3A%2F%2Fmatrix.000328.xyz%3A2053%2Foauth%2Foidc&response_type=code&scope=openid+profile+email&state=abc123',
    );
  });

  it('wraps the authorization URL with the Authentik enrollment flow', () => {
    const authorizationUrl = buildOIDCAuthorizationUrl({
      authorizationEndpoint:
        'https://auth.000328.xyz:2053/application/o/authorize/',
      clientId: 'newapi',
      redirectUri: 'https://matrix.000328.xyz:2053/oauth/oidc',
      state: 'abc123',
    });

    const flowUrl = buildAuthentikFlowContinueUrl(
      authorizationUrl,
      AUTHENTIK_SELF_SERVICE_ENROLLMENT_FLOW_SLUG,
    );

    expect(flowUrl.toString()).toBe(
      'https://auth.000328.xyz:2053/if/flow/self-service-enrollment/?next=%2Fapplication%2Fo%2Fauthorize%2F%3Fclient_id%3Dnewapi%26redirect_uri%3Dhttps%253A%252F%252Fmatrix.000328.xyz%253A2053%252Foauth%252Foidc%26response_type%3Dcode%26scope%3Dopenid%2Bprofile%2Bemail%26state%3Dabc123',
    );
  });

  it('stores and consumes callback redirect targets by OAuth state', () => {
    storeOAuthCallbackRedirectTarget('login-state', AUTHENTIK_USER_PORTAL_URL);
    storeOAuthCallbackRedirectTarget('portal-state', NEWAPI_CONSOLE_PATH);

    expect(consumeOAuthCallbackRedirectTarget('login-state')).toBe(
      AUTHENTIK_USER_PORTAL_URL,
    );
    expect(consumeOAuthCallbackRedirectTarget('login-state')).toBe(
      NEWAPI_CONSOLE_PATH,
    );
    expect(consumeOAuthCallbackRedirectTarget('portal-state')).toBe(
      NEWAPI_CONSOLE_PATH,
    );
  });
});
