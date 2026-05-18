/*
Copyright (C) 2023-2026 QuantumNous

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
import { useCallback, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { SignUpForm } from './components/sign-up-form'
import { getOAuthState, buildOIDCOAuthUrl } from '@/lib/oauth'

export function SignUp() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const redirecting = useRef(false)

  const passwordRegisterEnabled = Boolean(
    status?.register_enabled ?? status?.data?.register_enabled ?? true
  ) && Boolean(
    status?.password_register_enabled ?? status?.data?.password_register_enabled ?? true
  )
  const oidcEnabled = Boolean(status?.oidc_enabled ?? status?.data?.oidc_enabled)
  const oidcAuthUrl = status?.oidc_authorization_endpoint ?? status?.data?.oidc_authorization_endpoint ?? ''
  const oidcClientId = status?.oidc_client_id ?? status?.data?.oidc_client_id ?? ''

  const redirectEnrollment = useCallback(async () => {
    if (redirecting.current) return
    redirecting.current = true
    try {
      const state = await getOAuthState()
      if (!state) {
        redirecting.current = false
        return
      }
      const authzUrl = buildOIDCOAuthUrl(oidcAuthUrl, oidcClientId, state)
      const enrollmentUrl = `https://auth.000328.xyz:2053/if/flow/self-service-enrollment/?next=${encodeURIComponent(authzUrl)}`
      window.location.href = enrollmentUrl
    } catch {
      redirecting.current = false
    }
  }, [oidcAuthUrl, oidcClientId])

  useEffect(() => {
    if (!passwordRegisterEnabled && oidcEnabled && oidcAuthUrl && oidcClientId) {
      redirectEnrollment()
    }
  }, [passwordRegisterEnabled, oidcEnabled, oidcAuthUrl, oidcClientId, redirectEnrollment])

  if (!passwordRegisterEnabled && oidcEnabled) {
    return (
      <AuthLayout>
        <div className='flex w-full items-center justify-center py-12'>
          <p className='text-muted-foreground'>{t('Redirecting to SSO registration...')}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className='w-full space-y-8'>
        <div className='space-y-2'>
          <h2 className='text-center text-2xl font-semibold tracking-tight sm:text-left'>
            {t('Create an account')}
          </h2>
          <p className='text-muted-foreground text-left text-sm sm:text-base'>
            {t('Already have an account?')}{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary font-medium underline underline-offset-4'
            >
              {t('Sign in')}
            </Link>
            .
          </p>
        </div>

        <SignUpForm />

        <TermsFooter
          variant='sign-up'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
