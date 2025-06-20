import React, { useState, useCallback } from 'react';
import { X, Building, Loader2, Shield, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';
import type { AddAccountModalProps } from '../types';
import { plaidService } from '../services/plaidService';

const AddAccountModal: React.FC<AddAccountModalProps> = ({ 
  showAddAccount, 
  setShowAddAccount, 
  handleAddAccount,
  setAccounts,
  setTransactions
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get Link token on mount
  React.useEffect(() => {
    const getLinkToken = async () => {
      try {
        setError(null);
        const response = await plaidService.createLinkToken();
        setLinkToken(response.link_token);
      } catch (error) {
        console.error('Error getting link token:', error);
        setError('Failed to initialize Plaid. Please make sure your server is running.');
      }
    };

    if (showAddAccount) {
      getLinkToken();
    }
  }, [showAddAccount]);

  const onSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Plaid Link Success:', { publicToken, metadata });
      
      // Exchange public token for access token
      const { access_token } = await plaidService.exchangePublicToken(publicToken);
      console.log('Access token received');
      
      // Fetch accounts
      const accountsData = await plaidService.fetchAccounts(access_token);
      console.log('Accounts fetched:', accountsData);
      
      // Add accounts to state
      const newAccounts = accountsData.accounts.map((account: any) => ({
        id: Date.now() + Math.random(),
        name: account.name,
        type: mapAccountType(account.type, account.subtype),
        subtype: account.subtype,
        balance: account.balances.current || account.balances.available || 0,
        institution: metadata.institution.name,
        accountNumber: account.mask ? `****${account.mask}` : 'N/A',
        routing: 'N/A',
        connected: true,
        autoSync: true,
        lastUpdate: 'Just now',
        lastSync: new Date().toISOString(),
        icon: account.type,
        plaidAccountId: account.account_id,
        accessToken: access_token
      }));

      // Add accounts to state FIRST (before trying transactions)
      setAccounts((prev: any) => [...prev, ...newAccounts]);
      console.log('✅ Added accounts to state:', newAccounts);

      // Try to fetch transactions, but don't fail if it doesn't work
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        console.log('Fetching transactions from', startDate, 'to', endDate);
        const transactionsData = await plaidService.fetchTransactions(access_token, startDate, endDate);
        console.log('Transactions fetched:', transactionsData);
        
        // Add transactions to state
        const newTransactions = transactionsData.transactions.map((transaction: any) => ({
          id: Date.now() + Math.random(),
          merchant: transaction.merchant_name || transaction.name || 'Unknown Merchant',
          amount: -transaction.amount, // Plaid shows debits as positive, we want negative for expenses
          category: mapPlaidCategory(transaction.category),
          account: newAccounts.find((acc: any) => acc.plaidAccountId === transaction.account_id)?.name || 'Unknown Account',
          date: transaction.date,
          location: transaction.location ? 
            `${transaction.location.city || ''}, ${transaction.location.region || ''}`.trim().replace(/^,|,$/, '') || '' : '',
          notes: '',
          tags: transaction.category ? [transaction.category[0]] : [],
          recurring: transaction.payment_channel === 'recurring',
          verified: true,
          pending: transaction.pending || false,
          plaidTransactionId: transaction.transaction_id
        }));

        setTransactions((prev: any) => [...newTransactions, ...prev]);
        console.log('✅ Added transactions to state:', newTransactions.length);
      } catch (transError) {
        console.warn('⚠️ Failed to fetch transactions, but accounts were added successfully:', transError);
        // Don't set error state - accounts were still added successfully
      }
      
      setShowAddAccount(false);
            
    } catch (error) {
      console.error('❌ Error connecting account:', error);
      setError(`Failed to connect account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [setAccounts, setTransactions, setShowAddAccount]);

  const onExit = useCallback((err: any, metadata: any) => {
    console.log('Plaid Link Exit:', { err, metadata });
    if (err != null) {
      console.error('Plaid Link error:', err);
      if (err.error_code !== 'USER_EXIT') {
        setError(`Plaid Link error: ${err.error_message || err.error_code}`);
      }
    }
    setIsLoading(false);
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  if (!showAddAccount) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Connect Bank Account</h3>
          <button 
            onClick={() => setShowAddAccount(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-red-700 text-sm">{error}</span>
              {error.includes('server') && (
                <p className="text-red-600 text-xs mt-1">
                  Make sure your backend server is running on port 5000
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Your Accounts
          </h4>
          
          <p className="text-gray-600 mb-4">
            Securely connect your bank accounts, credit cards, and investments with bank-level encryption.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
              <div className="text-left">
                <h5 className="text-sm font-medium text-green-900 mb-1">What you can connect:</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Checking & Savings Accounts
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Credit Cards & Lines of Credit
                  </li>
                  <li className="flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    Investment & Retirement Accounts
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => open()}
            disabled={!ready || isLoading || !linkToken}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : !linkToken ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Connect with Plaid
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Bank-level encryption • 256-bit SSL • No passwords stored
          </p>
          
          <p className="text-xs text-gray-400 mt-2">
            Sandbox Mode: Use "user_good" / "pass_good" for demo accounts
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to map Plaid account types to app types
function mapAccountType(type: string, subtype: string): string {
  if (type === 'depository') return 'cash';
  if (type === 'credit') return 'credit';
  if (type === 'investment') return 'investment';
  if (type === 'loan') return 'loan';
  return 'cash';
}

// Helper function to map Plaid categories to app categories
function mapPlaidCategory(plaidCategories: string[]): string {
  if (!plaidCategories || plaidCategories.length === 0) return 'Other';
  
  const categoryMap: { [key: string]: string } = {
    'Food and Drink': 'Food & Dining',
    'Transportation': 'Auto & Transport',
    'Shops': 'Shopping',
    'Entertainment': 'Entertainment',
    'Recreation': 'Entertainment',
    'Healthcare': 'Health & Medical',
    'Service': 'Utilities',
    'Payment': 'Bills',
    'Transfer': 'Transfer',
    'Travel': 'Travel',
    'Interest': 'Income',
    'Deposit': 'Income',
    'Payroll': 'Income',
  };

  const primaryCategory = plaidCategories[0] || 'Other';
  return categoryMap[primaryCategory] || primaryCategory || 'Other';
}

export default AddAccountModal;