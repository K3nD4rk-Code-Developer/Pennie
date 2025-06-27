import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, Download, Upload, Edit, Trash2, X, RefreshCw, MapPin, 
  Clock, Coffee, Car, ShoppingCart, Tv, Receipt, Heart, DollarSign, CreditCard,
  TrendingUp, TrendingDown, Activity, CheckCircle, FileText, MoreHorizontal,
  Eye, EyeOff, Calendar, Tag, ArrowUpDown, ArrowUp, ArrowDown, Star,
  ExternalLink, Copy, AlertCircle, Info, ChevronDown, ChevronUp, ChevronRight, Settings,
  Grid, List, SortAsc, SortDesc, Zap, Bell, Bookmark, Flag, BarChart3
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import type { Transaction, PageProps } from '../types';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Transactions: React.FC<PageProps> = ({
  transactions,
  accounts,
  filteredTransactions,
  transactionFilters,
  setTransactionFilters,
  handleEditTransaction,
  handleDeleteTransaction,
  setShowAddTransaction,
  exportData,
  setTransactions
}) => {
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'detailed'>('detailed');
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quickFilters, setQuickFilters] = useState({
    timeframe: 'all',
    amount: 'all',
    type: 'all'
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    merchant: true,
    category: true,
    account: true,
    date: true,
    amount: true,
    location: false,
    notes: false,
    tags: false,
    status: true
  });
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'category' | 'account'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Chart type state for Monthly Overview chart
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  // New state for enhanced functionality
  const [showBulkCategorizeModal, setShowBulkCategorizeModal] = useState(false);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState<number | null>(null);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [showQuickAddExpense, setShowQuickAddExpense] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [quickExpense, setQuickExpense] = useState({
    merchant: '',
    amount: '',
    category: 'Food & Dining' as const
  });

  // Import functionality
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // Search input ref for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete handlers - MOVED OUTSIDE OF OTHER FUNCTIONS
  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      handleDeleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  // Enhanced analytics with better calculations
  const analytics = useMemo(() => {
    const income = filteredTransactions
      .filter((t: Transaction) => t.amount > 0)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
    const expenses = Math.abs(
      filteredTransactions
      .filter((t: Transaction) => t.amount < 0)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    );
    
    const netFlow = income - expenses;
    
    // Aggregates negative transactions by category using an object map
    // Calculates total, count, and average for each category — used for analytics/charting
    const categoryTotals = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.amount < 0) {
          const category = transaction.category;
          if (!acc[category]) {
            acc[category] = { total: 0, count: 0, avgAmount: 0 };
          }
          acc[category].total += Math.abs(transaction.amount);
          acc[category].count += 1;
          acc[category].avgAmount = acc[category].total / acc[category].count;
        }
        return acc;
      },
      {} as Record<string, { total: number; count: number; avgAmount: number }>
    );

    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5);

    // Monthly data for the last 6 months
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = Math.abs(monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses
      });
    }

    // Calculate chart data for category donut
    const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
    const categoryChartData = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 4) // Top 4 categories
      .map(([category, data]) => ({
        category,
        amount: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0
      }));

    // Monthly comparison with previous period
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const thisMonthExpenses = Math.abs(thisMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const lastMonthExpenses = Math.abs(lastMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const monthlyChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Transaction frequency analysis
    const transactionsByDay = filteredTransactions.reduce((acc, t) => {
      const day = new Date(t.date).toDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgTransactionsPerDay = Object.values(transactionsByDay).length > 0 
      ? Object.values(transactionsByDay).reduce((sum, count) => sum + count, 0) / Object.keys(transactionsByDay).length 
      : 0;

    return {
      income,
      expenses,
      netFlow,
      topCategories,
      monthlyChange,
      averageTransaction: filteredTransactions.length > 0 ? expenses / filteredTransactions.filter(t => t.amount < 0).length : 0,
      totalTransactions: filteredTransactions.length,
      avgTransactionsPerDay,
      categoryBreakdown: categoryTotals,
      monthlyData,
      categoryChartData
    };
  }, [filteredTransactions, transactions]);

  // Apply quick filters on top of already filtered transactions
const displayedTransactions = useMemo(() => {
  let filtered = [...filteredTransactions];
  
  // Apply quick type filter (income/expenses)
  if (quickFilters.type !== 'all') {
    if (quickFilters.type === 'income') {
      filtered = filtered.filter(t => t.amount > 0);
    } else if (quickFilters.type === 'expenses') {
      filtered = filtered.filter(t => t.amount < 0);
    }
  }
  
  // Apply timeframe filter
  if (quickFilters.timeframe !== 'all') {
    const now = new Date();
    
    switch (quickFilters.timeframe) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
          return transactionDay.getTime() === today.getTime();
        });
        break;
      case 'week':
        const startOfWeek = new Date(now);
        const dayOfWeek = startOfWeek.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday the start of the week
        startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfWeek;
        });
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfMonth;
        });
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfQuarter;
        });
        break;
    }
  }
  
  // Sort the filtered transactions
  filtered.sort((a, b) => {
    const aValue = transactionFilters.sortBy === 'date' ? new Date(a.date).getTime() :
                   transactionFilters.sortBy === 'amount' ? Math.abs(a.amount) :
                   transactionFilters.sortBy === 'merchant' ? a.merchant.toLowerCase() :
                   transactionFilters.sortBy === 'category' ? a.category.toLowerCase() : 0;
                   
    const bValue = transactionFilters.sortBy === 'date' ? new Date(b.date).getTime() :
                   transactionFilters.sortBy === 'amount' ? Math.abs(b.amount) :
                   transactionFilters.sortBy === 'merchant' ? b.merchant.toLowerCase() :
                   transactionFilters.sortBy === 'category' ? b.category.toLowerCase() : 0;
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
  
  return filtered;
}, [filteredTransactions, quickFilters, transactionFilters.sortBy, sortOrder]);

  // Group transactions by specified criteria
  const groupedTransactions = useMemo(() => {
  if (groupBy === 'none') {
    return { 'All Transactions': displayedTransactions };
  }

  return displayedTransactions.reduce((groups, transaction) => {
    let groupKey: string;
    
    switch (groupBy) {
      case 'date':
        groupKey = new Date(transaction.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        break;
      case 'category':
        groupKey = transaction.category;
        break;
      case 'account':
        groupKey = transaction.account;
        break;
      default:
        groupKey = 'All Transactions';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
}, [displayedTransactions, groupBy]);

  // Enhanced bulk actions
  const handleSelectAll = useCallback(() => {
    if (selectedTransactions.length === displayedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(displayedTransactions.map((t: Transaction) => t.id));
    }
  }, [selectedTransactions.length, displayedTransactions]);

  const handleSelectTransaction = useCallback((transactionId: number) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'delete':
        // For bulk delete, we'll use a simpler approach for now
        // You could enhance this later to show "Delete X transactions?" in the modal
        if (selectedTransactions.length > 0) {
          const firstTransaction = transactions.find(t => t.id === selectedTransactions[0]);
          if (firstTransaction) {
            setTransactionToDelete(firstTransaction);
            setShowDeleteModal(true);
            // Store the fact that this is a bulk delete
            // You might want to add another state variable for this
          }
        }
        break;
      case 'export':
        exportData('csv', 'Selected');
        setSelectedTransactions([]);
        break;
      case 'categorize':
        setShowBulkCategorizeModal(true);
        break;
      case 'tag':
        setShowBulkTagModal(true);
        break;
      case 'duplicate':
        // Duplicate selected transactions
        console.log('Duplicate transactions:', selectedTransactions);
        setSelectedTransactions([]);
        break;
      case 'markRecurring':
        // Mark as recurring
        console.log('Mark as recurring:', selectedTransactions);
        setSelectedTransactions([]);
        break;
    }
  }, [selectedTransactions, exportData, transactions]);

  // Enhanced transaction actions
const handleTransactionAction = useCallback((transactionId: number, action: string) => {
  console.log('Transaction action:', action, 'for ID:', transactionId);
  
  switch (action) {
    case 'edit':
      const transactionToEdit = transactions.find(t => t.id === transactionId);
      console.log('Found transaction to edit:', transactionToEdit);
      
      if (transactionToEdit) {
        console.log('Calling handleEditTransaction...');
        handleEditTransaction(transactionToEdit);
      }
      break;
      case 'delete':
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (transactionToDelete) {
          handleDeleteClick(transactionToDelete);
        }
        break;
      case 'duplicate':
        const transactionToDuplicate = transactions.find(t => t.id === transactionId);
        if (transactionToDuplicate) {
          // Create a copy of the transaction
          const duplicatedTransaction = {
            ...transactionToDuplicate,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0]
          };
          console.log('Duplicate transaction:', duplicatedTransaction);
        }
        break;
      case 'details':
        setShowTransactionDetails(transactionId);
        break;
      case 'copy':
        const transactionToCopy = transactions.find(t => t.id === transactionId);
        if (transactionToCopy) {
          // Copy transaction details to clipboard
          const transactionText = `${transactionToCopy.merchant}: ${formatCurrency(transactionToCopy.amount)} - ${transactionToCopy.category} on ${formatDate(transactionToCopy.date)}`;
          navigator.clipboard.writeText(transactionText);
        }
        break;
      case 'flag':
        // Flag transaction for review
        console.log('Flag transaction:', transactionId);
        break;
      case 'bookmark':
        // Bookmark transaction
        console.log('Bookmark transaction:', transactionId);
        break;
    }
  }, [transactions, handleEditTransaction]);

  // Quick add expense handler - FIXED VERSION
  const handleQuickAddExpense = useCallback(() => {
    if (!quickExpense.merchant || !quickExpense.amount) {
      return;
    }
    
    const amount = parseFloat(quickExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    const newTransaction: Transaction = {
      id: Date.now(),
      merchant: quickExpense.merchant,
      amount: -Math.abs(amount), // Always negative for expenses
      category: quickExpense.category as any,
      account: accounts.length > 0 ? accounts[0].name : 'Cash',
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: '',
      tags: [],
      recurring: false,
      verified: true
    };

    // Use setTransactions to add the new transaction
    if (setTransactions) {
      setTransactions([newTransaction, ...transactions]);
    }
    
    // Reset form
    setQuickExpense({
      merchant: '',
      amount: '',
      category: 'Food & Dining'
    });
    setShowQuickAddExpense(false);
    
  }, [quickExpense, accounts, setTransactions, transactions]);

  // Enhanced CSV Import handler - FIXED VERSION
  const handleFileImport = useCallback(async () => {
    if (!importFile) {
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate headers
      const requiredHeaders = ['date', 'description', 'amount'];
      const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.includes(h)));
      
      if (missingHeaders.length > 0) {
        setIsImporting(false);
        return;
      }

      const newTransactions: Transaction[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          setImportProgress((i / lines.length) * 100);
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          const dateIndex = headers.findIndex(h => h.includes('date'));
          const descriptionIndex = headers.findIndex(h => h.includes('description') || h.includes('merchant'));
          const amountIndex = headers.findIndex(h => h.includes('amount'));
          const categoryIndex = headers.findIndex(h => h.includes('category'));
          
          if (dateIndex !== -1 && descriptionIndex !== -1 && amountIndex !== -1) {
            const amount = parseFloat(values[amountIndex]?.replace(/[^-\d.]/g, '') || '0');
            const categoryValue = categoryIndex !== -1 ? values[categoryIndex] : 'Other';
            
            const transaction: Transaction = {
              id: Date.now() + i,
              merchant: values[descriptionIndex] || 'Unknown',
              amount: amount,
              category: CATEGORIES.includes(categoryValue as any) ? categoryValue as any : 'Other',
              account: accounts[0]?.name || 'Imported Account',
              date: values[dateIndex] || new Date().toISOString().split('T')[0],
              location: '',
              notes: 'Imported from CSV',
              tags: ['imported'],
              recurring: false,
              verified: false
            };
            
            newTransactions.push(transaction);
          }
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Add new transactions using setTransactions
      if (setTransactions) {
        setTransactions([...newTransactions, ...transactions]);
      }
      
      setImportProgress(100);
      
      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportProgress(0);
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
      
    } catch (error) {
      console.error('Import error:', error);
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [importFile, accounts, setTransactions, transactions]);

  // Bulk categorize handler
  const handleBulkCategorize = useCallback(() => {
    if (!bulkCategory) return;
    
    console.log('Bulk categorize:', {
      transactionIds: selectedTransactions,
      category: bulkCategory
    });
    
    setBulkCategory('');
    setShowBulkCategorizeModal(false);
    setSelectedTransactions([]);
  }, [selectedTransactions, bulkCategory]);

  // Bulk tag handler
  const handleBulkTag = useCallback(() => {
    if (!bulkTags) return;
    
    const tags = bulkTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    console.log('Bulk tag:', {
      transactionIds: selectedTransactions,
      tags
    });
    
    setBulkTags('');
    setShowBulkTagModal(false);
    setSelectedTransactions([]);
  }, [selectedTransactions, bulkTags]);

  // Enhanced icon system
  const getCategoryIcon = useCallback((categoryName: string) => {
    const iconProps = "w-5 h-5";
    const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
      'Food & Dining': { icon: <Coffee className={iconProps} />, color: 'text-orange-600' },
      'Auto & Transport': { icon: <Car className={iconProps} />, color: 'text-blue-600' },
      'Shopping': { icon: <ShoppingCart className={iconProps} />, color: 'text-purple-600' },
      'Entertainment': { icon: <Tv className={iconProps} />, color: 'text-pink-600' },
      'Bills & Utilities': { icon: <Receipt className={iconProps} />, color: 'text-gray-600' },
      'Healthcare': { icon: <Heart className={iconProps} />, color: 'text-red-600' },
      'Income': { icon: <DollarSign className={iconProps} />, color: 'text-green-600' },
      'Education': { icon: <FileText className={iconProps} />, color: 'text-indigo-600' },
      'Travel': { icon: <MapPin className={iconProps} />, color: 'text-teal-600' },
      'Business': { icon: <FileText className={iconProps} />, color: 'text-slate-600' }
    };
    
    return iconMap[categoryName] || { icon: <Receipt className={iconProps} />, color: 'text-gray-600' };
  }, []);

  const getTransactionStatus = useCallback((transaction: Transaction) => {
    if (!transaction.verified) return { status: 'pending', color: 'yellow', icon: Clock, label: 'Pending' };
    if (transaction.recurring) return { status: 'recurring', color: 'blue', icon: RefreshCw, label: 'Recurring' };
    return { status: 'verified', color: 'green', icon: CheckCircle, label: 'Verified' };
  }, []);

  // Search and filter handlers
  const handleSearch = useCallback((searchTerm: string) => {
    setTransactionFilters({...transactionFilters, search: searchTerm});
  }, [transactionFilters, setTransactionFilters]);

  const clearFilters = useCallback(() => {
    setTransactionFilters({
      search: '',
      category: 'all',
      account: 'all',
      dateRange: 'all',
      sortBy: 'date'
    });
    setQuickFilters({
      timeframe: 'all',
      amount: 'all',
      type: 'all'
    });
  }, [setTransactionFilters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleSelectAll();
      }
      // Delete key to delete selected
      if (e.key === 'Delete' && selectedTransactions.length > 0) {
        handleBulkAction('delete');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, selectedTransactions.length, handleBulkAction]);

  // Apply quick filters
  const applyQuickFilter = (type: string, value: string) => {
    setQuickFilters(prev => ({ ...prev, [type]: value }));
    
    // Apply corresponding main filters
    switch (type) {
      case 'timeframe':
        setTransactionFilters({...transactionFilters, dateRange: value});
        break;
      case 'type':
        if (value === 'income') {
          // Filter for positive amounts
        } else if (value === 'expenses') {
          // Filter for negative amounts
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transactions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and analyze your financial transactions with advanced insights
            </p>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(transactionFilters.search || transactionFilters.category !== 'all' || transactionFilters.account !== 'all' || transactionFilters.dateRange !== 'all') && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                  !
                </span>
              )}
            </button>

            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
              <button 
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'detailed' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('detailed')}
                title="Detailed View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <button 
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              onClick={() => setShowColumnSettings(!showColumnSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Columns
            </button>

            <button 
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>

            <button 
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              onClick={() => exportData('csv', 'This Month')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button 
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm hover:from-orange-600 hover:to-orange-700 hover:shadow-md transition-all duration-200"
              onClick={() => setShowAddTransaction(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>

            <button 
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md transition-all duration-200"
              onClick={() => setShowQuickAddExpense(true)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Expense
            </button>
          </div>
        </div>

        {/* Professional Charts Section - Smaller Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Monthly Chart with Type Selector - Compact */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Overview</h3>
                <p className="text-xs text-gray-600">Income vs expenses comparison</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-700">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-rose-500 rounded-sm mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-700">Expenses</span>
                  </div>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button 
                    className={`px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                      chartType === 'bar' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setChartType('bar')}
                    title="Bar Chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    className={`px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                      chartType === 'line' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setChartType('line')}
                    title="Line Chart"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Optimized chart height */}
            <div className="h-80">
              {chartType === 'bar' ? (
                /* Clean Bar Chart */
                analytics.monthlyData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">No data available</p>
                      <p className="text-xs text-gray-400">Add some transactions to see the chart</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-end justify-between px-3 py-3 relative">
                    {analytics.monthlyData.map((data, index) => {
                      const maxValue = Math.max(
                        ...analytics.monthlyData.map(d => Math.max(d.income, d.expenses)),
                        1000
                      );
                      
                      const incomeHeight = (data.income / maxValue) * 240; // Increased back to 240
                      const expenseHeight = (data.expenses / maxValue) * 240;
                      
                      return (
                        <div key={index} className="flex flex-col items-center group flex-1 max-w-16">
                          {/* Bar Container - Larger */}
                          <div className="relative flex items-end justify-center space-x-1.5 h-64 mb-3">
                            {/* Income Bar */}
                            <div className="relative">
                              <div 
                                className="w-6 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md shadow-sm transition-all duration-500 hover:shadow-md group-hover:from-emerald-600 group-hover:to-emerald-500"
                                style={{ height: `${incomeHeight}px` }}
                              />
                              {/* Income Value Tooltip */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <div className="bg-emerald-600 text-white text-xs font-semibold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                  {formatCurrency(data.income)}
                                </div>
                                <div className="w-1.5 h-1.5 bg-emerald-600 transform rotate-45 -mt-0.5 mx-auto"></div>
                              </div>
                            </div>
                            
                            {/* Expense Bar */}
                            <div className="relative">
                              <div 
                                className="w-6 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md shadow-sm transition-all duration-500 hover:shadow-md group-hover:from-rose-600 group-hover:to-rose-500"
                                style={{ height: `${expenseHeight}px` }}
                              />
                              {/* Expense Value Tooltip */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <div className="bg-rose-600 text-white text-xs font-semibold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                  {formatCurrency(data.expenses)}
                                </div>
                                <div className="w-1.5 h-1.5 bg-rose-600 transform rotate-45 -mt-0.5 mx-auto"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Month Label */}
                          <div className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {data.month}
                          </div>
                          
                          {/* Net Flow Indicator */}
                          <div className={`text-xs font-semibold mt-1 ${
                            data.income - data.expenses >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {data.income - data.expenses >= 0 ? '+' : ''}{formatCurrency(data.income - data.expenses)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Y-axis reference lines - Adjusted for larger height */}
                    <div className="absolute inset-x-6 inset-y-3 pointer-events-none">
                      {[0.25, 0.5, 0.75, 1].map(fraction => (
                        <div 
                          key={fraction}
                          className="absolute w-full border-t border-gray-200/50"
                          style={{ bottom: `${fraction * 240 + 60}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )
              ) : (
                /* MAXIMUM Size Line Chart */
                <div className="w-full h-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      {/* Enhanced gradients */}
                      <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3"/>
                        <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="incomeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#059669"/>
                        <stop offset="100%" stopColor="#10b981"/>
                      </linearGradient>
                      <linearGradient id="expenseLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e11d48"/>
                        <stop offset="100%" stopColor="#f43f5e"/>
                      </linearGradient>
                      
                      {/* Drop shadows */}
                      <filter id="dropShadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    
                    {analytics.monthlyData.length === 0 ? (
                      <g>
                        <circle cx="400" cy="200" r="40" fill="#f3f4f6" opacity="0.5"/>
                        <text x="400" y="205" textAnchor="middle" className="text-lg fill-gray-500 font-medium">
                          No data available
                        </text>
                      </g>
                    ) : (
                      <>
                        {/* MAXIMUM Grid */}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                          <line 
                            key={i}
                            x1="80" 
                            y1={60 + i * 45} 
                            x2="720" 
                            y2={60 + i * 45} 
                            stroke={i === 7 ? "#e5e7eb" : "#f3f4f6"} 
                            strokeWidth={i === 7 ? "3" : "1"}
                            strokeDasharray={i === 7 ? "none" : "4,4"}
                          />
                        ))}
                        
                        {/* Vertical grid lines */}
                        {analytics.monthlyData.map((_, i) => (
                          <line 
                            key={i}
                            x1={120 + i * (560 / Math.max(analytics.monthlyData.length - 1, 1))} 
                            y1="60" 
                            x2={120 + i * (560 / Math.max(analytics.monthlyData.length - 1, 1))} 
                            y2="375" 
                            stroke="#f9fafb" 
                            strokeWidth="1"
                          />
                        ))}

                        {(() => {
                          const maxValue = Math.max(
                            ...analytics.monthlyData.map(d => Math.max(d.income, d.expenses)),
                            1000
                          );
                          
                          const scaleY = (value: number) => 370 - (value / maxValue) * 305; // MASSIVE chart area
                          const scaleX = (index: number) => 120 + index * (560 / Math.max(analytics.monthlyData.length - 1, 1));

                          // Create smooth curves
                          const createSmoothPath = (data: number[]) => {
                            if (data.length < 2) return '';
                            
                            let path = `M ${scaleX(0)} ${scaleY(data[0])}`;
                            
                            for (let i = 1; i < data.length; i++) {
                              const prevX = scaleX(i - 1);
                              const prevY = scaleY(data[i - 1]);
                              const currX = scaleX(i);
                              const currY = scaleY(data[i]);
                              
                              const cp1x = prevX + (currX - prevX) * 0.3;
                              const cp1y = prevY;
                              const cp2x = currX - (currX - prevX) * 0.3;
                              const cp2y = currY;
                              
                              path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
                            }
                            
                            return path;
                          };

                          const incomeData = analytics.monthlyData.map(d => d.income);
                          const expenseData = analytics.monthlyData.map(d => d.expenses);
                          
                          const incomePath = createSmoothPath(incomeData);
                          const expensePath = createSmoothPath(expenseData);
                          
                          // Create area paths
                          const incomeAreaPath = incomePath + ` L ${scaleX(analytics.monthlyData.length - 1)} 375 L 120 375 Z`;
                          const expenseAreaPath = expensePath + ` L ${scaleX(analytics.monthlyData.length - 1)} 375 L 120 375 Z`;

                          return (
                            <>
                              {/* Y-axis labels */}
                              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                                const value = (maxValue / 7) * (7 - i);
                                return (
                                  <text 
                                    key={i} 
                                    x="70" 
                                    y={67 + i * 45} 
                                    textAnchor="end" 
                                    className="text-base fill-gray-500 font-medium"
                                  >
                                    ${value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0)}
                                  </text>
                                );
                              })}
                              
                              {/* Area fills with gradients - Fixed overlap */}
                              <path d={incomeAreaPath} fill="url(#incomeGradient)" opacity="0.6" />
                              <path d={expenseAreaPath} fill="url(#expenseGradient)" opacity="0.6" />
                              
                              {/* Main lines with enhanced styling */}
                              <path 
                                d={incomePath} 
                                fill="none" 
                                stroke="url(#incomeLineGradient)" 
                                strokeWidth="6" 
                                filter="url(#dropShadow)"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path 
                                d={expensePath} 
                                fill="none" 
                                stroke="url(#expenseLineGradient)" 
                                strokeWidth="6" 
                                filter="url(#dropShadow)"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              
                              {/* MAXIMUM data points */}
                              {analytics.monthlyData.map((d, i) => (
                                <g key={i}>
                                  {/* Income point */}
                                  <circle 
                                    cx={scaleX(i)} 
                                    cy={scaleY(d.income)} 
                                    r="12" 
                                    fill="white" 
                                    stroke="#10b981" 
                                    strokeWidth="5"
                                    filter="url(#dropShadow)"
                                    className="hover:r-15 transition-all duration-200 cursor-pointer"
                                  />
                                  <circle 
                                    cx={scaleX(i)} 
                                    cy={scaleY(d.income)} 
                                    r="5" 
                                    fill="#10b981"
                                  />
                                  
                                  {/* Expense point */}
                                  <circle 
                                    cx={scaleX(i)} 
                                    cy={scaleY(d.expenses)} 
                                    r="12" 
                                    fill="white" 
                                    stroke="#f43f5e" 
                                    strokeWidth="5"
                                    filter="url(#dropShadow)"
                                    className="hover:r-15 transition-all duration-200 cursor-pointer"
                                  />
                                  <circle 
                                    cx={scaleX(i)} 
                                    cy={scaleY(d.expenses)} 
                                    r="5" 
                                    fill="#f43f5e"
                                  />
                                </g>
                              ))}
                            </>
                          );
                        })()}
                        
                        {/* Enhanced X-axis labels */}
                        {analytics.monthlyData.map((d, i) => (
                          <text 
                            key={i} 
                            x={120 + i * (560 / Math.max(analytics.monthlyData.length - 1, 1))} 
                            y="395" 
                            textAnchor="middle" 
                            className="text-base fill-gray-600 font-medium"
                          >
                            {d.month}
                          </text>
                        ))}
                        
                        {/* Axis lines */}
                        <line x1="80" y1="375" x2="720" y2="375" stroke="#d1d5db" strokeWidth="3"/>
                        <line x1="80" y1="60" x2="80" y2="375" stroke="#d1d5db" strokeWidth="3"/>
                      </>
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Category Breakdown Chart - Centered */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Spending Categories</h3>
                <p className="text-xs text-gray-600">Breakdown of your expenses by category</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200">
                  View Details
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Chart container - adjusted height to fit legend */}
            <div className="h-80 flex flex-col items-center justify-center py-4">
              {analytics.categoryChartData.length > 0 ? (
                <>
                  {/* Smaller Centered Donut Chart */}
                  <div className="relative w-52 h-52 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                      <defs>
                        {/* Enhanced gradients for each segment */}
                        <linearGradient id="categoryGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb7185"/>
                          <stop offset="100%" stopColor="#f97316"/>
                        </linearGradient>
                        <linearGradient id="categoryGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7"/>
                          <stop offset="100%" stopColor="#c084fc"/>
                        </linearGradient>
                        <linearGradient id="categoryGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6"/>
                          <stop offset="100%" stopColor="#60a5fa"/>
                        </linearGradient>
                        <linearGradient id="categoryGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981"/>
                          <stop offset="100%" stopColor="#34d399"/>
                        </linearGradient>
                        <linearGradient id="categoryGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6b7280"/>
                          <stop offset="100%" stopColor="#9ca3af"/>
                        </linearGradient>
                        
                        {/* Shadow filter */}
                        <filter id="chartShadow">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15"/>
                        </filter>
                      </defs>
                      
                      {/* Background circle - smaller */}
                      <circle 
                        cx="120" 
                        cy="120" 
                        r="80" 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth="24"
                      />
                      
                      {(() => {
                        const gradients = ['url(#categoryGrad1)', 'url(#categoryGrad2)', 'url(#categoryGrad3)', 'url(#categoryGrad4)', 'url(#categoryGrad5)'];
                        let currentOffset = 0;
                        const circumference = 2 * Math.PI * 80;
                        
                        return analytics.categoryChartData.map((item, index) => {
                          const strokeDasharray = (item.percentage / 100) * circumference;
                          const strokeDashoffset = -currentOffset;
                          currentOffset += strokeDasharray;
                          
                          return (
                            <circle
                              key={index}
                              cx="120"
                              cy="120"
                              r="80"
                              fill="transparent"
                              stroke={gradients[index % gradients.length]}
                              strokeWidth="24"
                              strokeDasharray={`${strokeDasharray} ${circumference}`}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              filter="url(#chartShadow)"
                              className="transition-all duration-700 ease-out hover:stroke-width-28 cursor-pointer"
                              style={{
                                transformOrigin: '120px 120px',
                                animation: `drawCircle 1s ease-out ${index * 0.1}s both`
                              }}
                            />
                          );
                        });
                      })()}
                    </svg>
                    
                    {/* Center content adjusted for smaller chart */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                      <div className={`font-bold text-gray-900 mb-1 text-center leading-tight ${
                        analytics.expenses >= 100000 ? 'text-base' :
                        analytics.expenses >= 10000 ? 'text-lg' :
                        analytics.expenses >= 1000 ? 'text-xl' :
                        'text-2xl'
                      }`}>
                        {formatCurrency(analytics.expenses)}
                      </div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Total Spent</div>
                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {analytics.totalTransactions} transactions
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Legend Below Chart */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-full px-2">
                    {analytics.categoryChartData.map((item, index) => {
                      const colors = [
                        'bg-gradient-to-r from-pink-400 to-orange-500',
                        'bg-gradient-to-r from-purple-500 to-purple-400',
                        'bg-gradient-to-r from-blue-500 to-blue-400',
                        'bg-gradient-to-r from-green-500 to-green-400',
                        'bg-gradient-to-r from-gray-500 to-gray-400'
                      ];
                      
                      return (
                        <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50/80 transition-all duration-200 cursor-pointer group">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 shadow-sm group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}></div>
                          <div className="text-center">
                            <div className="text-xs font-semibold text-gray-800">{item.category}</div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(item.amount)} • {item.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">No expenses yet</h4>
                  <p className="text-gray-500 text-xs">Add some transactions to see your spending breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.income)}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              No change from last period
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.expenses)}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {analytics.monthlyChange !== 0 && analytics.monthlyChange !== null ? (
                <>
                  <span className={`font-medium ${analytics.monthlyChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {analytics.monthlyChange > 0 ? '+' : ''}{analytics.monthlyChange.toFixed(1)}%
                  </span>
                  {' vs last month'}
                </>
              ) : (
                'No change from last month'
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Net Flow</p>
                  <p className={`text-2xl font-bold ${analytics.netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {analytics.netFlow >= 0 ? '+' : ''}{formatCurrency(analytics.netFlow)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Cash flow this period
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.totalTransactions}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {analytics.averageTransaction > 0 ? (
                `Avg: ${formatCurrency(analytics.averageTransaction)}`
              ) : (
                'No expenses yet'
              )}
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Filters</h3>
            {(quickFilters.timeframe !== 'all' || quickFilters.amount !== 'all' || quickFilters.type !== 'all') && (
              <button 
                onClick={() => {
                  setQuickFilters({ timeframe: 'all', amount: 'all', type: 'all' });
                  clearFilters();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Time Filters */}
            {['all', 'today', 'week', 'month', 'quarter'].map(period => (
              <button
                key={period}
                onClick={() => applyQuickFilter('timeframe', period)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  quickFilters.timeframe === period
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
            
            <div className="w-px h-8 bg-gray-300 mx-2"></div>
            
            {/* Type Filters */}
            {[
              { key: 'all', label: 'All Types' },
              { key: 'income', label: 'Income' },
              { key: 'expenses', label: 'Expenses' }
            ].map(type => {
              const typeColors: { [key: string]: string } = {
                all: 'bg-blue-500',
                income: 'bg-green-500',
                expenses: 'bg-red-500'
              };
              return (
                <button
                  key={type.key}
                  onClick={() => applyQuickFilter('type', type.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    quickFilters.type === type.key
                      ? `${typeColors[type.key]} text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Search and Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Enhanced Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input 
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Search merchants, notes, categories... (⌘K)"
                    value={transactionFilters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {transactionFilters.search && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={transactionFilters.category}
                  onChange={(e) => setTransactionFilters({...transactionFilters, category: e.target.value})}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {/* Account Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={transactionFilters.account}
                  onChange={(e) => setTransactionFilters({...transactionFilters, account: e.target.value})}
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.name}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={transactionFilters.dateRange}
                  onChange={(e) => setTransactionFilters({...transactionFilters, dateRange: e.target.value})}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex">
                  <select 
                    className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={transactionFilters.sortBy}
                    onChange={(e) => setTransactionFilters({...transactionFilters, sortBy: e.target.value})}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="merchant">Merchant</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 border border-l-0 border-gray-300 rounded-r-xl hover:bg-gray-50 transition-all duration-200"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                >
                  <option value="none">No Grouping</option>
                  <option value="date">Date</option>
                  <option value="category">Category</option>
                  <option value="account">Account</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                <span className="font-medium">{transactions.length}</span> transactions
              </div>
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Add Expense Modal */}
        {showQuickAddExpense && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Quick Add Expense</h3>
                <button 
                  onClick={() => setShowQuickAddExpense(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Merchant</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Starbucks"
                    value={quickExpense.merchant}
                    onChange={(e) => setQuickExpense({...quickExpense, merchant: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="25.00"
                    value={quickExpense.amount}
                    onChange={(e) => setQuickExpense({...quickExpense, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={quickExpense.category}
                    onChange={(e) => setQuickExpense({...quickExpense, category: e.target.value as any})}
                  >
                    {CATEGORIES.filter(cat => cat !== 'Income').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowQuickAddExpense(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={handleQuickAddExpense}
                  disabled={!quickExpense.merchant || !quickExpense.amount}
                >
                  <Zap className="w-4 h-4 mr-2 inline" />
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Import Transactions</h3>
                <button 
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportProgress(0);
                    setIsImporting(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* File Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    importFile 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                  onClick={() => !isImporting && fileInputRef.current?.click()}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${importFile ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {importFile ? importFile.name : 'Drop your CSV file here'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {importFile ? `File size: ${(importFile.size / 1024).toFixed(1)} KB` : 'or click to browse your computer'}
                  </p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                      }
                    }}
                    disabled={isImporting}
                  />
                  {!importFile && !isImporting && (
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all duration-200">
                      Choose File
                    </button>
                  )}
                </div>

                {/* Import Progress */}
                {isImporting && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Importing transactions...</span>
                      <span className="text-gray-500">{Math.round(importProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Import Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">CSV Format Requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Required columns: Date, Description/Merchant, Amount</li>
                        <li>Optional columns: Category, Account, Notes</li>
                        <li>Date format: YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY</li>
                        <li>Amount: Positive for income, negative for expenses</li>
                        <li>Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sample CSV Format */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sample CSV format:</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 text-xs font-mono text-gray-600">
                    Date,Description,Amount,Category<br/>
                    2024-12-15,Starbucks Coffee,-4.75,Food & Dining<br/>
                    2024-12-14,Salary Deposit,3500.00,Income<br/>
                    2024-12-13,Amazon Purchase,-89.99,Shopping
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportProgress(0);
                    setIsImporting(false);
                  }}
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={handleFileImport}
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 inline animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2 inline" />
                      Import Transactions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Categorize Modal */}
        {showBulkCategorizeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Bulk Categorize</h3>
                <button 
                  onClick={() => setShowBulkCategorizeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Categorize <span className="font-medium">{selectedTransactions.length}</span> selected transaction{selectedTransactions.length > 1 ? 's' : ''}
                </p>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowBulkCategorizeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={handleBulkCategorize}
                  disabled={!bulkCategory}
                >
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Apply Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedTransactions.length > 0 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-blue-800 font-medium">
                  {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                  onClick={() => handleBulkAction('categorize')}
                >
                  <Tag className="w-4 h-4 mr-1" />
                  Categorize
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                  onClick={() => handleBulkAction('tag')}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Tag
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                  onClick={() => handleBulkAction('duplicate')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                  onClick={() => handleBulkAction('markRecurring')}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recurring
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-700 ml-2"
                  onClick={() => setSelectedTransactions([])}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Display */}
        {filteredTransactions.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            {viewMode === 'detailed' ? (
              <>
                {/* Enhanced Table Header */}
                <div className="p-6 border-b border-gray-200 bg-gray rounded-t-2xl">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedTransactions.length === filteredTransactions.length}
                      onChange={handleSelectAll}
                    />
                    <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-gray-700">
                      {visibleColumns.merchant && <div className="col-span-3">Transaction</div>}
                      {visibleColumns.category && <div className="col-span-2">Category</div>}
                      {visibleColumns.account && <div className="col-span-2">Account</div>}
                      {visibleColumns.date && <div className="col-span-2">Date</div>}
                      {visibleColumns.amount && <div className="col-span-2 text-right">Amount</div>}
                      {visibleColumns.status && <div className="col-span-1 text-center">Actions</div>}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Table Body with Grouping */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {Object.entries(groupedTransactions).map(([groupName, groupTransactions]) => (
                    <React.Fragment key={groupName}>
                      {groupBy !== 'none' && (
                        <div className="bg-gray px-6 py-3 border-b border-gray-200">
                          <button
                            onClick={() => {
                              setExpandedGroups(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(groupName)) {
                                  newSet.delete(groupName);
                                } else {
                                  newSet.add(groupName);
                                }
                                return newSet;
                              });
                            }}
                            className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-600"
                          >
                            {expandedGroups.has(groupName) ? (
                              <ChevronDown className="w-4 h-4 mr-2" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            {groupName} ({groupTransactions.length} transactions)
                          </button>
                        </div>
                      )}
                      
                      {(groupBy === 'none' || expandedGroups.has(groupName)) &&
                        groupTransactions.map(transaction => {
                          const categoryInfo = getCategoryIcon(transaction.category);
                          
                          return (
                            <div key={transaction.id} className="p-6 hover:bg-gray transition-all duration-200">
                              <div className="flex items-center">
                                <input 
                                  type="checkbox"
                                  className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={selectedTransactions.includes(transaction.id)}
                                  onChange={() => handleSelectTransaction(transaction.id)}
                                />
                                <div className="grid grid-cols-12 gap-4 w-full items-center">
                                  {visibleColumns.merchant && (
                                    <div className="col-span-3">
                                      <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mr-3">
                                          <span className={categoryInfo.color}>
                                            {categoryInfo.icon}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{transaction.merchant}</div>
                                          {visibleColumns.notes && transaction.notes && (
                                            <div className="text-sm text-gray-500 truncate max-w-40">{transaction.notes}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {visibleColumns.category && (
                                    <div className="col-span-2">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {transaction.category}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {visibleColumns.account && (
                                    <div className="col-span-2">
                                      <span className="text-sm text-gray-700">{transaction.account}</span>
                                      {visibleColumns.location && transaction.location && (
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          {transaction.location}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {visibleColumns.date && (
                                    <div className="col-span-2">
                                      <span className="text-sm text-gray-700">{formatDate(transaction.date)}</span>
                                    </div>
                                  )}
                                  
                                  {visibleColumns.amount && (
                                    <div className="col-span-2 text-right">
                                      <span className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                      </span>
                                      {visibleColumns.tags && transaction.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                          {transaction.tags.slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                              {tag}
                                            </span>
                                          ))}
                                          {transaction.tags.length > 2 && (
                                            <span className="text-xs text-gray-500">+{transaction.tags.length - 2}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {visibleColumns.status && (
                                    <div className="col-span-1 text-center">
                                      <div className="flex items-center justify-center space-x-1">
                                        <button 
                                          className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                                          onClick={() => handleTransactionAction(transaction.id, 'edit')}
                                          title="Edit Transaction"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                          className="text-green-500 hover:text-green-700 transition-colors p-1 rounded"
                                          onClick={() => handleTransactionAction(transaction.id, 'details')}
                                          title="View Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                                          onClick={() => handleTransactionAction(transaction.id, 'delete')}
                                          title="Delete Transaction"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </React.Fragment>
                  ))}
                </div>
              </>
            ) : viewMode === 'cards' ? (
              /* Enhanced Cards View */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTransactions.map(transaction => {
                  const categoryInfo = getCategoryIcon(transaction.category);
                  
                  return (
                    <div key={transaction.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <input 
                            type="checkbox"
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                          />
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <span className={categoryInfo.color}>
                              {categoryInfo.icon}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                            onClick={() => handleTransactionAction(transaction.id, 'edit')}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-green-500 hover:text-green-700 p-1 rounded transition-colors"
                            onClick={() => handleTransactionAction(transaction.id, 'details')}
                            title="Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            onClick={() => handleTransactionAction(transaction.id, 'delete')}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{transaction.merchant}</h3>
                        <div className="text-sm text-gray-500 mb-3">{transaction.category}</div>
                        <div className={`text-xl font-bold mb-3 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Account:</span>
                            <span className="font-medium">{transaction.account}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Date:</span>
                            <span className="font-medium">{formatDate(transaction.date)}</span>
                          </div>
                          {transaction.location && (
                            <div className="flex items-center justify-between">
                              <span>Location:</span>
                              <span className="flex items-center font-medium">
                                <MapPin className="w-3 h-3 mr-1" />
                                {transaction.location}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {transaction.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                            {transaction.notes}
                          </div>
                        )}
                        
                        {transaction.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {transaction.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map(transaction => {
                  const categoryInfo = getCategoryIcon(transaction.category);
                  
                  return (
                    <div key={transaction.id} className="p-6 hover:bg-gray transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input 
                            type="checkbox"
                            className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                          />
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                            <span className={categoryInfo.color}>
                              {categoryInfo.icon}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{transaction.merchant}</div>
                            <div className="text-sm text-gray-500">{transaction.category} • {formatDate(transaction.date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                          <div className="flex space-x-1">
                            <button 
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => handleTransactionAction(transaction.id, 'edit')}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleTransactionAction(transaction.id, 'details')}
                              title="Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleTransactionAction(transaction.id, 'delete')}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {transactions.length === 0 
                ? "Start by adding your first transaction or importing from a CSV file."
                : "Try adjusting your filters or search terms to find the transactions you're looking for."
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              {transactions.length === 0 ? (
                <button 
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={() => setShowAddTransaction(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Transaction
                </button>
              ) : (
                <>
                  <button 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200"
                    onClick={clearFilters}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                  <button 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                    onClick={() => setShowAddTransaction(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showTransactionDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
              {(() => {
                const transaction = transactions.find(t => t.id === showTransactionDetails);
                if (!transaction) return null;
                
                const categoryInfo = getCategoryIcon(transaction.category);
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
                      <button 
                        onClick={() => setShowTransactionDetails(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                          <span className={categoryInfo.color}>
                            <div className="w-8 h-8">
                              {React.cloneElement(categoryInfo.icon as React.ReactElement, { className: "w-8 h-8" })}
                            </div>
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{transaction.merchant}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Verified Transaction
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                          <div className={`text-2xl font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                          <div className="text-gray-900 font-medium">{transaction.category}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Account</label>
                          <div className="text-gray-900 font-medium">{transaction.account}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                          <div className="text-gray-900 font-medium">{formatDate(transaction.date)}</div>
                        </div>
                      </div>
                      
                      {transaction.location && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location</label>
                          <div className="text-gray-900 flex items-center bg-gray-50 p-3 rounded-xl">
                            <MapPin className="w-4 h-4 mr-2" />
                            {transaction.location}
                          </div>
                        </div>
                      )}
                      
                      {transaction.notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
                          <div className="text-gray-900 bg-gray-50 p-4 rounded-xl">{transaction.notes}</div>
                        </div>
                      )}
                      
                      {transaction.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-3">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {transaction.tags.map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-8">
                      <button 
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                        onClick={() => setShowTransactionDetails(null)}
                      >
                        Close
                      </button>
                      <button 
                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                        onClick={() => {
                          handleTransactionAction(transaction.id, 'edit');
                          setShowTransactionDetails(null);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2 inline" />
                        Edit Transaction
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Column Settings Modal */}
        {showColumnSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Customize Columns</h3>
                <button 
                  onClick={() => setShowColumnSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(visibleColumns).map(([column, visible]) => (
                  <label key={column} className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => setVisibleColumns(prev => ({
                        ...prev,
                        [column]: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-lg text-gray-700 capitalize">
                      {column.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end mt-8">
                <button 
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  onClick={() => setShowColumnSettings(false)}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={transactionToDelete ? 
            `${transactionToDelete.merchant} - ${formatCurrency(transactionToDelete.amount)}` : 
            undefined
          }
        />
      </div>
    </div>
  );
};

export default Transactions;