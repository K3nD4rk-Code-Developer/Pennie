import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage'; // Import your existing localStorage hook
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
  // NOW USING LOCALSTORAGE FOR PERSISTENCE!
  const [accounts, setAccounts] = useLocalStorage<Account[]>('pennie_accounts', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('pennie_transactions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('pennie_goals', []);
  const [budgetCategories, setBudgetCategories] = useLocalStorage<BudgetCategory[]>('pennie_budget_categories', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('pennie_investments', []);
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('pennie_alerts', []);

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

  // Empty smart insights initially
  const [smartInsights] = useState<SmartInsight[]>([]);

  // Initial AI chat message for new users
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('pennie_chat_messages', [
    { 
      id: 1, 
      sender: 'ai', 
      message: "Hello I'm Pennie, your personal AI financial advisor! Once you connect your accounts and add some financial data, I'll be able to provide personalized insights and recommendations. How can I help you get started?",
      timestamp: new Date()
    }
  ]);

  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Form states - these don't need persistence
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
      id: Date.now(), // Use timestamp for unique ID
      merchant: newTransaction.merchant,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      account: newTransaction.account,
      date: newTransaction.date,
      location: newTransaction.location,
      notes: newTransaction.notes,
      tags: newTransaction.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      recurring: newTransaction.recurring,
      verified: true
    };
    
    // This will automatically save to localStorage because we're using useLocalStorage
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
    
    // Reset form
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
  }, [newTransaction, budgetCategories, accounts, setTransactions, setBudgetCategories, setAccounts]);

  const handleEditTransaction = useCallback((transaction: Transaction): void => {
    console.log('handleEditTransaction called with:', transaction);
    
    setEditingTransaction(transaction);
    
    setNewTransaction({
      merchant: transaction.merchant,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      account: transaction.account,
      date: transaction.date,
      location: transaction.location || '',
      notes: transaction.notes || '',
      tags: transaction.tags?.join(', ') || '',
      recurring: transaction.recurring || false
    });
  }, []);

  const handleDeleteTransaction = useCallback((transactionId: number): void => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  }, [setTransactions]);

  // Account handlers
  const handleAddAccount = useCallback((): void => {
    if (!newAccount.name || !newAccount.institution) return;
    
    const account: Account = {
      id: Date.now(), // Use timestamp for unique ID
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
    
    // This will automatically save to localStorage
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
  }, [newAccount, accounts, setAccounts]);

  const refreshAccounts = useCallback((): void => {
    setAccounts(prev => prev.map(account => ({
      ...account,
      lastUpdate: 'Just now'
    })));
  }, [setAccounts]);

  const toggleAccountConnection = useCallback((accountId: string | number) => {
    const id = typeof accountId === 'string' ? parseInt(accountId, 10) : accountId;
    
    setAccounts(prev => prev.map(acc => 
      acc.id === id 
        ? { ...acc, connected: !acc.connected, lastUpdate: acc.connected ? 'Disconnected' : 'Just now' }
        : acc
    ));
  }, [setAccounts]);

  // Goal handlers
  const handleAddGoal = useCallback((): void => {
    if (!newGoal.name || !newGoal.target) return;
    
    const goal: Goal = {
      id: Date.now(), // Use timestamp for unique ID
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
    
    // This will automatically save to localStorage
    setGoals(prev => [...prev, goal]);
    setNewGoal({
      name: '',
      target: '',
      current: '',
      type: 'savings',
      monthlyContribution: '',
      deadline: ''
    });
  }, [newGoal, goals.length, setGoals]);

  const updateGoalProgress = useCallback((goalId: number, amount: number): void => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.max(0, goal.current + amount) }
        : goal
    ));
  }, [setGoals]);

  const deleteGoal = useCallback((goalId: number): void => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  }, [setGoals]);

  // Budget handlers
  const updateBudgetCategory = useCallback((categoryName: string, newBudget: number): void => {
    setBudgetCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { ...cat, budgeted: newBudget, remaining: newBudget - cat.spent }
        : cat
    ));
  }, [setBudgetCategories]);

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
  }, [setBudgetCategories]);

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
  }, [setInvestments]);

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
  }, [setInvestments]);

  // AI Chat handlers
  const handleSendMessage = useCallback((): void => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
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
        id: Date.now() + 1,
        sender: 'ai',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setChatMessages(prev => [...prev, aiResponse]);
    }, 2000);
  }, [chatInput, setChatMessages]);

  // Notification handlers
  const markNotificationRead = useCallback((alertId: number): void => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  }, [setAlerts]);

  const deleteNotification = useCallback((alertId: number): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, [setAlerts]);

  // Export handlers
  const exportData = useCallback((format: string, timeRange: string): void => {
    if (transactions.length === 0) {
      return;
    }
    
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
  }, [transactions]);

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
    
    // Setters (these now automatically save to localStorage)
    setAccounts,
    setTransactions,
    setGoals,
    setBudgetCategories,
    setInvestments,
    setAlerts,
  };
};