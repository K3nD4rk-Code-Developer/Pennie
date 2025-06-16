import React, { useState, useMemo } from 'react';
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
import type { PageProps, Account, Transaction } from '../types';

const Accounts: React.FC<PageProps & {
  refreshAccounts: () => void;
  toggleAccountConnection: (accountId: number) => void;
}> = ({
  accounts,
  transactions,
  setShowAddAccount,
  refreshAccounts,
  toggleAccountConnection,
  setActiveTab,
  setShowAddTransaction
}) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    cash: true,
    credit: true,
    investment: true,
    loan: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActions, setShowActions] = useState<number | null>(null);

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

  // Calculate chart data from transactions
  const chartData = useMemo(() => {
    if (accounts.length === 0 || transactions.length === 0) return [];
    
    // Group transactions by date and calculate running net worth
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Start with current balances and work backwards
    let runningNetWorth = netWorth;
    const dataPoints: { date: string; netWorth: number }[] = [];
    
    // Get last 30 days of data
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Create daily data points
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      
      const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      runningNetWorth += dayTotal;
      
      dataPoints.push({
        date: dateStr,
        netWorth: runningNetWorth
      });
    }
    
    return dataPoints;
  }, [accounts, transactions, netWorth]);

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
      'Cash & ATM': '💵',
      'Electronics': '📱',
      'Auto Payment': '🚗',
      'Food & Dining': '🍔',
      'Bills & Utilities': '💡',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Travel': '✈️',
      'Income': '💰'
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
      'Vanguard': 'V',
      'Robinhood': 'RH'
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
      'Vanguard': 'bg-red-700',
      'Robinhood': 'bg-green-500'
    };
    return colors[institution] || 'bg-gray-500';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAccounts();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getAccountTypeIcon = (type: string) => {
    switch(type) {
      case 'cash':
      case 'checking':
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'credit':
        return <CreditCard className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      case 'loan':
        return <FileText className="w-5 h-5" />;
      default:
        return <Landmark className="w-5 h-5" />;
    }
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
    accounts: Account[], 
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
                onClick={() => setShowAddAccount(true)}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Add Account →
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all your financial accounts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center ${
                isRefreshing ? 'opacity-50' : ''
              }`}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddAccount(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </button>
          </div>
        </div>

        {/* Net Worth Section */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">NET WORTH</h2>
          </div>
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">{formatCurrency(netWorth)}</span>
          </div>
          
          {/* Area Chart */}
          <div className="h-32 relative">
            {chartData.length > 0 ? (
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
                  {accounts.length > 0 
                    ? "Chart will display once transaction history is available" 
                    : "Connect accounts to see net worth over time"
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Accounts List */}
          <div className="xl:col-span-2 space-y-4">
            <AccountSection
              title="Cash"
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
              <h3 className="font-semibold text-gray-900 mb-6">Summary</h3>
              
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

                {/* Connection Status */}
                {accounts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">Connection Status</h4>
                    <div className="space-y-3">
                      {accounts.filter(a => a.connected).length > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-700">Healthy</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {accounts.filter(a => a.connected).length}
                          </span>
                        </div>
                      )}
                      {accounts.filter(a => !a.connected).length > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-700">Need Attention</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {accounts.filter(a => !a.connected).length}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Last update: {accounts[0]?.lastUpdate || 'Never'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            {accounts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </button>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="w-full bg-orange-100 text-orange-700 py-2.5 px-4 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View All Transactions
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
                <h3 className="font-semibold text-gray-900">Transactions</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAccount.name}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit multiple
                </button>
                <button 
                  onClick={() => setShowAddTransaction(true)}
                  className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add transaction
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
                          <div className="text-sm text-gray-500">{transaction.date}</div>
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
                  <p className="text-gray-500">No transactions found</p>
                  <button 
                    onClick={() => setShowAddTransaction(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-2"
                  >
                    Add your first transaction →
                  </button>
                </div>
              )}
              {transactions.filter(t => t.account === selectedAccount.name).length > 10 && (
                <div className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    View all transactions →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;