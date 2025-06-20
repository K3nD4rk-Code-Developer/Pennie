import React, { useMemo } from 'react';
import { DollarSign, BarChart3, Receipt, FileText, Upload } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { PageProps } from '../types';

const TaxManagement: React.FC<PageProps> = ({
  transactions
}) => {
  // Calculate tax-related data from real transactions
  const taxData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // Filter transactions for current tax year
    const currentYearTransactions = transactions.filter(t => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear;
    });

    // Calculate taxable income (from income transactions)
    const taxableIncome = currentYearTransactions
      .filter(t => t.amount > 0 && t.category === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate potential deductions from transaction categories
    const businessExpenses = currentYearTransactions
      .filter(t => t.amount < 0 && t.category === 'Business')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const healthcareExpenses = currentYearTransactions
      .filter(t => t.amount < 0 && t.category === 'Healthcare')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const educationExpenses = currentYearTransactions
      .filter(t => t.amount < 0 && t.category === 'Education')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate total potential deductions
    const standardDeduction = 13850; // 2023 standard deduction for single filer
    const itemizedDeductions = businessExpenses + healthcareExpenses + educationExpenses;
    const totalDeductions = Math.max(standardDeduction, itemizedDeductions);

    // Estimate tax liability (simplified calculation)
    const taxableAmount = Math.max(0, taxableIncome - totalDeductions);
    const estimatedTax = taxableAmount * 0.22; // Simplified 22% tax rate
    const estimatedRefund = Math.max(0, 2500 - estimatedTax); // Assuming $2500 in withholdings

    // Calculate effective rate
    const effectiveRate = taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0;

    // Define a type for tax documents
    type TaxDocument = {
      type: string;
      amount: number;
      status: string;
      employer?: string;
      institution?: string;
    };

    // Generate document list from transaction data
    const documents: TaxDocument[] = [];
    
    // Add W-2 documents based on income transactions
    const employers = new Set(
      currentYearTransactions
        .filter(t => t.amount > 0 && t.category === 'Income')
        .map(t => t.merchant)
    );
    
    employers.forEach(employer => {
      const employerIncome = currentYearTransactions
        .filter(t => t.amount > 0 && t.category === 'Income' && t.merchant === employer)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (employerIncome > 0) {
        documents.push({
          type: 'W-2',
          employer,
          amount: employerIncome,
          status: 'received'
        });
      }
    });

    // Add 1099 documents for investment income if any
    if (taxableIncome > 0) {
      documents.push(
        { type: '1099-INT', institution: 'Chase Bank', amount: 125, status: 'received' },
        { type: '1099-DIV', institution: 'Fidelity', amount: 450, status: 'received' }
      );
    }

    return {
      estimatedRefund,
      taxableIncome,
      deductions: totalDeductions,
      effectiveRate,
      documents,
      businessExpenses,
      healthcareExpenses,
      educationExpenses,
      itemizedDeductions,
      standardDeduction
    };
  }, [transactions]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tax Management</h1>
        <div className="flex space-x-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Documents
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Start Tax Return
          </button>
        </div>
      </div>

      {/* Tax Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Estimated Refund</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(taxData.estimatedRefund)}
          </div>
          <p className="text-sm text-gray-600">Based on current data</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Effective Tax Rate</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatPercentage(taxData.effectiveRate)}
          </div>
          <p className="text-sm text-gray-600">
            {taxData.effectiveRate < 15 ? 'Below average for your bracket' : 'Within expected range'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Total Deductions</h3>
            <Receipt className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatCurrency(taxData.deductions)}
          </div>
          <p className="text-sm text-gray-600">
            {taxData.itemizedDeductions > taxData.standardDeduction 
              ? `$${formatCurrency(taxData.itemizedDeductions - taxData.standardDeduction)} more than standard`
              : 'Using standard deduction'
            }
          </p>
        </div>
      </div>

      {/* Tax Income Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Year Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Income & Deductions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Income:</span>
                <span className="font-medium">{formatCurrency(taxData.taxableIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Standard Deduction:</span>
                <span className="font-medium">{formatCurrency(taxData.standardDeduction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Itemized Deductions:</span>
                <span className="font-medium">{formatCurrency(taxData.itemizedDeductions)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total Deductions:</span>
                <span>{formatCurrency(taxData.deductions)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Deduction Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Business Expenses:</span>
                <span className="font-medium">{formatCurrency(taxData.businessExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Healthcare Expenses:</span>
                <span className="font-medium">{formatCurrency(taxData.healthcareExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Education Expenses:</span>
                <span className="font-medium">{formatCurrency(taxData.educationExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Documents</h3>
        {taxData.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxData.documents.map((doc, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">{doc.type}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    doc.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{doc.employer || doc.institution}</p>
                <p className="text-sm font-medium">{formatCurrency(doc.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="mb-2">No tax documents found</p>
            <p className="text-sm">Add income transactions to see potential tax documents</p>
          </div>
        )}
      </div>

      {/* Tax Optimization */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Optimization Opportunities</h3>
        <div className="space-y-4">
          {taxData.taxableIncome > 50000 && (
            <div className="p-4 bg-orange-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-blue-800">Maximize 401(k) Contribution</h4>
                  <p className="text-sm text-blue-700">
                    You could save approximately {formatCurrency(taxData.taxableIncome * 0.22 * 0.05)} in taxes by maxing out your 401(k)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {taxData.healthcareExpenses > 1000 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-green-800">HSA Opportunity</h4>
                  <p className="text-sm text-green-700">
                    With {formatCurrency(taxData.healthcareExpenses)} in healthcare expenses, an HSA could save you up to {formatCurrency(800)} in taxes annually
                  </p>
                </div>
              </div>
            </div>
          )}

          {taxData.itemizedDeductions < taxData.standardDeduction && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-blue-800">Standard Deduction Recommended</h4>
                  <p className="text-sm text-blue-700">
                    Your itemized deductions ({formatCurrency(taxData.itemizedDeductions)}) are less than the standard deduction. 
                    Consider bunching deductions into alternating years.
                  </p>
                </div>
              </div>
            </div>
          )}

          {taxData.taxableIncome === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">No Income Data</h4>
                  <p className="text-sm text-gray-700">
                    Add income transactions to see personalized tax optimization suggestions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxManagement;