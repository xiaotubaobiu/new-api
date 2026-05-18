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

vi.mock('../../helpers/api', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { API } from '../../helpers/api';
import { fetchAvailableTokenKeys, fetchTokenKeys } from '../../helpers/token';

describe('token helpers', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns no_enabled_tokens when token list has no enabled token', async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1, status: 0 }],
      },
    });

    await expect(fetchAvailableTokenKeys()).resolves.toEqual({
      status: 'no_enabled_tokens',
      keys: [],
    });
    expect(API.post).not.toHaveBeenCalled();
  });

  it('sequentially probes enabled tokens and stops after first successful key', async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 1, status: 1 },
          { id: 2, status: 1 },
          { id: 3, status: 1 },
        ],
      },
    });
    API.post.mockImplementation((url) => {
      if (url === '/api/token/1/key') {
        return Promise.reject(new Error('429'));
      }
      if (url === '/api/token/2/key') {
        return Promise.resolve({
          data: {
            success: true,
            data: { key: 'second-key' },
          },
        });
      }
      if (url === '/api/token/3/key') {
        return Promise.resolve({
          data: {
            success: true,
            data: { key: 'third-key' },
          },
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    await expect(fetchAvailableTokenKeys()).resolves.toEqual({
      status: 'success',
      keys: ['second-key'],
    });
    expect(API.post).toHaveBeenCalledTimes(2);
    expect(API.post).toHaveBeenNthCalledWith(1, '/api/token/1/key');
    expect(API.post).toHaveBeenNthCalledWith(2, '/api/token/2/key');
  });

  it('returns request_limited_or_failed with first probe error when enabled tokens exist but all key requests fail', async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 1, status: 1 },
          { id: 2, status: 1 },
        ],
      },
    });
    API.post
      .mockRejectedValueOnce(new Error('429'))
      .mockResolvedValueOnce({
        data: {
          success: false,
          message: 'still limited',
        },
      });

    await expect(fetchAvailableTokenKeys()).resolves.toEqual({
      status: 'request_limited_or_failed',
      keys: [],
      error: '429',
    });
    expect(API.post).toHaveBeenCalledTimes(2);
  });

  it('returns request_limited_or_failed with error when token list request itself fails', async () => {
    API.get.mockRejectedValue(new Error('list failed'));

    await expect(fetchAvailableTokenKeys()).resolves.toEqual({
      status: 'request_limited_or_failed',
      keys: [],
      error: 'list failed',
    });
    expect(API.post).not.toHaveBeenCalled();
  });


  it('keeps fetchTokenKeys backward-compatible for failure and success cases', async () => {
    API.get.mockRejectedValueOnce(new Error('list failed'));

    await expect(fetchTokenKeys()).resolves.toEqual([]);

    API.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          { id: 1, status: 1 },
          { id: 2, status: 1 },
        ],
      },
    });
    API.post
      .mockRejectedValueOnce(new Error('429'))
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { key: 'usable-key' },
        },
      });

    await expect(fetchTokenKeys()).resolves.toEqual(['usable-key']);
  });
});
