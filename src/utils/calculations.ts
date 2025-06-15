import type { Account, BudgetCategory, Investment, Goal } from '../types';

export const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((sum, account) => sum + account.balance, 0);
};

export const calculateTotalAssets = (accounts: Account[]): number => {
  return accounts.filter(a => a.balance > 0).reduce((sum, account) => sum + account.balance, 0);
};

export const calculateTotalLiabilities = (accounts: Account[]): number => {
  return Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, account) => sum + account.balance, 0));
};

export const calculateBudgetTotals = (budgetCategories: BudgetCategory[]) => {
  return {
    totalBudgeted: budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0),
    totalSpent: budgetCategories.reduce((sum, cat) => sum + cat.spent, 0),
    totalRemaining: budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0)
  };
};

export const calculateInvestmentTotals = (investments: Investment[]) => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalChange = investments.reduce((sum, inv) => sum + inv.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
  
  return { totalValue, totalChange, totalChangePercent };
};

export const calculateGoalProgress = (goal: Goal) => {
  const progressPercent = (goal.current / goal.target) * 100;
  const monthsRemaining = goal.monthlyContribution > 0 
    ? Math.ceil((goal.target - goal.current) / goal.monthlyContribution)
    : 0;
  
  return { progressPercent, monthsRemaining };
};

export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
};