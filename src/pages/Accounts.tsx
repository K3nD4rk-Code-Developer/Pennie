import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  RefreshCw, Plus, Building, ChevronDown, ChevronUp, 
  MoreHorizontal, DollarSign, TrendingUp, TrendingDown, 
  Eye, EyeOff, CreditCard, Landmark, PiggyBank, 
  Wallet, Shield, AlertCircle, CheckCircle, 
  Settings, Edit3, Trash2, ExternalLink, 
  Activity, Calendar, Filter, Search, Download,
  ArrowUpRight, ArrowDownRight, Info, BarChart3,
  LineChart, Users, Target, Zap, Bell, Copy,
  Globe, Lock, Wifi, WifiOff, Star
} from 'lucide-react';
import { formatCurrency, calculateNetWorth, calculateTotalAssets, calculateTotalLiabilities } from '../utils';
import type { PageProps, Account } from '../types';

interface AccountsProps extends PageProps {
  refreshAccounts: () => void;
  toggleAccountConnection: (accountId: number) => void;
}

// Account type configuration
const accountTypeConfig = {
  cash: { 
    label: 'Cash & Checking', 
    icon: Wallet, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-green-600'
  },
  savings: { 
    label: 'Savings', 
    icon: PiggyBank, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-400',
    gradientTo: 'to-blue-600'
  },
  credit: { 
    label: 'Credit Cards', 
    icon: CreditCard, 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    gradientFrom: 'from-red-400',
    gradientTo: 'to-red-600'
  },
  investment: { 
    label: 'Investment Accounts', 
    icon: TrendingUp, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    gradientFrom: 'from-purple-400',
    gradientTo: 'to-purple-600'
  },
  loan: { 
    label: 'Loans & Mortgages', 
    icon: Landmark, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-orange-600'
  }
};

const EnhancedAccounts: React.FC<AccountsProps> = ({ 
  accounts, 
  refreshAccounts, 
  toggleAccountConnection,
  setShowAddAccount,
  setShowAddTransaction,
  setActiveTab
}) => {
  // State management
  const [expandedSections, setExpandedSections] = useState<string[]>(['cash', 'savings']);
  const [showAccountDetails, setShowAccountDetails] = useState<number | null>(null);
  const [selectedAccountAction, setSelectedAccountAction] = useState<number | null>(null);
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'type'>('type');
  const [filterType, setFilterType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showConnectionSettings, setShowConnectionSettings] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate totals with memoization
  const totals = useMemo(() => ({
    netWorth: calculateNetWorth(accounts),
    totalAssets: calculateTotalAssets(accounts),
    totalLiabilities: calculateTotalLiabilities(accounts),
    connectedAccounts: accounts.filter(a => a.connected).length,
    totalAccounts: accounts.length
  }), [accounts]);

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (account.bank?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesType = filterType === 'all' || account.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return b.balance - a.balance;
        case 'type':
        default:
          return (a.type || 'cash').localeCompare(b.type || 'cash');
      }
    });
  }, [accounts, searchTerm, filterType, sortBy]);

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    return filteredAndSortedAccounts.reduce<Record<string, Account[]>>((groups, account) => {
      const type = account.type || 'cash';
      if (!groups[type]) groups[type] = [];
      groups[type].push(account);
      return groups;
    }, {});
  }, [filteredAndSortedAccounts]);

  // Chart data for account distribution
  const chartData = useMemo(() => {
    const typeData = Object.entries(groupedAccounts).map(([type, accounts]) => {
      const config = accountTypeConfig[type as keyof typeof accountTypeConfig];
      const total = accounts.reduce((sum, account) => {
        if (account.type === 'credit' || account.type === 'loan') {
          return sum + Math.abs(account.balance);
        }
        return sum + account.balance;
      }, 0);
      
      return {
        type,
        label: config.label,
        total,
        count: accounts.length,
        color: config.color
      };
    });
    
    const totalValue = typeData.reduce((sum, item) => sum + item.total, 0);
    
    return typeData.map(item => ({
      ...item,
      percentage: totalValue > 0 ? (item.total / totalValue) * 100 : 0
    }));
  }, [groupedAccounts]);

  // Handlers
  const toggleSection = useCallback((type: string) => {
    setExpandedSections(prev => 
      prev.includes(type) 
        ? prev.filter(s => s !== type)
        : [...prev, type]
    );
  }, []);

  const handleRefreshAccounts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleAccountAction = useCallback((accountId: number, action: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    switch (action) {
      case 'view_transactions':
        setActiveTab('transactions');
        // Filter would be applied here to show only this account's transactions
        break;
      case 'add_transaction':
        setShowAddTransaction(true);
        // Pre-select this account in the modal
        break;
      case 'edit_account':
        break;
      case 'toggle_connection':
        toggleAccountConnection(accountId);
        break;
      case 'delete_account':
        if (window.confirm(`Are you sure you want to delete ${account.name}?`)) {
          alert(`Delete ${account.name} - This would remove the account`);
        }
        break;
      case 'copy_account':
        navigator.clipboard.writeText(`${account.name} - ${account.accountNumber}`);
        break;
      case 'download_statement':
        break;
      default:
        break;
    }
    setSelectedAccountAction(null);
  }, [accounts, setActiveTab, setShowAddTransaction, toggleAccountConnection]);

  const getConnectionStatus = useCallback((account: Account) => {
    if (!account.connected) return 'disconnected';
    const lastSync = account.lastSync ? new Date(account.lastSync) : null;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastSync && lastSync > oneDayAgo ? 'connected' : 'stale';
  }, []);

  const formatBalance = useCallback((balance: number, isHidden: boolean = false) => {
    if (isHidden) return '••••••';
    return formatCurrency(balance);
  }, []);

  const getAccountIcon = useCallback((account: Account) => {
    const config = accountTypeConfig[account.type as keyof typeof accountTypeConfig] || accountTypeConfig.cash;
    const IconComponent = config.icon;
    return <IconComponent className={`w-5 h-5 ${config.color}`} />;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Accounts
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage your financial accounts and track net worth with real-time insights
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex items-center text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {hideBalances ? 'Show' : 'Hide'} Balances
            </button>

            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
              <button 
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <CreditCard className="w-4 h-4" />
              </button>
              <button 
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              className={`flex items-center text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200 ${isRefreshing ? 'animate-pulse' : ''}`}
              onClick={handleRefreshAccounts}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync All'}
            </button>
            
            <button 
              className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 hover:shadow-md transition-all duration-200 shadow-sm"
              onClick={() => setShowAddAccount(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </button>
          </div>
        </div>

        {/* Enhanced Net Worth Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Net Worth</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatBalance(totals.netWorth, hideBalances)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-700">+2.4% this month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatBalance(totals.totalAssets, hideBalances)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-700">+1.8% this month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Liabilities</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatBalance(totals.totalLiabilities, hideBalances)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-700">-0.5% this month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Connected</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {totals.connectedAccounts}/{totals.totalAccounts}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Wifi className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-700">Auto-sync enabled</span>
            </div>
          </div>
        </div>

        {/* Account Distribution Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Distribution</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="70" 
                    fill="transparent" 
                    stroke="#e5e7eb" 
                    strokeWidth="20"
                  />
                  
                  {(() => {
                    const colors = ['#10b981', '#3b82f6', '#ef4444', '#a855f7', '#f97316'];
                    let currentOffset = 0;
                    const circumference = 2 * Math.PI * 70;
                    
                    return chartData.map((item, index) => {
                      const strokeDasharray = (item.percentage / 100) * circumference;
                      const strokeDashoffset = -currentOffset;
                      currentOffset += strokeDasharray;
                      
                      return (
                        <circle
                          key={index}
                          cx="100"
                          cy="100"
                          r="70"
                          fill="transparent"
                          stroke={colors[index % colors.length]}
                          strokeWidth="20"
                          strokeDasharray={`${strokeDasharray} ${circumference}`}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-gray-900">{totals.totalAccounts}</div>
                  <div className="text-sm text-gray-500">Total Accounts</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {chartData.map((item, index) => {
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500'];
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        <div className="text-xs text-gray-500">{item.count} account{item.count > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{item.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option value="all">All Types</option>
                {Object.entries(accountTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'balance' | 'type')}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option value="type">Sort by Type</option>
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                onClick={() => alert('Export accounts data')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                className="flex items-center text-gray-600 hover:text-gray-800 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                onClick={() => setShowConnectionSettings(!showConnectionSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Accounts Display */}
        {viewMode === 'cards' ? (
          /* Card View */
          <div className="space-y-6">
            {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
              const config = accountTypeConfig[type as keyof typeof accountTypeConfig] || accountTypeConfig.cash;
              const isExpanded = expandedSections.includes(type);
              const TypeIcon = config.icon;
              const categoryTotal = typeAccounts.reduce((sum, account) => sum + account.balance, 0);

              return (
                <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleSection(type)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`w-14 h-14 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} rounded-2xl flex items-center justify-center shadow-lg mr-4`}>
                        <TypeIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-900">{config.label}</h3>
                        <p className="text-sm text-gray-600">{typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatBalance(categoryTotal, hideBalances)}
                        </p>
                        <p className="text-sm text-gray-500">Total Balance</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Account Cards */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {typeAccounts.map((account) => {
                          const connectionStatus = getConnectionStatus(account);
                          const isSelected = selectedAccountAction === account.id;

                          return (
                            <div key={account.id} className="relative group">
                              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center">
                                    {getAccountIcon(account)}
                                    <div className="ml-3">
                                      <h4 className="text-lg font-semibold text-gray-900">{account.name}</h4>
                                      <p className="text-sm text-gray-600">{account.bank}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="relative">
                                    <button
                                      onClick={() => setSelectedAccountAction(isSelected ? null : account.id)}
                                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <MoreHorizontal className="w-5 h-5" />
                                    </button>

                                    {isSelected && (
                                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'view_transactions')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Activity className="w-4 h-4 mr-3" />
                                          View Transactions
                                        </button>
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'add_transaction')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Plus className="w-4 h-4 mr-3" />
                                          Add Transaction
                                        </button>
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'copy_account')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Copy className="w-4 h-4 mr-3" />
                                          Copy Details
                                        </button>
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'download_statement')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Download className="w-4 h-4 mr-3" />
                                          Download Statement
                                        </button>
                                        <hr className="my-2" />
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'edit_account')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Edit3 className="w-4 h-4 mr-3" />
                                          Edit Account
                                        </button>
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'toggle_connection')}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Shield className="w-4 h-4 mr-3" />
                                          {connectionStatus === 'connected' ? 'Disconnect' : 'Reconnect'}
                                        </button>
                                        <hr className="my-2" />
                                        <button
                                          onClick={() => handleAccountAction(account.id, 'delete_account')}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                          <Trash2 className="w-4 h-4 mr-3" />
                                          Delete Account
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                      {formatBalance(account.balance, hideBalances)}
                                    </p>
                                    <p className="text-sm text-gray-500">Current Balance</p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Status</span>
                                      <div className="flex items-center">
                                        {connectionStatus === 'connected' ? (
                                          <>
                                            <Wifi className="w-4 h-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600 font-medium">Connected</span>
                                          </>
                                        ) : connectionStatus === 'stale' ? (
                                          <>
                                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                                            <span className="text-sm text-yellow-600 font-medium">Needs Sync</span>
                                          </>
                                        ) : (
                                          <>
                                            <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                                            <span className="text-sm text-red-600 font-medium">Disconnected</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Account</span>
                                      <span className="text-sm text-gray-900 font-mono">
                                        •••• {account.accountNumber.slice(-4)}
                                      </span>
                                    </div>

                                    {account.lastSync && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Last Sync</span>
                                        <span className="text-sm text-gray-500">
                                          {new Date(account.lastSync).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}

                                    {account.limit && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Credit Limit</span>
                                        <span className="text-sm text-gray-500">
                                          {formatCurrency(account.limit)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-4">Account</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Institution</div>
                <div className="col-span-2">Balance</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredAndSortedAccounts.map((account) => {
                const connectionStatus = getConnectionStatus(account);
                const isSelected = selectedAccountAction === account.id;
                
                return (
                  <div key={account.id} className="p-6 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center">
                        {getAccountIcon(account)}
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-gray-900">{account.name}</h4>
                          <p className="text-sm text-gray-500 font-mono">•••• {account.accountNumber.slice(-4)}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {account.type}
                        </span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-sm text-gray-700">{account.bank}</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatBalance(account.balance, hideBalances)}
                        </span>
                      </div>
                      
                      <div className="col-span-1">
                        {connectionStatus === 'connected' ? (
                          <Wifi className="w-5 h-5 text-green-500" />
                        ) : connectionStatus === 'stale' ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="col-span-1 relative">
                        <button
                          onClick={() => setSelectedAccountAction(isSelected ? null : account.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {isSelected && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                            {/* Same dropdown menu as card view */}
                            <button
                              onClick={() => handleAccountAction(account.id, 'view_transactions')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Activity className="w-4 h-4 mr-3" />
                              View Transactions
                            </button>
                            <button
                              onClick={() => handleAccountAction(account.id, 'edit_account')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit3 className="w-4 h-4 mr-3" />
                              Edit Account
                            </button>
                            <hr className="my-2" />
                            <button
                              onClick={() => handleAccountAction(account.id, 'delete_account')}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete Account
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {accounts.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Building className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No accounts connected</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your bank accounts to start tracking your finances and get a complete view of your net worth
            </p>
            <button 
              onClick={() => setShowAddAccount(true)}
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Connect Your First Account
            </button>
          </div>
        )}

        {/* Add Account Modal */}
        {/* This would be handled by the existing AddAccountModal component */}

        {/* Click outside to close dropdowns */}
        {selectedAccountAction && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setSelectedAccountAction(null)}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedAccounts;