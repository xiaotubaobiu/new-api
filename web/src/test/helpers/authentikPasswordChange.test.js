import { describe, expect, it } from 'vitest';

import {
  AUTHENTIK_PASSWORD_CHANGE_RETURN_URL,
  buildAuthentikPasswordChangeUrl,
} from '../../helpers/authentikPasswordChange';

describe('authentikPasswordChange', () => {
  it('uses the actual NewAPI personal settings route as return URL', () => {
    expect(AUTHENTIK_PASSWORD_CHANGE_RETURN_URL).toBe(
      'https://matrix.000328.xyz:2053/console/personal',
    );
  });

  it('builds an Authentik password-change URL with an encoded next URL', () => {
    const url = buildAuthentikPasswordChangeUrl();

    expect(url).toBe(
      'https://auth.000328.xyz:2053/if/flow/default-password-change/?next=https%3A%2F%2Fmatrix.000328.xyz%3A2053%2Fconsole%2Fpersonal',
    );
  });
});
