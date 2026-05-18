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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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

  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value) => value,
  }),
}));

vi.mock('../../helpers/render', () => ({
  getLucideIcon: () => null,
}));

vi.mock('../../hooks/common/useSidebarCollapsed', () => ({
  useSidebarCollapsed: () => [false, vi.fn(), vi.fn()],
}));

vi.mock('../../hooks/common/useSidebar', () => ({
  useSidebar: () => ({
    isModuleVisible: (section, itemKey) =>
      section === 'chat' ? ['playground', 'chat'].includes(itemKey) : false,
    hasSectionVisibleModules: (section) => section === 'chat',
    loading: false,
  }),
}));

vi.mock('../../hooks/common/useMinimumLoadingTime', () => ({
  useMinimumLoadingTime: () => false,
}));

vi.mock('../../helpers', () => ({
  isAdmin: () => false,
  isRoot: () => false,
  showError: vi.fn(),
}));

vi.mock('../../components/layout/components/SkeletonWrapper', () => ({
  default: ({ children }) => <>{children}</>,
}));

import SiderBar from '../../components/layout/SiderBar';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid='location-probe'>{location.pathname}</div>;
}

function renderSiderBar(onNavigate = vi.fn()) {
  return {
    onNavigate,
    ...render(
      <MemoryRouter initialEntries={['/']}>
        <LocationProbe />
        <SiderBar onNavigate={onNavigate} />
      </MemoryRouter>,
    ),
  };
}

describe('SiderBar chat submenu behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not wrap the chat parent submenu item in a navigable link', async () => {
    localStorage.setItem(
      'chats',
      JSON.stringify([{ Alpha: 'https://chat.example/alpha' }]),
    );

    renderSiderBar();

    const parentTrigger = await screen.findByRole('menuitem', { name: '聊天' });

    expect(parentTrigger.closest('a')).toBeNull();
  });

  it('keeps the chat parent as a non-link submenu even when all chats are filtered out', async () => {
    localStorage.setItem(
      'chats',
      JSON.stringify([
        { HiddenOne: 'fluent://hidden' },
        { HiddenTwo: 'ccswitch://hidden' },
      ]),
    );

    renderSiderBar();

    const parentTrigger = await screen.findByRole('menuitem', { name: '聊天' });

    expect(parentTrigger.closest('a')).toBeNull();
    expect(parentTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(parentTrigger.closest('.semi-navigation-item-sub')).not.toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'HiddenOne' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'HiddenTwo' })).toBeNull();
  });

  it('renders chat child items from localStorage and keeps them navigable', async () => {
    localStorage.setItem(
      'chats',
      JSON.stringify([
        { Alpha: 'https://chat.example/alpha' },
        { Beta: 'https://chat.example/beta' },
      ]),
    );

    renderSiderBar();

    const parentTrigger = await screen.findByRole('menuitem', { name: '聊天' });
    fireEvent.click(parentTrigger);

    const alphaItem = await screen.findByRole('menuitem', { name: 'Alpha' });
    const betaItem = await screen.findByRole('menuitem', { name: 'Beta' });

    expect(alphaItem.closest('a')).toHaveAttribute('href', '/console/chat/0');
    expect(betaItem.closest('a')).toHaveAttribute('href', '/console/chat/1');

    fireEvent.click(alphaItem.closest('a'));

    await waitFor(() => {
      expect(screen.getByTestId('location-probe')).toHaveTextContent('/console/chat/0');
    });
  });

  it('does not trigger the leaf-navigation callback when clicking the chat parent', async () => {
    localStorage.setItem(
      'chats',
      JSON.stringify([{ Alpha: 'https://chat.example/alpha' }]),
    );

    const { onNavigate } = renderSiderBar(vi.fn());

    const parentTrigger = await screen.findByRole('menuitem', { name: '聊天' });
    fireEvent.click(parentTrigger);

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
