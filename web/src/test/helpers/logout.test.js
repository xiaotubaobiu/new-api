import { describe, expect, it } from 'vitest';

import { getLogoutRedirectUrl } from '../../helpers/logout';

describe('logout', () => {
  it('returns the backend-provided redirect URL', () => {
    expect(
      getLogoutRedirectUrl({
        data: {
          redirect_to:
            'https://auth.000328.xyz:2053/application/o/newapi/end-session/?post_logout_redirect_uri=https%3A%2F%2Fmatrix.000328.xyz%3A2053%2Flogin',
        },
      }),
    ).toBe(
      'https://auth.000328.xyz:2053/application/o/newapi/end-session/?post_logout_redirect_uri=https%3A%2F%2Fmatrix.000328.xyz%3A2053%2Flogin',
    );
  });

  it('returns an empty string when no redirect is present', () => {
    expect(getLogoutRedirectUrl({})).toBe('');
  });
});
