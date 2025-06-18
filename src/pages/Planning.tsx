import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  CreditCard, 
  PieChart, 
  Home, 
  Heart, 
  Book, 
  Plane, 
  Target, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  Zap,
  Plus,
  ArrowRight,
  Star
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { PageProps } from '../types';

const Planning: React.FC<PageProps> = ({
  accounts,
  transactions,
  goals
}) => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<string | null>(null);
  const [retirementInputs, setRetirementInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    monthlyContribution: 500,
    expectedReturn: 7
  });

  // Calculate retirement projections from real data
  const retirementData = useMemo(() => {
    const currentSavings = accounts
      ?.filter(a => a.type === 'investment')
      .reduce((sum, a) => sum + a.balance, 0) || 0;

    const monthlyIncome = transactions
      ?.filter(t => t.amount > 0 && t.category === 'Income')
      .reduce((sum, t) => sum + t.amount, 0) / 12 || 0;

    const yearsToRetirement = retirementInputs.retirementAge - retirementInputs.currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // Compound interest calculation
    const monthlyRate = retirementInputs.expectedReturn / 100 / 12;
    const futureValueContributions = retirementInputs.monthlyContribution * 
      ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement);
    
    const projectedBalance = futureValueCurrent + futureValueContributions;
    const monthlyIncomeAt65 = projectedBalance * 0.04 / 12; // 4% withdrawal rule

    return {
      currentAge: retirementInputs.currentAge,
      retirementAge: retirementInputs.retirementAge,
      yearsToRetirement,
      currentSavings,
      monthlyContribution: retirementInputs.monthlyContribution,
      expectedReturn: retirementInputs.expectedReturn,
      projectedBalance,
      monthlyIncomeAt65,
      monthlyIncome
    };
  }, [accounts, transactions, retirementInputs]);

  // Calculate debt payoff from real data
  const debtData = useMemo(() => {
    const debtAccounts = accounts?.filter(a => a.balance < 0) || [];
    const totalDebt = Math.abs(debtAccounts.reduce((sum, a) => sum + a.balance, 0));
    
    // Estimate monthly payment based on 3% of debt or minimum of $100
    const estimatedMonthlyPayment = Math.max(totalDebt * 0.03, 100);
    
    // Simple payoff calculation (assumes 18% APR average)
    const monthlyRate = 0.18 / 12;
    const monthsToPayoff = totalDebt > 0 
      ? Math.log(1 + (totalDebt * monthlyRate) / estimatedMonthlyPayment) / Math.log(1 + monthlyRate)
      : 0;

    return {
      totalDebt,
      estimatedMonthlyPayment,
      monthsToPayoff: Math.ceil(monthsToPayoff),
      totalInterest: (estimatedMonthlyPayment * monthsToPayoff) - totalDebt
    };
  }, [accounts]);

  // Investment allocation suggestions
  const investmentData = useMemo(() => {
    const age = retirementInputs.currentAge;
    const stockAllocation = Math.max(20, 120 - age); // Rule of 120
    const bondAllocation = 100 - stockAllocation;
    
    const totalInvestments = accounts
      ?.filter(a => a.type === 'investment')
      .reduce((sum, a) => sum + a.balance, 0) || 0;

    return {
      recommendedStocks: stockAllocation,
      recommendedBonds: bondAllocation,
      totalInvestments,
      suggestedStockAmount: totalInvestments * (stockAllocation / 100),
      suggestedBondAmount: totalInvestments * (bondAllocation / 100)
    };
  }, [accounts, retirementInputs.currentAge]);

  const calculators = [
    {
      id: 'retirement',
      title: 'Retirement Calculator',
      icon: Calculator,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Plan for your retirement with personalized projections',
      value: formatCurrency(retirementData.projectedBalance),
      subtitle: `At age ${retirementData.retirementAge}`
    },
    {
      id: 'debt',
      title: 'Debt Payoff Planner',
      icon: CreditCard,
      gradient: 'from-red-500 to-red-600',
      description: 'Create a strategy to pay off your debts faster',
      value: debtData.totalDebt > 0 ? formatCurrency(debtData.totalDebt) : 'Debt Free!',
      subtitle: debtData.totalDebt > 0 ? `${Math.floor(debtData.monthsToPayoff / 12)}y ${debtData.monthsToPayoff % 12}m to payoff` : 'Great job!'
    },
    {
      id: 'investment',
      title: 'Investment Allocator',
      icon: PieChart,
      gradient: 'from-green-500 to-green-600',
      description: 'Optimize your investment portfolio allocation',
      value: formatCurrency(investmentData.totalInvestments),
      subtitle: `${investmentData.recommendedStocks}% stocks, ${investmentData.recommendedBonds}% bonds`
    }
  ];

  const lifeEvents = [
    { 
      id: 'home', 
      title: 'Home Purchase', 
      icon: Home, 
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'wedding', 
      title: 'Wedding', 
      icon: Heart, 
      gradient: 'from-pink-500 to-rose-600'
    },
    { 
      id: 'education', 
      title: 'Education', 
      icon: Book, 
      gradient: 'from-purple-500 to-indigo-600'
    },
    { 
      id: 'travel', 
      title: 'Dream Vacation', 
      icon: Plane, 
      gradient: 'from-green-500 to-teal-600'
    }
  ];

  const CalculatorCard = ({ calc }: { calc: typeof calculators[0] }) => {
    const Icon = calc.icon;
    const isActive = activeCalculator === calc.id;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${calc.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{calc.value}</div>
            <div className="text-xs text-gray-500">{calc.subtitle}</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{calc.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{calc.description}</p>
        
        <button 
          className={`w-full py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
            isActive 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
          }`}
          onClick={() => setActiveCalculator(isActive ? null : calc.id)}
        >
          {isActive ? 'Hide Calculator' : 'Open Calculator'}
        </button>
      </div>
    );
  };

  const LifeEventCard = ({ event }: { event: typeof lifeEvents[0] }) => {
    const Icon = event.icon;
    const isSelected = selectedLifeEvent === event.id;

    return (
      <div 
        className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 cursor-pointer group ${
          isSelected ? 'border-orange-300 bg-orange-50' : 'border-gray-100 hover:shadow-lg'
        }`}
        onClick={() => setSelectedLifeEvent(isSelected ? null : event.id)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${event.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Plan Event</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <div className="text-sm text-gray-600">
          {event.id === 'home' && 'Plan for down payment and closing costs'}
          {event.id === 'wedding' && 'Budget for your special day'}
          {event.id === 'education' && 'Save for college or continuing education'}
          {event.id === 'travel' && 'Plan and budget for dream vacations'}
        </div>

        {isSelected && (
          <div className="mt-4 p-4 bg-white rounded-xl">
            <h4 className="font-medium text-gray-900 mb-3">Planning Tools</h4>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-orange-600 font-medium">
                Create Savings Goal →
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-orange-600 font-medium">
                Cost Calculator →
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-orange-600 font-medium">
                Timeline Planner →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Planning</h1>
            <p className="text-gray-600">Plan your financial future with personalized tools and insights</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <Plus className="w-5 h-5" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Retirement Readiness</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercentage(
                    ((retirementData.currentSavings ?? 0) / ((retirementData.monthlyIncome ?? 0) * 10 || 1)) * 100)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Debt-to-Income</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercentage(((debtData.totalDebt ?? 0) / ((retirementData.monthlyIncome ?? 0) * 12 || 1)) * 100)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Investment Growth</p>
                <p className="text-xl font-bold text-green-600">+{formatPercentage(retirementData.expectedReturn)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Goals</p>
                <p className="text-xl font-bold text-gray-900">{goals?.length || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 mb-6 min-h-0 overflow-y-auto">
          <div className="space-y-6">
            {/* Planning Tools */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Calculators</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {calculators.map((calc) => (
                  <CalculatorCard key={calc.id} calc={calc} />
                ))}
              </div>
            </div>

            {/* Calculator Details */}
            {activeCalculator && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                  <h3 className="text-xl font-bold">
                    {calculators.find(c => c.id === activeCalculator)?.title}
                  </h3>
                </div>

                <div className="p-6">
                  {/* Retirement Calculator */}
                  {activeCalculator === 'retirement' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Input Parameters</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
                            <input 
                              type="number"
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={retirementInputs.currentAge}
                              onChange={(e) => setRetirementInputs({...retirementInputs, currentAge: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Retirement Age</label>
                            <input 
                              type="number"
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={retirementInputs.retirementAge}
                              onChange={(e) => setRetirementInputs({...retirementInputs, retirementAge: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input 
                                type="number"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                value={retirementInputs.monthlyContribution}
                                onChange={(e) => setRetirementInputs({...retirementInputs, monthlyContribution: parseInt(e.target.value) || 0})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Annual Return (%)</label>
                            <input 
                              type="number"
                              step="0.1"
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={retirementInputs.expectedReturn}
                              onChange={(e) => setRetirementInputs({...retirementInputs, expectedReturn: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Retirement Projections</h4>
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-green-800 font-medium">Projected Balance</span>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-green-900">{formatCurrency(retirementData.projectedBalance)}</div>
                            <div className="text-sm text-green-700">At retirement age {retirementData.retirementAge}</div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Savings</span>
                              <span className="font-medium">{formatCurrency(retirementData.currentSavings)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Years to Retirement</span>
                              <span className="font-medium">{retirementData.yearsToRetirement} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Income at {retirementData.retirementAge}</span>
                              <span className="font-medium text-green-600">{formatCurrency(retirementData.monthlyIncomeAt65)}</span>
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-xl">
                            <div className="flex items-center mb-2">
                              <Info className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-800">Retirement Tip</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              The 4% rule suggests withdrawing 4% annually from your retirement savings for sustainable income.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Debt Calculator */}
                  {activeCalculator === 'debt' && (
                    <div>
                      {debtData.totalDebt > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Current Debt Analysis</h4>
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-red-800 font-medium">Total Debt</span>
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-2xl font-bold text-red-900">{formatCurrency(debtData.totalDebt)}</div>
                                <div className="text-sm text-red-700">Across all accounts</div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Suggested Monthly Payment</span>
                                  <span className="font-medium">{formatCurrency(debtData.estimatedMonthlyPayment)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Payoff Timeline</span>
                                  <span className="font-medium">{Math.floor(debtData.monthsToPayoff / 12)}y {debtData.monthsToPayoff % 12}m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Interest</span>
                                  <span className="font-medium text-red-600">{formatCurrency(debtData.totalInterest)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Payoff Strategies</h4>
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center mb-2">
                                  <Zap className="w-4 h-4 text-blue-600 mr-2" />
                                  <span className="font-medium text-blue-800">Debt Avalanche</span>
                                </div>
                                <p className="text-sm text-blue-700">Pay minimums on all debts, then extra on highest interest rate debt. Saves the most money.</p>
                              </div>
                              
                              <div className="p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center mb-2">
                                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                                  <span className="font-medium text-green-800">Debt Snowball</span>
                                </div>
                                <p className="text-sm text-green-700">Pay minimums on all debts, then extra on smallest balance. Builds momentum faster.</p>
                              </div>
                              
                              <div className="p-4 bg-purple-50 rounded-xl">
                                <div className="flex items-center mb-2">
                                  <Star className="w-4 h-4 text-purple-600 mr-2" />
                                  <span className="font-medium text-purple-800">Extra Payment Impact</span>
                                </div>
                                <p className="text-sm text-purple-700">
                                  Adding $100/month could save {formatCurrency(debtData.totalInterest * 0.25)} in interest
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h4>
                          <p className="text-gray-600 mb-4">You have no outstanding debt balances.</p>
                          <div className="p-4 bg-green-50 rounded-xl max-w-md mx-auto">
                            <p className="text-sm text-green-700">
                              Keep up the great work! Consider redirecting your previous debt payments toward investments or emergency savings.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Investment Calculator */}
                  {activeCalculator === 'investment' && (
                    <div>
                      {investmentData.totalInvestments > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Recommended Allocation</h4>
                            <div className="space-y-6">
                              <div>
                                <div className="flex justify-between mb-3">
                                  <span className="text-gray-700 font-medium">Stocks (Growth)</span>
                                  <span className="font-bold text-gray-900">{investmentData.recommendedStocks}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${investmentData.recommendedStocks}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                  Target: {formatCurrency(investmentData.suggestedStockAmount)}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-3">
                                  <span className="text-gray-700 font-medium">Bonds (Stability)</span>
                                  <span className="font-bold text-gray-900">{investmentData.recommendedBonds}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${investmentData.recommendedBonds}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                  Target: {formatCurrency(investmentData.suggestedBondAmount)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Portfolio Analysis</h4>
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-purple-800 font-medium">Total Investments</span>
                                  <PieChart className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-2xl font-bold text-purple-900">{formatCurrency(investmentData.totalInvestments)}</div>
                                <div className="text-sm text-purple-700">Current portfolio value</div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Your Age</span>
                                  <span className="font-medium">{retirementInputs.currentAge} years</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Risk Tolerance</span>
                                  <span className="font-medium">
                                    {retirementInputs.currentAge < 40 ? 'Aggressive' : 
                                     retirementInputs.currentAge < 55 ? 'Moderate' : 'Conservative'}
                                  </span>
                                </div>
                              </div>

                              <div className="p-4 bg-yellow-50 rounded-xl">
                                <div className="flex items-center mb-2">
                                  <Target className="w-4 h-4 text-yellow-600 mr-2" />
                                  <span className="text-sm font-medium text-yellow-800">Rebalancing Tip</span>
                                </div>
                                <p className="text-sm text-yellow-700">
                                  Review and rebalance your portfolio every 6-12 months to maintain your target allocation.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <PieChart className="w-8 h-8 text-purple-600" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Start Investing Today</h4>
                          <p className="text-gray-600 mb-6">Connect your investment accounts to see personalized allocation recommendations.</p>
                          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                            Connect Investment Account
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Life Events Planning */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Life Events Planning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {lifeEvents.map((event) => (
                  <LifeEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>

            {/* Active Goals */}
            {goals && goals.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Your Active Goals</h3>
                  <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{goal.emoji}</span>
                          <span className="font-semibold text-gray-900">{goal.name}</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {formatPercentage((goal.current / goal.target) * 100)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;