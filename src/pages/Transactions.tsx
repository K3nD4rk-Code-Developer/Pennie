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
  
  // New modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

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
        t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Math.abs(t.amount).toString().includes(searchTerm)
      );
    }

    // Category filter (for modal)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }

    // Account filter (for modal)
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(t => selectedAccounts.includes(t.account));
    }

    // Account filter (for dropdown)
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.account === selectedAccount);
    }

    // Category filter (for dropdown)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (dateRange === 'custom' && customDateRange.start) {
        startDate = new Date(customDateRange.start);
        if (customDateRange.end) {
          endDate = new Date(customDateRange.end);
          filtered = filtered.filter(t => {
            const date = new Date(t.date);
            return date >= startDate! && date <= endDate!;
          });
        } else {
          filtered = filtered.filter(t => new Date(t.date) >= startDate!);
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(dateRange) {
          case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
          case '7days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
          case '14days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 14);
            break;
          case '30days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            break;
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'lastmonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
          case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
          case 'lastyear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
        }
        
        if (startDate) {
          filtered = filtered.filter(t => {
            const date = new Date(t.date);
            if (endDate) {
              return date >= startDate! && date <= endDate;
            } else {
              return date >= startDate!;
            }
          });
        }
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
        {/* Header - Made more compact */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <div className="flex space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Search
            </button>
            
            {/* Date Button */}
            <button
              onClick={() => setShowDateModal(true)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Date
            </button>
            
            {/* Filters Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Filters
              {(selectedCategories.length > 0 || selectedAccounts.length > 0) && (
                <span className="ml-1 text-xs bg-orange-500 text-white rounded-full px-1.5">
                  {selectedCategories.length + selectedAccounts.length}
                </span>
              )}
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
              >
                Sort
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => { setSortBy('date'); setSortOrder('desc'); setShowSortDropdown(false); }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                  >
                    Date (new to old)
                  </button>
                  <button
                    onClick={() => { setSortBy('date'); setSortOrder('asc'); setShowSortDropdown(false); }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                  >
                    Date (old to new)
                  </button>
                  <button
                    onClick={() => { setSortBy('amount'); setSortOrder('desc'); setShowSortDropdown(false); }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                  >
                    Amount (high to low)
                  </button>
                  <button
                    onClick={() => { setSortBy('amount'); setSortOrder('asc'); setShowSortDropdown(false); }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                  >
                    Amount (low to high)
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 border rounded-lg transition-colors text-sm ${
                editMode ? 'bg-orange-50 border-orange-300' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Edit multiple
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add transaction
            </button>
          </div>
        </div>

        {/* Remove old filters section */}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">
                Connect your accounts or add transactions manually to start tracking your finances
              </p>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <>
              {/* Table Header - Made more compact */}
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  {editMode && (
                    <div className="w-8 flex items-center">
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

              {/* Bulk Actions - Made more compact */}
              {editMode && selectedTransactions.length > 0 && (
                <div className="px-4 py-2 bg-orange-50 border-b border-orange-200 flex items-center justify-between">
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
                    {/* Date Header - Made more subtle */}
                    <div className="px-4 py-1.5 bg-gray-50 text-xs font-medium text-gray-600">
                      {date}
                    </div>
                    
                    {/* Transactions for this date - More compact */}
                    {dayTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedTransactions.includes(transaction.id) ? 'bg-orange-50' : ''
                        }`}
                        onMouseEnter={() => setHoveredTransaction(transaction.id)}
                        onMouseLeave={() => setHoveredTransaction(null)}
                      >
                        <div className="flex items-center">
                          {editMode && (
                            <div className="w-8 flex items-center">
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
                              <span className="text-lg mr-2">{getCategoryIcon(transaction.category)}</span>
                              <span className="text-sm font-medium text-gray-900">{transaction.merchant}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {transaction.category}
                              </span>
                            </div>
                            <div className="col-span-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></div>
                                {transaction.account}
                              </div>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className={`text-sm font-medium ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                              </span>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              {(hoveredTransaction === transaction.id || showActionMenu === transaction.id) && !editMode && (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowActionMenu(showActionMenu === transaction.id ? null : transaction.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  
                                  {showActionMenu === transaction.id && (
                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                      <button 
                                        onClick={() => {
                                          handleEditTransaction(transaction);
                                          setShowActionMenu(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteTransaction(transaction.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination - Made more compact */}
              {filteredTransactions.length > 50 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {Math.min(50, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex space-x-1">
                    <button className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Search</h3>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter a search term..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-2"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mb-4">
                  We'll match your search term to merchant names, categories, original statements, amounts, and notes.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => { setSearchTerm(''); }}
                    className="px-4 py-2 text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="px-4 py-2 text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Date Range</h3>
                <div className="space-y-1 mb-4">
                  {[
                    { value: '7days', label: 'Last 7 days' },
                    { value: '14days', label: 'Last 14 days' },
                    { value: '30days', label: 'Last 30 days' },
                    { value: 'month', label: 'This month' },
                    { value: 'lastmonth', label: 'Last month' },
                    { value: 'year', label: 'This year' },
                    { value: 'lastyear', label: 'Last year' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value)}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                        dateRange === option.value ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start date</label>
                      <div className="flex items-center justify-between mt-1">
                        <input
                          type="text"
                          placeholder="MM/DD/YYYY"
                          value={customDateRange.start}
                          onChange={(e) => {
                            setCustomDateRange({...customDateRange, start: e.target.value});
                            setDateRange('custom');
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => setCustomDateRange({...customDateRange, start: ''})}
                          className="ml-2 text-blue-500 text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">End date</label>
                      <div className="flex items-center justify-between mt-1">
                        <input
                          type="text"
                          placeholder="MM/DD/YYYY"
                          value={customDateRange.end}
                          onChange={(e) => {
                            setCustomDateRange({...customDateRange, end: e.target.value});
                            setDateRange('custom');
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => setCustomDateRange({...customDateRange, end: ''})}
                          className="ml-2 text-blue-500 text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setDateRange('all');
                      setCustomDateRange({ start: '', end: '' });
                    }}
                    className="px-4 py-2 text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDateModal(false)}
                    className="px-4 py-2 text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowDateModal(false)}
                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-3xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="ml-6 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="ml-4 text-sm text-gray-500">
                      {selectedCategories.length + selectedAccounts.length} filters selected
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-8">
                  {/* Left sidebar */}
                  <div className="w-48">
                    <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                      Categories
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg mt-1">
                      Merchants
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg mt-1">
                      Accounts
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg mt-1">
                      Tags
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg mt-1">
                      Amount
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg mt-1">
                      Other
                    </button>
                  </div>
                  
                  {/* Right content */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === 0}
                          onChange={() => setSelectedCategories([])}
                          className="mr-3 rounded border-gray-300 text-orange-600"
                        />
                        <span className="text-sm">Select all</span>
                      </label>
                      
                      <label className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Income')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, 'Income']);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== 'Income'));
                            }
                          }}
                          className="mr-3 rounded border-gray-300 text-orange-600"
                        />
                        <span className="text-sm text-gray-400 mr-2">💰</span>
                        <span className="text-sm">Income</span>
                      </label>
                      
                      {categories.filter(cat => cat !== 'Income').map(cat => (
                        <label key={cat} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, cat]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat));
                              }
                            }}
                            className="mr-3 rounded border-gray-300 text-orange-600"
                          />
                          <span className="text-sm text-gray-400 mr-2">{getCategoryIcon(cat)}</span>
                          <span className="text-sm">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedAccounts([]);
                    }}
                    className="px-4 py-2 text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="px-4 py-2 text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;