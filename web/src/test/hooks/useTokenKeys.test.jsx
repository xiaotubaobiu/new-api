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

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../helpers/token', () => ({
  fetchAvailableTokenKeys: vi.fn(),
  fetchTokenKeys: vi.fn(),
  getServerAddress: vi.fn(),
}));

vi.mock('../../helpers', () => ({
  showError: vi.fn(),
}));

import { useTokenKeys } from '../../hooks/chat/useTokenKeys';
import {
  fetchAvailableTokenKeys,
  fetchTokenKeys,
  getServerAddress,
} from '../../helpers/token';
import { showError } from '../../helpers';

const NO_TOKEN_ERROR = '当前没有可用的启用令牌，请确认是否有令牌处于启用状态！';
const REQUEST_LIMITED_ERROR = '请求次数过多，请稍后再试！';
const LOAD_FAILED_ERROR = '获取聊天令牌失败，请稍后再试！';

function createDeferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe('useTokenKeys', () => {
  it('sets keys and serverAddress on success and stops loading', async () => {
    fetchAvailableTokenKeys.mockResolvedValue({
      status: 'success',
      keys: ['usable-key'],
    });
    fetchTokenKeys.mockResolvedValue([]);
    getServerAddress.mockReturnValue('https://server.example');

    const { result } = renderHook(() => useTokenKeys('chat-id'));

    expect(result.current).toEqual({
      keys: [],
      serverAddress: '',
      isLoading: true,
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        keys: ['usable-key'],
        serverAddress: 'https://server.example',
        isLoading: false,
      });
    });

    expect(fetchAvailableTokenKeys).toHaveBeenCalledTimes(1);
    expect(fetchTokenKeys).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it('shows the existing no-token error and schedules redirect after 1500ms', async () => {
    fetchAvailableTokenKeys.mockResolvedValue({
      status: 'no_enabled_tokens',
      keys: [],
    });
    fetchTokenKeys.mockResolvedValue([]);
    getServerAddress.mockReturnValue('https://server.example');
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    renderHook(() => useTokenKeys('chat-id'));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(NO_TOKEN_ERROR);
    });

    expect(showError).toHaveBeenCalledTimes(1);
    expect(fetchAvailableTokenKeys).toHaveBeenCalledTimes(1);
    expect(fetchTokenKeys).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);
  });

  it('shows a distinct request/load failure message for 429-like failures without claiming no enabled token exists', async () => {
    fetchAvailableTokenKeys.mockResolvedValue({
      status: 'request_limited_or_failed',
      keys: [],
      error: '429 Too Many Requests',
    });
    fetchTokenKeys.mockResolvedValue([]);
    getServerAddress.mockReturnValue('https://server.example');

    renderHook(() => useTokenKeys('chat-id'));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(REQUEST_LIMITED_ERROR);
    });

    expect(showError).not.toHaveBeenCalledWith(NO_TOKEN_ERROR);
    expect(fetchAvailableTokenKeys).toHaveBeenCalledTimes(1);
    expect(fetchTokenKeys).not.toHaveBeenCalled();
  });

  it('shows generic load failure message for non-rate-limited request_limited_or_failed errors', async () => {
    fetchAvailableTokenKeys.mockResolvedValue({
      status: 'request_limited_or_failed',
      keys: [],
      error: 'Network connection failed',
    });
    fetchTokenKeys.mockResolvedValue([]);
    getServerAddress.mockReturnValue('https://server.example');

    renderHook(() => useTokenKeys('chat-id'));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(LOAD_FAILED_ERROR);
    });

    expect(showError).not.toHaveBeenCalledWith(NO_TOKEN_ERROR);
    expect(showError).not.toHaveBeenCalledWith(REQUEST_LIMITED_ERROR);
    expect(fetchAvailableTokenKeys).toHaveBeenCalledTimes(1);
    expect(fetchTokenKeys).not.toHaveBeenCalled();
  });

  it('retains server-address loading behavior while token loading is pending', async () => {
    const deferred = createDeferred();
    fetchAvailableTokenKeys.mockReturnValue(deferred.promise);
    fetchTokenKeys.mockResolvedValue([]);
    getServerAddress.mockReturnValue('https://server.example');

    const { result } = renderHook(() => useTokenKeys('chat-id'));

    expect(result.current).toEqual({
      keys: [],
      serverAddress: '',
      isLoading: true,
    });
    expect(getServerAddress).not.toHaveBeenCalled();

    deferred.resolve({
      status: 'success',
      keys: ['usable-key'],
    });

    await waitFor(() => {
      expect(result.current.serverAddress).toBe('https://server.example');
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.keys).toEqual(['usable-key']);
  });
});
