export function getLogoutRedirectUrl(responseData) {
  const redirectTo = responseData?.data?.redirect_to;
  if (typeof redirectTo !== 'string') {
    return '';
  }
  return redirectTo.trim();
}
