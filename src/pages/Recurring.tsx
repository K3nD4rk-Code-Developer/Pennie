import React, { useState, useMemo } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  DollarSign, 
  Tv, 
  Coffee, 
  Plus,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Home,
  Car,
  Heart,
  ShoppingBag,
  Briefcase,
  CreditCard,
  MoreHorizontal,
  Filter,
  Search,
  X,
  Clock,
  CalendarDays,
  Save,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Transaction, PageProps } from '../types';

// Schedule Management Modal Component
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onUpdateSchedule: (transactionId: number, schedule: ScheduleData) => void;
}

interface ScheduleData {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  autoRenew: boolean;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions, 
  onUpdateSchedule 
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    frequency: 'monthly',
    dayOfMonth: 1,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    autoRenew: true
  });

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const recurringTransactions = transactions.filter(t => t.recurring);

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    // Initialize schedule data based on transaction tags or defaults
    const frequency = transaction.tags.find(tag => 
      ['weekly', 'monthly', 'quarterly', 'annual'].includes(tag.toLowerCase())
    )?.toLowerCase() as 'weekly' | 'monthly' | 'quarterly' | 'annual' || 'monthly';
    
    setScheduleData({
      frequency,
      dayOfMonth: new Date(transaction.date).getDate(),
      dayOfWeek: new Date(transaction.date).getDay(),
      startDate: transaction.date,
      isActive: true,
      autoRenew: true
    });
  };

  const handleSave = () => {
    if (selectedTransaction) {
      onUpdateSchedule(selectedTransaction.id, scheduleData);
      setSelectedTransaction(null);
      onClose();
    }
  };

  const getNextPaymentDate = (schedule: ScheduleData): string => {
    const start = new Date(schedule.startDate);
    const now = new Date();
    let next = new Date(start);

    while (next <= now) {
      switch (schedule.frequency) {
        case 'weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'quarterly':
          next.setMonth(next.getMonth() + 3);
          break;
        case 'annual':
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
    }

    return next.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Manage Recurring Schedules</h3>
              <p className="text-orange-100 text-sm">Set up and modify payment schedules for your recurring transactions</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Transaction List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900">Recurring Transactions</h4>
              <p className="text-sm text-gray-600">{recurringTransactions.length} active</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recurringTransactions.map(transaction => (
                <button
                  key={transaction.id}
                  onClick={() => handleTransactionSelect(transaction)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedTransaction?.id === transaction.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{transaction.merchant}</div>
                      <div className="text-sm text-gray-500">{transaction.category}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {transaction.tags.find(tag => 
                          ['weekly', 'monthly', 'quarterly', 'annual'].includes(tag.toLowerCase())
                        ) || 'Monthly'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                      <div className="flex items-center mt-1">
                        {transaction.verified ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Editor */}
          <div className="w-1/2 p-6">
            {selectedTransaction ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Schedule for {selectedTransaction.merchant}</h4>
                  <p className="text-sm text-gray-600">{formatCurrency(Math.abs(selectedTransaction.amount))} • {selectedTransaction.category}</p>
                </div>

                <div className="space-y-4">
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={scheduleData.frequency}
                      onChange={(e) => setScheduleData(prev => ({
                        ...prev,
                        frequency: e.target.value as ScheduleData['frequency']
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Day Selection */}
                  {scheduleData.frequency === 'weekly' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={scheduleData.dayOfWeek || 1}
                        onChange={(e) => setScheduleData(prev => ({
                          ...prev,
                          dayOfWeek: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {dayOfWeekOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={scheduleData.dayOfMonth || 1}
                        onChange={(e) => setScheduleData(prev => ({
                          ...prev,
                          dayOfMonth: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={scheduleData.startDate}
                      onChange={(e) => setScheduleData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Date (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={scheduleData.endDate || ''}
                      onChange={(e) => setScheduleData(prev => ({
                        ...prev,
                        endDate: e.target.value || undefined
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={scheduleData.isActive}
                        onChange={(e) => setScheduleData(prev => ({
                          ...prev,
                          isActive: e.target.checked
                        }))}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Schedule is active</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={scheduleData.autoRenew}
                        onChange={(e) => setScheduleData(prev => ({
                          ...prev,
                          autoRenew: e.target.checked
                        }))}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto-renew subscription</span>
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Schedule Preview</h5>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Frequency:</span> {scheduleData.frequency}</p>
                      <p><span className="text-gray-600">Next Payment:</span> {getNextPaymentDate(scheduleData)}</p>
                      <p><span className="text-gray-600">Amount:</span> {formatCurrency(Math.abs(selectedTransaction.amount))}</p>
                      <p><span className="text-gray-600">Status:</span> 
                        <span className={`ml-1 ${scheduleData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {scheduleData.isActive ? 'Active' : 'Paused'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Schedule</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Select a Transaction</h4>
                <p className="text-gray-600">Choose a recurring transaction from the list to manage its schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Recurring: React.FC<PageProps> = ({
  transactions,
  setShowAddTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [sortBy, setSortBy] = useState('amount');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Helper functions - defined before useMemo hooks to avoid hoisting issues
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'Income': <DollarSign className="w-5 h-5 text-green-600" />,
      'Salary': <Briefcase className="w-5 h-5 text-green-600" />,
      'Entertainment': <Tv className="w-5 h-5 text-pink-600" />,
      'Food & Dining': <Coffee className="w-5 h-5 text-orange-600" />,
      'Shopping': <ShoppingBag className="w-5 h-5 text-purple-600" />,
      'Transportation': <Car className="w-5 h-5 text-blue-600" />,
      'Housing': <Home className="w-5 h-5 text-indigo-600" />,
      'Healthcare': <Heart className="w-5 h-5 text-red-600" />,
      'Utilities': <CreditCard className="w-5 h-5 text-gray-600" />
    };
    
    return iconMap[category] || <RefreshCw className="w-5 h-5 text-gray-600" />;
  };

  const getFrequencyDisplay = (transaction: Transaction): string => {
    // Check tags for frequency
    const frequencyTag = transaction.tags.find(tag => 
      ['weekly', 'monthly', 'quarterly', 'annual'].includes(tag.toLowerCase())
    );
    
    if (frequencyTag) {
      return frequencyTag.charAt(0).toUpperCase() + frequencyTag.slice(1);
    }
    
    // Default to monthly
    return 'Monthly';
  };

  const getNextPaymentDate = (transaction: Transaction): Date => {
    const lastDate = new Date(transaction.date);
    const frequency = getFrequencyDisplay(transaction).toLowerCase();
    const nextDate = new Date(lastDate);

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  };

  const formatNextPaymentDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Filter for recurring transactions
  const recurringTransactions = useMemo(() => {
    return transactions.filter(t => t.recurring);
  }, [transactions]);

  // Filter by search and frequency
  const filteredTransactions = useMemo(() => {
    let filtered = recurringTransactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Frequency filter (using tags or a default)
    if (selectedFrequency !== 'all') {
      filtered = filtered.filter(t => {
        const frequency = t.tags.find(tag => 
          ['weekly', 'monthly', 'quarterly', 'annual'].includes(tag.toLowerCase())
        ) || 'monthly';
        return frequency.toLowerCase() === selectedFrequency;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'merchant':
          return a.merchant.localeCompare(b.merchant);
        default:
          return 0;
      }
    });

    return filtered;
  }, [recurringTransactions, searchQuery, selectedFrequency, sortBy]);

  // Calculate totals
  const { monthlyIncome, monthlyExpenses, netRecurring } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      netRecurring: income - expenses
    };
  }, [filteredTransactions]);

  // Get upcoming payments (next 30 days)
  const upcomingPayments = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return filteredTransactions
      .map(t => {
        const nextDate = getNextPaymentDate(t);
        return { ...t, nextDate };
      })
      .filter(t => t.nextDate <= thirtyDaysFromNow)
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
      .slice(0, 3);
  }, [filteredTransactions]);

  // Event handlers
  const handleEditRecurring = (transaction: Transaction) => {
    // This would typically set the editing state and open the modal
    console.log('Edit recurring transaction:', transaction);
    // You can integrate this with your modal system
  };

  const handleCancelRecurring = async (transactionId: number) => {
    // This would update the transaction to set recurring = false
    try {
      // API call to update transaction
      console.log('Cancel recurring transaction:', transactionId);
      // After successful update, refresh transactions
      // Note: refreshTransactions would need to be passed as a prop if needed
    } catch (error) {
      console.error('Error canceling recurring transaction:', error);
    }
  };

  const handleUpdateSchedule = (transactionId: number, schedule: ScheduleData) => {
    console.log('Update schedule for transaction:', transactionId, schedule);
    // Here you would typically update the transaction with the new schedule
    // This could involve updating the transaction's tags, date, or other properties
    // For now, we'll just log it
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Transactions</h1>
            <p className="text-gray-600">Manage your subscriptions and regular payments</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="text-gray-600 hover:text-gray-900 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors hover:border-orange-300 hover:bg-orange-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Manage Schedule</span>
            </button>
            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              onClick={() => setShowAddTransaction && setShowAddTransaction(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Recurring</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recurring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Frequencies</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="amount">Sort by Amount</option>
                <option value="date">Sort by Date</option>
                <option value="merchant">Sort by Merchant</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredTransactions.length} active subscription{filteredTransactions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Recurring Overview Cards */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
                <p className="text-sm text-gray-500">Recurring income</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
                <p className="text-sm text-gray-500">Recurring expenses</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Net Recurring</p>
                <p className={`text-2xl font-bold ${netRecurring >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(netRecurring)}
                </p>
                <p className="text-sm text-gray-500">Monthly net</p>
              </div>
              <div className={`w-12 h-12 ${netRecurring >= 0 ? 'bg-blue-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
                <RefreshCw className={`w-6 h-6 ${netRecurring >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 mb-6 min-h-0 overflow-y-auto">
          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Payments</h3>
                <span className="text-sm text-gray-500">Next 30 days</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingPayments.map(transaction => (
                  <div key={transaction.id} className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{transaction.merchant}</span>
                      <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Due {formatNextPaymentDate(transaction.nextDate)}</span>
                      {transaction.verified ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Transactions List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Your Recurring Transactions</h3>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center">
                  <Filter className="w-4 h-4 mr-1" />
                  Bulk Actions
                </button>
              </div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredTransactions.map(transaction => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-50 transition-colors">
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{transaction.merchant}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{transaction.account}</span>
                            <span>•</span>
                            <span>{getFrequencyDisplay(transaction)}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                            <span>Next payment: {formatNextPaymentDate(getNextPaymentDate(transaction))}</span>
                            {transaction.verified && (
                              <>
                                <span>•</span>
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Auto-pay enabled
                                </span>
                              </>
                            )}
                          </div>
                          {transaction.notes && (
                            <div className="text-xs text-gray-600 mt-1 italic">{transaction.notes}</div>
                          )}
                          {transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {transaction.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {formatCurrency(Math.abs(transaction.amount * 12))}/year
                        </div>
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            onClick={() => handleEditRecurring(transaction)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleCancelRecurring(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recurring transactions found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Set up recurring income and expenses to track your regular cash flow and never miss a payment.
                </p>
                <button 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 inline-flex items-center"
                  onClick={() => setShowAddTransaction && setShowAddTransaction(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Recurring Transaction
                </button>
              </div>
            )}
          </div>

          {/* Recurring Insights */}
          {recurringTransactions.length > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Recurring Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <p className="text-orange-800">
                    <span className="font-semibold">Annual Commitment:</span> You have {formatCurrency(Math.abs(monthlyExpenses * 12))} in yearly recurring expenses
                  </p>
                  <p className="text-orange-800">
                    <span className="font-semibold">Largest Expense:</span> {
                      filteredTransactions
                        .filter(t => t.amount < 0)
                        .sort((a, b) => a.amount - b.amount)[0]?.merchant || 'N/A'
                    } at {formatCurrency(Math.abs(
                      filteredTransactions
                        .filter(t => t.amount < 0)
                        .sort((a, b) => a.amount - b.amount)[0]?.amount || 0
                    ))}/month
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-orange-800">
                    <span className="font-semibold">Savings Opportunity:</span> Review subscriptions quarterly to identify unused services
                  </p>
                  <p className="text-orange-800">
                    <span className="font-semibold">Recommendation:</span> {
                      monthlyExpenses > monthlyIncome * 0.3 
                        ? 'Consider reducing recurring expenses to below 30% of income'
                        : 'Your recurring expense ratio is healthy'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Management Modal */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          transactions={transactions}
          onUpdateSchedule={handleUpdateSchedule}
        />
      </div>
    </div>
  );
};

export default Recurring;