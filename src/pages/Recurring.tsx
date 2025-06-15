import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  DollarSign, 
  Tv, 
  Coffee, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Transaction, PageProps } from '../types';

const Recurring: React.FC<PageProps> = ({
  transactions,
  setShowAddTransaction
}) => {
  // Filter for recurring transactions
  const recurringTransactions = transactions.filter(t => t.recurring);

  // Calculate totals
  const monthlyIncome = recurringTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(recurringTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));

  const netRecurring = monthlyIncome - monthlyExpenses;

  const handleEditRecurring = (transaction: Transaction) => {
    // This would typically set the editing state and open the modal
    console.log('Edit recurring transaction:', transaction);
  };

  const handleCancelRecurring = (transactionId: number) => {
    // This would typically update the transaction to set recurring = false
    console.log('Cancel recurring transaction:', transactionId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Income':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'Entertainment':
        return <Tv className="w-6 h-6 text-pink-600" />;
      case 'Food & Dining':
        return <Coffee className="w-6 h-6 text-orange-600" />;
      default:
        return <RefreshCw className="w-6 h-6 text-gray-600" />;
    }
  };

  const getFrequencyDisplay = (transaction: Transaction) => {
    // This would ideally come from transaction data, defaulting to Monthly for now
    return 'Monthly';
  };

  const getNextPaymentDate = (transaction: Transaction) => {
    // Calculate next payment based on last transaction date
    const lastDate = new Date(transaction.date);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Recurring Transactions</h1>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Manage Schedule
          </button>
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
            onClick={() => setShowAddTransaction(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Recurring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
            <ArrowUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(monthlyIncome)}
          </div>
          <div className="text-sm text-gray-600">Recurring income</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <ArrowDown className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </div>
          <div className="text-sm text-gray-600">Recurring expenses</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Net Recurring</h3>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${netRecurring >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netRecurring)}
          </div>
          <div className="text-sm text-gray-600">Monthly net</div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Payments</h3>
          <span className="text-sm text-gray-500">Next 30 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recurringTransactions.slice(0, 3).map(transaction => (
            <div key={transaction.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{transaction.merchant}</span>
                <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Due {getNextPaymentDate(transaction)}</span>
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

      {/* Recurring Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Your Recurring Transactions</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {recurringTransactions.length} active subscriptions
              </span>
              <button className="text-blue-500 hover:text-blue-700 text-sm">
                Bulk Actions
              </button>
            </div>
          </div>
        </div>
        
        {recurringTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recurringTransactions.map(transaction => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.merchant}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.account}</span>
                        <span>•</span>
                        <span>{getFrequencyDisplay(transaction)}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                        <span>Next payment: {getNextPaymentDate(transaction)}</span>
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
                        <div className="text-xs text-gray-600 mt-1">{transaction.notes}</div>
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
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatCurrency(Math.abs(transaction.amount * 12))}/year
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                        onClick={() => handleEditRecurring(transaction)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        onClick={() => handleCancelRecurring(transaction.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No recurring transactions</h3>
            <p className="text-gray-600 mb-4">
              Set up recurring income and expenses to track your regular cash flow.
            </p>
            <button 
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 flex items-center mx-auto"
              onClick={() => setShowAddTransaction(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recurring Transaction
            </button>
          </div>
        )}
      </div>

      {/* Recurring Insights */}
      {recurringTransactions.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 text-blue-900 mb-2">💡 Recurring Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800">
                <strong>Annual Commitment:</strong> You have {formatCurrency(Math.abs(monthlyExpenses * 12))} 
                in yearly recurring expenses.
              </p>
            </div>
            <div>
              <p className="text-blue-800">
                <strong>Savings Opportunity:</strong> Review subscriptions quarterly to identify unused services.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recurring;