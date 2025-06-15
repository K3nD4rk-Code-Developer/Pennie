// hooks/useFilters.ts
import { useState, useMemo } from 'react';
import type { Transaction, TransactionFilters } from '../types';

interface UseFiltersProps {
  transactions: Transaction[];
  accounts: { id: number; name: string }[];
}

interface UseFiltersReturn {
  filters: TransactionFilters;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  filteredTransactions: Transaction[];
  clearFilters: () => void;
  updateFilter: (key: keyof TransactionFilters, value: string) => void;
}

const defaultFilters: TransactionFilters = {
  search: '',
  category: 'all',
  account: 'all',
  dateRange: 'all',
  sortBy: 'date'
};

export const useFilters = ({ transactions, accounts }: UseFiltersProps): UseFiltersReturn => {
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Search filter
      const matchesSearch = !filters.search || 
        transaction.merchant.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filters.search.toLowerCase());

      // Category filter
      const matchesCategory = filters.category === 'all' || 
        transaction.category === filters.category;

      // Account filter
      const matchesAccount = filters.account === 'all' || 
        transaction.account === filters.account;

      // Date range filter
      const matchesDateRange = filters.dateRange === 'all' || (() => {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return transactionDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return transactionDate >= quarterAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return transactionDate >= yearAgo;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesAccount && matchesDateRange;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'amount':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'merchant':
          return a.merchant.localeCompare(b.merchant);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'account':
          return a.account.localeCompare(b.account);
        default: // date
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [transactions, filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    setFilters,
    filteredTransactions,
    clearFilters,
    updateFilter
  };
};

export default useFilters;