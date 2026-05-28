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

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet } = vi.hoisted(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
      fillStyle: '',
      globalCompositeOperation: '',
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray() }),
      putImageData: () => {},
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    }),
  });

  return {
    apiGet: vi.fn(),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: apiGet,
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

vi.mock('../../helpers/utils', () => ({
  formatMessageForAPI: vi.fn(),
  getUserIdFromLocalStorage: vi.fn(() => -1),
  isValidMessage: vi.fn(() => true),
  showError: vi.fn(),
}));

import {
  loginPageOIDCOptions,
  newAPIAppOIDCOptions,
  onOIDCClicked,
  registerPageOIDCOptions,
} from '../../helpers/api';
import {
  AUTHENTIK_USER_PORTAL_URL,
  NEWAPI_CONSOLE_PATH,
  consumeOAuthCallbackRedirectTarget,
} from '../../helpers/authentikOidcFlow';

describe('onOIDCClicked', () => {
  beforeEach(() => {
    apiGet.mockReset();
    vi.restoreAllMocks();
  });

  it('routes register-page OIDC through the Authentik enrollment flow', async () => {
    apiGet
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true, data: 'abc123' } });

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const expectedOrigin = window.location.origin;

    await onOIDCClicked(
      'https://auth.000328.xyz:2053/application/o/authorize/',
      'newapi',
      true,
      registerPageOIDCOptions,
    );

    expect(apiGet).toHaveBeenNthCalledWith(1, '/api/user/logout', {
      skipErrorHandler: true,
    });
    expect(apiGet.mock.calls[1][0]).toBe('/api/oauth/state');
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [targetUrl, target] = openSpy.mock.calls[0];
    const parsedTargetUrl = new URL(targetUrl);
    expect(target).toBe('_blank');
    expect(parsedTargetUrl.origin).toBe('https://auth.000328.xyz:2053');
    expect(parsedTargetUrl.pathname).toBe('/if/flow/self-service-enrollment/');
    expect(parsedTargetUrl.searchParams.get('next')).toBe(
      `/application/o/authorize/?client_id=newapi&redirect_uri=${encodeURIComponent(
        `${expectedOrigin}/oauth/oidc`,
      )}&response_type=code&scope=openid+profile+email&state=abc123`,
    );
    expect(consumeOAuthCallbackRedirectTarget('abc123')).toBe(
      AUTHENTIK_USER_PORTAL_URL,
    );
  });

  it('routes login-page OIDC back to the Authentik user portal after callback', async () => {
    apiGet
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true, data: 'abc123' } });

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const expectedOrigin = window.location.origin;

    await onOIDCClicked(
      'https://auth.000328.xyz:2053/application/o/authorize/',
      'newapi',
      true,
      loginPageOIDCOptions,
    );

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [targetUrl, target] = openSpy.mock.calls[0];
    const parsedTargetUrl = new URL(targetUrl);
    expect(target).toBe('_blank');
    expect(parsedTargetUrl.origin).toBe('https://auth.000328.xyz:2053');
    expect(parsedTargetUrl.pathname).toBe('/application/o/authorize/');
    expect(parsedTargetUrl.searchParams.get('client_id')).toBe('newapi');
    expect(parsedTargetUrl.searchParams.get('redirect_uri')).toBe(
      `${expectedOrigin}/oauth/oidc`,
    );
    expect(parsedTargetUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedTargetUrl.searchParams.get('scope')).toBe(
      'openid profile email',
    );
    expect(parsedTargetUrl.searchParams.get('state')).toBe('abc123');
    expect(consumeOAuthCallbackRedirectTarget('abc123')).toBe(
      AUTHENTIK_USER_PORTAL_URL,
    );
  });

  it('routes Authentik application launches into the NewAPI console after callback', async () => {
    apiGet.mockResolvedValueOnce({
      data: { success: true, data: 'portal-state' },
    });

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await onOIDCClicked(
      'https://auth.000328.xyz:2053/application/o/authorize/',
      'newapi',
      true,
      newAPIAppOIDCOptions,
    );

    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(apiGet.mock.calls[0][0]).toBe('/api/oauth/state');
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [targetUrl] = openSpy.mock.calls[0];
    const parsedTargetUrl = new URL(targetUrl);
    expect(parsedTargetUrl.pathname).toBe('/application/o/authorize/');
    expect(parsedTargetUrl.searchParams.get('state')).toBe('portal-state');
    expect(consumeOAuthCallbackRedirectTarget('portal-state')).toBe(
      NEWAPI_CONSOLE_PATH,
    );
  });
});
