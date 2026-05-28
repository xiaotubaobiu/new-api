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

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { StatusContext } from '../../context/Status';
import { UserContext } from '../../context/User';

const { onOIDCClicked } = vi.hoisted(() => ({
  onOIDCClicked: vi.fn(),
}));

vi.hoisted(() => {
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
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value) => value,
  }),
}));

vi.mock('react-turnstile', () => ({
  default: () => <div data-testid='turnstile' />,
}));

vi.mock('react-telegram-login', () => ({
  default: () => <div data-testid='telegram-login' />,
}));

vi.mock('react-telegram-login/src', () => ({
  default: () => <div data-testid='telegram-register' />,
}));

vi.mock('../../helpers', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
  },
  buildAssertionResult: vi.fn(),
  getLogo: vi.fn(() => '/logo.png'),
  getOAuthProviderIcon: vi.fn(() => null),
  getSystemName: vi.fn(() => 'NewAPI'),
  isPasskeySupported: vi.fn(() => Promise.resolve(false)),
  loginPageOIDCOptions: {
    callbackRedirectTarget: 'https://auth.000328.xyz:2053/if/user/',
    shouldLogout: true,
  },
  onCustomOAuthClicked: vi.fn(),
  onDiscordOAuthClicked: vi.fn(),
  onGitHubOAuthClicked: vi.fn(),
  onLinuxDOOAuthClicked: vi.fn(),
  onOIDCClicked,
  prepareCredentialRequestOptions: vi.fn(),
  registerPageOIDCOptions: {
    authentikFlowSlug: 'self-service-enrollment',
    callbackRedirectTarget: 'https://auth.000328.xyz:2053/if/user/',
    shouldLogout: true,
  },
  setUserData: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showSuccess: vi.fn(),
  updateAPI: vi.fn(),
}));

const status = {
  custom_oauth_providers: [{ name: 'Custom', slug: 'custom' }],
  discord_oauth: true,
  github_oauth: true,
  linuxdo_oauth: true,
  oidc_authorization_endpoint:
    'https://auth.000328.xyz:2053/application/o/authorize/',
  oidc_client_id: 'newapi',
  oidc_enabled: true,
  passkey_login: true,
  self_use_mode_enabled: false,
  telegram_oauth: true,
  wechat_login: true,
};

function renderAuthForm(children) {
  return render(
    <MemoryRouter>
      <StatusContext.Provider value={[{ status }, vi.fn()]}>
        <UserContext.Provider value={[{}, vi.fn()]}>
          {children}
        </UserContext.Provider>
      </StatusContext.Provider>
    </MemoryRouter>,
  );
}

describe('OIDC-only auth forms', () => {
  beforeEach(() => {
    onOIDCClicked.mockReset();
  });

  it('shows only the OIDC action on the login page', () => {
    renderAuthForm(<LoginForm />);

    expect(
      screen.getByRole('button', { name: /使用 OIDC 继续/ }),
    ).toBeEnabled();
    expect(screen.queryByText('使用 GitHub 继续')).not.toBeInTheDocument();
    expect(
      screen.queryByText('使用 邮箱或用户名 登录'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('注册')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /使用 OIDC 继续/ }));
    expect(onOIDCClicked).toHaveBeenCalledWith(
      'https://auth.000328.xyz:2053/application/o/authorize/',
      'newapi',
      false,
      {
        callbackRedirectTarget: 'https://auth.000328.xyz:2053/if/user/',
        shouldLogout: true,
      },
    );
  });

  it('shows only the OIDC action on the register page', () => {
    renderAuthForm(<RegisterForm />);

    expect(
      screen.getByRole('button', { name: /使用 OIDC 继续/ }),
    ).toBeEnabled();
    expect(screen.queryByText('使用 GitHub 继续')).not.toBeInTheDocument();
    expect(screen.queryByText('使用 用户名 注册')).not.toBeInTheDocument();
    expect(screen.queryByText('登录')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /使用 OIDC 继续/ }));
    expect(onOIDCClicked).toHaveBeenCalledWith(
      'https://auth.000328.xyz:2053/application/o/authorize/',
      'newapi',
      false,
      {
        authentikFlowSlug: 'self-service-enrollment',
        callbackRedirectTarget: 'https://auth.000328.xyz:2053/if/user/',
        shouldLogout: true,
      },
    );
  });
});
