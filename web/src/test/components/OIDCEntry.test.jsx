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
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../helpers', () => ({
  newAPIAppOIDCOptions: {
    callbackRedirectTarget: '/console',
    shouldLogout: false,
  },
  onOIDCClicked: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('../../components/common/ui/Loading', () => ({
  default: () => <div data-testid='loading' />,
}));

import { newAPIAppOIDCOptions, onOIDCClicked, showError } from '../../helpers';
import OIDCEntry from '../../components/auth/OIDCEntry';
import { StatusContext } from '../../context/Status';

function renderWithStatus(status) {
  return render(
    <StatusContext.Provider value={[{ status }, vi.fn()]}>
      <OIDCEntry />
    </StatusContext.Provider>,
  );
}

describe('OIDCEntry', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockReset();
    onOIDCClicked.mockReset();
    showError.mockReset();
  });

  it('starts NewAPI OIDC with a console callback target', async () => {
    renderWithStatus({
      oidc_authorization_endpoint:
        'https://auth.000328.xyz:2053/application/o/authorize/',
      oidc_client_id: 'newapi',
      oidc_enabled: true,
    });

    await waitFor(() => {
      expect(onOIDCClicked).toHaveBeenCalledWith(
        'https://auth.000328.xyz:2053/application/o/authorize/',
        'newapi',
        false,
        newAPIAppOIDCOptions,
      );
    });
  });

  it('sends an already logged-in user straight to the console', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    renderWithStatus({
      oidc_authorization_endpoint:
        'https://auth.000328.xyz:2053/application/o/authorize/',
      oidc_client_id: 'newapi',
      oidc_enabled: true,
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/console', { replace: true });
    });
    expect(onOIDCClicked).not.toHaveBeenCalled();
  });
});
