import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, TrendingUp, TrendingDown, AlertCircle, 
  Target, Calendar, DollarSign, PieChart, BarChart3, CheckCircle, 
  X, Coffee, Car, ShoppingCart, Tv, Receipt, Heart, Activity, 
  ArrowUp, ArrowDown, PiggyBank, Briefcase, GraduationCap, Plane,
  Sparkles, Gift, Calculator, MoreHorizontal
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { BudgetCategory, PageProps, CategoryType, Transaction } from '../types';

// Define all transaction categories
const TRANSACTION_CATEGORIES: CategoryType[] = [
  'Food & Dining',
  'Auto & Transport',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Business',
  'Taxes',
  'Other'
];

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryType;
  currentBudget?: number;
  onSave: (category: CategoryType, budget: number) => void;
  isEditing?: boolean;
  existingCategories: string[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  currentBudget,
  onSave, 
  isEditing = false,
  existingCategories = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>(category || '');
  const [budgetAmount, setBudgetAmount] = useState(currentBudget?.toString() || '');

  React.useEffect(() => {
    if (isOpen) {
      if (category) {
        setSelectedCategory(category);
        setBudgetAmount(currentBudget?.toString() || '');
      } else {
        setSelectedCategory('');
        setBudgetAmount('');
      }
    }
  }, [category, currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedCategory || !budgetAmount || parseFloat(budgetAmount) <= 0) return;
    onSave(selectedCategory as CategoryType, parseFloat(budgetAmount));
  };

  const handleClose = () => {
    onClose();
    setSelectedCategory('');
    setBudgetAmount('');
  };

  const getCategoryIcon = (categoryName: CategoryType) => {
    const iconMap: { [key in CategoryType]: React.ReactNode } = {
      'Food & Dining': <Coffee className="w-5 h-5" />,
      'Auto & Transport': <Car className="w-5 h-5" />,
      'Shopping': <ShoppingCart className="w-5 h-5" />,
      'Entertainment': <Tv className="w-5 h-5" />,
      'Bills & Utilities': <Receipt className="w-5 h-5" />,
      'Healthcare': <Heart className="w-5 h-5" />,
      'Education': <GraduationCap className="w-5 h-5" />,
      'Travel': <Plane className="w-5 h-5" />,
      'Personal Care': <Sparkles className="w-5 h-5" />,
      'Gifts & Donations': <Gift className="w-5 h-5" />,
      'Business': <Briefcase className="w-5 h-5" />,
      'Taxes': <Calculator className="w-5 h-5" />,
      'Other': <MoreHorizontal className="w-5 h-5" />,
      'Income': <DollarSign className="w-5 h-5" />
    };
    return iconMap[categoryName] || <DollarSign className="w-5 h-5" />;
  };

  // Get available categories (not already budgeted)
  const availableCategories = TRANSACTION_CATEGORIES.filter(
    cat => !existingCategories.includes(cat) || cat === category
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Budget' : 'Set Budget'}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  {getCategoryIcon(selectedCategory as CategoryType)}
                </div>
                <span className="font-medium text-gray-900">{selectedCategory}</span>
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a category...</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monthly Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                required
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedCategory || !budgetAmount}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Budget: React.FC<PageProps> = ({
  budgetCategories,
  setBudgetCategories,
  transactions = [],
  updateBudgetCategory,
  addBudgetCategory
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'Budget' | 'Trends' | 'Forecast'>('Budget');
  const [showUnbudgeted, setShowUnbudgeted] = useState(false);

  // Get category icon
  const getCategoryIcon = (categoryName: CategoryType) => {
    const iconMap: { [key in CategoryType]: React.ReactNode } = {
      'Food & Dining': <Coffee className="w-5 h-5" />,
      'Auto & Transport': <Car className="w-5 h-5" />,
      'Shopping': <ShoppingCart className="w-5 h-5" />,
      'Entertainment': <Tv className="w-5 h-5" />,
      'Bills & Utilities': <Receipt className="w-5 h-5" />,
      'Healthcare': <Heart className="w-5 h-5" />,
      'Education': <GraduationCap className="w-5 h-5" />,
      'Travel': <Plane className="w-5 h-5" />,
      'Personal Care': <Sparkles className="w-5 h-5" />,
      'Gifts & Donations': <Gift className="w-5 h-5" />,
      'Business': <Briefcase className="w-5 h-5" />,
      'Taxes': <Calculator className="w-5 h-5" />,
      'Other': <MoreHorizontal className="w-5 h-5" />,
      'Income': <DollarSign className="w-5 h-5" />
    };
    return iconMap[categoryName] || <DollarSign className="w-5 h-5" />;
  };

  // Calculate spending by category from transactions
  const spendingByCategory = useMemo(() => {
    const spending: { [key in CategoryType]?: number } = {};
    
    // Initialize all categories with 0
    TRANSACTION_CATEGORIES.forEach(cat => {
      spending[cat] = 0;
    });

    // Sum up transactions by category (excluding income)
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        // Count expenses (negative amounts) as positive spending
        if (transaction.category !== 'Income' && transaction.amount < 0) {
          spending[transaction.category] = (spending[transaction.category] || 0) + Math.abs(transaction.amount);
        }
      });
    }

    return spending;
  }, [transactions, transactions.length]); // Track length for updates

  // Update budget categories with current spending whenever transactions change
  useEffect(() => {
    setBudgetCategories(prev => 
      prev.map(cat => {
        const spent = spendingByCategory[cat.name as CategoryType] || 0;
        return {
          ...cat,
          spent,
          remaining: cat.budgeted - spent
        };
      })
    );
  }, [transactions.length]); // ONLY depend on transactions.length, remove spendingByCategory and setBudgetCategories

  // Create comprehensive view of all categories
  const allCategoriesView = useMemo(() => {
    const budgetMap = new Map(budgetCategories.map(cat => [cat.name, cat]));
    
    return TRANSACTION_CATEGORIES.map(categoryName => {
      const existingBudget = budgetMap.get(categoryName);
      const spent = spendingByCategory[categoryName] || 0;
      
      if (existingBudget) {
        return existingBudget; // Use the budget category which now has updated spent values
      } else {
        return {
          name: categoryName,
          budgeted: 0,
          spent,
          remaining: -spent,
          lastMonth: 0,
          yearToDate: 0,
          trend: 'stable' as const
        };
      }
    });
  }, [budgetCategories, spendingByCategory, transactions.length]);

  // Filter categories based on whether they have budgets
  const displayCategories = showUnbudgeted 
    ? allCategoriesView 
    : allCategoriesView.filter(cat => cat.budgeted > 0);

  // Calculate totals only from budgeted categories
  const totals = useMemo(() => {
    const budgetedCategories = budgetCategories; // Only use actual budget categories
    return {
      totalBudgeted: budgetedCategories.reduce((sum, cat) => sum + cat.budgeted, 0),
      totalSpent: budgetedCategories.reduce((sum, cat) => sum + cat.spent, 0),
      totalRemaining: budgetedCategories.reduce((sum, cat) => sum + cat.remaining, 0)
    };
  }, [budgetCategories]);

  const savingsRate = totals.totalBudgeted > 0 ? 
    ((totals.totalRemaining / totals.totalBudgeted) * 100) : 0;

  // Get unbudgeted spending total
  const unbudgetedSpending = useMemo(() => {
    const budgetedCategoryNames = budgetCategories.map(cat => cat.name);
    return Object.entries(spendingByCategory)
      .filter(([category]) => !budgetedCategoryNames.includes(category))
      .reduce((sum, [, amount]) => sum + amount, 0);
  }, [budgetCategories, spendingByCategory, transactions.length]);

  // Get category status
  const getBudgetStatus = (category: BudgetCategory) => {
    if (category.budgeted === 0) {
      return { status: 'unbudgeted', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
    const percentage = (category.spent / category.budgeted) * 100;
    if (percentage > 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage > 80) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const handleSaveCategory = (categoryName: CategoryType, budget: number) => {
    // Check if this category already has a budget
    const existingCategory = budgetCategories.find(cat => cat.name === categoryName);
    
    if (existingCategory) {
      // Update existing category
      updateBudgetCategory(categoryName, budget);
    } else {
      // Add new category with current spending
      const currentSpending = spendingByCategory[categoryName] || 0;
      const newCategory: BudgetCategory = {
        name: categoryName,
        budgeted: budget,
        spent: currentSpending,
        remaining: budget - currentSpending,
        lastMonth: 0,
        yearToDate: 0,
        trend: 'stable'
      };
      setBudgetCategories(prev => [...prev, newCategory]);
    }
    setEditingCategory(undefined);
    setShowModal(false);
  };

  const handleEditCategory = (categoryName: CategoryType) => {
    setEditingCategory(categoryName);
    setShowModal(true);
  };

  const handleDeleteBudget = (categoryName: string) => {
    setBudgetCategories(prev => prev.filter(cat => cat.name !== categoryName));
  };

  const getTopSpendingCategory = () => {
    if (budgetCategories.length === 0) return null;
    return budgetCategories.reduce((prev, current) => 
      (prev.spent > current.spent) ? prev : current
    );
  };

  const CategoryCard = ({ category }: { category: BudgetCategory }) => {
    const { status, color, bgColor } = getBudgetStatus(category);
    const percentage = category.budgeted > 0 ? Math.min((category.spent / category.budgeted) * 100, 100) : 0;
    const hasBudget = category.budgeted > 0;

    // Suggested budgets based on spending patterns
    const suggestedBudget = category.spent > 0 ? Math.max(Math.ceil(category.spent * 1.2 / 50) * 50, 100) : 200;

    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 group ${
        hasBudget ? 'border-gray-100' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 ${bgColor}`}>
              {getCategoryIcon(category.name as CategoryType)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className={`text-sm font-medium ${color}`}>
                {!hasBudget ? 'No Budget Set' : status === 'over' ? 'Over Budget' : status === 'warning' ? 'Near Limit' : 'On Track'}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            {hasBudget ? (
              <>
                <button
                  onClick={() => handleEditCategory(category.name as CategoryType)}
                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Edit budget"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBudget(category.name)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete budget"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditingCategory(category.name as CategoryType);
                  setShowModal(true);
                }}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Set Budget
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent</span>
            <span className="font-semibold">{formatCurrency(category.spent)}</span>
          </div>
          
          {hasBudget && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget</span>
                <span className="font-semibold">{formatCurrency(category.budgeted)}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    status === 'over' ? 'bg-red-500' : status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {category.remaining >= 0 ? 'Remaining' : 'Over by'}
                </span>
                <span className={`font-bold ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(category.remaining))}
                </span>
              </div>
            </>
          )}

          {/* Quick budget suggestions for unbudgeted categories */}
          {!hasBudget && category.spent > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick set budget:</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCategory(category.name as CategoryType, suggestedBudget);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  {formatCurrency(suggestedBudget)}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCategory(category.name as CategoryType, suggestedBudget * 1.5);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  {formatCurrency(suggestedBudget * 1.5)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const topSpendingCategory = getTopSpendingCategory();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Overview</h1>
            <p className="text-gray-600">Track spending across all transaction categories</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {activeTab === 'Budget' && (
              <>
                <label className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnbudgeted}
                    onChange={(e) => setShowUnbudgeted(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Show unbudgeted</span>
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => { setEditingCategory(undefined); setShowModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Set Budget</span>
            </button>
          </div>
        </div>

        {/* Summary Cards - Only show in Budget tab */}
        {activeTab === 'Budget' && (
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
              <div>
              <p className="text-gray-600 text-sm font-medium">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalBudgeted)}</p>
              <p className="text-sm text-gray-500">
              {budgetCategories.length} categories
              </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
              </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalSpent)}</p>
                  <p className="text-sm text-gray-500">
                    {totals.totalBudgeted > 0 ? formatPercentage((totals.totalSpent / totals.totalBudgeted) * 100) : '0%'} of budget
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {totals.totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
                  </p>
                  <p className={`text-2xl font-bold ${totals.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(totals.totalRemaining))}
                  </p>
                  <p className="text-sm text-gray-500">
                    {totals.totalBudgeted > 0 ? formatPercentage((Math.abs(totals.totalRemaining) / totals.totalBudgeted) * 100) : '0%'} 
                    {totals.totalRemaining >= 0 ? ' left' : ' over'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  totals.totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {totals.totalRemaining >= 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Unbudgeted Spending</p>
                  <p className={`text-2xl font-bold ${unbudgetedSpending > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formatCurrency(unbudgetedSpending)}
                  </p>
                  <p className="text-sm text-gray-500">Track these categories</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overall Progress - Only show in Budget tab when there are budgets */}
        {activeTab === 'Budget' && totals.totalBudgeted > 0 && (
          <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mx-6 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-900">Overall Budget Progress</h3>
              <span className="text-sm font-medium text-gray-600">
                {formatPercentage((totals.totalSpent / totals.totalBudgeted) * 100)} spent
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  totals.totalSpent > totals.totalBudgeted ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${Math.min((totals.totalSpent / totals.totalBudgeted) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>$0</span>
              <span>{formatCurrency(totals.totalBudgeted)}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'Budget' ? (
          <>
            {/* Budget Categories */}
            <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-6 mb-6 flex flex-col min-h-0">
              <div className="flex-shrink-0 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {showUnbudgeted ? 'All Categories' : 'Budgeted Categories'}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>June 2025</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {displayCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Budgets Set</h3>
                    <p className="text-gray-600 mb-8">Start by setting budgets for your spending categories</p>
                    
                    {/* Quick Stats if there are transactions */}
                    {Object.values(spendingByCategory).some(amount => amount > 0) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
                        <p className="text-sm text-orange-800">
                          <span className="font-semibold">💡 Pro tip:</span> You've already spent {formatCurrency(Object.values(spendingByCategory).reduce((a, b) => a + b, 0))} this month. 
                          Set budgets to track and control your spending!
                        </p>
                      </div>
                    )}
                    
                    {/* Suggested Category Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                      {[
                        { name: 'Food & Dining' as CategoryType, icon: Coffee, amount: 600 },
                        { name: 'Auto & Transport' as CategoryType, icon: Car, amount: 400 },
                        { name: 'Shopping' as CategoryType, icon: ShoppingCart, amount: 300 },
                        { name: 'Entertainment' as CategoryType, icon: Tv, amount: 200 },
                        { name: 'Bills & Utilities' as CategoryType, icon: Receipt, amount: 800 },
                        { name: 'Healthcare' as CategoryType, icon: Heart, amount: 150 }
                      ].map(category => {
                        const Icon = category.icon;
                        const currentSpending = spendingByCategory[category.name] || 0;
                        const isOverSuggested = currentSpending > category.amount;
                        return (
                          <button
                            key={category.name}
                            onClick={() => handleSaveCategory(category.name, isOverSuggested ? Math.ceil(currentSpending * 1.2 / 50) * 50 : category.amount)}
                            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group relative overflow-hidden"
                          >
                            {currentSpending > 0 && (
                              <div 
                                className={`absolute bottom-0 left-0 right-0 ${isOverSuggested ? 'bg-red-100' : 'bg-orange-100'} transition-all`}
                                style={{ height: `${Math.min((currentSpending / category.amount) * 100, 100)}%` }}
                              />
                            )}
                            <div className="relative">
                              <Icon className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                              <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                              <div className="text-xs text-gray-500">
                                {isOverSuggested ? formatCurrency(Math.ceil(currentSpending * 1.2 / 50) * 50) : formatCurrency(category.amount)}/mo
                              </div>
                              {currentSpending > 0 && (
                                <div className={`text-xs mt-1 font-medium ${isOverSuggested ? 'text-red-600' : 'text-orange-600'}`}>
                                  Spent: {formatCurrency(currentSpending)}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => { setEditingCategory(undefined); setShowModal(true); }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Create Custom Budget
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                    {displayCategories.map((category) => (
                      <CategoryCard key={category.name} category={category} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Budget Insights */}
            {topSpendingCategory && totals.totalBudgeted > 0 && (
              <div className="flex-shrink-0 bg-white rounded-2xl p-4 mx-6 mb-6">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Budget Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <p className="text-orange-800">
                      <span className="font-semibold">Top Spending:</span> {topSpendingCategory.name} ({formatCurrency(topSpendingCategory.spent)})
                    </p>
                    <p className="text-orange-800">
                      <span className="font-semibold">Budgeted Categories:</span> {budgetCategories.length} of {TRANSACTION_CATEGORIES.length}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-orange-800">
                      <span className="font-semibold">Savings Rate:</span> {formatPercentage(savingsRate)}
                    </p>
                    <p className="text-orange-800">
                      <span className="font-semibold">Recommendation:</span> {unbudgetedSpending > 100 ? 'Set budgets for untracked categories' : totals.totalRemaining > 0 ? 'Consider increasing savings goals' : 'Review overspent categories'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'Trends' ? (
          <div className="flex-1 overflow-hidden mx-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Spending Trends Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Spending Trends</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                    const height = Math.random() * 80 + 20;
                    const isCurrentMonth = index === 5;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full">
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              isCurrentMonth ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                            style={{ height: `${height * 2}px` }}
                          />
                          {isCurrentMonth && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600">
                              {formatCurrency(totals.totalSpent)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="relative h-64 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simple pie chart visualization */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {budgetCategories.length > 0 ? (
                        budgetCategories.map((category, index) => {
                          const total = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
                          const percentage = total > 0 ? (category.spent / total) * 100 : 0;
                          const startAngle = budgetCategories.slice(0, index).reduce((sum, cat) => 
                            sum + (total > 0 ? (cat.spent / total) * 360 : 0), 0
                          );
                          const endAngle = startAngle + (total > 0 ? (category.spent / total) * 360 : 0);
                          
                          const colors = ['#f97316', '#fb923c', '#fed7aa', '#ffedd5', '#ea580c', '#dc2626'];
                          const color = colors[index % colors.length];
                          
                          return (
                            <circle
                              key={category.name}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={color}
                              strokeWidth="20"
                              strokeDasharray={`${percentage * 2.51} 251.2`}
                              strokeDashoffset={`${-startAngle * 2.51 / 360}`}
                              className="transition-all duration-500"
                            />
                          );
                        })
                      ) : (
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalSpent)}</p>
                        <p className="text-xs text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 space-y-2 text-sm">
                    {budgetCategories.slice(0, 5).map((category, index) => {
                      const colors = ['#f97316', '#fb923c', '#fed7aa', '#ffedd5', '#ea580c'];
                      return (
                        <div key={category.name} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index % colors.length] }} />
                          <span className="text-gray-700">{category.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Spending Categories</h3>
                <div className="space-y-3">
                  {[...budgetCategories]
                    .sort((a, b) => b.spent - a.spent)
                    .slice(0, 5)
                    .map((category) => {
                      const maxSpent = Math.max(...budgetCategories.map(c => c.spent));
                      const percentage = maxSpent > 0 ? (category.spent / maxSpent) * 100 : 0;
                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(category.spent)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Year-over-Year Comparison */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Year-over-Year Comparison</h3>
                <div className="space-y-4">
                  {budgetCategories.slice(0, 4).map(category => {
                    const lastYear = Math.random() * 1000 + 500;
                    const thisYear = category.spent;
                    const change = ((thisYear - lastYear) / lastYear) * 100;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          <span className={`text-sm font-bold flex items-center ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {formatPercentage(Math.abs(change))}
                          </span>
                        </div>
                        <div className="flex space-x-2 h-6">
                          <div className="flex-1 bg-gray-200 rounded flex items-center px-2">
                            <div className="bg-gray-400 h-2 rounded" style={{ width: `${(lastYear / 2000) * 100}%` }} />
                          </div>
                          <div className="flex-1 bg-orange-100 rounded flex items-center px-2">
                            <div className="bg-orange-500 h-2 rounded" style={{ width: `${(thisYear / 2000) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden mx-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Forecast Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Spending Forecast</h3>
                <p className="text-sm text-gray-600 mb-4">Based on your current spending patterns</p>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                    const projected = totals.totalSpent * (1 + (Math.random() * 0.2 - 0.1));
                    const height = (projected / (totals.totalSpent * 1.5)) * 100;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full">
                          <div 
                            className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-300 opacity-70"
                            style={{ height: `${height * 2}px` }}
                          />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">
                            {formatCurrency(projected)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget vs Actual Forecast */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Budget vs Projected Spending</h3>
                <div className="space-y-4">
                  {budgetCategories.map(category => {
                    const projectedSpending = category.spent * 1.1;
                    const percentOfBudget = category.budgeted > 0 ? (projectedSpending / category.budgeted) * 100 : 0;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          <span className={`text-sm font-bold ${percentOfBudget > 100 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(projectedSpending)} / {formatCurrency(category.budgeted)}
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              percentOfBudget > 100 ? 'bg-red-500' : percentOfBudget > 80 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentOfBudget, 100)}%` }}
                          />
                          {percentOfBudget > 100 && (
                            <div className="absolute right-0 top-0 h-3 bg-red-600 rounded-r-full animate-pulse" 
                              style={{ width: '10px' }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Savings Projection */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Projected Savings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-sm text-green-800 font-medium">End of Year</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.totalRemaining * 6)}</p>
                    <p className="text-xs text-green-700 mt-1">If you maintain current budget</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-blue-800 font-medium">With 10% Reduction</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totals.totalRemaining * 6 * 1.6)}</p>
                    <p className="text-xs text-blue-700 mt-1">Reduce spending by 10%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <p className="text-sm text-purple-800 font-medium">Emergency Fund Goal</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(totals.totalSpent * 3)}</p>
                    <p className="text-xs text-purple-700 mt-1">3 months of expenses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <BudgetModal
          isOpen={showModal}
          onClose={() => { 
            setShowModal(false); 
            setEditingCategory(undefined); 
          }}
          category={editingCategory}
          currentBudget={editingCategory ? budgetCategories.find(cat => cat.name === editingCategory)?.budgeted : undefined}
          onSave={handleSaveCategory}
          isEditing={!!editingCategory && budgetCategories.some(cat => cat.name === editingCategory)}
          existingCategories={budgetCategories.map(cat => cat.name)}
        />
      </div>
    </div>
  );
};

export default Budget;