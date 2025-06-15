import type { CategoryType } from '../types';

export const CATEGORIES: readonly CategoryType[] = [
  'Food & Dining', 
  'Auto & Transport', 
  'Shopping', 
  'Bills & Utilities', 
  'Income', 
  'Entertainment', 
  'Healthcare', 
  'Education', 
  'Travel', 
  'Personal Care', 
  'Gifts & Donations', 
  'Business', 
  'Taxes', 
  'Other'
] as const;

export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'investment', label: 'Investment' },
  { value: 'loan', label: 'Loan' }
] as const;

export const GOAL_TYPES = [
  { value: 'savings', label: 'Savings Goal' },
  { value: 'debt', label: 'Pay Off Debt' }
] as const;

export const TIME_RANGES = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: 'ALL', label: 'All Time' }
] as const;

export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Report' },
  { value: 'excel', label: 'Excel Spreadsheet' },
  { value: 'csv', label: 'CSV Data' }
] as const;

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'merchant', label: 'Merchant' }
] as const;

// Default values
export const DEFAULT_TRANSACTION_FORM = {
  merchant: '',
  amount: '',
  category: 'Food & Dining' as CategoryType,
  account: 'Chase Checking',
  date: new Date().toISOString().split('T')[0],
  location: '',
  notes: '',
  tags: '',
  recurring: false
};

export const DEFAULT_ACCOUNT_FORM = {
  name: '',
  type: 'cash' as const,
  balance: '',
  institution: '',
  accountNumber: ''
};

export const DEFAULT_GOAL_FORM = {
  name: '',
  target: '',
  current: '',
  type: 'savings' as const,
  monthlyContribution: '',
  deadline: ''
};