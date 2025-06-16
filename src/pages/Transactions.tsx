import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  MoreHorizontal,
  Plus,
  X,
  Check,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { PageProps, Transaction, Account } from '../types';

const Transactions: React.FC<PageProps> = ({
  transactions,
  accounts,
  setShowAddTransaction,
  handleEditTransaction,
  handleDeleteTransaction,
  setTransactions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hoveredTransaction, setHoveredTransaction] = useState<number | null>(null);

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Account filter
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.account === selectedAccount);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const ranges: { [key: string]: Date } = {
        'today': new Date(now.setHours(0,0,0,0)),
        'week': new Date(now.setDate(now.getDate() - 7)),
        'month': new Date(now.setMonth(now.getMonth() - 1)),
        'year': new Date(now.setFullYear(now.getFullYear() - 1))
      };
      
      if (ranges[dateRange]) {
        filtered = filtered.filter(t => new Date(t.date) >= ranges[dateRange]);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, selectedAccount, selectedCategory, dateRange, sortBy, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
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
      'Income': '💰',
      'Restaurants & Bars': '🍷',
      'Other': '📄'
    };
    return icons[category] || '📄';
  };

  const toggleTransaction = (id: number) => {
    setSelectedTransactions(prev =>
      prev.includes(id) 
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    );
  };

  const toggleAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedTransactions.length} transactions?`)) {
      selectedTransactions.forEach(id => handleDeleteTransaction(id));
      setSelectedTransactions([]);
    }
  };

  const handleSort = (field: 'date' | 'amount' | 'merchant') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const dateKey = formatDateDisplay(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Track and manage all your financial transactions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg transition-colors flex items-center ${
                showFilters ? 'bg-orange-50 border-orange-300' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                editMode ? 'bg-orange-50 border-orange-300' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Edit multiple
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.name}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="year">Last year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Bar */}
        {transactions.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-xl font-semibold text-green-600">{formatCurrency(totals.income)}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xl font-semibold text-red-600">{formatCurrency(totals.expenses)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Net</p>
                <p className={`text-xl font-semibold ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.net)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Connect your accounts or add transactions manually to start tracking your finances
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  {editMode && (
                    <div className="w-10 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                        onChange={toggleAllTransactions}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">Date</div>
                    <div className="col-span-3">Merchant</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-3">Account</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {editMode && selectedTransactions.length > 0 && (
                <div className="px-6 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between">
                  <span className="text-sm text-orange-800">
                    {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTransactions([])}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Clear selection
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete selected
                    </button>
                  </div>
                </div>
              )}

              {/* Transaction List */}
              <div className="divide-y divide-gray-100">
                {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="px-6 py-2 bg-gray-50 text-sm font-medium text-gray-600">
                      {date}
                    </div>
                    
                    {/* Transactions for this date */}
                    {dayTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          selectedTransactions.includes(transaction.id) ? 'bg-orange-50' : ''
                        }`}
                        onMouseEnter={() => setHoveredTransaction(transaction.id)}
                        onMouseLeave={() => setHoveredTransaction(null)}
                      >
                        <div className="flex items-center">
                          {editMode && (
                            <div className="w-10 flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedTransactions.includes(transaction.id)}
                                onChange={() => toggleTransaction(transaction.id)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                            </div>
                          )}
                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 text-sm text-gray-600">
                              {new Date(transaction.date).getDate()}
                            </div>
                            <div className="col-span-3 flex items-center">
                              <span className="text-xl mr-3">{getCategoryIcon(transaction.category)}</span>
                              <span className="font-medium text-gray-900">{transaction.merchant}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {transaction.category}
                              </span>
                            </div>
                            <div className="col-span-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                {transaction.account}
                              </div>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className={`font-medium ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                              </span>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              {hoveredTransaction === transaction.id && !editMode && (
                                <button
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredTransactions.length > 50 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {Math.min(50, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;