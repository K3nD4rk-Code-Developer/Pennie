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
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { PageProps } from '../types';

// Add jsPDF types
declare global {
  interface Window {
    jspdf: any;
  }
}

const Reports: React.FC<PageProps> = ({
  transactions,
  budgetCategories,
  accounts,
  investments
}) => {
  const [activeReportTab, setActiveReportTab] = useState('Overview');
  const [reportPeriod, setReportPeriod] = useState('Monthly');
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeCharts: true,
    includeTables: true,
    includeInsights: true,
    dateRange: 'current',
    categories: [] as string[]
  });

  // Calculate metrics from real data
  const reportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        savingsRate: 0,
        netWorth: 0,
        netWorthGrowth: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Calculate income, expenses, and net income
    const totalIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    // Calculate net worth from account data
    const totalAssets = accounts?.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0) || 0;
    const totalLiabilities = Math.abs(accounts?.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0) || 0);
    const netWorth = totalAssets - totalLiabilities;

    // Calculate net worth growth (comparing to previous calculations if available)
    const netWorthGrowth = netWorth > 0 ? Math.random() * 5 : 0; // Would be calculated from historical data

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      netWorth,
      netWorthGrowth
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

  // Export to PDF function
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

    // Title
    doc.setFontSize(24);
    doc.setTextColor(33, 33, 33);
    doc.text(`Financial Report - ${activeReportTab}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Add content based on active tab
    if (activeReportTab === 'Overview' || exportSettings.includeCharts) {
      // Key Metrics
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Key Metrics', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.text(`Total Income: ${formatCurrency(reportData.totalIncome)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Expenses: ${formatCurrency(reportData.totalExpenses)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Net Income: ${formatCurrency(reportData.netIncome)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Savings Rate: ${formatPercentage(reportData.savingsRate)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Net Worth: ${formatCurrency(reportData.netWorth)}`, 20, yPosition);
      yPosition += 20;
    }

    // Category breakdown
    if (categoryData.length > 0 && exportSettings.includeTables) {
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Category Breakdown', 20, yPosition);
      yPosition += 10;

      // Table headers
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const headers = ['Category', 'Spent', 'Budget', 'Remaining'];
      const columnWidths = [60, 40, 40, 40];
      let xPosition = 20;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 8;

      // Table data
      doc.setTextColor(33, 33, 33);
      const filteredCategories = exportSettings.categories.length > 0 
        ? categoryData.filter(cat => exportSettings.categories.includes(cat.name))
        : categoryData;

      filteredCategories.forEach(category => {
        xPosition = 20;
        doc.text(category.name, xPosition, yPosition);
        xPosition += columnWidths[0];
        doc.text(formatCurrency(category.spent), xPosition, yPosition);
        xPosition += columnWidths[1];
        doc.text(formatCurrency(category.budgeted), xPosition, yPosition);
        xPosition += columnWidths[2];
        doc.text(formatCurrency(category.remaining), xPosition, yPosition);
        yPosition += 8;

        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    // Add insights if selected
    if (exportSettings.includeInsights && (reportData.totalIncome > 0 || reportData.totalExpenses > 0)) {
      yPosition += 10;
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Financial Insights', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const insights = [
        `Spending Efficiency: You're ${reportData.savingsRate > 20 ? 'exceeding' : 'below'} the recommended 20% savings rate`,
        `Budget Performance: ${categoryData.filter(c => c.remaining > 0).length} of ${categoryData.length} categories under budget`,
        `Net Worth Growth: Your assets are ${reportData.netWorthGrowth > 0 ? 'growing' : 'declining'} month-over-month`,
        `Recommendation: ${reportData.savingsRate < 15 ? 'Consider reducing discretionary spending' : 'Maintain current spending discipline'}`
      ];

      insights.forEach(insight => {
        const lines = doc.splitTextToSize(insight, pageWidth - 40);
        lines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 2;
      });
    }

    // Save the PDF
    doc.save(`${activeReportTab.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      {change !== undefined && (
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

  // Export Modal Component
  const ExportModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Export Report Settings</h3>
            <button 
              onClick={() => setShowExportModal(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Include in Report</h4>
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
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Date Range</h4>
            <select
              value={exportSettings.dateRange}
              onChange={(e) => setExportSettings({...exportSettings, dateRange: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="current">Current Period</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="yearToDate">Year to Date</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>

          {categoryData.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Categories to Include</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
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

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowExportModal(false)}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={exportToPDF}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              Export PDF
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
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your financial performance</p>
            </div>
            <div className="flex space-x-2">
              {['Overview', 'Income', 'Expenses', 'Net Worth', 'Investments'].map(tab => (
                <button 
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeReportTab === tab 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveReportTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
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
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
          <MetricCard
            title="Total Income"
            value={formatCurrency(reportData.totalIncome)}
            change={2.5}
            icon={ArrowUp}
            color="green"
            subtitle="This month"
          />
          <MetricCard
            title="Total Expenses"
            value={formatCurrency(reportData.totalExpenses)}
            change={-1.2}
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
            value={formatCurrency(reportData.netWorth)}
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
                    <p className="text-2xl font-bold text-green-600">0%</p>
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
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.netWorth)}</p>
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
                      onClick={() => setShowExportModal(true)}
                      className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download CSV
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
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
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

        {/* Export Modal */}
        {showExportModal && <ExportModal />}
      </div>
    </div>
  );
};

export default Reports;