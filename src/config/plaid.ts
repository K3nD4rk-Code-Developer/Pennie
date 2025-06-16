export const plaidConfig = {
  clientName: 'Pennie',
  env: process.env.REACT_APP_PLAID_ENV || 'sandbox',
  publicKey: process.env.REACT_APP_PLAID_PUBLIC_KEY || '',
  products: ['transactions', 'accounts', 'liabilities'],
  countryCodes: ['US'],
  language: 'en',
};