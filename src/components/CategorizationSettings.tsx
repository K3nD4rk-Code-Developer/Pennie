// components/CategorizationSettings.tsx
import React, { useState } from 'react';
import { 
  Settings, Plus, Trash2, Edit3, Save, X, RefreshCw, 
  Zap, AlertCircle, CheckCircle, Info 
} from 'lucide-react';
import { MERCHANT_CATEGORY_MAP, categorizeTransaction } from '../utils/merchantCategorization';
import { CATEGORIES } from '../utils/constants';
import type { CategoryType, Transaction } from '../types';

interface CategorizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
}

const CategorizationSettings: React.FC<CategorizationSettingsProps> = ({
  isOpen,
  onClose,
  transactions,
  onUpdateTransactions
}) => {
  const [customRules, setCustomRules] = useState<Record<string, CategoryType>>({});
  const [newMerchant, setNewMerchant] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Food & Dining');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessResult, setLastProcessResult] = useState<{
    count: number;
    timestamp: Date;
  } | null>(null);

  if (!isOpen) return null;

  // Get uncategorized transactions (category = 'Other')
  const uncategorizedTransactions = transactions.filter(t => t.category === 'Other');
  const uncategorizedMerchants = Array.from(new Set(uncategorizedTransactions.map(t => t.merchant)));

  // Process auto-categorization for all uncategorized transactions
  const handleAutoCategorizeBulk = async () => {
    setIsProcessing(true);
    
    // Simulate processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let categorizedCount = 0;
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.category === 'Other') {
        const newCategory = categorizeTransaction(transaction.merchant);
        if (newCategory !== 'Other') {
          categorizedCount++;
          return {
            ...transaction,
            category: newCategory,
            notes: transaction.notes.includes('Auto-categorized') 
              ? transaction.notes 
              : transaction.notes + ' (Auto-categorized)',
            tags: transaction.tags.includes('auto-categorized') 
              ? transaction.tags 
              : [...transaction.tags, 'auto-categorized']
          };
        }
      }
      return transaction;
    });
    
    onUpdateTransactions(updatedTransactions);
    setLastProcessResult({
      count: categorizedCount,
      timestamp: new Date()
    });
    setIsProcessing(false);
  };

  // Add custom merchant rule
  const handleAddCustomRule = () => {
    if (!newMerchant.trim()) return;
    
    setCustomRules(prev => ({
      ...prev,
      [newMerchant.toUpperCase().trim()]: newCategory
    }));
    
    setNewMerchant('');
    setNewCategory('Food & Dining');
  };

  // Remove custom rule
  const handleRemoveCustomRule = (merchant: string) => {
    setCustomRules(prev => {
      const updated = { ...prev };
      delete updated[merchant];
      return updated;
    });
  };

  // Get preview of what would be categorized
  const getCategorizationPreview = () => {
    return uncategorizedMerchants.map(merchant => ({
      merchant,
      suggestedCategory: categorizeTransaction(merchant),
      transactionCount: uncategorizedTransactions.filter(t => t.merchant === merchant).length
    })).filter(item => item.suggestedCategory !== 'Other');
  };

  const categorizationPreview = getCategorizationPreview();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Transaction Categorization Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Auto-Categorization Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Categorization</h3>
            
            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{uncategorizedTransactions.length}</div>
                <div className="text-sm text-blue-600">Uncategorized Transactions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{categorizationPreview.length}</div>
                <div className="text-sm text-green-600">Can Auto-Categorize</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(MERCHANT_CATEGORY_MAP).length}</div>
                <div className="text-sm text-purple-600">Built-in Rules</div>
              </div>
            </div>

            {/* Auto-Categorize Button */}
            <button
              onClick={handleAutoCategorizeBulk}
              disabled={isProcessing || categorizationPreview.length === 0}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Auto-Categorize {categorizationPreview.length} Merchants
                </>
              )}
            </button>

            {/* Last Process Result */}
            {lastProcessResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">
                    Successfully categorized {lastProcessResult.count} transactions at{' '}
                    {lastProcessResult.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {categorizationPreview.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorization Preview</h3>
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                {categorizationPreview.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.merchant}</div>
                      <div className="text-sm text-gray-500">{item.transactionCount} transactions</div>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      {item.suggestedCategory}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Rules Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Categorization Rules</h3>
            
            {/* Add New Rule */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Add New Rule</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Merchant name (e.g., 'LOCAL COFFEE SHOP')"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddCustomRule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Rules List */}
            {Object.keys(customRules).length > 0 && (
              <div className="space-y-2">
                {Object.entries(customRules).map(([merchant, category]) => (
                  <div key={merchant} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{merchant}</div>
                      <div className="text-sm text-gray-500">→ {category}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomRule(merchant)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How Auto-Categorization Works:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Exact merchant name matching (e.g., "KFC" → "Food & Dining")</li>
                  <li>Fuzzy matching for partial names</li>
                  <li>Keyword-based fallback categorization</li>
                  <li>Only affects transactions currently categorized as "Other"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorizationSettings;