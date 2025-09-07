export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  clientId: 'YZ',
  realmId: 'devaktus',
  // Note: Client secret should never be in frontend code
  // This should be handled by backend authentication
  version: '1.0.0',
  appName: 'SaaS Pricing Widget Builder',
  features: {
    enableAnalytics: false,
    enableErrorReporting: true,
    enablePWA: true
  }
};
