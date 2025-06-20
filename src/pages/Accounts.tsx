import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Building,
  PiggyBank,
  Wallet,
  FileText,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Landmark,
  Activity,
  Shield,
  Link2,
  Unlink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import types from your main types file
import type { Account, Transaction } from '../types';

interface PlaidApiResponse {
  accounts?: any[];
  transactions?: any[];
  access_token?: string;
  link_token?: string;
  error?: any;
}

// Extended Account interface for Plaid-specific fields
interface PlaidAccount extends Account {
  plaidAccountId?: string;
  accessToken?: string;
}

// Define the expected props interface
interface AccountsPageProps {
  accounts: PlaidAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<PlaidAccount[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  refreshAccounts?: () => void;
  toggleAccountConnection?: (accountId: number) => void;
  setActiveTab?: (tab: string) => void;
  setShowAddAccount?: (show: boolean) => void;
  setShowAddTransaction?: (show: boolean) => void;
}

const PlaidAccountsDashboard: React.FC<AccountsPageProps> = ({
  accounts = [],
  setAccounts,
  transactions = [],
  setTransactions,
  refreshAccounts: externalRefreshAccounts,
  toggleAccountConnection: externalToggleAccountConnection,
  setActiveTab: externalSetActiveTab,
  setShowAddAccount: externalSetShowAddAccount,
  setShowAddTransaction: externalSetShowAddTransaction,
  ...otherProps
}) => {
  const [selectedAccount, setSelectedAccount] = useState<PlaidAccount | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    cash: true,
    credit: true,
    investment: true,
    loan: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActions, setShowActions] = useState<number | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use external functions if provided, otherwise use internal state
  const handleSetShowAddAccount = externalSetShowAddAccount || setShowAddAccount;
  const handleSetShowAddTransaction = externalSetShowAddTransaction || setShowAddTransaction;

  // Backend API base URL - adjust this to match your backend
  const API_BASE_URL = 'http://localhost:5000/api/plaid';

  // Plaid API Helper Functions that call your backend
  const plaidApiCall = async (endpoint: string, body: any): Promise<PlaidApiResponse> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Plaid API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  // Create Link Token
  const createLinkToken = async () => {
    try {
      const response = await plaidApiCall('create-link-token', {});
      return response.link_token;
    } catch (err) {
      throw new Error('Failed to create link token');
    }
  };

  // Exchange public token for access token
  const exchangePublicToken = async (publicToken: string) => {
    try {
      setIsLoading(true);
      
      const response = await plaidApiCall('exchange-token', {
        public_token: publicToken
      });

      if (response.error) {
        throw new Error(response.error.error_message || 'Token exchange failed');
      }

      const accessToken = response.access_token;
      
      if (accessToken) {
        // Fetch accounts with the new access token
        await fetchAccounts(accessToken);
      }
      
    } catch (err) {
      console.error('Token exchange error:', err);
      setError('Failed to connect account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accounts from Plaid via your backend
  const fetchAccounts = async (accessToken: string) => {
    try {
      setIsLoading(true);
      
      const response = await plaidApiCall('accounts', {
        access_token: accessToken
      });

      if (response.accounts) {
        const formattedAccounts: PlaidAccount[] = response.accounts.map((acc: any) => ({
          id: Date.now() + Math.random(), // Generate unique number ID
          name: acc.name,
          type: mapPlaidAccountType(acc.type, acc.subtype),
          balance: acc.balances.current || 0,
          institution: 'Connected Bank', // You'd get this from institution/get endpoint
          accountNumber: `****${acc.account_id.slice(-4)}`,
          connected: true,
          autoSync: true,
          lastUpdate: 'Just now',
          icon: getAccountIcon(mapPlaidAccountType(acc.type, acc.subtype)),
          plaidAccountId: acc.account_id,
          accessToken: accessToken
        }));

        setAccounts(prevAccounts => {
          // Remove any existing accounts with the same access token to avoid duplicates
          const filteredAccounts = prevAccounts.filter(acc => acc.accessToken !== accessToken);
          return [...filteredAccounts, ...formattedAccounts];
        });

        // Fetch transactions for the new accounts
        await fetchTransactions(accessToken);
      }

    } catch (err) {
      console.error('Fetch accounts error:', err);
      setError('Failed to fetch accounts. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions from Plaid via your backend
  const fetchTransactions = async (accessToken: string, accountId?: string) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const response = await plaidApiCall('transactions', {
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        account_ids: accountId ? [accountId] : undefined
      });

      if (response.transactions) {
        const formattedTransactions: Transaction[] = response.transactions.map((trans: any) => ({
          id: Date.now() + Math.random(), // Generate unique number ID
          account: accounts.find(acc => acc.plaidAccountId === trans.account_id)?.name || 'Unknown Account',
          merchant: trans.merchant_name || trans.name || 'Unknown',
          amount: -trans.amount, // Plaid uses negative for outflows, we want positive for expenses
          category: trans.category?.[0] || 'Other',
          date: trans.date,
          // Required fields from your types
          location: '',
          notes: '',
          tags: [],
          recurring: false,
          verified: true
        }));

        setTransactions(prevTransactions => {
          // Remove any existing transactions from the same access token to avoid duplicates
          const filteredTransactions = prevTransactions.filter(trans => 
            !accounts.some(acc => acc.name === trans.account && acc.accessToken === accessToken)
          );
          return [...filteredTransactions, ...formattedTransactions];
        });
      }

    } catch (err) {
      console.error('Fetch transactions error:', err);
      setError('Failed to fetch transactions.');
    }
  };

  // Helper function to get account icon - returns string to match your types
  const getAccountIcon = (type: Account['type']): string => {
    switch (type) {
      case 'cash':
        return 'wallet';
      case 'credit':
        return 'credit-card';
      case 'investment':
        return 'trending-up';
      case 'loan':
        return 'file-text';
      default:
        return 'wallet';
    }
  };

  // Map Plaid account types to our types
  const mapPlaidAccountType = (type: string, subtype: string): Account['type'] => {
    switch (type) {
      case 'depository':
        return 'cash'; // Your types only support 'cash', not 'checking'/'savings'
      case 'credit':
        return 'credit';
      case 'investment':
        return 'investment';
      case 'loan':
        return 'loan';
      default:
        return 'cash';
    }
  };

  // Handle successful Plaid Link
  const handleLinkSuccess = useCallback(async (publicToken: string, metadata: any) => {
    console.log('Plaid Link Success:', { publicToken, metadata });
    handleSetShowAddAccount(false);
    await exchangePublicToken(publicToken);
  }, [handleSetShowAddAccount]);

  // Handle Plaid Link exit
  const handleLinkExit = useCallback((err: any, metadata: any) => {
    console.log('Plaid Link Exit:', { err, metadata });
    handleSetShowAddAccount(false);
  }, [handleSetShowAddAccount]);

  // Refresh all accounts
  const refreshAccounts = async () => {
    // Use external refresh function if provided
    if (externalRefreshAccounts) {
      externalRefreshAccounts();
      return;
    }

    // Otherwise use internal refresh logic
    setIsRefreshing(true);
    
    try {
      // Refresh each connected account
      const connectedAccounts = accounts.filter(acc => acc.connected && acc.accessToken);
      
      for (const account of connectedAccounts) {
        await fetchAccounts(account.accessToken!);
      }
      
      // Update last refresh time
      setAccounts(prev => prev.map(acc => 
        acc.connected ? { ...acc, lastUpdate: 'Just now' } : acc
      ));
      
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh some accounts.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Toggle account connection
  const toggleAccountConnection = async (accountId: number) => {
    // Use external function if provided
    if (externalToggleAccountConnection) {
      externalToggleAccountConnection(accountId);
      return;
    }

    // Otherwise use internal logic
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    if (account.connected) {
      // Disconnect account
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, connected: false, lastUpdate: 'Disconnected' }
          : acc
      ));
    } else {
      // Reconnect account - would typically re-run Plaid Link
      handleSetShowAddAccount(true);
    }
  };

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    const groups = {
      cash: accounts.filter(a => a.type === 'cash'),
      credit: accounts.filter(a => a.type === 'credit'),
      investment: accounts.filter(a => a.type === 'investment'),
      loan: accounts.filter(a => a.type === 'loan')
    };
    return groups;
  }, [accounts]);

  // Calculate totals
  const { netWorth, assets, liabilities, totals } = useMemo(() => {
    const cashTotal = groupedAccounts.cash.reduce((sum, acc) => sum + acc.balance, 0);
    const creditTotal = groupedAccounts.credit.reduce((sum, acc) => sum + acc.balance, 0);
    const investmentTotal = groupedAccounts.investment.reduce((sum, acc) => sum + acc.balance, 0);
    const loanTotal = groupedAccounts.loan.reduce((sum, acc) => sum + acc.balance, 0);

    const assets = cashTotal + investmentTotal;
    const liabilities = Math.abs(creditTotal + loanTotal);
    const netWorth = assets - liabilities;

    return { 
      netWorth, 
      assets, 
      liabilities,
      totals: {
        cash: cashTotal,
        credit: creditTotal,
        investment: investmentTotal,
        loan: loanTotal
      }
    };
  }, [groupedAccounts]);

  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    let runningNetWorth = netWorth;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Add some realistic fluctuation
      const fluctuation = (Math.random() - 0.5) * 1000;
      runningNetWorth += fluctuation;
      
      data.push({
        date: dateStr,
        netWorth: runningNetWorth
      });
    }
    
    return data;
  }, [netWorth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Shopping': '🛒',
      'Transfer': '💸',
      'Food and Drink': '🍔',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Travel': '✈️',
      'Deposit': '💰',
      'Other': '📄'
    };
    return icons[category] || '📄';
  };

  const getInstitutionLogo = (institution: string) => {
    const logos: { [key: string]: string } = {
      'Wells Fargo': 'WF',
      'Chase': 'CH',
      'Bank of America': 'BA',
      'Citi': 'C',
      'Capital One': 'CO',
      'Fidelity': 'F',
      'Connected Bank': 'CB'
    };
    return logos[institution] || institution.substring(0, 2).toUpperCase();
  };

  const getLogoColor = (institution: string) => {
    const colors: { [key: string]: string } = {
      'Wells Fargo': 'bg-red-500',
      'Chase': 'bg-blue-600',
      'Bank of America': 'bg-red-600',
      'Citi': 'bg-blue-500',
      'Capital One': 'bg-gray-800',
      'Fidelity': 'bg-green-600',
      'Connected Bank': 'bg-purple-600'
    };
    return colors[institution] || 'bg-gray-500';
  };

  const AccountSection = ({ 
    title, 
    icon, 
    accounts, 
    total, 
    sectionKey 
  }: { 
    title: string, 
    icon: React.ReactNode, 
    accounts: PlaidAccount[], 
    total: number, 
    sectionKey: keyof typeof expandedSections 
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gray-600">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-gray-600">{formatCurrency(total)}</span>
        </div>
        {expandedSections[sectionKey] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expandedSections[sectionKey] && (
        <div className="border-t border-gray-100">
          {accounts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">{icon}</span>
              </div>
              <p className="text-gray-500 mb-4">No {title.toLowerCase()} accounts connected</p>
              <button
                onClick={() => handleSetShowAddAccount(true)}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Connect with Plaid →
              </button>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors relative ${
                  selectedAccount?.id === account.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                }`}
                onMouseEnter={() => setShowActions(account.id)}
                onMouseLeave={() => setShowActions(null)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${getLogoColor(account.institution)} text-white rounded-lg flex items-center justify-center font-bold text-sm`}>
                    {getInstitutionLogo(account.institution)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{account.institution}</span>
                      {account.accountNumber && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{account.accountNumber}</span>
                        </>
                      )}
                      {account.plaidAccountId && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Plaid</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(account.balance)}</div>
                    <div className="text-sm text-gray-500 flex items-center justify-end">
                      {account.connected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Updated {account.lastUpdate}
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          Disconnected
                        </>
                      )}
                    </div>
                  </div>
                  {showActions === account.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAccountConnection(account.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {account.connected ? <Unlink className="w-4 h-4 text-gray-600" /> : <Link2 className="w-4 h-4 text-gray-600" />}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Mock Plaid Link component for demo (replace with real react-plaid-link)
  const PlaidLinkButton = () => (
    <button
      onClick={async () => {
        try {
          // In a real app, you'd use the actual Plaid Link component
          // For demo purposes, we'll simulate the flow
          const linkToken = await createLinkToken();
          
          // Simulate successful link with a mock public token
          setTimeout(() => {
            handleLinkSuccess('public-sandbox-mock-token-' + Date.now(), {
              institution: {
                name: 'Demo Bank',
                institution_id: 'ins_109508'
              },
              accounts: [{
                id: 'demo_account_' + Date.now(),
                name: 'Demo Checking',
                type: 'depository',
                subtype: 'checking'
              }]
            });
          }, 1000);
        } catch (err) {
          setError('Failed to initialize Plaid Link');
        }
      }}
      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      disabled={isLoading}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Shield className="w-4 h-4 mr-2" />
      )}
      Connect with Plaid
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <RefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
            <span className="text-blue-800">Connecting to Plaid...</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">Connect and manage your financial accounts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshAccounts}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center ${
                isRefreshing ? 'opacity-50' : ''
              }`}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleSetShowAddAccount(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </button>
          </div>
        </div>

        {/* Net Worth Section */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">NET WORTH</h2>
            <div className="text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Live data from Plaid
            </div>
          </div>
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">{formatCurrency(netWorth)}</span>
          </div>
          
          {/* Area Chart */}
          <div className="h-32 relative">
            {chartData.length > 0 && accounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorNetWorth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  Connect accounts to see net worth over time
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Accounts List */}
          <div className="xl:col-span-2 space-y-4">
            <AccountSection
              title="Cash & Checking"
              icon={<Wallet className="w-5 h-5" />}
              accounts={groupedAccounts.cash}
              total={totals.cash}
              sectionKey="cash"
            />

            <AccountSection
              title="Credit Cards"
              icon={<CreditCard className="w-5 h-5" />}
              accounts={groupedAccounts.credit}
              total={totals.credit}
              sectionKey="credit"
            />

            <AccountSection
              title="Investments"
              icon={<TrendingUp className="w-5 h-5" />}
              accounts={groupedAccounts.investment}
              total={totals.investment}
              sectionKey="investment"
            />

            <AccountSection
              title="Loans"
              icon={<FileText className="w-5 h-5" />}
              accounts={groupedAccounts.loan}
              total={totals.loan}
              sectionKey="loan"
            />
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Financial Summary</h3>
              
              <div className="space-y-6">
                {/* Assets */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">Assets</h4>
                  <div className="space-y-2">
                    {totals.cash > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Cash
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(totals.cash)}</span>
                      </div>
                    )}
                    {totals.investment > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Investments
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(totals.investment)}</span>
                      </div>
                    )}
                    {assets === 0 && (
                      <p className="text-gray-500 py-2">No assets connected</p>
                    )}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">{formatCurrency(assets)}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">Liabilities</h4>
                  <div className="space-y-2">
                    {totals.credit < 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Credit Cards
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(Math.abs(totals.credit))}</span>
                      </div>
                    )}
                    {totals.loan < 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Loans
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(Math.abs(totals.loan))}</span>
                      </div>
                    )}
                    {liabilities === 0 && (
                      <p className="text-gray-500 py-2">No liabilities</p>
                    )}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">{formatCurrency(liabilities)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {accounts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={refreshAccounts}
                    className="w-full bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Accounts
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Section */}
        {selectedAccount && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAccount.name}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => selectedAccount.accessToken && fetchTransactions(selectedAccount.accessToken, selectedAccount.plaidAccountId)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Refresh Transactions
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {transactions
                .filter(t => t.account === selectedAccount.name)
                .slice(0, 10)
                .map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getCategoryIcon(transaction.category)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.merchant}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{transaction.date}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">Plaid</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{transaction.category}</span>
                        <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              {transactions.filter(t => t.account === selectedAccount.name).length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No transactions found</p>
                  <p className="text-sm text-gray-400">
                    {selectedAccount.plaidAccountId 
                      ? "Click 'Refresh Transactions' to fetch from Plaid"
                      : "Connect this account to Plaid to see transactions"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plaid Link Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Connect Bank Account</h3>
                <button onClick={() => handleSetShowAddAccount(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Plaid Link Integration</h4>
                  <p className="text-sm text-blue-800">
                    This will securely connect your bank account. 
                    Your credentials are never stored on our servers.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <PlaidLinkButton />
                <button
                  onClick={() => handleSetShowAddAccount(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaidAccountsDashboard;