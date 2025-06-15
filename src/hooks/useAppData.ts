// hooks/useAppData.ts
import { useState, useCallback } from 'react';
import type { 
  Account, 
  Transaction, 
  Goal, 
  BudgetCategory, 
  Investment, 
  TaxData, 
  InsurancePolicy, 
  Alert, 
  SmartInsight, 
  ChatMessage,
  NewTransactionForm,
  NewAccountForm,
  NewGoalForm,
  AppDataReturn
} from '../types';

export const useAppData = (): AppDataReturn => {
  // Initial data states - ALL EMPTY for new users
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Default tax data for new users
  const [taxData] = useState<TaxData>({
    estimatedRefund: 0,
    taxableIncome: 0,
    deductions: 0,
    effectiveRate: 0,
    documents: []
  });

  // Empty insurance policies
  const [insurancePolicies] = useState<InsurancePolicy[]>([]);

  // Empty alerts
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Empty smart insights initially
  const [smartInsights] = useState<SmartInsight[]>([]);

  // Initial AI chat message for new users
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      sender: 'ai', 
      message: "Hello! I'm your AI financial advisor. Once you connect your accounts and add some financial data, I'll be able to provide personalized insights and recommendations. How can I help you get started?",
      timestamp: new Date()
    }
  ]);

  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Form states
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    merchant: '',
    amount: '',
    category: 'Food & Dining',
    account: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
    tags: '',
    recurring: false
  });

  const [newAccount, setNewAccount] = useState<NewAccountForm>({
    name: '',
    type: 'cash',
    balance: '',
    institution: '',
    accountNumber: ''
  });

  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    name: '',
    target: '',
    current: '',
    type: 'savings',
    monthlyContribution: '',
    deadline: ''
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Transaction handlers
  const handleAddTransaction = useCallback((): void => {
    if (!newTransaction.merchant || !newTransaction.amount) return;
    
    const transaction: Transaction = {
      id: transactions.length + 1,
      merchant: newTransaction.merchant,
      amount: parseFloat(newTransaction.amount) * (parseFloat(newTransaction.amount) > 0 ? 1 : -1),
      category: newTransaction.category,
      account: newTransaction.account,
      date: newTransaction.date,
      location: newTransaction.location,
      notes: newTransaction.notes,
      tags: newTransaction.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      recurring: newTransaction.recurring,
      verified: true
    };
    
    setTransactions(prev => [transaction, ...prev]);
    
    // Update budget spending if category exists
    const categoryIndex = budgetCategories.findIndex(cat => cat.name === transaction.category);
    if (categoryIndex !== -1 && transaction.amount < 0) {
      setBudgetCategories(prev => {
        const updated = [...prev];
        updated[categoryIndex].spent += Math.abs(transaction.amount);
        updated[categoryIndex].remaining -= Math.abs(transaction.amount);
        return updated;
      });
    }
    
    // Update account balance if account exists
    const accountIndex = accounts.findIndex(acc => acc.name === transaction.account);
    if (accountIndex !== -1) {
      setAccounts(prev => {
        const updated = [...prev];
        updated[accountIndex].balance += transaction.amount;
        updated[accountIndex].lastUpdate = 'Just now';
        return updated;
      });
    }
    
    setNewTransaction({
      merchant: '',
      amount: '',
      category: 'Food & Dining',
      account: accounts.length > 0 ? accounts[0].name : '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: '',
      tags: '',
      recurring: false
    });
  }, [newTransaction, transactions.length, budgetCategories, accounts]);

  const handleEditTransaction = useCallback((transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setNewTransaction({
      merchant: transaction.merchant,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      account: transaction.account,
      date: transaction.date,
      location: transaction.location,
      notes: transaction.notes,
      tags: transaction.tags.join(', '),
      recurring: transaction.recurring
    });
  }, []);

  const handleDeleteTransaction = useCallback((transactionId: number): void => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  }, []);

  // Account handlers
  const handleAddAccount = useCallback((): void => {
    if (!newAccount.name || !newAccount.institution) return;
    
    const account: Account = {
      id: accounts.length + 1,
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance) || 0,
      institution: newAccount.institution,
      accountNumber: `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      routing: '021000021',
      connected: true,
      autoSync: true,
      lastUpdate: 'Just now',
      icon: newAccount.type === 'cash' ? 'cc' : newAccount.type === 'credit' ? 'cc' : newAccount.type === 'investment' ? 'iv' : newAccount.type === 'loan' ? 'ln' : 'cc'
    };
    
    setAccounts(prev => [...prev, account]);
    
    // Update the default account in new transaction form
    if (accounts.length === 0) {
      setNewTransaction(prev => ({ ...prev, account: account.name }));
    }
    
    setNewAccount({
      name: '',
      type: 'cash',
      balance: '',
      institution: '',
      accountNumber: ''
    });
  }, [newAccount, accounts]);

  const refreshAccounts = useCallback((): void => {
    setAccounts(prev => prev.map(account => ({
      ...account,
      lastUpdate: 'Just now'
    })));
  }, []);

  const toggleAccountConnection = useCallback((accountId: number): void => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, connected: !account.connected }
        : account
    ));
  }, []);

  // Goal handlers
  const handleAddGoal = useCallback((): void => {
    if (!newGoal.name || !newGoal.target) return;
    
    const goal: Goal = {
      id: goals.length + 1,
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      type: newGoal.type,
      monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
      deadline: newGoal.deadline,
      priority: goals.length + 1,
      emoji: newGoal.type === 'debt' ? '💳' : '💰',
      linkedAccounts: []
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal({
      name: '',
      target: '',
      current: '',
      type: 'savings',
      monthlyContribution: '',
      deadline: ''
    });
  }, [newGoal, goals.length]);

  const updateGoalProgress = useCallback((goalId: number, amount: number): void => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.max(0, goal.current + amount) }
        : goal
    ));
  }, []);

  const deleteGoal = useCallback((goalId: number): void => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  }, []);

  // Budget handlers
  const updateBudgetCategory = useCallback((categoryName: string, newBudget: number): void => {
    setBudgetCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { ...cat, budgeted: newBudget, remaining: newBudget - cat.spent }
        : cat
    ));
  }, []);

  const addBudgetCategory = useCallback((name: string, budget: number): void => {
    const newCategory: BudgetCategory = {
      name,
      budgeted: budget,
      spent: 0,
      remaining: budget,
      lastMonth: 0,
      yearToDate: 0,
      trend: 'stable'
    };
    setBudgetCategories(prev => [...prev, newCategory]);
  }, []);

  // Investment handlers
  const addInvestment = useCallback((symbol: string, shares: string, price: string): void => {
    const investment: Investment = {
      symbol: symbol.toUpperCase(),
      shares: parseInt(shares),
      currentPrice: parseFloat(price),
      totalValue: parseInt(shares) * parseFloat(price),
      change: 0,
      changePercent: 0,
      sector: 'Unknown'
    };
    setInvestments(prev => [...prev, investment]);
  }, []);

  const updateInvestmentPrices = useCallback((): void => {
    setInvestments(prev => prev.map(inv => {
      const changePercent = (Math.random() - 0.5) * 0.1;
      const newPrice = inv.currentPrice * (1 + changePercent);
      const change = newPrice - inv.currentPrice;
      return {
        ...inv,
        currentPrice: newPrice,
        totalValue: inv.shares * newPrice,
        change: change * inv.shares,
        changePercent: changePercent * 100
      };
    }));
  }, []);

  // AI Chat handlers
  const handleSendMessage = useCallback((): void => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "I'd be happy to help! To provide better insights, try connecting your bank accounts or adding some transactions first.",
        "That's a great question! Once you have some financial data in the system, I can give you more personalized advice.",
        "I can help you with budgeting, saving strategies, and financial planning. Start by adding your accounts to get personalized recommendations.",
        "Great question! As you add more financial data, I'll be able to provide specific insights about your spending patterns and suggest improvements.",
        "I'm here to help with your financial journey! Connect your accounts or add some transactions to get started with personalized advice."
      ];
      
      const aiResponse: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'ai',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setChatMessages(prev => [...prev, aiResponse]);
    }, 2000);
  }, [chatInput, chatMessages.length]);

  // Notification handlers
  const markNotificationRead = useCallback((alertId: number): void => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  }, []);

  const deleteNotification = useCallback((alertId: number): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Export handlers
  const exportData = useCallback((format: string, timeRange: string): void => {
    if (transactions.length === 0) {
      return;
    }

    const data = {
      transactions: transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        const monthsAgo = timeRange === 'This Month' ? 1 : 
                         timeRange === 'Last 3 Months' ? 3 :
                         timeRange === 'Last 6 Months' ? 6 :
                         timeRange === 'This Year' ? 12 : 1000;
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        return transactionDate >= cutoffDate;
      }),
      accounts,
      budgetCategories,
      goals
    };
    
    if (format === 'csv') {
      const csv = transactions.map(t => 
        `${t.date},${t.merchant},${t.amount},${t.category},${t.account}`
      ).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pennie-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  }, [transactions, accounts, budgetCategories, goals]);

  return {
    // Data
    accounts,
    transactions,
    goals,
    budgetCategories,
    investments,
    taxData,
    insurancePolicies,
    alerts,
    smartInsights,
    chatMessages,
    
    // Form states
    newTransaction,
    setNewTransaction,
    newAccount,
    setNewAccount,
    newGoal,
    setNewGoal,
    editingTransaction,
    setEditingTransaction,
    editingGoal,
    setEditingGoal,
    chatInput,
    setChatInput,
    isTyping,
    
    // Action handlers
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleAddAccount,
    handleAddGoal,
    updateGoalProgress,
    deleteGoal,
    updateBudgetCategory,
    addBudgetCategory,
    addInvestment,
    updateInvestmentPrices,
    handleSendMessage,
    markNotificationRead,
    deleteNotification,
    exportData,
    refreshAccounts,
    toggleAccountConnection,
    
    // Setters
    setAccounts,
    setTransactions,
    setGoals,
    setBudgetCategories,
    setInvestments,
    setAlerts,
  };
};