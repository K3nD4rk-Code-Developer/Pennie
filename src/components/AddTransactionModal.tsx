import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { AddTransactionModalProps, CategoryType } from '../types';
import { CATEGORIES } from '../utils/constants';

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  showAddTransaction, 
  setShowAddTransaction, 
  newTransaction, 
  setNewTransaction, 
  editingTransaction, 
  setEditingTransaction,
  handleAddTransaction,
  accounts
}) => {
  // Add state for transaction type
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const transactionTypeRef = useRef<'expense' | 'income'>('expense');

  // Set transaction type based on editing transaction
  useEffect(() => {
    if (editingTransaction) {
      const type = editingTransaction.amount > 0 ? 'income' : 'expense';
      setTransactionType(type);
      transactionTypeRef.current = type;
    } else {
      setTransactionType('expense'); // Default to expense for new transactions
      transactionTypeRef.current = 'expense';
    }
  }, [editingTransaction]);

  // Update the amount field whenever transaction type changes
  useEffect(() => {
    transactionTypeRef.current = transactionType;
    if (newTransaction.amount) {
      const amount = Math.abs(parseFloat(newTransaction.amount));
      const signedAmount = transactionType === 'income' ? amount : -amount;
      setNewTransaction({ ...newTransaction, amount: signedAmount.toString() });
    }
  }, [transactionType]);

  if (!showAddTransaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTransaction();
    setShowAddTransaction(false);
    setEditingTransaction(null);
    setTransactionType('expense'); // Reset to default
  };

  const handleClose = () => {
    setShowAddTransaction(false);
    setEditingTransaction(null);
    setTransactionType('expense'); // Reset to default
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 mb-2">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  transactionType === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setTransactionType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  transactionType === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setTransactionType('income')}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === 'income' ? 'Source' : 'Merchant'}
            </label>
            <input 
              id="merchant"
              type="text" 
              required
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.merchant}
              onChange={(e) => setNewTransaction({...newTransaction, merchant: e.target.value})}
              placeholder={transactionType === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Starbucks'}
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input 
                id="amount"
                type="number" 
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-400 bg-white text-black rounded-lg pl-8 pr-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                value={Math.abs(parseFloat(newTransaction.amount) || 0).toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  const amount = parseFloat(value) || 0;
                  const signedAmount = transactionType === 'income' ? amount : -amount;
                  setNewTransaction({...newTransaction, amount: signedAmount.toString()});
                }}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select 
              id="category"
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value as CategoryType})}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input 
              id="date"
              type="date" 
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input 
              id="location"
              type="text" 
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.location}
              onChange={(e) => setNewTransaction({...newTransaction, location: e.target.value})}
              placeholder="New York, NY"
            />
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input 
              id="notes"
              type="text" 
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.notes}
              onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
              placeholder="Morning coffee"
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input 
              id="tags"
              type="text" 
              className="w-full border border-gray-400 bg-white text-black rounded-lg px-4 py-3 shadow-sm focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              value={newTransaction.tags}
              onChange={(e) => setNewTransaction({...newTransaction, tags: e.target.value})}
              placeholder="coffee, breakfast"
            />
          </div>
          
          <div className="flex items-center">
            <input 
              id="recurring"
              type="checkbox" 
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={newTransaction.recurring}
              onChange={(e) => setNewTransaction({...newTransaction, recurring: e.target.checked})}
            />
            <label htmlFor="recurring" className="text-sm text-gray-700">
              Recurring transaction
            </label>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
            <button 
              type="button"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                transactionType === 'income' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {editingTransaction ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;