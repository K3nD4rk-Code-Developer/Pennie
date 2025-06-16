const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const router = express.Router();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Create Link token
router.post('/create-link-token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.session.userId || 'user-id' },
      client_name: 'Pennie',
      products: ['accounts', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange public token
router.post('/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    
    res.json({ access_token: response.data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get accounts
router.post('/accounts', async (req, res) => {
  try {
    const { access_token } = req.body;
    const response = await plaidClient.accountsGet({
      access_token,
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.post('/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date,
      end_date,
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;