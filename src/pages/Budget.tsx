import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, TrendingUp, TrendingDown, AlertCircle, Target, Calendar, DollarSign, PieChart, BarChart3, CheckCircle, X, Coffee, Car, ShoppingCart, Tv, Receipt, Heart, Activity, ArrowUp, ArrowDown, PiggyBank } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { calculateBudgetTotals } from '../utils/calculations';
import type { BudgetCategory, PageProps } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: BudgetCategory;
  onSave: (name: string, budget: number) => void;
  isEditing?: boolean;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, category, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    budgeted: category?.budgeted?.toString() || ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.budgeted) return;
    onSave(formData.name, parseFloat(formData.budgeted));
    onClose();
    setFormData({ name: '', budgeted: '' });
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', budgeted: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Budget Category' : 'Add Budget Category'}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Housing, Food, Transportation"
              disabled={isEditing}
            />
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
                value={formData.budgeted}
                onChange={(e) => setFormData({ ...formData, budgeted: e.target.value })}
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
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
  updateBudgetCategory,
  addBudgetCategory
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('Budget');

  // Calculate totals with safety checks
  const totals = useMemo(() => {
    if (!budgetCategories || budgetCategories.length === 0) {
      return { totalBudgeted: 0, totalSpent: 0, totalRemaining: 0 };
    }
    return calculateBudgetTotals(budgetCategories);
  }, [budgetCategories]);

  const savingsRate = totals.totalBudgeted > 0 ? 
    ((totals.totalRemaining / (totals.totalBudgeted + totals.totalRemaining)) * 100) : 0;

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Food & Dining': <Coffee className="w-5 h-5" />,
      'Auto & Transport': <Car className="w-5 h-5" />,
      'Shopping': <ShoppingCart className="w-5 h-5" />,
      'Entertainment': <Tv className="w-5 h-5" />,
      'Bills & Utilities': <Receipt className="w-5 h-5" />,
      'Healthcare': <Heart className="w-5 h-5" />,
    };
    return iconMap[categoryName] || <DollarSign className="w-5 h-5" />;
  };

  // Get category status
  const getBudgetStatus = (category: BudgetCategory) => {
    const percentage = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
    if (percentage > 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage > 80) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  // Get trend icon
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-red-600" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-green-600" />;
      default:
        return <Activity className="w-3 h-3 text-gray-600" />;
    }
  };

  const handleSaveCategory = (name: string, budget: number) => {
    if (editingCategory) {
      updateBudgetCategory(editingCategory.name, budget);
    } else {
      addBudgetCategory(name, budget);
    }
    setEditingCategory(undefined);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const getTopSpendingCategory = () => {
    if (!budgetCategories || budgetCategories.length === 0) return null;
    return budgetCategories.reduce((prev, current) => 
      (prev.spent > current.spent) ? prev : current
    );
  };

  const CategoryCard = ({ category }: { category: BudgetCategory }) => {
    const { status, color, bgColor } = getBudgetStatus(category);
    const percentage = Math.min((category.spent / category.budgeted) * 100, 100);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 ${bgColor}`}>
              {getCategoryIcon(category.name)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className={`text-sm font-medium ${color}`}>
                {status === 'over' ? 'Over Budget' : status === 'warning' ? 'Near Limit' : 'On Track'}
              </p>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent</span>
            <span className="font-semibold">{formatCurrency(category.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget</span>
            <span className="font-semibold">{formatCurrency(category.budgeted)}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status === 'over' ? 'bg-red-500' : status === 'warning' ? 'bg-orange-500' : 'bg-orange-500'
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

          {/* Additional Details */}
          {(category.lastMonth !== undefined || category.yearToDate !== undefined) && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
              {category.lastMonth !== undefined && (
                <div>
                  <span className="text-gray-500">Last Month:</span>
                  <div className="font-medium">{formatCurrency(category.lastMonth)}</div>
                </div>
              )}
              {category.yearToDate !== undefined && (
                <div>
                  <span className="text-gray-500">Year to Date:</span>
                  <div className="font-medium">{formatCurrency(category.yearToDate)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show empty state if no budget categories
  if (!budgetCategories || budgetCategories.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
        <div className="h-full max-w-full mx-auto flex flex-col">
          <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Budget Overview</h1>
            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center mx-6 mb-6 overflow-hidden">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <PieChart className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Budget Categories Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Create budget categories to track your spending and manage your finances better. 
              Start with common categories like Food, Transportation, or Entertainment.
            </p>
            
            {            /* Suggested Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 px-4">
              {[
                { name: 'Food & Dining', icon: Coffee, amount: 600 },
                { name: 'Auto & Transport', icon: Car, amount: 400 },
                { name: 'Shopping', icon: ShoppingCart, amount: 300 },
                { name: 'Entertainment', icon: Tv, amount: 200 },
                { name: 'Bills & Utilities', icon: Receipt, amount: 800 },
                { name: 'Healthcare', icon: Heart, amount: 150 }
              ].map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => {
                      addBudgetCategory(category.name, category.amount);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group"
                  >
                    <Icon className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(category.amount)}/mo</div>
                  </button>
                );
              })}
            </div>

            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              onClick={() => setShowModal(true)}
            >
              Create Your First Budget Category
            </button>
          </div>

          {/* Modal */}
          <BudgetModal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingCategory(undefined); }}
            category={editingCategory}
            onSave={handleSaveCategory}
            isEditing={!!editingCategory}
          />
        </div>
      </div>
    );
  }

  const topSpendingCategory = getTopSpendingCategory();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Overview</h1>
              <p className="text-gray-600">Track your spending and stay on top of your financial goals</p>
            </div>
            <div className="flex space-x-2">
              {['Budget', 'Trends', 'Forecast'].map(tab => (
                <button 
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
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
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button
              onClick={() => { setEditingCategory(undefined); setShowModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Budgeted</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalBudgeted)}</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPercentage(savingsRate)}
                </p>
                <p className="text-sm text-gray-500">Of income</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mx-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Overall Budget Progress</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Spent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Remaining</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">Budget Progress</span>
              <span className="font-medium">
                {totals.totalBudgeted > 0 ? formatPercentage((totals.totalSpent / totals.totalBudgeted) * 100) : '0%'} spent
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  totals.totalSpent > totals.totalBudgeted ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${totals.totalBudgeted > 0 ? Math.min((totals.totalSpent / totals.totalBudgeted) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>$0</span>
              <span>{formatCurrency(totals.totalBudgeted)}</span>
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden mx-6 mb-6 flex flex-col min-h-0">
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Budget Categories</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>June 2025</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {budgetCategories.map((category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        {topSpendingCategory && (
          <div className="flex-shrink-0 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 mx-6 mb-6">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Budget Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="text-orange-800">
                  <span className="font-semibold">Top Spending Category:</span> {topSpendingCategory.name} ({formatCurrency(topSpendingCategory.spent)})
                </p>
                <p className="text-orange-800">
                  <span className="font-semibold">Budget Performance:</span> Categories under 80% show good control
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-orange-800">
                  <span className="font-semibold">Savings Rate:</span> {formatPercentage(savingsRate)} of your budget
                </p>
                <p className="text-orange-800">
                  <span className="font-semibold">Recommendation:</span> {totals.totalRemaining > 0 ? 'Consider increasing emergency fund contributions' : 'Review spending in over-budget categories'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <BudgetModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingCategory(undefined); }}
          category={editingCategory}
          onSave={handleSaveCategory}
          isEditing={!!editingCategory}
        />
      </div>
    </div>
  );
};

export default Budget;