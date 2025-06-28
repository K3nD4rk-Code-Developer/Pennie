import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Shield, 
  LineChart, 
  Calendar, 
  Bell, 
  Settings, 
  Plus, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  AlertTriangle,
  Coffee,
  Car,
  ShoppingCart,
  Download,
  X,
  PieChart,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { calculateNetWorth, calculateBudgetTotals, calculateInvestmentTotals } from '../utils/calculations';
import type { PageProps } from '../types';

// Report Generation Component
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
}> = ({ 
  showModal, 
  setShowModal, 
  accounts, 
  transactions, 
  goals, 
  budgetCategories, 
  investments, 
  alerts, 
  smartInsights 
}) => {
  const [reportType, setReportType] = useState<'pdf' | 'excel'>('pdf');
  const [reportCategory, setReportCategory] = useState<'comprehensive' | 'financial-summary' | 'transaction-analysis' | 'goal-progress' | 'budget-analysis'>('comprehensive');
  const [dateRange, setDateRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'>('3M');
  const [isGenerating, setIsGenerating] = useState(false);

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
    const netWorth = calculateNetWorth(accounts);
    
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
          <title>Pennie Financial Report</title>
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PENNIE</div>
            <h1>${reportCategory === 'comprehensive' ? 'Comprehensive Financial Report' : 
                  reportCategory === 'financial-summary' ? 'Financial Summary Report' :
                  reportCategory === 'transaction-analysis' ? 'Transaction Analysis Report' :
                  reportCategory === 'goal-progress' ? 'Goal Progress Report' :
                  'Budget Analysis Report'}</h1>
            <p>Report Period: ${formatDate(data.startDate)} to ${formatDate(data.endDate)}</p>
            <p>Generated on: ${formatDate(new Date().toISOString())}</p>
          </div>

          ${reportCategory === 'comprehensive' || reportCategory === 'financial-summary' ? `
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
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Account Balances by Type</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Account Type</th>
                  <th>Number of Accounts</th>
                  <th>Total Balance</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.accountsByType).map(([type, info]: [string, any]) => `
                  <tr>
                    <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                    <td>${info.accounts.length}</td>
                    <td>${formatCurrency(info.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${reportCategory === 'comprehensive' || reportCategory === 'transaction-analysis' ? `
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
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${reportCategory === 'comprehensive' || reportCategory === 'goal-progress' ? `
          <div class="section">
            <h2 class="section-title">Goal Progress</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Goal Name</th>
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

          ${reportCategory === 'comprehensive' || reportCategory === 'budget-analysis' ? `
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

          ${smartInsights.length > 0 ? `
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
    const transactionData = [
      ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Type']
    ];
    
    data.filteredTransactions.forEach((transaction: any) => {
      transactionData.push([
        formatDate(transaction.date),
        transaction.merchant,
        transaction.category,
        transaction.account,
        transaction.amount,
        transaction.amount > 0 ? 'Income' : 'Expense'
      ]);
    });

    workbookData.push({
      name: 'Transactions',
      data: transactionData
    });

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

    // Goals Sheet
    if (data.goalAnalysis.length > 0) {
      const goalsData = [
        ['Goal Name', 'Type', 'Target Amount', 'Current Amount', 'Progress %', 'Remaining Amount', 'Monthly Contribution', 'Deadline']
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
          goal.deadline || 'Not set'
        ]);
      });

      workbookData.push({
        name: 'Goals',
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Generate Financial Report</h3>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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

          {/* Report Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Report Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Format: {reportType === 'pdf' ? 'PDF Document' : 'Excel/CSV Files'}</div>
              <div>• Content: {reportCategory.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
              <div>• Period: {dateRange === 'ALL' ? 'All available data' : dateRange}</div>
              <div>• Includes: {transactions.length} transactions, {accounts.length} accounts, {goals.length} goals</div>
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

const Dashboard: React.FC<PageProps> = ({
  accounts,
  transactions,
  goals,
  budgetCategories,
  investments,
  alerts,
  smartInsights,
  setActiveTab,
  setShowAddTransaction,
  setShowAddAccount,
  setShowGoalSetup,
  setShowExportModal
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [showReportModal, setShowReportModal] = useState(false);

  // Calculate key metrics
  const Assets = calculateNetWorth(accounts);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, acc) => sum + acc.balance, 0));
  
  const { totalSpent, totalRemaining } = calculateBudgetTotals(budgetCategories);
  const { totalChange: investmentChange, totalChangePercent } = calculateInvestmentTotals(investments);
  
  // Calculate cash flow for current month
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyIncome = currentMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.abs(currentMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Goal progress calculation
  const goalsWithProgress = goals.map(goal => ({
    ...goal,
    progressPercent: (goal.current / goal.target) * 100
  }));

  // Top spending categories
  const topSpendingCategories = budgetCategories
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  // Unread alerts count
  const unreadAlerts = alerts.filter(alert => !alert.read);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Food & Dining':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'Auto & Transport':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Shopping':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's your financial overview for {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(Assets)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +$2,340 (3.4%)
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyCashFlow)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +$340 vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Investment Returns</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investmentChange)}</p>
              <p className={`text-sm flex items-center ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChangePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {formatPercentage(Math.abs(totalChangePercent))} YTD
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <LineChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-sm text-blue-600 flex items-center">
                <PieChart className="w-3 h-3 mr-1" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">AI-Powered Insights</h2>
          <button 
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setActiveTab('ai-advisor')}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartInsights.map((insight: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; impact: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; category: string; action: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                onClick={() => {
                  if (insight.category === 'savings') setActiveTab('accounts');
                  else if (insight.category === 'credit') setActiveTab('credit');
                  else if (insight.category === 'tax') setActiveTab('taxes');
                }}
              >
                {insight.action}
                <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Net Worth Trend */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Net Worth Trend</h2>
            <select 
              className="text-sm font-medium text-black border border-gray-300 rounded px-2 py-1"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
          <div className="h-48 relative">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="netWorthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <path 
                d="M 50 150 Q 150 120 250 130 T 450 110 T 650 100 T 850 90" 
                stroke="#10B981" 
                strokeWidth="3" 
                fill="none"
              />
              <path 
                d="M 50 150 Q 150 120 250 130 T 450 110 T 650 100 T 850 90 L 850 200 L 50 200 Z" 
                fill="url(#netWorthGradient)"
              />
            </svg>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(totalAssets)} Assets</span>
            <span>{formatCurrency(totalLiabilities)} Liabilities</span>
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Spending Breakdown</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('budget')}
            >
              View Budget
            </button>
          </div>
          <div className="space-y-3">
            {topSpendingCategories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(category.spent)}</span>
                  <div className="text-xs text-gray-500">
                    {formatPercentage((category.spent / category.budgeted) * 100)} of budget
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-medium">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget Remaining</span>
              <span className="font-medium text-green-600">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Goals */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Financial Goals</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('goals')}
            >
              View All
            </button>
          </div>
          {goalsWithProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsWithProgress.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{goal.emoji}</span>
                      <span className="font-medium text-gray-900">{goal.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatPercentage(goal.progressPercent)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No goals set yet</p>
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => setShowGoalSetup(true)}
              >
                Create your first goal
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => setActiveTab('transactions')}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{transaction.merchant}</span>
                    <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </span>
                  <div className="text-xs text-gray-500">{transaction.account}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowAddTransaction(true)}
          >
            <Plus className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-black">Add Transaction</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowGoalSetup(true)}
          >
            <Target className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-black">Set Goal</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowAddAccount(true)}
          >
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-black">Link Account</span>
          </button>
          <button 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowReportModal(true)}
          >
            <FileText className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-black">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {unreadAlerts.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 text-yellow-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Alerts
            </h2>
            <span className="text-sm text-yellow-700">{unreadAlerts.length} unread</span>
          </div>
          <div className="space-y-3">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-yellow-500' :
                    alert.severity === 'positive' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      <ReportGenerationModal
        showModal={showReportModal}
        setShowModal={setShowReportModal}
        accounts={accounts}
        transactions={transactions}
        goals={goals}
        budgetCategories={budgetCategories}
        investments={investments}
        alerts={alerts}
        smartInsights={smartInsights}
      />
    </div>
  );
};

export default Dashboard;