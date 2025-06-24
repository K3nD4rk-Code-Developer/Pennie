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

  // Enhanced cash flow calculation with real transaction data
  const cashFlowData = useMemo(() => {
    const now = new Date();
    let filteredTransactions = transactions;

    // Filter by time range
    switch (selectedTimeRange) {
      case 'This Month':
        filteredTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'Last 3 Months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filteredTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
        break;
      case 'Last 6 Months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filteredTransactions = transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
        break;
      case 'This Year':
        filteredTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'Last Year':
        const lastYear = now.getFullYear() - 1;
        filteredTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === lastYear;
        });
        break;
    }

    // Calculate totals from real transaction data
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netCashFlow = income - expenses;
    const savingsRate = income > 0 ? calculateSavingsRate(income, expenses) : 0;

    // Category breakdown with real data and trends
    const categoryBreakdown = filteredTransactions
      .filter(t => t.amount < 0) // Only expenses
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
      }, {} as Record<string, { 
        total: number; 
        count: number; 
        transactions: Transaction[];
        avgTransaction: number;
        trend: 'up' | 'down' | 'stable';
      }>);

    // Calculate trends for categories
    Object.keys(categoryBreakdown).forEach(category => {
      const categoryTransactions = categoryBreakdown[category].transactions;
      if (categoryTransactions.length >= 2) {
        const sorted = categoryTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
        
        const firstHalfTotal = firstHalf.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const secondHalfTotal = secondHalf.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        if (secondHalfTotal > firstHalfTotal * 1.1) {
          categoryBreakdown[category].trend = 'up';
        } else if (secondHalfTotal < firstHalfTotal * 0.9) {
          categoryBreakdown[category].trend = 'down';
        }
      }
    });

    // Top categories with enhanced data
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 6);

    // Income sources with detailed breakdown
    const incomeBreakdown = filteredTransactions
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
    const dailyTransactions = filteredTransactions.reduce((acc, t) => {
      const day = new Date(t.date).toDateString();
      if (!acc[day]) acc[day] = { income: 0, expenses: 0, count: 0 };
      if (t.amount > 0) acc[day].income += t.amount;
      else acc[day].expenses += Math.abs(t.amount);
      acc[day].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expenses: number; count: number }>);

    const avgDailyIncome = Object.values(dailyTransactions).reduce((sum, day) => sum + day.income, 0) / Object.keys(dailyTransactions).length || 0;
    const avgDailyExpenses = Object.values(dailyTransactions).reduce((sum, day) => sum + day.expenses, 0) / Object.keys(dailyTransactions).length || 0;

    // Financial health score based on real data
    const healthScore = Math.min(100, Math.max(0, 
      (savingsRate * 2) + // 40% weight on savings rate
      (netCashFlow > 0 ? 30 : 0) + // 30% weight on positive cash flow
      (income > expenses * 1.2 ? 20 : 0) + // 20% weight on income buffer
      (topCategories.length > 3 ? 10 : 0) // 10% weight on spending diversity
    ));

    return {
      income,
      expenses,
      netCashFlow,
      savingsRate,
      categoryBreakdown,
      topCategories,
      incomeBreakdown,
      topIncomeSources,
      transactionCount: filteredTransactions.length,
      avgDailyIncome,
      avgDailyExpenses,
      healthScore,
      cashFlowVelocity: (income + expenses) / 30, // Daily cash flow velocity
      spendingDiversity: topCategories.length
    };
  }, [transactions, selectedTimeRange]);

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
            className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {comparisonMode ? 'Hide' : 'Show'} Comparison
          </button>

          <button 
            className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg shadow-sm hover:bg-orange-700 transition-colors"
            onClick={() => setShowAddTransaction?.(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(new Set(transactions.map(t => t.category))).map(category => (
                  <label key={category} className="flex items-center">
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
              <div className="space-y-2">
                <input 
                  type="number" 
                  placeholder="Min amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input 
                  type="number" 
                  placeholder="Max amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Options</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                  <span className="ml-2 text-sm text-gray-700">Show only recurring</span>
                </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-sm text-gray-700">Include pending</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cash Flow Status */}
          <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${
            cashFlowStatus.color === 'green'
              ? 'border-l-green-500'
              : cashFlowStatus.color === 'blue'
              ? 'border-l-blue-500'
              : cashFlowStatus.color === 'yellow'
              ? 'border-l-yellow-500'
              : cashFlowStatus.color === 'red'
              ? 'border-l-red-500'
              : ''
          }`}
          >
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