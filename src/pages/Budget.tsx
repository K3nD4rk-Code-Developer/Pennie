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

// Fixed CategoryCard Component
interface CategoryCardProps {
  category: BudgetCategory;
  onEdit: (categoryName: CategoryType) => void;
  onDelete: (categoryName: CategoryType) => void;
  onSetBudget: (categoryName: CategoryType, amount: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  onSetBudget 
}) => {
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

  const hasBudget = category.budgeted > 0;
  const percentage = hasBudget ? Math.min((category.spent / category.budgeted) * 100, 100) : 0;
  
  // Get status and colors
  const getStatusInfo = () => {
    if (!hasBudget) {
      return { 
        status: 'No Budget Set', 
        statusColor: 'text-gray-600', 
        bgColor: 'bg-gray-100',
        progressColor: 'bg-gray-500'
      };
    }
    
    const pct = (category.spent / category.budgeted) * 100;
    if (pct > 100) {
      return { 
        status: 'Over Budget', 
        statusColor: 'text-red-600', 
        bgColor: 'bg-red-100',
        progressColor: 'bg-red-500'
      };
    }
    if (pct > 80) {
      return { 
        status: 'Near Limit', 
        statusColor: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        progressColor: 'bg-orange-500'
      };
    }
    return { 
      status: 'On Track', 
      statusColor: 'text-green-600', 
      bgColor: 'bg-green-100',
      progressColor: 'bg-green-500'
    };
  };

  const { status, statusColor, bgColor, progressColor } = getStatusInfo();

  // Suggested budget amounts for quick setup
  const suggestedBudget = category.spent > 0 ? Math.max(Math.ceil(category.spent * 1.2 / 50) * 50, 100) : 200;

  // Simple click handlers - no event object manipulation
  const handleEditClick = () => {
    console.log('Edit clicked for:', category.name);
    onEdit(category.name as CategoryType);
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked for:', category.name);
    onDelete(category.name as CategoryType);
  };

  const handleSetBudgetClick = () => {
    console.log('Set budget clicked for:', category.name);
    onEdit(category.name as CategoryType);
  };

  const handleQuickBudget = (amount: number) => {
    console.log(`Quick budget ${amount} for:`, category.name);
    onSetBudget(category.name as CategoryType, amount);
  };

  return (
    <div className={`
      bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md
      ${hasBudget ? 'border-gray-100' : 'border-gray-200 bg-gray-50'}
    `}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* Category Info */}
        <div className="flex items-center space-x-3 flex-grow min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 ${bgColor} flex-shrink-0`}>
            {getCategoryIcon(category.name as CategoryType)}
          </div>
          <div className="min-w-0 flex-grow">
            <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
            <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1 flex-shrink-0 ml-3">
          {hasBudget ? (
            <>
              {/* Edit Button */}
              <button
                type="button"
                onClick={handleEditClick}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                title="Edit budget"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Set Budget Button */
            <button
              type="button"
              onClick={handleSetBudgetClick}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
            >
              Set Budget
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Spending Amount */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Spent</span>
          <span className="font-semibold">{formatCurrency(category.spent)}</span>
        </div>
        
        {hasBudget && (
          <>
            {/* Budget Amount */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget</span>
              <span className="font-semibold">{formatCurrency(category.budgeted)}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            
            {/* Remaining/Over Amount */}
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

        {/* Quick Budget Setup for Unbudgeted Categories */}
        {!hasBudget && category.spent > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Quick set budget:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickBudget(suggestedBudget)}
                className="flex-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
              >
                {formatCurrency(suggestedBudget)}
              </button>
              <button
                type="button"
                onClick={() => handleQuickBudget(Math.round(suggestedBudget * 1.5))}
                className="flex-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
              >
                {formatCurrency(Math.round(suggestedBudget * 1.5))}
              </button>
            </div>
          </div>
        )}
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
  const [pendingDelete, setPendingDelete] = useState<CategoryType | null>(null);

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

  // FIXED: Proper handlers with improved logic
  const handleSaveCategory = (categoryName: CategoryType, budget: number) => {
    console.log('💰 Saving budget category:', categoryName, 'Amount:', budget);
    
    // Check if this category already has a budget
    const existingCategory = budgetCategories.find(cat => cat.name === categoryName);
    
    if (existingCategory) {
      console.log('✏️ Updating existing category');
      // Update existing category directly
      setBudgetCategories(prev => 
        prev.map(cat => 
          cat.name === categoryName 
            ? { ...cat, budgeted: budget, remaining: budget - cat.spent }
            : cat
        )
      );
    } else {
      console.log('➕ Adding new category');
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
    console.log('✅ Budget category saved successfully');
  };

  // FIXED: Proper edit handler
  const handleEditCategory = (categoryName: CategoryType) => {
    console.log('🔧 Edit category:', categoryName);
    setEditingCategory(categoryName);
    setShowModal(true);
  };

  // FIXED: Proper delete handler
  const handleDeleteCategory = (categoryName: CategoryType) => {
    console.log('🗑️ Delete category:', categoryName);
    setPendingDelete(categoryName);
  };

  // FIXED: Confirm delete
  const confirmDelete = () => {
    if (pendingDelete) {
      console.log('✅ Confirming delete for:', pendingDelete);
      setBudgetCategories(prev => prev.filter(cat => cat.name !== pendingDelete));
      setPendingDelete(null);
    }
  };

  const getTopSpendingCategory = () => {
    if (budgetCategories.length === 0) return null;
    return budgetCategories.reduce((prev, current) => 
      (prev.spent > current.spent) ? prev : current
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
              onClick={() => { 
                setEditingCategory(undefined); 
                setShowModal(true); 
                console.log('➕ Add Budget button clicked');
              }}
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
                      <CategoryCard 
                        key={category.name} 
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        onSetBudget={handleSaveCategory}
                      />
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
              {/* Placeholder for Trends content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900">Trends Coming Soon</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden mx-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Placeholder for Forecast content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900">Forecast Coming Soon</h3>
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

        {/* Delete Confirmation Modal */}
        {pendingDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Budget</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the budget for <span className="font-semibold">{pendingDelete}</span>?
                <br />
                <span className="text-sm text-gray-500">This action cannot be undone.</span>
              </p>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    console.log('❌ Delete cancelled');
                    setPendingDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  onClick={() => {
                    console.log('✅ Delete confirmed for:', pendingDelete);
                    confirmDelete();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;