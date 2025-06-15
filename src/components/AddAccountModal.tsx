import React from 'react';
import { X } from 'lucide-react';
import type { AddAccountModalProps } from '../types';
import { ACCOUNT_TYPES } from '../utils/constants';

const AddAccountModal: React.FC<AddAccountModalProps> = ({ 
  showAddAccount, 
  setShowAddAccount, 
  newAccount, 
  setNewAccount, 
  handleAddAccount 
}) => {
  if (!showAddAccount) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddAccount();
    setShowAddAccount(false);
  };

  const handleClose = () => {
    setShowAddAccount(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Connect Bank Account</h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input 
              id="account-name"
              type="text" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newAccount.name}
              onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
              placeholder="Chase Checking"
            />
          </div>
          
          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select 
              id="account-type"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newAccount.type}
              onChange={(e) => setNewAccount({...newAccount, type: e.target.value as any})}
            >
              {ACCOUNT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input 
              id="institution"
              type="text" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newAccount.institution}
              onChange={(e) => setNewAccount({...newAccount, institution: e.target.value})}
              placeholder="Chase Bank"
            />
          </div>
          
          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input 
              id="account-number"
              type="text" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newAccount.accountNumber}
              onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
              placeholder="****1234"
            />
          </div>
          
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <input 
              id="balance"
              type="number" 
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newAccount.balance}
              onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
              placeholder="1000.00"
            />
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
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Connect Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;