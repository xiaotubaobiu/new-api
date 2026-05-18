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

import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusContext } from '../../context/Status';
import { newAPIAppOIDCOptions, onOIDCClicked, showError } from '../../helpers';
import Loading from '../common/ui/Loading';

function getSavedStatus() {
  const savedStatus = localStorage.getItem('status');
  if (!savedStatus) return undefined;
  try {
    return JSON.parse(savedStatus) || undefined;
  } catch (err) {
    return undefined;
  }
}

const OIDCEntry = () => {
  const navigate = useNavigate();
  const [statusState] = useContext(StatusContext);
  const startedRef = useRef(false);
  const status = useMemo(
    () => statusState?.status || getSavedStatus(),
    [statusState?.status],
  );

  useEffect(() => {
    if (startedRef.current) return;

    if (localStorage.getItem('user')) {
      startedRef.current = true;
      navigate('/console', { replace: true });
      return;
    }

    if (!status) return;

    startedRef.current = true;
    if (
      !status.oidc_enabled ||
      !status.oidc_authorization_endpoint ||
      !status.oidc_client_id
    ) {
      showError('OIDC 未启用');
      navigate('/login', { replace: true });
      return;
    }

    onOIDCClicked(
      status.oidc_authorization_endpoint,
      status.oidc_client_id,
      false,
      newAPIAppOIDCOptions,
    );
  }, [navigate, status]);

  return <Loading />;
};

export default OIDCEntry;
