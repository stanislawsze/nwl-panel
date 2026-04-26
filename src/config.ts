export const config = {
  appName: import.meta.env.VITE_APP_NAME ?? 'NWL Panel',
  apiBaseUrl: (
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/api/v1'
  ).replace(/\/$/, ''),
};
