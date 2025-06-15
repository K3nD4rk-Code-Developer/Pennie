import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Shield, 
  LineChart, 
  Calendar, 
  Bell, 
  Settings, 
  Plus, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  AlertTriangle,
  Coffee,
  Car,
  ShoppingCart} from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { calculateNetWorth, calculateBudgetTotals, calculateInvestmentTotals } from '../utils/calculations';
import type { PageProps } from '../types';

const Dashboard: React.FC<PageProps> = ({
  accounts,
  transactions,
  goals,
  budgetCategories,
  investments,
  alerts,
  smartInsights,
  setActiveTab,
  setShowAddTransaction,
  setShowAddAccount,
  setShowGoalSetup,
  setShowExportModal
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');

  // Calculate key metrics
  const netWorth = calculateNetWorth(accounts);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, acc) => sum + acc.balance, 0));
  
  const { totalSpent, totalRemaining } = calculateBudgetTotals(budgetCategories);
  const { totalChange: investmentChange, totalChangePercent } = calculateInvestmentTotals(investments);
  
  // Calculate cash flow for current month
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyIncome = currentMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.abs(currentMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Goal progress calculation
  const goalsWithProgress = goals.map(goal => ({
    ...goal,
    progressPercent: (goal.current / goal.target) * 100
  }));

  // Top spending categories
  const topSpendingCategories = budgetCategories
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  // Unread alerts count
  const unreadAlerts = alerts.filter(alert => !alert.read);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Food & Dining':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'Auto & Transport':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Shopping':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's your financial overview for {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(netWorth)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +$2,340 (3.4%)
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyCashFlow)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +$340 vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Investment Returns</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investmentChange)}</p>
              <p className={`text-sm flex items-center ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChangePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {formatPercentage(Math.abs(totalChangePercent))} YTD
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <LineChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">AI-Powered Insights</h2>
          <button 
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setActiveTab('ai-advisor')}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartInsights.map((insight: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; impact: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; category: string; action: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                onClick={() => {
                  if (insight.category === 'savings') setActiveTab('accounts');
                  else if (insight.category === 'credit') setActiveTab('credit');
                  else if (insight.category === 'tax') setActiveTab('taxes');
                }}
              >
                {insight.action}
                <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Net Worth Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Net Worth Trend</h2>
            <select 
              className="text-sm font-medium text-black border border-gray-300 rounded px-2 py-1"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
          <div className="h-48 relative">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="netWorthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <path 
                d="M 50 150 Q 150 120 250 130 T 450 110 T 650 100 T 850 90" 
                stroke="#10B981" 
                strokeWidth="3" 
                fill="none"
              />
              <path 
                d="M 50 150 Q 150 120 250 130 T 450 110 T 650 100 T 850 90 L 850 200 L 50 200 Z" 
                fill="url(#netWorthGradient)"
              />
            </svg>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(totalAssets)} Assets</span>
            <span>{formatCurrency(totalLiabilities)} Liabilities</span>
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Spending Breakdown</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('budget')}
            >
              View Budget
            </button>
          </div>
          <div className="space-y-3">
            {topSpendingCategories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(category.spent)}</span>
                  <div className="text-xs text-gray-500">
                    {formatPercentage((category.spent / category.budgeted) * 100)} of budget
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-medium">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget Remaining</span>
              <span className="font-medium text-green-600">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Goals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Financial Goals</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('goals')}
            >
              View All
            </button>
          </div>
          {goalsWithProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsWithProgress.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{goal.emoji}</span>
                      <span className="font-medium text-gray-900">{goal.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatPercentage(goal.progressPercent)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No goals set yet</p>
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => setShowGoalSetup(true)}
              >
                Create your first goal
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('transactions')}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{transaction.merchant}</span>
                    <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </span>
                  <div className="text-xs text-gray-500">{transaction.account}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowAddTransaction(true)}
          >
            <Plus className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-black">Add Transaction</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowGoalSetup(true)}
          >
            <Target className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-black">Set Goal</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowAddAccount(true)}
          >
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-black">Link Account</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowExportModal(true)}
          >
            <FileText className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-black">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {unreadAlerts.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 text-yellow-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Alerts
            </h2>
            <span className="text-sm text-yellow-700">{unreadAlerts.length} unread</span>
          </div>
          <div className="space-y-3">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-yellow-500' :
                    alert.severity === 'positive' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;