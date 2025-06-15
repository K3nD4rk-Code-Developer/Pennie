import { LucideIcon } from 'lucide-react';

// Tab and Navigation Types
export type TabId = 
  | 'dashboard' 
  | 'accounts' 
  | 'transactions' 
  | 'cashflow' 
  | 'budget' 
  | 'goals' 
  | 'investments' 
  | 'credit' 
  | 'taxes' 
  | 'insurance' 
  | 'planning' 
  | 'reports' 
  | 'recurring' 
  | 'ai-advisor' 
  | 'advice';

export interface SidebarItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

// Category Types
export type CategoryType = 
  | 'Food & Dining' 
  | 'Auto & Transport' 
  | 'Shopping' 
  | 'Bills & Utilities' 
  | 'Income' 
  | 'Entertainment' 
  | 'Healthcare' 
  | 'Education' 
  | 'Travel' 
  | 'Personal Care' 
  | 'Gifts & Donations' 
  | 'Business' 
  | 'Taxes' 
  | 'Other';

export type AccountType = 'cash' | 'credit' | 'investment' | 'loan';
export type GoalType = 'savings' | 'debt';
export type AlertType = 'budget' | 'security' | 'bill' | 'investment';
export type AlertSeverity = 'high' | 'warning' | 'info' | 'positive';
export type TrendType = 'up' | 'down' | 'stable';

// Core Data Types
export interface Transaction {
  id: number;
  merchant: string;
  amount: number;
  category: CategoryType;
  account: string;
  date: string;
  location: string;
  notes: string;
  tags: string[];
  recurring: boolean;
  verified: boolean;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  lastUpdate: string;
  icon: string;
  institution: string;
  accountNumber: string;
  routing?: string;
  connected: boolean;
  autoSync: boolean;
  limit?: number;
  lastSync?: string;
  bank?: string;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  type: GoalType;
  emoji: string;
  priority: number;
  deadline: string;
  monthlyContribution: number;
  linkedAccounts: string[];
}

export interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  lastMonth: number;
  yearToDate: number;
  trend: TrendType;
}

export interface Investment {
  symbol: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
  sector: string;
}

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  date: string;
  read: boolean;
}

export interface TaxData {
  estimatedRefund: number;
  taxableIncome: number;
  deductions: number;
  effectiveRate: number;
  documents: {
    type: string;
    employer?: string;
    institution?: string;
    amount: number;
    status: 'received' | 'pending';
  }[];
}

export interface InsurancePolicy {
  type: string;
  provider: string;
  premium: number;
  coverage: number;
  renewal: string;
  status: 'active' | 'inactive';
}

export interface SmartInsight {
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

// Form Types
export interface NewTransactionForm {
  merchant: string;
  amount: string;
  category: CategoryType;
  account: string;
  date: string;
  location: string;
  notes: string;
  tags: string;
  recurring: boolean;
}

export interface NewAccountForm {
  name: string;
  type: AccountType;
  balance: string;
  institution: string;
  accountNumber: string;
}

export interface NewGoalForm {
  name: string;
  target: string;
  current: string;
  type: GoalType;
  monthlyContribution: string;
  deadline: string;
}

// Filter Types
export interface TransactionFilters {
  search: string;
  category: string;
  account: string;
  dateRange: string;
  sortBy: string;
}

// Modal Props Types
export interface AddTransactionModalProps {
  showAddTransaction: boolean;
  setShowAddTransaction: (show: boolean) => void;
  newTransaction: NewTransactionForm;
  setNewTransaction: (transaction: NewTransactionForm) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  handleAddTransaction: () => void;
  accounts: Account[];
}

export interface AddAccountModalProps {
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
  newAccount: NewAccountForm;
  setNewAccount: (account: NewAccountForm) => void;
  handleAddAccount: () => void;
}

export interface GoalSetupModalProps {
  showGoalSetup: boolean;
  setShowGoalSetup: (show: boolean) => void;
  newGoal: NewGoalForm;
  setNewGoal: (goal: NewGoalForm) => void;
  editingGoal: Goal | null;
  setEditingGoal: (goal: Goal | null) => void;
  handleAddGoal: () => void;
}

export interface NotificationsDropdownProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  alerts: Alert[];
  markNotificationRead: (id: number) => void;
  deleteNotification: (id: number) => void;
}

export interface ExportModalProps {
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  exportData: (format: string, timeRange: string) => void;
}

// Chat Types
export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

// App Data Hook Types
export interface AppDataReturn {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  budgetCategories: BudgetCategory[];
  investments: Investment[];
  taxData: TaxData;
  insurancePolicies: InsurancePolicy[];
  alerts: Alert[];
  smartInsights: SmartInsight[];
  chatMessages: ChatMessage[];
  
  // Form states
  newTransaction: NewTransactionForm;
  setNewTransaction: (transaction: NewTransactionForm) => void;
  newAccount: NewAccountForm;
  setNewAccount: (account: NewAccountForm) => void;
  newGoal: NewGoalForm;
  setNewGoal: (goal: NewGoalForm) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  editingGoal: Goal | null;
  setEditingGoal: (goal: Goal | null) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  isTyping: boolean;
  
  // Handlers
  handleAddTransaction: () => void;
  handleEditTransaction: (transaction: Transaction) => void;
  handleDeleteTransaction: (id: number) => void;
  handleAddAccount: () => void;
  handleAddGoal: () => void;
  updateGoalProgress: (goalId: number, amount: number) => void;
  deleteGoal: (goalId: number) => void;
  updateBudgetCategory: (name: string, budget: number) => void;
  addBudgetCategory: (name: string, budget: number) => void;
  addInvestment: (symbol: string, shares: string, price: string) => void;
  updateInvestmentPrices: () => void;
  handleSendMessage: () => void;
  markNotificationRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  exportData: (format: string, timeRange: string) => void;
  refreshAccounts: () => void;
  toggleAccountConnection: (accountId: number) => void;
  
  // Setters (for pages that need direct access)
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  setInvestments: (investments: Investment[]) => void;
  setAlerts: (alerts: Alert[]) => void;
}

// Extended interface for Accounts page
export interface AccountsProps extends AppDataReturn {
  setActiveTab: (tab: TabId) => void;
  setShowAddTransaction: (show: boolean) => void;
  setShowAddAccount: (show: boolean) => void;
  setShowGoalSetup: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  refreshAccounts: () => void;
  toggleAccountConnection: (accountId: number) => void;
}

// Page Props Types with all required properties
export interface PageProps extends AppDataReturn {
  setActiveTab: (tab: TabId) => void;
  setShowAddTransaction: (show: boolean) => void;
  setShowAddAccount: (show: boolean) => void;
  setShowGoalSetup: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  
  // Transaction filtering props (required for Transactions page)
  filteredTransactions: Transaction[];
  transactionFilters: TransactionFilters;
  setTransactionFilters: (filters: TransactionFilters) => void;
}

// Utility Types
export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
export type SortOption = 'date' | 'amount' | 'merchant';