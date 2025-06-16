import React, { useState, useCallback } from 'react';
import { X, Building, Loader2 } from 'lucide-react';
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

  // Get Link token on mount
  React.useEffect(() => {
    const getLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error getting link token:', error);
      }
    };

    if (showAddAccount) {
      getLinkToken();
    }
  }, [showAddAccount]);

  const onSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setIsLoading(true);
    try {
      // Exchange public token for access token
      const { access_token } = await plaidService.exchangePublicToken(publicToken);
      
      // Fetch accounts
      const accountsData = await plaidService.fetchAccounts(access_token);
      
      // Add accounts to state
      const newAccounts = accountsData.accounts.map((account: any) => ({
        id: Date.now() + Math.random(),
        name: account.name,
        type: account.subtype,
        balance: account.balances.current,
        institution: metadata.institution.name,
        accountNumber: account.mask,
        routing: account.routing || 'N/A',
        connected: true,
        autoSync: true,
        lastUpdate: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        icon: account.type,
        plaidAccountId: account.account_id,
        accessToken: access_token
      }));

      setAccounts((prev: any) => [...prev, ...newAccounts]);

      // Fetch initial transactions (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const transactionsData = await plaidService.fetchTransactions(access_token, startDate, endDate);
      
      // Add transactions to state
      const newTransactions = transactionsData.transactions.map((transaction: any) => ({
        id: Date.now() + Math.random(),
        merchant: transaction.merchant_name || transaction.name,
        amount: -transaction.amount, // Plaid shows debits as positive
        category: mapPlaidCategory(transaction.category),
        account: newAccounts.find((acc: any) => acc.plaidAccountId === transaction.account_id)?.name || '',
        date: transaction.date,
        location: transaction.location ? 
          `${transaction.location.city || ''}, ${transaction.location.region || ''}` : '',
        notes: '',
        tags: transaction.category || [],
        recurring: transaction.payment_channel === 'recurring',
        verified: true,
        pending: transaction.pending,
        plaidTransactionId: transaction.transaction_id
      }));

      setTransactions((prev: any) => [...newTransactions, ...prev]);
      
      setShowAddAccount(false);
    } catch (error) {
      console.error('Error connecting account:', error);
      alert('Failed to connect account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setAccounts, setTransactions, setShowAddAccount]);

  const config = {
    token: linkToken,
    onSuccess,
    onExit: (err: any, metadata: any) => {
      if (err != null) {
        console.error('Plaid Link error:', err);
      }
    },
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
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-orange-600" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Secure Bank Connection
          </h4>
          
          <p className="text-gray-600 mb-6">
            We use Plaid to securely connect your bank accounts. Your credentials are never stored.
          </p>

          <button
            onClick={() => open()}
            disabled={!ready || isLoading}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect with Plaid'
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Bank-level encryption • No passwords stored
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to map Plaid categories to app categories
function mapPlaidCategory(plaidCategories: string[]): string {
  const categoryMap: { [key: string]: string } = {
    'Food and Drink': 'Food & Dining',
    'Transportation': 'Auto & Transport',
    'Shops': 'Shopping',
    'Entertainment': 'Entertainment',
    'Healthcare': 'Health & Medical',
    'Service': 'Utilities',
    'Payment': 'Bills',
    'Transfer': 'Transfer',
    'Recreation': 'Entertainment',
    'Travel': 'Travel',
  };

  const primaryCategory = plaidCategories[0] || 'Other';
  return categoryMap[primaryCategory] || 'Other';
}

export default AddAccountModal;