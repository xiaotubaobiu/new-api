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
import { describe, expect, it, vi } from 'vitest';
import AccountManagement from '../../components/settings/personal/cards/AccountManagement';

vi.hoisted(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
      arc: () => {},
      beginPath: () => {},
      clearRect: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      drawImage: () => {},
      fill: () => {},
      fillRect: () => {},
      fillStyle: '',
      getImageData: () => ({ data: new Uint8ClampedArray() }),
      globalCompositeOperation: '',
      lineTo: () => {},
      measureText: () => ({ width: 0 }),
      moveTo: () => {},
      putImageData: () => {},
      rect: () => {},
      restore: () => {},
      rotate: () => {},
      save: () => {},
      scale: () => {},
      setTransform: () => {},
      stroke: () => {},
      transform: () => {},
      translate: () => {},
    }),
  });
});

vi.mock('react-telegram-login', () => ({
  default: () => <div data-testid='telegram-login' />,
}));

vi.mock('../../components/settings/personal/components/TwoFASetting', () => ({
  default: () => <div data-testid='two-fa-setting' />,
}));

vi.mock('../../helpers', () => ({
  API: {
    delete: vi.fn(),
    get: vi.fn(() => Promise.resolve({ data: { success: true, data: [] } })),
  },
  getOAuthProviderIcon: vi.fn(() => null),
  onCustomOAuthClicked: vi.fn(),
  onDiscordOAuthClicked: vi.fn(),
  onGitHubOAuthClicked: vi.fn(),
  onLinuxDOOAuthClicked: vi.fn(),
  onOIDCClicked: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));

const t = (value) => value;

function renderAccountManagement(props = {}) {
  const defaultProps = {
    generateAccessToken: vi.fn(),
    handleSystemTokenClick: vi.fn(),
    onPasskeyDelete: vi.fn(),
    onPasskeyRegister: vi.fn(),
    passkeyDeleteLoading: false,
    passkeyRegisterLoading: false,
    passkeyStatus: { enabled: false },
    passkeySupported: false,
    setShowAccountDeleteModal: vi.fn(),
    setShowEmailBindModal: vi.fn(),
    setShowWeChatBindModal: vi.fn(),
    status: {
      custom_oauth_providers: [],
      discord_oauth: false,
      github_oauth: false,
      linuxdo_oauth: false,
      oidc_enabled: false,
      telegram_oauth: false,
      wechat_login: false,
    },
    systemToken: '',
    t,
    userState: {
      user: {
        display_name: 'Tester',
        email: 'tester@example.com',
        github_id: '',
        linuxdo_id: '',
        oidc_id: '',
        username: 'tester',
        wechat_id: '',
      },
    },
  };

  return render(<AccountManagement {...defaultProps} {...props} />);
}

describe('AccountManagement password change', () => {
  it('opens the local password change modal instead of delegating to an external redirect', async () => {
    const setShowChangePasswordModal = vi.fn();

    renderAccountManagement({ setShowChangePasswordModal });

    fireEvent.click(await screen.findByRole('tab', { name: '安全设置' }));
    fireEvent.click(screen.getByRole('button', { name: /修改密码/ }));

    expect(setShowChangePasswordModal).toHaveBeenCalledWith(true);
  });
});
