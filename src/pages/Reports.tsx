import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  MoreHorizontal, 
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  Share2,
  Plus,
  Settings,
  Check,
  X
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import type { PageProps } from '../types';

// Add jsPDF types
declare global {
  interface Window {
    jspdf: any;
  }
}

// Enhanced Report Generation Component
const ReportGenerationModal: React.FC<{
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  accounts: any[];
  transactions: any[];
  goals: any[];
  budgetCategories: any[];
  investments: any[];
  alerts: any[];
  smartInsights: any[];
  reportData: any;
  categoryData: any[];
}> = ({ 
  showModal, 
  setShowModal, 
  accounts, 
  transactions, 
  goals, 
  budgetCategories, 
  investments, 
  alerts, 
  smartInsights,
  reportData,
  categoryData
}) => {
  const [reportType, setReportType] = useState<'pdf' | 'excel'>('pdf');
  const [reportCategory, setReportCategory] = useState<'comprehensive' | 'financial-summary' | 'transaction-analysis' | 'goal-progress' | 'budget-analysis' | 'income-statement' | 'expense-breakdown'>('comprehensive');
  const [dateRange, setDateRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'>('3M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeCharts: true,
    includeTables: true,
    includeInsights: true,
    includeAccounts: true,
    includeGoals: true,
    categories: [] as string[]
  });

  // Calculate comprehensive financial data
  const calculateFinancialData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '1M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2020, 0, 1); // Very old date for "ALL"
    }

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });

    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    const netCashFlow = totalIncome - totalExpenses;
    const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Category breakdown
    const categoryBreakdown = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.category;
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0, transactions: [] };
        }
        acc[category].total += Math.abs(t.amount);
        acc[category].count += 1;
        acc[category].transactions.push(t);
        return acc;
      }, {} as Record<string, { total: number; count: number; transactions: any[] }>);

    // Monthly breakdown
    const monthlyData: Record<string, { income: number; expenses: number; transactions: number }> = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, transactions: 0 };
      }
      
      if (t.amount > 0) {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
      monthlyData[monthKey].transactions += 1;
    });

    // Account balances by type
    const accountsByType = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = { total: 0, accounts: [] };
      }
      acc[account.type].total += account.balance;
      acc[account.type].accounts.push(account);
      return acc;
    }, {} as Record<string, { total: number; accounts: any[] }>);

    // Goal progress analysis
    const goalAnalysis = goals.map(goal => ({
      ...goal,
      progressPercent: (goal.current / goal.target) * 100,
      remainingAmount: goal.target - goal.current,
      onTrack: goal.current >= (goal.target * 0.1) // Basic on-track calculation
    }));

    // Budget performance
    const budgetPerformance = budgetCategories.map(category => ({
      ...category,
      utilizationPercent: (category.spent / category.budgeted) * 100,
      remaining: category.budgeted - category.spent,
      overBudget: category.spent > category.budgeted
    }));

    return {
      dateRange,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      totalIncome,
      totalExpenses,
      netCashFlow,
      netWorth,
      transactionCount: filteredTransactions.length,
      categoryBreakdown,
      monthlyData,
      accountsByType,
      goalAnalysis,
      budgetPerformance,
      filteredTransactions
    };
  };

  // Generate PDF Report
  const generatePDFReport = async (data: any) => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Pennie Financial Report - ${reportCategory.replace('-', ' ').toUpperCase()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #f97316; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #f97316; 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .section { 
              margin-bottom: 30px; 
              page-break-inside: avoid; 
            }
            .section-title { 
              font-size: 20px; 
              font-weight: bold; 
              color: #f97316; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 8px; 
              margin-bottom: 15px; 
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-bottom: 20px; 
            }
            .card { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 15px; 
              background: #f9fafb; 
            }
            .card-title { 
              font-weight: bold; 
              color: #374151; 
              margin-bottom: 8px; 
            }
            .card-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #1f2937; 
            }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .table th, .table td { 
              border: 1px solid #e5e7eb; 
              padding: 10px; 
              text-align: left; 
            }
            .table th { 
              background: #f3f4f6; 
              font-weight: bold; 
            }
            .summary { 
              background: #fef3c7; 
              border: 1px solid #f59e0b; 
              border-radius: 8px; 
              padding: 20px; 
              margin-bottom: 20px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              color: #6b7280; 
              font-size: 12px; 
            }
            .chart-placeholder {
              height: 200px;
              background: #f9fafb;
              border: 2px dashed #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px 0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PENNIE</div>
            <h1>${reportCategory === 'comprehensive' ? 'Comprehensive Financial Report' : 
                  reportCategory === 'financial-summary' ? 'Financial Summary Report' :
                  reportCategory === 'transaction-analysis' ? 'Transaction Analysis Report' :
                  reportCategory === 'goal-progress' ? 'Goal Progress Report' :
                  reportCategory === 'budget-analysis' ? 'Budget Analysis Report' :
                  reportCategory === 'income-statement' ? 'Income Statement Report' :
                  'Expense Breakdown Report'}</h1>
            <p>Report Period: ${formatDate(data.startDate)} to ${formatDate(data.endDate)}</p>
            <p>Generated on: ${formatDate(new Date().toISOString())}</p>
          </div>

          ${(reportCategory === 'comprehensive' || reportCategory === 'financial-summary' || reportCategory === 'income-statement') && exportSettings.includeCharts ? `
          <div class="section">
            <h2 class="section-title">Financial Overview</h2>
            <div class="grid">
              <div class="card">
                <div class="card-title">Net Worth</div>
                <div class="card-value">${formatCurrency(data.netWorth)}</div>
              </div>
              <div class="card">
                <div class="card-title">Total Income</div>
                <div class="card-value positive">${formatCurrency(data.totalIncome)}</div>
              </div>
              <div class="card">
                <div class="card-title">Total Expenses</div>
                <div class="card-value negative">${formatCurrency(data.totalExpenses)}</div>
              </div>
              <div class="card">
                <div class="card-title">Net Cash Flow</div>
                <div class="card-value ${data.netCashFlow >= 0 ? 'positive' : 'negative'}">${formatCurrency(data.netCashFlow)}</div>
              </div>
              <div class="card">
                <div class="card-title">Savings Rate</div>
                <div class="card-value">${formatPercentage(data.totalIncome > 0 ? (data.netCashFlow / data.totalIncome) * 100 : 0)}</div>
              </div>
              <div class="card">
                <div class="card-title">Transaction Volume</div>
                <div class="card-value">${data.transactionCount}</div>
              </div>
            </div>
          </div>
          ` : ''}

          ${exportSettings.includeAccounts ? `
          <div class="section">
            <h2 class="section-title">Account Summary</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Account Type</th>
                  <th>Number of Accounts</th>
                  <th>Total Balance</th>
                  <th>Percentage of Net Worth</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.accountsByType).map(([type, info]: [string, any]) => `
                  <tr>
                    <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                    <td>${info.accounts.length}</td>
                    <td>${formatCurrency(info.total)}</td>
                    <td>${formatPercentage(data.netWorth > 0 ? (info.total / data.netWorth) * 100 : 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${(reportCategory === 'comprehensive' || reportCategory === 'transaction-analysis' || reportCategory === 'expense-breakdown') && exportSettings.includeTables ? `
          <div class="section">
            <h2 class="section-title">Transaction Analysis</h2>
            <div class="summary">
              <strong>Transaction Summary:</strong> ${data.transactionCount} transactions processed during this period.
              Average transaction value: ${formatCurrency(data.totalExpenses / Math.max(data.filteredTransactions.filter((t: any) => t.amount < 0).length, 1))}
            </div>
            
            <h3>Top Spending Categories</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount Spent</th>
                  <th>Transaction Count</th>
                  <th>Average per Transaction</th>
                  <th>Percentage of Total</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.categoryBreakdown)
                  .sort(([,a], [,b]) => (b as any).total - (a as any).total)
                  .slice(0, 10)
                  .map(([category, info]: [string, any]) => `
                    <tr>
                      <td>${category}</td>
                      <td>${formatCurrency(info.total)}</td>
                      <td>${info.count}</td>
                      <td>${formatCurrency(info.total / info.count)}</td>
                      <td>${formatPercentage((info.total / data.totalExpenses) * 100)}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${exportSettings.includeCharts ? `
          <div class="section">
            <h2 class="section-title">Monthly Trends</h2>
            <div class="chart-placeholder">
              <div style="text-align: center; color: #6b7280;">
                <strong>Monthly Income vs Expenses Chart</strong><br>
                <small>Chart visualization would appear here in a full implementation</small>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net Flow</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.monthlyData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, monthData]: [string, any]) => `
                    <tr>
                      <td>${month}</td>
                      <td class="positive">${formatCurrency(monthData.income)}</td>
                      <td class="negative">${formatCurrency(monthData.expenses)}</td>
                      <td class="${monthData.income - monthData.expenses >= 0 ? 'positive' : 'negative'}">${formatCurrency(monthData.income - monthData.expenses)}</td>
                      <td>${monthData.transactions}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${(reportCategory === 'comprehensive' || reportCategory === 'goal-progress') && exportSettings.includeGoals && data.goalAnalysis.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Goal Progress</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Goal Name</th>
                  <th>Type</th>
                  <th>Target Amount</th>
                  <th>Current Amount</th>
                  <th>Progress</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.goalAnalysis.map((goal: any) => `
                  <tr>
                    <td>${goal.emoji} ${goal.name}</td>
                    <td>${goal.type}</td>
                    <td>${formatCurrency(goal.target)}</td>
                    <td>${formatCurrency(goal.current)}</td>
                    <td>${formatPercentage(goal.progressPercent)}</td>
                    <td>${formatCurrency(goal.remainingAmount)}</td>
                    <td>${goal.onTrack ? '✅ On Track' : '⚠️ Behind'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${(reportCategory === 'comprehensive' || reportCategory === 'budget-analysis') && exportSettings.includeTables ? `
          <div class="section">
            <h2 class="section-title">Budget Performance</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budgeted</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.budgetPerformance.map((budget: any) => `
                  <tr>
                    <td>${budget.name}</td>
                    <td>${formatCurrency(budget.budgeted)}</td>
                    <td>${formatCurrency(budget.spent)}</td>
                    <td class="${budget.remaining >= 0 ? 'positive' : 'negative'}">${formatCurrency(budget.remaining)}</td>
                    <td>${formatPercentage(budget.utilizationPercent)}</td>
                    <td>${budget.overBudget ? '🔴 Over Budget' : '🟢 Within Budget'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${exportSettings.includeInsights && smartInsights.length > 0 ? `
          <div class="section">
            <h2 class="section-title">AI Insights & Recommendations</h2>
            ${smartInsights.map((insight: any) => `
              <div class="card">
                <div class="card-title">${insight.title}</div>
                <p>${insight.description}</p>
                <p><strong>Impact:</strong> ${insight.impact}</p>
                <p><strong>Recommended Action:</strong> ${insight.action}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>This report was generated by Pennie Financial Management System</p>
            <p>Report includes data from ${data.startDate} to ${data.endDate}</p>
            <p>For questions about this report, please contact support</p>
          </div>
        </body>
      </html>
    `;

    // Convert HTML to PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  // Generate Excel Report
  const generateExcelReport = async (data: any) => {
    const workbookData = [];

    // Summary Sheet
    const summaryData = [
      ['PENNIE FINANCIAL REPORT'],
      ['Report Type:', reportCategory.replace('-', ' ').toUpperCase()],
      ['Date Range:', `${formatDate(data.startDate)} to ${formatDate(data.endDate)}`],
      ['Generated:', formatDate(new Date().toISOString())],
      [''],
      ['FINANCIAL OVERVIEW'],
      ['Net Worth', formatCurrency(data.netWorth)],
      ['Total Income', formatCurrency(data.totalIncome)],
      ['Total Expenses', formatCurrency(data.totalExpenses)],
      ['Net Cash Flow', formatCurrency(data.netCashFlow)],
      ['Savings Rate', formatPercentage(data.totalIncome > 0 ? (data.netCashFlow / data.totalIncome) * 100 : 0)],
      ['Transaction Count', data.transactionCount],
      [''],
      ['ACCOUNT SUMMARY BY TYPE']
    ];

    Object.entries(data.accountsByType).forEach(([type, info]: [string, any]) => {
      summaryData.push([
        type.charAt(0).toUpperCase() + type.slice(1),
        info.accounts.length + ' accounts',
        formatCurrency(info.total)
      ]);
    });

    workbookData.push({
      name: 'Summary',
      data: summaryData
    });

    // Transactions Sheet
    if (exportSettings.includeTables) {
      const transactionData = [
        ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Type', 'Notes', 'Tags']
      ];
      
      data.filteredTransactions.forEach((transaction: any) => {
        transactionData.push([
          formatDate(transaction.date),
          transaction.merchant,
          transaction.category,
          transaction.account,
          transaction.amount,
          transaction.amount > 0 ? 'Income' : 'Expense',
          transaction.notes || '',
          transaction.tags ? transaction.tags.join(';') : ''
        ]);
      });

      workbookData.push({
        name: 'Transactions',
        data: transactionData
      });
    }

    // Category Analysis Sheet
    const categoryData = [
      ['Category', 'Total Spent', 'Transaction Count', 'Average per Transaction', 'Percentage of Total']
    ];

    Object.entries(data.categoryBreakdown)
      .sort(([,a], [,b]) => (b as any).total - (a as any).total)
      .forEach(([category, info]: [string, any]) => {
        categoryData.push([
          category,
          info.total,
          info.count,
          info.total / info.count,
          (info.total / data.totalExpenses * 100).toFixed(2) + '%'
        ]);
      });

    workbookData.push({
      name: 'Category Analysis',
      data: categoryData
    });

    // Monthly Trends Sheet
    if (exportSettings.includeCharts) {
      const monthlyTrendsData = [
        ['Month', 'Income', 'Expenses', 'Net Flow', 'Transaction Count', 'Savings Rate']
      ];

      Object.entries(data.monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, monthData]: [string, any]) => {
          const savingsRate = monthData.income > 0 ? ((monthData.income - monthData.expenses) / monthData.income) * 100 : 0;
          monthlyTrendsData.push([
            month,
            monthData.income,
            monthData.expenses,
            monthData.income - monthData.expenses,
            monthData.transactions,
            savingsRate.toFixed(2) + '%'
          ]);
        });

      workbookData.push({
        name: 'Monthly Trends',
        data: monthlyTrendsData
      });
    }

    // Goals Sheet
    if (exportSettings.includeGoals && data.goalAnalysis.length > 0) {
      const goalsData = [
        ['Goal Name', 'Type', 'Target Amount', 'Current Amount', 'Progress %', 'Remaining Amount', 'Monthly Contribution', 'Deadline', 'Status']
      ];

      data.goalAnalysis.forEach((goal: any) => {
        goalsData.push([
          goal.name,
          goal.type,
          goal.target,
          goal.current,
          goal.progressPercent.toFixed(2) + '%',
          goal.remainingAmount,
          goal.monthlyContribution || 0,
          goal.deadline || 'Not set',
          goal.onTrack ? 'On Track' : 'Behind Schedule'
        ]);
      });

      workbookData.push({
        name: 'Goals Progress',
        data: goalsData
      });
    }

    // Budget Sheet
    if (data.budgetPerformance.length > 0) {
      const budgetData = [
        ['Category', 'Budgeted Amount', 'Spent Amount', 'Remaining', 'Utilization %', 'Status']
      ];

      data.budgetPerformance.forEach((budget: any) => {
        budgetData.push([
          budget.name,
          budget.budgeted,
          budget.spent,
          budget.remaining,
          budget.utilizationPercent.toFixed(2) + '%',
          budget.overBudget ? 'Over Budget' : 'Within Budget'
        ]);
      });

      workbookData.push({
        name: 'Budget Analysis',
        data: budgetData
      });
    }

    // Convert to CSV format and download
    const generateCSVContent = (data: any[]) => {
      return data.map(row => 
        row.map((cell: any) => {
          const cellStr = String(cell);
          return cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"') 
            ? `"${cellStr.replace(/"/g, '""')}"` 
            : cellStr;
        }).join(',')
      ).join('\n');
    };

    // Create a ZIP-like structure by downloading multiple CSV files
    workbookData.forEach((sheet, index) => {
      const csvContent = generateCSVContent(sheet.data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pennie-${reportCategory}-${sheet.name.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (index === 0) {
        // Download the first file immediately
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Delay subsequent downloads to avoid browser blocking
        setTimeout(() => {
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, index * 1000);
      }
      
      if (index === 0) {
        window.URL.revokeObjectURL(url);
      }
    });
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const data = calculateFinancialData();
      
      if (reportType === 'pdf') {
        await generatePDFReport(data);
      } else {
        await generateExcelReport(data);
      }
      
      // Close modal after generation
      setTimeout(() => {
        setShowModal(false);
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Generate Comprehensive Report</h3>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Report Configuration */}
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setReportType('pdf')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    reportType === 'pdf'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">PDF Report</div>
                  <div className="text-sm text-gray-600">Professional formatted document</div>
                </button>
                <button
                  onClick={() => setReportType('excel')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    reportType === 'excel'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">Excel/CSV Data</div>
                  <div className="text-sm text-gray-600">Raw data for analysis</div>
                </button>
              </div>
            </div>

            {/* Report Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <select 
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value as any)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="comprehensive">Comprehensive Report (All Data)</option>
                <option value="financial-summary">Financial Summary</option>
                <option value="income-statement">Income Statement</option>
                <option value="expense-breakdown">Expense Breakdown</option>
                <option value="transaction-analysis">Transaction Analysis</option>
                <option value="goal-progress">Goal Progress Report</option>
                <option value="budget-analysis">Budget Analysis</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '1M', label: 'Last Month' },
                  { value: '3M', label: 'Last 3 Months' },
                  { value: '6M', label: 'Last 6 Months' },
                  { value: '1Y', label: 'Last Year' },
                  { value: 'YTD', label: 'Year to Date' },
                  { value: 'ALL', label: 'All Time' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value as any)}
                    className={`p-3 text-sm border rounded-lg transition-all duration-200 ${
                      dateRange === range.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content Options */}
          <div className="space-y-6">
            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Include in Report</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeCharts}
                    onChange={(e) => setExportSettings({...exportSettings, includeCharts: e.target.checked})}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Charts & Visualizations</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeTables}
                    onChange={(e) => setExportSettings({...exportSettings, includeTables: e.target.checked})}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Detailed Tables</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeInsights}
                    onChange={(e) => setExportSettings({...exportSettings, includeInsights: e.target.checked})}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Financial Insights</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeAccounts}
                    onChange={(e) => setExportSettings({...exportSettings, includeAccounts: e.target.checked})}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Account Summary</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeGoals}
                    onChange={(e) => setExportSettings({...exportSettings, includeGoals: e.target.checked})}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Goal Progress</span>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            {categoryData.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Categories to Include</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {categoryData.map(category => (
                    <label key={category.name} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSettings.categories.includes(category.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportSettings({
                              ...exportSettings,
                              categories: [...exportSettings.categories, category.name]
                            });
                          } else {
                            setExportSettings({
                              ...exportSettings,
                              categories: exportSettings.categories.filter(c => c !== category.name)
                            });
                          }
                        }}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setExportSettings({
                    ...exportSettings,
                    categories: exportSettings.categories.length === categoryData.length ? [] : categoryData.map(c => c.name)
                  })}
                  className="mt-2 text-sm text-orange-600 hover:text-orange-700"
                >
                  {exportSettings.categories.length === categoryData.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}

            {/* Report Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Report Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Format: {reportType === 'pdf' ? 'PDF Document' : 'Excel/CSV Files'}</div>
                <div>• Content: {reportCategory.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                <div>• Period: {dateRange === 'ALL' ? 'All available data' : dateRange}</div>
                <div>• Includes: {transactions.length} transactions, {accounts.length} accounts, {goals.length} goals</div>
                <div>• Sections: {Object.values(exportSettings).filter(v => v === true).length} content sections</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button 
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            onClick={() => setShowModal(false)}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Download className="w-4 h-4 mr-2 inline animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2 inline" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC<PageProps> = ({
  transactions,
  budgetCategories,
  accounts,
  investments,
  goals = [],
  alerts = [],
  smartInsights = []
}) => {
  const [reportPeriod, setReportPeriod] = useState('Monthly');
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showComprehensiveReportModal, setShowComprehensiveReportModal] = useState(false);

  // Calculate metrics from real data with month-over-month comparisons
  const reportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        savingsRate: 0,
        Assets: 0,
        netWorthGrowth: 0,
        incomeChange: 0,
        expenseChange: 0,
        lastMonthIncome: 0,
        lastMonthExpenses: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter transactions for last month
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Calculate current month income and expenses
    const totalIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    // Calculate last month income and expenses
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = Math.abs(lastMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    // Calculate changes
    const incomeChange = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    const expenseChange = lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    // Calculate net worth from account data
    const totalAssets = accounts?.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0) || 0;
    const totalLiabilities = Math.abs(accounts?.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0) || 0);
    const Assets = totalAssets - totalLiabilities;

    // For net worth growth, we'd need historical data. For now, calculate based on net income
    const netWorthGrowth = Assets > 0 && lastMonthIncome > 0 ? (netIncome / Assets) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      Assets,
      netWorthGrowth,
      incomeChange,
      expenseChange,
      lastMonthIncome,
      lastMonthExpenses
    };
  }, [transactions, accounts]);

  // Generate category breakdown from budget data
  const categoryData = useMemo(() => {
    if (!budgetCategories || budgetCategories.length === 0) return [];
    
    const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    
    return budgetCategories.map(category => ({
      ...category,
      change: category.spent - (category.lastMonth || 0),
      percentageOfTotal: totalSpent > 0 ? (category.spent / totalSpent) * 100 : 0
    }));
  }, [budgetCategories]);

  // Export to PDF function (simplified - keeping existing for compatibility)
  const exportToPDF = async () => {
    // Load jsPDF dynamically
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up the document
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Brand colors
    const colors = {
      primary: { r: 251, g: 146, b: 60 },      // orange-500
      primaryDark: { r: 234, g: 88, b: 12 },   // orange-600
      secondary: { r: 254, g: 215, b: 170 },   // orange-200
      lightBg: { r: 255, g: 247, b: 237 },     // orange-50
      text: { r: 51, g: 51, b: 51 },           // gray-900
      textLight: { r: 107, g: 114, b: 128 },   // gray-500
      success: { r: 34, g: 197, b: 94 },       // green-500
      danger: { r: 239, g: 68, b: 68 }         // red-500
    };

    // Add header
    doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Title
    doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Pennie Reports & Analytics', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 45, { align: 'center' });

    yPosition = 80;

    // Add key metrics
    const metrics = [
      { label: 'Total Income', value: formatCurrency(reportData.totalIncome) },
      { label: 'Total Expenses', value: formatCurrency(reportData.totalExpenses) },
      { label: 'Net Income', value: formatCurrency(reportData.netIncome) },
      { label: 'Net Worth', value: formatCurrency(reportData.Assets) }
    ];

    metrics.forEach((metric, index) => {
      doc.setFontSize(12);
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.text(`${metric.label}: ${metric.value}`, 20, yPosition + (index * 15));
    });

    // Save the PDF
    doc.save(`pennie-report-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportModal(false);
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {change !== undefined && change !== 0 && (
        <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
          {Math.abs(change).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  // Export Modal Component (simplified)
  const ExportModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Quick Export</h3>
            <button 
              onClick={() => setShowExportModal(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Generate a basic PDF report with current data</p>
            <button
              onClick={exportToPDF}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              Export Basic PDF
            </button>
          </div>
          
          <div className="text-center border-t pt-6">
            <p className="text-gray-600 mb-4">Or create a comprehensive report with advanced options</p>
            <button
              onClick={() => {
                setShowExportModal(false);
                setShowComprehensiveReportModal(true);
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Create Comprehensive Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your financial performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('charts')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'charts' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button 
              onClick={() => setShowComprehensiveReportModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <FileText className="w-5 h-5" />
              <span>Comprehensive Report</span>
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Quick Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
          <MetricCard
            title="Total Income"
            value={formatCurrency(reportData.totalIncome)}
            change={reportData.incomeChange}
            icon={ArrowUp}
            color="green"
            subtitle="This month"
          />
          <MetricCard
            title="Total Expenses"
            value={formatCurrency(reportData.totalExpenses)}
            change={reportData.expenseChange}
            icon={ArrowDown}
            color="red"
            subtitle="This month"
          />
          <MetricCard
            title="Net Income"
            value={formatCurrency(reportData.netIncome)}
            icon={TrendingUp}
            color="blue"
            subtitle={`${formatPercentage(reportData.savingsRate)} savings rate`}
          />
          <MetricCard
            title="Net Worth"
            value={formatCurrency(reportData.Assets)}
            change={reportData.netWorthGrowth}
            icon={Activity}
            color="purple"
            subtitle="Total value"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 mb-6 min-h-0 overflow-y-auto">
          {viewMode === 'charts' ? (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 gap-6">
                <ChartCard title="Spending by Category">
                  {categoryData.length > 0 ? (
                    <div className="space-y-4">
                      {categoryData.slice(0, 6).map((category, idx) => (
                        <div key={category.name} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: `hsl(${idx * 60}, 70%, 50%)` }}
                              ></div>
                              <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">{formatCurrency(category.spent)}</div>
                              <div className="text-xs text-gray-500">
                                {formatPercentage(category.percentageOfTotal)}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
                              style={{ 
                                width: `${category.percentageOfTotal}%`,
                                backgroundColor: `hsl(${idx * 60}, 70%, 50%)`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No category data available</p>
                      <p className="text-xs text-gray-400">Create budget categories to see spending breakdown</p>
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* Performance Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Income Growth</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.incomeChange !== 0 ? `${reportData.incomeChange >= 0 ? '+' : ''}${reportData.incomeChange.toFixed(1)}%` : '0%'}
                    </p>
                    <p className="text-sm text-gray-600">vs last month</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Savings Rate</h4>
                    <p className="text-2xl font-bold text-orange-600">{formatPercentage(reportData.savingsRate)}</p>
                    <p className="text-sm text-gray-600">of income saved</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <ArrowUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Net Worth</h4>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.Assets)}</p>
                    <p className="text-sm text-gray-600">total value</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Detailed Analysis</h3>
                  <div className="flex items-center space-x-3">
                    <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share Report
                    </button>
                    <button 
                      onClick={() => setShowComprehensiveReportModal(true)}
                      className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>

              {categoryData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">This Month</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Last Month</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Change</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">YTD</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Budget</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((category, idx) => (
                        <tr key={category.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-3"
                                style={{ backgroundColor: `hsl(${idx * 60}, 70%, 50%)` }}
                              ></div>
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-gray-900">
                            {formatCurrency(category.spent)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-gray-700">
                            {formatCurrency(category.lastMonth || 0)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`font-medium ${
                              category.change > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {category.change > 0 ? '+' : ''}
                              {formatCurrency(Math.abs(category.change))}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-gray-700">
                            {formatCurrency(category.yearToDate || 0)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-gray-700">
                            {formatCurrency(category.budgeted)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`font-bold ${category.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(category.remaining)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h4>
                  <p className="text-gray-600 mb-6">Create budget categories and add transactions to see detailed analysis here.</p>
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Insights Panel */}
          {(reportData.totalIncome > 0 || reportData.totalExpenses > 0) && (
            <div className="mt-6 bg-white border border-orange-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Financial Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <p className="text-orange-800">
                    <span className="font-semibold">Spending Efficiency:</span> You're {reportData.savingsRate > 20 ? 'exceeding' : 'below'} the recommended 20% savings rate
                  </p>
                  <p className="text-orange-800">
                    <span className="font-semibold">Budget Performance:</span> {categoryData.filter(c => c.remaining > 0).length} of {categoryData.length} categories under budget
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-orange-800">
                    <span className="font-semibold">Net Worth Growth:</span> Your assets are {reportData.netWorthGrowth > 0 ? 'growing' : 'declining'} month-over-month
                  </p>
                  <p className="text-orange-800">
                    <span className="font-semibold">Recommendation:</span> {reportData.savingsRate < 15 ? 'Consider reducing discretionary spending' : 'Maintain current spending discipline'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Modals */}
        {showExportModal && <ExportModal />}
        
        {/* Comprehensive Report Modal */}
        <ReportGenerationModal
          showModal={showComprehensiveReportModal}
          setShowModal={setShowComprehensiveReportModal}
          accounts={accounts || []}
          transactions={transactions || []}
          goals={goals || []}
          budgetCategories={budgetCategories || []}
          investments={investments || []}
          alerts={alerts || []}
          smartInsights={smartInsights || []}
          reportData={reportData}
          categoryData={categoryData}
        />
      </div>
    </div>
  );
};

export default Reports;