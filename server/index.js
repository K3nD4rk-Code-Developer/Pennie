const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Plaid configuration with your credentials
const PLAID_CONFIG = {
  client_id: '684f55f9e8ae2f00252e88bb',
  secret: 'b53c87a0404fd7c9d50ad35c6aaa41', 
  environment: 'sandbox', // Back to sandbox for testing
  baseUrl: 'https://sandbox.plaid.com' // Back to sandbox URL
};

console.log('🔧 Plaid Config:', {
  client_id: PLAID_CONFIG.client_id,
  environment: PLAID_CONFIG.environment,
  secret: PLAID_CONFIG.secret.substring(0, 8) + '...'
});

// Plaid API helper function with better error handling
async function plaidApiCall(endpoint, body) {
  try {
    console.log(`📡 Making Plaid API call to: ${endpoint}`);
    console.log('📄 Request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(`${PLAID_CONFIG.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CONFIG.client_id,
        'PLAID-SECRET': PLAID_CONFIG.secret,
        'Plaid-Version': '2020-09-14'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log(`📨 Plaid response status: ${response.status}`);
    console.log('📨 Plaid response:', responseText);

    if (!response.ok) {
      let errorMessage = `Plaid API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = `Plaid API error: ${errorData.error_message || errorData.error_code || errorMessage}`;
      } catch (e) {
        // Response wasn't JSON
        errorMessage = `Plaid API error: ${response.status} - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('❌ Plaid API Error:', error.message);
    throw error;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    plaid_env: PLAID_CONFIG.environment,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Plaid Backend Server', 
    endpoints: [
      'GET /api/health',
      'POST /api/plaid/create-link-token',
      'POST /api/plaid/exchange-token',
      'POST /api/plaid/accounts',
      'POST /api/plaid/transactions'
    ]
  });
});

// Create link token
app.post('/api/plaid/create-link-token', async (req, res) => {
  try {
    console.log('🔗 Creating link token...');
    
    const linkTokenRequest = {
      user: { 
        client_user_id: 'user-' + Date.now()
      },
      client_name: 'Pennie Financial App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en'
    };

    const response = await plaidApiCall('link/token/create', linkTokenRequest);
    
    console.log('✅ Link token created successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ Create link token error:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to create link token'
    });
  }
});

// Exchange public token for access token
app.post('/api/plaid/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' });
    }

    console.log('🔄 Exchanging public token...');
    
    const response = await plaidApiCall('item/public_token/exchange', {
      public_token: public_token
    });

    console.log('✅ Token exchange successful');
    res.json(response);
  } catch (error) {
    console.error('❌ Token exchange error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get accounts
app.post('/api/plaid/accounts', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log('🏦 Fetching accounts...');
    
    const response = await plaidApiCall('accounts/get', {
      access_token: access_token
    });

    console.log(`✅ Found ${response.accounts?.length || 0} accounts`);
    res.json(response);
  } catch (error) {
    console.error('❌ Get accounts error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.post('/api/plaid/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date, account_ids } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log('💳 Fetching transactions...');
    
    const response = await plaidApiCall('transactions/get', {
      access_token: access_token,
      start_date: start_date,
      end_date: end_date,
      account_ids: account_ids
      // Removed count and offset - they're deprecated
    });

    console.log(`✅ Found ${response.transactions?.length || 0} transactions`);
    res.json(response);
  } catch (error) {
    console.error('❌ Get transactions error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    available_endpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/plaid/create-link-token',
      'POST /api/plaid/exchange-token',
      'POST /api/plaid/accounts',
      'POST /api/plaid/transactions'
    ]
  });
});

app.listen(PORT, () => {
  console.log('🚀 Plaid Backend Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Environment: ${PLAID_CONFIG.environment}`);
  console.log(`🔑 Client ID: ${PLAID_CONFIG.client_id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Ready to connect accounts!');
});

module.exports = app;