import React, { useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, Activity, Coffee, Car, ShoppingCart, Tv, Receipt, 
  Star, RefreshCw, Target, AlertCircle, CheckCircle, Download, Plus, ArrowUpRight, 
  ArrowDownRight, Filter, Eye, EyeOff, BarChart3, PieChart, LineChart, Settings,
  Info, Zap, Bell, FileText, CreditCard, Wallet, TrendingDown, ArrowUp, ArrowDown,
  MapPin, Clock, Users, Globe, Sparkles, ChevronRight, ChevronDown, ChevronUp, X, Search
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { calculateSavingsRate } from '../utils/calculations';
import type { Transaction, PageProps } from '../types';

const CashFlow: React.FC<PageProps> = ({
  transactions,
  setShowAddTransaction,
  exportData
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('This Month');
  const [viewType, setViewType] = useState('overview');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  // Helper function to calculate cash flow data for a specific period
  const calculatePeriodData = useCallback((periodTransactions: Transaction[]) => {
    const income = periodTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = Math.abs(periodTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netCashFlow = income - expenses;
    const savingsRate = income > 0 ? calculateSavingsRate(income, expenses) : 0;

    // Category breakdown
    const categoryBreakdown = periodTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { 
            total: 0, 
            count: 0, 
            transactions: [],
            avgTransaction: 0,
            trend: 'stable' as 'up' | 'down' | 'stable'
          };
        }
        acc[category].total += Math.abs(transaction.amount);
        acc[category].count += 1;
        acc[category].transactions.push(transaction);
        acc[category].avgTransaction = acc[category].total / acc[category].count;
        return acc;
      }, {} as Record<string, any>);

    return {
      income,
      expenses,
      netCashFlow,
      savingsRate,
      categoryBreakdown,
      transactionCount: periodTransactions.length
    };
  }, []);

  // Get transactions for current and previous period with filters applied
  const { currentPeriodTransactions, previousPeriodTransactions } = useMemo(() => {
    const now = new Date();
    let currentPeriod: Transaction[] = [];
    let previousPeriod: Transaction[] = [];

    // First, filter by time range
    switch (selectedTimeRange) {
      case 'This Month': {
        currentPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        });
        
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        previousPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === lastMonth.getMonth() && 
                 transactionDate.getFullYear() === lastMonth.getFullYear();
        });
        break;
      }
      case 'Last 3 Months': {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        currentPeriod = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        previousPeriod = transactions.filter(t => 
          new Date(t.date) >= sixMonthsAgo && new Date(t.date) < threeMonthsAgo
        );
        break;
      }
      case 'Last 6 Months': {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        currentPeriod = transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
        
        const oneYearAgo = new Date();
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
        previousPeriod = transactions.filter(t => 
          new Date(t.date) >= oneYearAgo && new Date(t.date) < sixMonthsAgo
        );
        break;
      }
      case 'This Year': {
        currentPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === now.getFullYear();
        });
        
        previousPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === now.getFullYear() - 1;
        });
        break;
      }
      case 'Last Year': {
        const lastYear = now.getFullYear() - 1;
        currentPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === lastYear;
        });
        
        previousPeriod = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === lastYear - 1;
        });
        break;
      }
    }

    // Apply advanced filters if enabled
    if (showAdvancedFilters) {
      // Category filter
      if (selectedCategories.length > 0) {
        currentPeriod = currentPeriod.filter(t => selectedCategories.includes(t.category));
        previousPeriod = previousPeriod.filter(t => selectedCategories.includes(t.category));
      }

      // Amount range filter
      const min = minAmount ? parseFloat(minAmount) : null;
      const max = maxAmount ? parseFloat(maxAmount) : null;
      
      if (min !== null) {
        currentPeriod = currentPeriod.filter(t => Math.abs(t.amount) >= min);
        previousPeriod = previousPeriod.filter(t => Math.abs(t.amount) >= min);
      }
      
      if (max !== null) {
        currentPeriod = currentPeriod.filter(t => Math.abs(t.amount) <= max);
        previousPeriod = previousPeriod.filter(t => Math.abs(t.amount) <= max);
      }

      // Recurring filter
      if (showRecurringOnly) {
        // Simple logic: if a transaction has similar merchant/amount in multiple months, it's recurring
        const isRecurring = (t: Transaction, allTransactions: Transaction[]) => {
          return allTransactions.filter(other => 
            other.id !== t.id &&
            other.merchant === t.merchant &&
            Math.abs(other.amount - t.amount) < 0.01
          ).length > 0;
        };
        
        currentPeriod = currentPeriod.filter(t => isRecurring(t, transactions));
        previousPeriod = previousPeriod.filter(t => isRecurring(t, transactions));
      }
    }

    return { currentPeriodTransactions: currentPeriod, previousPeriodTransactions: previousPeriod };
  }, [transactions, selectedTimeRange, showAdvancedFilters, selectedCategories, minAmount, maxAmount, showRecurringOnly]);

  // Calculate data for current period
  const cashFlowData = useMemo(() => {
    const data = calculatePeriodData(currentPeriodTransactions);
    
    // Calculate trends for categories
    Object.keys(data.categoryBreakdown).forEach(category => {
      const categoryTransactions = data.categoryBreakdown[category].transactions;
      if (categoryTransactions.length >= 2) {
        const sorted = categoryTransactions.sort((a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
        
        const firstHalfTotal = firstHalf.reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
        const secondHalfTotal = secondHalf.reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
        
        if (secondHalfTotal > firstHalfTotal * 1.1) {
          data.categoryBreakdown[category].trend = 'up';
        } else if (secondHalfTotal < firstHalfTotal * 0.9) {
          data.categoryBreakdown[category].trend = 'down';
        }
      }
    });

    // Top categories
    const topCategories = Object.entries(data.categoryBreakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 6);

    // Income sources
    const incomeBreakdown = currentPeriodTransactions
      .filter(t => t.amount > 0)
      .reduce((acc, transaction) => {
        const source = transaction.category === 'Income' ? 
          transaction.merchant : transaction.category;
        if (!acc[source]) {
          acc[source] = { total: 0, count: 0, frequency: 'monthly' };
        }
        acc[source].total += transaction.amount;
        acc[source].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number; frequency: string }>);

    const topIncomeSources = Object.entries(incomeBreakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 4);

    // Calculate cash flow velocity and patterns
    const dailyTransactions = currentPeriodTransactions.reduce((acc, t) => {
      const day = new Date(t.date).toDateString();
      if (!acc[day]) acc[day] = { income: 0, expenses: 0, count: 0 };
      if (t.amount > 0) acc[day].income += t.amount;
      else acc[day].expenses += Math.abs(t.amount);
      acc[day].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expenses: number; count: number }>);

    const avgDailyIncome = Object.values(dailyTransactions).reduce((sum, day) => sum + day.income, 0) / Object.keys(dailyTransactions).length || 0;
    const avgDailyExpenses = Object.values(dailyTransactions).reduce((sum, day) => sum + day.expenses, 0) / Object.keys(dailyTransactions).length || 0;

    // Financial health score with improved algorithm
    let healthScore = 0;
    
    // 1. Savings Rate Component (0-30 points)
    // Excellent: 20%+, Good: 10-20%, Fair: 5-10%, Poor: <5%
    if (data.savingsRate >= 20) {
      healthScore += 30;
    } else if (data.savingsRate >= 10) {
      healthScore += 20 + (data.savingsRate - 10) * 1; // Linear scale 20-30
    } else if (data.savingsRate >= 5) {
      healthScore += 10 + (data.savingsRate - 5) * 2; // Linear scale 10-20
    } else if (data.savingsRate >= 0) {
      healthScore += data.savingsRate * 2; // Linear scale 0-10
    }
    
    // 2. Cash Flow Status (0-25 points)
    // Positive cash flow with good margin
    if (data.netCashFlow > 0) {
      const cashFlowRatio = data.income > 0 ? (data.netCashFlow / data.income) : 0;
      if (cashFlowRatio >= 0.3) {
        healthScore += 25; // Excellent - saving 30%+ of income
      } else if (cashFlowRatio >= 0.2) {
        healthScore += 20; // Good - saving 20-30% of income
      } else if (cashFlowRatio >= 0.1) {
        healthScore += 15; // Fair - saving 10-20% of income
      } else {
        healthScore += 10; // Positive but low
      }
    }
    
    // 3. Income Stability (0-20 points)
    // Based on number of income sources and consistency
    if (topIncomeSources.length >= 3) {
      healthScore += 20; // Multiple income sources
    } else if (topIncomeSources.length === 2) {
      healthScore += 15; // Two income sources
    } else if (topIncomeSources.length === 1) {
      healthScore += 10; // Single income source
    }
    
    // 4. Expense Management (0-15 points)
    // Based on spending diversity and control
    if (topCategories.length >= 5) {
      healthScore += 10; // Well-diversified spending
    } else if (topCategories.length >= 3) {
      healthScore += 7; // Moderately diversified
    } else if (topCategories.length >= 1) {
      healthScore += 5; // Limited diversity
    }
    
    // Bonus for controlled spending (no single category > 40% of expenses)
    if (topCategories.length > 0 && data.expenses > 0) {
      const topCategoryPercentage = (topCategories[0][1].total / data.expenses) * 100;
      if (topCategoryPercentage <= 40) {
        healthScore += 5; // No dominant expense category
      }
    }
    
    // 5. Transaction Activity (0-10 points)
    // Regular financial activity indicates active management
    if (data.transactionCount >= 50) {
      healthScore += 10; // Very active
    } else if (data.transactionCount >= 20) {
      healthScore += 7; // Active
    } else if (data.transactionCount >= 10) {
      healthScore += 5; // Moderate activity
    } else if (data.transactionCount >= 1) {
      healthScore += 3; // Some activity
    }
    
    // Ensure score is between 0 and 100
    healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

    return {
      ...data,
      topCategories,
      incomeBreakdown,
      topIncomeSources,
      avgDailyIncome,
      avgDailyExpenses,
      healthScore,
      cashFlowVelocity: (data.income + data.expenses) / 30,
      spendingDiversity: topCategories.length
    };
  }, [currentPeriodTransactions, calculatePeriodData]);

  // Calculate data for previous period (for comparison)
  const previousPeriodData = useMemo(() => {
    if (!comparisonMode) return null;
    return calculatePeriodData(previousPeriodTransactions);
  }, [previousPeriodTransactions, comparisonMode, calculatePeriodData]);

  // Calculate percentage changes
  const calculateChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Category icon mapping
  const getCategoryIcon = useCallback((categoryName: string) => {
    const iconMap: Record<string, { icon: React.ReactElement; color: string; bgColor: string }> = {
      'Food & Dining': { 
        icon: <Coffee className="w-5 h-5" />, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100' 
      },
      'Auto & Transport': { 
        icon: <Car className="w-5 h-5" />, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100' 
      },
      'Shopping': { 
        icon: <ShoppingCart className="w-5 h-5" />, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100' 
      },
      'Entertainment': { 
        icon: <Tv className="w-5 h-5" />, 
        color: 'text-pink-600', 
        bgColor: 'bg-pink-100' 
      },
      'Bills & Utilities': { 
        icon: <Receipt className="w-5 h-5" />, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100' 
      },
      'Healthcare': { 
        icon: <Activity className="w-5 h-5" />, 
        color: 'text-red-600', 
        bgColor: 'bg-red-100' 
      }
    };
    
    return iconMap[categoryName] || { 
      icon: <DollarSign className="w-5 h-5" />, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100' 
    };
  }, []);

  const getCashFlowStatus = useCallback(() => {
    if (cashFlowData.netCashFlow > 2000) return { 
      status: 'excellent', 
      color: 'green', 
      icon: CheckCircle, 
      label: 'Excellent',
      description: 'Strong positive cash flow'
    };
    if (cashFlowData.netCashFlow > 500) return { 
      status: 'good', 
      color: 'blue', 
      icon: TrendingUp, 
      label: 'Good',
      description: 'Healthy cash flow'
    };
    if (cashFlowData.netCashFlow > 0) return { 
      status: 'fair', 
      color: 'yellow', 
      icon: AlertCircle, 
      label: 'Fair',
      description: 'Modest positive cash flow'
    };
    return { 
      status: 'warning', 
      color: 'red', 
      icon: AlertCircle, 
      label: 'Needs Attention',
      description: 'Negative cash flow'
    };
  }, [cashFlowData.netCashFlow]);

  const cashFlowStatus = getCashFlowStatus();
  const StatusIcon = cashFlowStatus.icon;

  // Export handler
  const handleExport = useCallback((format: 'csv' | 'pdf' = 'csv') => {
    exportData?.(format, selectedTimeRange);
  }, [exportData, selectedTimeRange]);

  // Refresh data handler
  const handleRefresh = useCallback(() => {
    // In a real app, this would refresh data from the API
    console.log('Refreshing cash flow data...');
  }, []);

  // Get comparison period label
  const getComparisonPeriodLabel = () => {
    switch (selectedTimeRange) {
      case 'This Month': return 'Last Month';
      case 'Last 3 Months': return 'Previous 3 Months';
      case 'Last 6 Months': return 'Previous 6 Months';
      case 'This Year': return 'Last Year';
      case 'Last Year': return 'Year Before';
      default: return 'Previous Period';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Analysis</h1>
          <p className="text-gray-600 mt-1">
            Monitor your income, expenses, and financial health trends
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            className="border border-gray-300 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="This Month">This Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="This Year">This Year</option>
            <option value="Last Year">Last Year</option>
          </select>

          <button 
            className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          <button 
            className={`inline-flex items-center px-3 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-colors ${
              comparisonMode 
                ? 'text-white bg-blue-600 hover:bg-blue-700' 
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {comparisonMode ? 'Hide' : 'Show'} Comparison
          </button>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button 
              className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-300"
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleExport('csv')}
              title="Export Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {(selectedCategories.length > 0 || minAmount || maxAmount || showRecurringOnly) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setMinAmount('');
                  setMaxAmount('');
                  setShowRecurringOnly(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {Array.from(new Set(transactions.map(t => t.category))).map(category => (
                  <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{selectedCategories.length} selected</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
              <div className="space-y-2">
                <input 
                  type="number" 
                  placeholder="Min amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input 
                  type="number" 
                  placeholder="Max amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              {(minAmount || maxAmount) && (
                <p className="text-xs text-gray-500 mt-1">
                  {minAmount && maxAmount ? `${minAmount} - ${maxAmount}` : 
                   minAmount ? `Min: ${minAmount}` : `Max: ${maxAmount}`}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Options</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={showRecurringOnly}
                    onChange={(e) => setShowRecurringOnly(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show only recurring</span>
                </label>
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          {(selectedCategories.length > 0 || minAmount || maxAmount || showRecurringOnly) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <span>Active filters: </span>
                <span className="ml-1 font-medium">
                  {currentPeriodTransactions.length} of {transactions.length} transactions shown
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Mode Notice */}
      {comparisonMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Comparing <strong>{selectedTimeRange}</strong> with <strong>{getComparisonPeriodLabel()}</strong>. 
            Percentage changes are shown in comparison to the previous period.
          </p>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cash Flow Status */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-${cashFlowStatus.color}-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Cash Flow</p>
              <p className={`text-2xl font-bold text-${cashFlowStatus.color}-600`}>
                {formatCurrency(cashFlowData.netCashFlow)}
              </p>
              <div className="flex items-center mt-2">
                <StatusIcon className={`w-4 h-4 text-${cashFlowStatus.color}-600 mr-1`} />
                <span className={`text-sm text-${cashFlowStatus.color}-600 font-medium`}>
                  {cashFlowStatus.label}
                </span>
              </div>
              {comparisonMode && previousPeriodData && (
                <div className="mt-2 flex items-center">
                  {calculateChange(cashFlowData.netCashFlow, previousPeriodData.netCashFlow) >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    calculateChange(cashFlowData.netCashFlow, previousPeriodData.netCashFlow) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateChange(cashFlowData.netCashFlow, previousPeriodData.netCashFlow)).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 bg-${cashFlowStatus.color}-100 rounded-lg flex items-center justify-center`}>
              <TrendingUp className={`w-6 h-6 text-${cashFlowStatus.color}-600`} />
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(cashFlowData.income)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {cashFlowData.topIncomeSources.length > 0 ? 
                  `Top: ${cashFlowData.topIncomeSources[0][0]}` : 
                  'No income sources'
                }
              </p>
              {comparisonMode && previousPeriodData && (
                <div className="mt-2 flex items-center">
                  {calculateChange(cashFlowData.income, previousPeriodData.income) >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    calculateChange(cashFlowData.income, previousPeriodData.income) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateChange(cashFlowData.income, previousPeriodData.income)).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(cashFlowData.expenses)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {cashFlowData.topCategories.length > 0 ? 
                  `Top: ${cashFlowData.topCategories[0][0]}` : 
                  'No expenses'
                }
              </p>
              {comparisonMode && previousPeriodData && (
                <div className="mt-2 flex items-center">
                  {calculateChange(cashFlowData.expenses, previousPeriodData.expenses) <= 0 ? (
                    <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    calculateChange(cashFlowData.expenses, previousPeriodData.expenses) <= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateChange(cashFlowData.expenses, previousPeriodData.expenses)).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Savings Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(cashFlowData.savingsRate)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {cashFlowData.savingsRate >= 20 ? 'Excellent' : 
                 cashFlowData.savingsRate >= 10 ? 'Good' : 'Needs improvement'}
              </p>
              {comparisonMode && previousPeriodData && (
                <div className="mt-2 flex items-center">
                  {cashFlowData.savingsRate >= previousPeriodData.savingsRate ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    cashFlowData.savingsRate >= previousPeriodData.savingsRate 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(cashFlowData.savingsRate - previousPeriodData.savingsRate).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Expense Categories</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {cashFlowData.topCategories.length > 0 ? (
              cashFlowData.topCategories.map(([category, data]) => {
                const categoryIcon = getCategoryIcon(category);
                const percentage = cashFlowData.expenses > 0 ? (data.total / cashFlowData.expenses) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${categoryIcon.bgColor} rounded-lg flex items-center justify-center`}>
                        {categoryIcon.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category}</p>
                        <p className="text-sm text-gray-500">
                          {data.count} transactions • Avg: {formatCurrency(data.avgTransaction)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(data.total)}</p>
                      <p className="text-sm text-gray-500">{formatPercentage(percentage)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No expense data available</p>
                <p className="text-sm">Add some transactions to see category breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Income Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {cashFlowData.topIncomeSources.length > 0 ? (
              cashFlowData.topIncomeSources.map(([source, data]) => {
                const percentage = cashFlowData.income > 0 ? (data.total / cashFlowData.income) * 100 : 0;
                
                return (
                  <div key={source} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{source}</p>
                        <p className="text-sm text-gray-500">
                          {data.count} payments • {data.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(data.total)}</p>
                      <p className="text-sm text-gray-500">{formatPercentage(percentage)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No income data available</p>
                <p className="text-sm">Add some income transactions to see sources</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Health Score & Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Financial Health Score</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-16 h-16 rounded-full border-4 ${
              cashFlowData.healthScore >= 80 ? 'border-green-500' :
              cashFlowData.healthScore >= 60 ? 'border-yellow-500' :
              cashFlowData.healthScore >= 40 ? 'border-orange-500' : 'border-red-500'
            } flex items-center justify-center bg-white`}>
              <span className={`text-lg font-bold ${
                cashFlowData.healthScore >= 80 ? 'text-green-500' :
                cashFlowData.healthScore >= 60 ? 'text-yellow-500' :
                cashFlowData.healthScore >= 40 ? 'text-orange-500' : 'text-red-500'
              }`}>
                {Math.round(cashFlowData.healthScore)}
              </span>
            </div>
            <button
              onClick={() => setExpandedInsights(!expandedInsights)}
              className="flex items-center text-blue-700 hover:text-blue-800 transition-colors"
            >
              {expandedInsights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {expandedInsights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Cash Flow Velocity
              </h5>
              <p className="text-sm text-blue-700">
                You process <strong>{formatCurrency(cashFlowData.cashFlowVelocity)}</strong> per day on average. 
                This indicates {cashFlowData.cashFlowVelocity > 100 ? 'high' : 'moderate'} financial activity.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Spending Pattern
              </h5>
              <p className="text-sm text-blue-700">
                Top category represents <strong>{cashFlowData.topCategories.length > 0 ? 
                  formatPercentage((cashFlowData.topCategories[0][1].total / cashFlowData.expenses) * 100) : '0%'}</strong> of expenses. 
                {cashFlowData.topCategories.length > 0 && (cashFlowData.topCategories[0][1].total / cashFlowData.expenses) > 0.4 ? 
                  ' Consider diversifying spending.' : ' Good spending distribution.'}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Financial Outlook
              </h5>
              <p className="text-sm text-blue-700">
                Based on current trends, you're {cashFlowData.netCashFlow > 0 ? 'maintaining positive' : 'working to improve'} cash flow. 
                {cashFlowData.savingsRate >= 10 ? ' Your savings rate is healthy.' : ' Consider increasing your savings rate.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowAddTransaction?.(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-orange-700">Add Transaction</p>
              <p className="text-sm text-gray-500">Record income or expense</p>
            </div>
          </button>
          
          <button 
            onClick={() => handleExport('csv')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-center">
              <Download className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-blue-700">Export Data</p>
              <p className="text-sm text-gray-500">Download cash flow report</p>
            </div>
          </button>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
          >
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-green-700">Refresh Data</p>
              <p className="text-sm text-gray-500">Update latest information</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;