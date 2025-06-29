import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  MessageCircle, 
  X, 
  Send, 
  Loader2,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Lightbulb,
  Star,
  ExternalLink,
  Calculator,
  CreditCard,
  Building,
  ArrowRight,
  Info,
  Menu
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

// OpenAI Service Class (keeping the same implementation)
class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private createSystemPrompt(userData: any): string {
    return `You are Pennie, a highly knowledgeable and professional personal financial advisor AI. You have access to the user's comprehensive financial data and should provide personalized, actionable advice.

CONTEXT ABOUT THE USER'S FINANCIAL SITUATION:
- Total Income: $${userData.totalIncome?.toFixed(2) || '0.00'}
- Total Expenses: $${userData.totalExpenses?.toFixed(2) || '0.00'}
- Net Worth: $${userData.netWorth?.toFixed(2) || '0.00'}
- Number of Accounts: ${userData.accountCount || 0}
- Active Goals: ${userData.goalCount || 0}
- Budget Categories: ${userData.budgetCount || 0}
- Recent Transactions: ${userData.transactionCount || 0}

AVAILABLE FEATURES IN THE PENNIE APP:
1. Dashboard - Financial overview and insights
2. Transactions - Track and categorize income/expenses
3. Cash Flow - Analyze money movement and trends
4. Budget - Set spending limits and track progress
5. Goals - Save for specific targets (emergency fund, vacation, etc.)
6. Accounts - Manage checking, savings, credit cards, investments
7. Recurring - Track subscriptions and regular payments
8. Planning - Retirement, debt payoff, investment strategies
9. Reports - Generate financial reports and analytics

PERSONALITY & RESPONSE STYLE:
- Be warm, encouraging, and professional
- Use the user's actual financial data when giving advice
- Provide specific, actionable recommendations
- Be concise but thorough (aim for 2-4 sentences typically)
- Use financial terminology appropriately but keep it accessible
- Always be supportive and non-judgmental
- When discussing dollar amounts, be specific using their actual data
- Suggest specific features of the Pennie app when relevant

EXPERTISE AREAS:
- Budgeting and expense tracking
- Savings strategies and emergency funds
- Debt management and payoff strategies
- Investment basics and portfolio allocation
- Retirement planning
- Goal setting and achievement
- Cash flow optimization
- Credit improvement
- Financial planning for major life events
- Tax planning basics

Remember: You have access to their real financial data, so make your advice personal and specific to their situation.`;
  }

  private createUserContext(userData: any): string {
    const context = [];
    
    if (userData.recentTransactions?.length > 0) {
      context.push(`Recent spending: ${userData.recentTransactions.slice(0, 3).map((t: any) => 
        `${t.merchant} (${t.category}): $${Math.abs(t.amount).toFixed(2)}`
      ).join(', ')}`);
    }

    if (userData.topCategories?.length > 0) {
      context.push(`Top spending categories: ${userData.topCategories.slice(0, 3).map((cat: any) => 
        `${cat[0]}: $${cat[1].total.toFixed(2)}`
      ).join(', ')}`);
    }

    if (userData.goals?.length > 0) {
      context.push(`Active goals: ${userData.goals.map((g: any) => 
        `${g.name} (${((g.current / g.target) * 100).toFixed(1)}% complete)`
      ).join(', ')}`);
    }

    if (userData.savingsRate !== undefined) {
      context.push(`Current savings rate: ${userData.savingsRate.toFixed(1)}%`);
    }

    return context.length > 0 ? `\n\nCURRENT FINANCIAL CONTEXT:\n${context.join('\n')}` : '';
  }

  async generateResponse(userMessage: string, userData: any): Promise<string> {
    console.log('🚀 Starting OpenAI API call...');
    console.log('🔑 API Key:', this.apiKey?.substring(0, 10) + '...');
    
    try {
      const systemPrompt = this.createSystemPrompt(userData);
      const userContext = this.createUserContext(userData);
      
      console.log('📋 System prompt length:', systemPrompt.length);
      console.log('👤 User context:', userContext);

      const requestBody = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage + userContext
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      };

      console.log('📤 Sending request to OpenAI...');
      console.log('🌐 URL:', this.baseURL);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI response data:', data);
      
      const aiResponse = data.choices[0]?.message?.content || "I'm having trouble processing your request right now. Please try again.";
      console.log('🎯 Final AI response:', aiResponse);
      
      return aiResponse;
    } catch (error) {
      console.error('💥 OpenAI API Error Details:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach OpenAI API. Check your internet connection.');
      }
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication failed: Invalid API key. Please check your OpenAI API key.');
      }
      
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('Rate limit exceeded: Too many requests. Please wait a moment and try again.');
      }
      
      if (error instanceof Error && error.message.includes('insufficient_quota')) {
        throw new Error('Insufficient credits: Your OpenAI account is out of credits. Please add credits to your account.');
      }
      
      throw error;
    }
  }
}

// High-Yield Savings Modal Component (keeping original but making it responsive)
interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const SavingsModal: React.FC<SavingsModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  
  const savingsOptions = [
    { name: 'Marcus by Goldman Sachs', apy: 4.5, minimum: 0, bonus: 'No fees' },
    { name: 'Capital One 360', apy: 4.25, minimum: 0, bonus: 'Easy mobile banking' },
    { name: 'Ally Bank Online Savings', apy: 4.35, minimum: 0, bonus: 'No monthly fees' },
    { name: 'Discover Online Savings', apy: 4.3, minimum: 0, bonus: 'Cashback rewards' }
  ];

  const currentAPY = 0.1;
  const projectedEarnings = (selectedBank: string) => {
    const bank = savingsOptions.find(b => b.name === selectedBank);
    if (!bank) return 0;
    return (currentBalance * (bank.apy / 100)) - (currentBalance * (currentAPY / 100));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">High-Yield Savings Comparison</h3>
                <p className="text-orange-100 text-sm hidden sm:block">Find the best rates for your savings</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Current Rate Alert</span>
              </div>
              <p className="text-red-700 text-sm">
                You're earning only {currentAPY}% APY. You could be earning 40x more with a high-yield account!
              </p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-4">Top High-Yield Savings Accounts</h4>
            <div className="space-y-3">
              {savingsOptions.map((bank) => (
                <div 
                  key={bank.name}
                  onClick={() => setSelectedBank(bank.name)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedBank === bank.name 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 truncate">{bank.name}</h5>
                      <p className="text-sm text-gray-600">{bank.bonus}</p>
                      <p className="text-xs text-gray-500 mt-1">Minimum: ${bank.minimum.toLocaleString()}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-lg font-bold text-green-600">{bank.apy}% APY</div>
                      <div className="text-xs text-gray-500">Annual Percentage Yield</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBank && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-green-800 mb-2">Potential Annual Earnings</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Current Earnings:</span>
                  <div className="font-bold text-green-900">${(currentBalance * (currentAPY / 100)).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-green-700">New Earnings:</span>
                  <div className="font-bold text-green-900">${(currentBalance * (savingsOptions.find(b => b.name === selectedBank)?.apy || 0) / 100).toFixed(2)}</div>
                </div>
                <div className="col-span-2 pt-2 border-t border-green-200">
                  <span className="text-green-700">Extra Annual Income:</span>
                  <div className="font-bold text-green-900 text-lg">+${projectedEarnings(selectedBank).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                if (selectedBank) {
                  window.open('https://www.nerdwallet.com/banking/savings-accounts', '_blank');
                }
              }}
              disabled={!selectedBank}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Investment Rebalancing Modal Component (making responsive)
interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge: number;
  totalInvestments: number;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, currentAge, totalInvestments }) => {
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  
  const getAllocation = () => {
    const baseStock = Math.max(20, 120 - currentAge);
    const adjustments = {
      conservative: -10,
      moderate: 0,
      aggressive: +10
    };
    const stockPercentage = Math.min(90, Math.max(10, baseStock + adjustments[riskTolerance]));
    return {
      stocks: stockPercentage,
      bonds: 100 - stockPercentage
    };
  };

  const allocation = getAllocation();
  const stockAmount = totalInvestments * (allocation.stocks / 100);
  const bondAmount = totalInvestments * (allocation.bonds / 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Portfolio Rebalancing</h3>
                <p className="text-green-100 text-sm hidden sm:block">Optimize your investment allocation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Your Investment Profile</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600 text-sm">Age</span>
                <div className="font-bold text-gray-900">{currentAge} years</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600 text-sm">Portfolio Value</span>
                <div className="font-bold text-gray-900">${totalInvestments.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Risk Tolerance</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'conservative' as const, label: 'Conservative', desc: 'Lower risk, stable returns' },
                  { value: 'moderate' as const, label: 'Moderate', desc: 'Balanced risk and growth' },
                  { value: 'aggressive' as const, label: 'Aggressive', desc: 'Higher risk, growth focused' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setRiskTolerance(option.value)}
                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                      riskTolerance === option.value 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-blue-800 mb-4">Recommended Allocation</h5>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-700 font-medium">Stocks (Growth)</span>
                    <span className="font-bold text-blue-900">{allocation.stocks}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${allocation.stocks}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Target: ${stockAmount.toLocaleString()}</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-700 font-medium">Bonds (Stability)</span>
                    <span className="font-bold text-blue-900">{allocation.bonds}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${allocation.bonds}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Target: ${bondAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <Info className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Rebalancing Tips</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Rebalance every 6-12 months or when allocation drifts 5%+</li>
                <li>• Consider tax implications when rebalancing in taxable accounts</li>
                <li>• Use new contributions to rebalance before selling existing holdings</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Review Later
            </button>
            <button
              onClick={() => {
                window.open('https://www.bogleheads.org/wiki/Rebalancing', '_blank');
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Learn More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Debt Optimization Modal Component (making responsive)
interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDebt: number;
  monthlyPayment: number;
}

const DebtModal: React.FC<DebtModalProps> = ({ isOpen, onClose, totalDebt, monthlyPayment }) => {
  const [consolidationAmount, setConsolidationAmount] = useState(totalDebt);
  const [newRate, setNewRate] = useState(12);
  const [currentRate] = useState(18);
  
  const calculateSavings = () => {
    const currentMonthlyInterest = (totalDebt * (currentRate / 100)) / 12;
    const newMonthlyInterest = (consolidationAmount * (newRate / 100)) / 12;
    const monthlySavings = currentMonthlyInterest - newMonthlyInterest;
    return {
      monthly: monthlySavings,
      annual: monthlySavings * 12
    };
  };

  const savings = calculateSavings();

  const consolidationOptions = [
    { 
      type: 'Personal Loan', 
      rate: '10-15%', 
      term: '3-5 years',
      pros: ['Fixed rate', 'Predictable payments', 'No collateral needed'],
      cons: ['Higher rates for poor credit', 'Origination fees possible']
    },
    { 
      type: 'Balance Transfer Card', 
      rate: '0% intro (12-21 mo)', 
      term: 'Varies',
      pros: ['0% intro period', 'Consolidate multiple cards', 'Rewards possible'],
      cons: ['High rate after intro', 'Balance transfer fees', 'Requires good credit']
    },
    { 
      type: 'Home Equity Loan', 
      rate: '7-10%', 
      term: '5-30 years',
      pros: ['Lower rates', 'Tax deductible interest', 'Large amounts available'],
      cons: ['Home as collateral', 'Closing costs', 'Risk of foreclosure']
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Debt Consolidation Options</h3>
                <p className="text-blue-100 text-sm hidden sm:block">Reduce your interest payments and simplify debts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Current Debt Situation</h4>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-700">Total Debt:</span>
                    <span className="font-bold text-red-900">${totalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Avg. Interest Rate:</span>
                    <span className="font-bold text-red-900">{currentRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Monthly Payment:</span>
                    <span className="font-bold text-red-900">${monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consolidation Amount
                  </label>
                  <input
                    type="number"
                    value={consolidationAmount}
                    onChange={(e) => setConsolidationAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRate}
                    onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {savings.monthly > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <h5 className="font-semibold text-green-800 mb-2">Potential Savings</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Monthly Interest Savings:</span>
                      <span className="font-bold text-green-900">${savings.monthly.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Annual Savings:</span>
                      <span className="font-bold text-green-900">${savings.annual.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Consolidation Options</h4>
              <div className="space-y-4">
                {consolidationOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900">{option.type}</h5>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{option.rate}</div>
                        <div className="text-xs text-gray-500">{option.term}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-green-700">Pros:</span>
                        <ul className="text-green-600 mt-1">
                          {option.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">Cons:</span>
                        <ul className="text-red-600 mt-1">
                          {option.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={() => {
                window.open('https://www.creditkarma.com/personal-loans', '_blank');
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Get Quotes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define PageProps interface if not already defined
interface PageProps {
  setActiveTab: any;
  setShowAddTransaction: any;
  setShowAddAccount: any;
  transactions: any[];
  budgetCategories: any[];
  accounts: any[];
  goals: any[];
  [key: string]: any;
}

// Main AIAdvisor Component with responsive fixes
const AIAdvisor: React.FC<PageProps> = ({
  transactions = [],
  budgetCategories = [],
  accounts = [],
  goals = [],
  ...otherProps
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Pennie, your personal AI financial advisor. I've analyzed your financial data and I'm here to provide personalized advice. What would you like to know about your finances?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize OpenAI service
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const openAIService = new OpenAIService('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');

  // Test OpenAI connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Testing OpenAI connection...');
        const testData = {
          totalIncome: 0,
          totalExpenses: 0,
          netWorth: 0,
          savingsRate: 0,
          accountCount: 0,
          goalCount: 0,
          budgetCount: 0,
          transactionCount: 0,
          recentTransactions: [],
          topCategories: [],
          goals: []
        };
        
        await openAIService.generateResponse('Connection test', testData);
        setConnectionStatus('connected');
        console.log('✅ OpenAI connection successful!');
      } catch (error) {
        setConnectionStatus('failed');
        console.error('❌ OpenAI connection failed:', error);
      }
    };

    testConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Use provided data or fallback to mock data for demo
  const mockTransactions = [
    { id: '1', amount: -25.50, merchant: 'Starbucks', category: 'Food & Dining' },
    { id: '2', amount: -89.99, merchant: 'Amazon', category: 'Shopping' },
    { id: '3', amount: 3000, merchant: 'Salary', category: 'Income' }
  ];

  const mockBudgetCategories = [
    { name: 'Food & Dining', spent: 450, budget: 500 },
    { name: 'Shopping', spent: 200, budget: 300 }
  ];

  const mockAccounts = [
    { type: 'Savings', balance: 15000 },
    { type: 'Investment', balance: 25000 },
    { type: 'Credit Card', balance: -2500 }
  ];

  const mockGoals = [
    { name: 'Emergency Fund', current: 8000, target: 10000 }
  ];

  // Use real data if available, otherwise use mock data
  const finalTransactions = transactions?.length > 0 ? transactions : mockTransactions;
  const finalBudgetCategories = budgetCategories?.length > 0 ? budgetCategories : mockBudgetCategories;
  const finalAccounts = accounts?.length > 0 ? accounts : mockAccounts;
  const finalGoals = goals?.length > 0 ? goals : mockGoals;

  // Prepare user data for AI context
  const prepareUserData = () => {
    const totalIncome = finalTransactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalExpenses = Math.abs(finalTransactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)) || 0;
    const netWorth = finalAccounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const recentTransactions = finalTransactions?.slice(0, 5) || [];

    const categoryTotals = finalTransactions?.filter(t => t.amount < 0).reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) acc[category] = { total: 0, count: 0 };
      acc[category].total += Math.abs(t.amount);
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>) || {};

    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as { total: number }).total - (a as { total: number }).total)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      netWorth,
      savingsRate,
      accountCount: finalAccounts?.length || 0,
      goalCount: finalGoals?.length || 0,
      budgetCount: finalBudgetCategories?.length || 0,
      transactionCount: finalTransactions?.length || 0,
      recentTransactions,
      topCategories,
      goals: finalGoals || []
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const userData = prepareUserData();
      const aiResponse = await openAIService.generateResponse(currentInput, userData);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ OpenAI Connection Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🔧 **Connection Status**: OpenAI API connection failed
        
**Error Details**: ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting Steps**:
1. ✅ Check your API key is set correctly
2. ✅ Verify your OpenAI account has credits
3. ✅ Check your internet connection
4. ✅ Ensure API key has proper permissions

I'm falling back to basic responses for now. Please fix the connection to get personalized AI advice!`,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Calculate financial data for insights
  const savingsBalance = finalAccounts?.filter(a => a.type.toLowerCase() === 'savings').reduce((sum, a) => sum + a.balance, 0) || 0;
  const investmentBalance = finalAccounts?.filter(a => a.type.toLowerCase() === 'investment').reduce((sum, a) => sum + a.balance, 0) || 0;
  const debtBalance = Math.abs(finalAccounts?.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0) || 0);
  const estimatedDebtPayment = Math.max(debtBalance * 0.03, 100);

  // Calculate insights from real data
  const insights = [
    {
      id: 1,
      type: 'alert',
      title: 'Spending Pattern Alert',
      description: finalBudgetCategories?.length > 0 
        ? `Your ${finalBudgetCategories.reduce((max, cat) => cat.spent > max.spent ? cat : max).name} spending is trending higher this month`
        : 'Add budget categories to track spending patterns',
      color: 'orange',
      icon: AlertCircle
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Investment Opportunity',
      description: finalAccounts?.filter(a => a.type.toLowerCase() === 'savings').length > 0
        ? 'Consider moving excess savings to investment accounts for better returns'
        : 'Set up automatic investments to grow your wealth over time',
      color: 'green',
      icon: TrendingUp
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Goal Progress',
      description: finalGoals?.length > 0 
        ? `You're making great progress on your ${finalGoals[0].name} goal`
        : 'Set financial goals to track your progress and stay motivated',
      color: 'purple',
      icon: Target
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: 'High-Yield Savings',
      description: 'Switch to earn more on your savings',
      benefit: 'Earn 4.5% APY vs current 0.1%',
      icon: PiggyBank,
      color: 'orange',
      action: 'Compare Rates',
      onClick: () => setShowSavingsModal(true)
    },
    {
      id: 2,
      title: 'Investment Rebalancing',
      description: 'Optimize your portfolio allocation',
      benefit: 'Reduce risk and improve returns',
      icon: BarChart3,
      color: 'green',
      action: 'Review Portfolio',
      onClick: () => setShowInvestmentModal(true)
    },
    {
      id: 3,
      title: 'Debt Optimization',
      description: 'Consolidate high-interest debt',
      benefit: 'Save on interest payments',
      icon: Shield,
      color: 'blue',
      action: 'Get Quote',
      onClick: () => setShowDebtModal(true)
    }
  ];

  const quickActions = [
    'How can I improve my savings rate?',
    'What should I invest in based on my portfolio?',
    'Help me create a budget for my expenses',
    'How can I pay off my debt faster?',
    'What retirement planning advice do you have?',
    'Analyze my spending patterns',
    'How am I doing financially overall?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-full mx-auto">
        {/* Mobile Header */}
        <div className="flex-shrink-0 lg:hidden bg-white shadow-sm border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Financial Advisor</h1>
              <p className="text-sm text-gray-600">Powered by OpenAI</p>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex flex-shrink-0 flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Financial Advisor</h1>
            <p className="text-gray-600">Get personalized financial insights powered by OpenAI</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <Bot className="w-5 h-5" />
              <span>AI-Powered Advice</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Chat Interface - Always visible, takes full width on mobile */}
          <div className="flex-1 lg:flex-[2] bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:m-6 lg:mt-0 overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 lg:p-6 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3 lg:mr-4 relative overflow-visible">
                  <img src="/mascot.png" alt="Mascot" className="absolute w-8 h-8 object-contain scale-[1.8]"/> 
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold">Pennie AI Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-orange-100 text-sm">Powered by OpenAI GPT-4</p>
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-400' : 
                      connectionStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 
                      'bg-red-400'
                    }`} title={
                      connectionStatus === 'connected' ? 'Connected to OpenAI' : 
                      connectionStatus === 'testing' ? 'Testing connection...' : 
                      'Connection failed'
                    }></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages - Responsive height */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 min-h-[300px] lg:min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start ${message.isBot ? '' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <img src="/mascot.png" alt="Pennie Logo" className="w-8 h-8 lg:w-13 lg:h-13 object-contain -scale-x-100"/>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] lg:max-w-[80%] p-3 lg:p-4 rounded-2xl ${
                      message.isBot
                        ? 'bg-gray-50 text-gray-900 rounded-bl-none'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-none'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content.split('\n').map((line, lineIndex) => {
                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <div key={lineIndex}>
                            {parts.map((part, partIndex) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                              }
                              return <span key={partIndex}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                    <span className={`text-xs mt-2 block ${message.isBot ? 'text-gray-500' : 'text-orange-100'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                    <img src="/mascot.png" alt="Pennie Logo" className="w-6 h-6 lg:w-9 lg:h-9 object-contain -scale-x-100"/>
                  </div>
                  <div className="bg-gray-50 p-3 lg:p-4 rounded-2xl rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - Responsive scrolling */}
            <div className="px-4 lg:px-6 pb-2 lg:pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input - Fixed at bottom */}
            <div className="p-4 lg:p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 px-3 lg:px-4 py-2 lg:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 lg:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Send className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Hidden on mobile by default, toggleable */}
          <div className={`${showSidebar ? 'block' : 'hidden'} lg:block lg:flex-1 bg-white lg:bg-transparent`}>
            {/* Mobile sidebar overlay */}
            {showSidebar && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSidebar(false)} />
            )}
            
            <div className={`${showSidebar ? 'fixed right-0 top-0 h-full w-80 z-50 bg-white shadow-xl' : ''} lg:relative lg:h-auto lg:w-auto lg:shadow-none lg:bg-transparent p-4 lg:p-6 lg:pt-0 space-y-6 overflow-y-auto`}>
              {/* Mobile sidebar header */}
              {showSidebar && (
                <div className="lg:hidden flex items-center justify-between pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Insights & Tips</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* AI Insights */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <div className="flex items-center mb-4 lg:mb-6">
                  <Lightbulb className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                </div>
                <div className="space-y-4">
                  {insights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                      <div key={insight.id} className={`p-4 bg-white border border-${insight.color}-200 rounded-xl shadow-sm`}>
                        <div className="flex items-start">
                          <Icon className={`w-4 h-4 text-${insight.color}-600 mt-1 mr-3 flex-shrink-0`} />
                          <div>
                            <h4 className={`font-semibold text-${insight.color}-800 mb-1`}>{insight.title}</h4>
                            <p className={`text-sm text-${insight.color}-700`}>{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <div className="flex items-center mb-4 lg:mb-6">
                  <Star className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.map((rec) => {
                    const Icon = rec.icon;
                    return (
                      <div key={rec.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className={`w-10 h-10 bg-${rec.color}-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                            <Icon className={`w-5 h-5 text-${rec.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                            <p className="text-xs text-green-600 font-medium mb-3">{rec.benefit}</p>
                            <button 
                              onClick={rec.onClick}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>{rec.action}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <SavingsModal
          isOpen={showSavingsModal}
          onClose={() => setShowSavingsModal(false)}
          currentBalance={savingsBalance}
        />

        <InvestmentModal
          isOpen={showInvestmentModal}
          onClose={() => setShowInvestmentModal(false)}
          currentAge={30}
          totalInvestments={investmentBalance}
        />

        <DebtModal
          isOpen={showDebtModal}
          onClose={() => setShowDebtModal(false)}
          totalDebt={debtBalance}
          monthlyPayment={estimatedDebtPayment}
        />
      </div>
    </div>
  );
};

export default AIAdvisor;