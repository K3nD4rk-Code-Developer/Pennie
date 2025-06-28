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
  Info
} from 'lucide-react';
import type { PageProps } from '../types';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

// High-Yield Savings Modal Component
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
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <PiggyBank className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">High-Yield Savings Comparison</h3>
                <p className="text-orange-100 text-sm">Find the best rates for your savings</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
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
                    <div>
                      <h5 className="font-semibold text-gray-900">{bank.name}</h5>
                      <p className="text-sm text-gray-600">{bank.bonus}</p>
                      <p className="text-xs text-gray-500 mt-1">Minimum: ${bank.minimum.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
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

          <div className="flex space-x-3">
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

// Investment Rebalancing Modal Component
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Portfolio Rebalancing</h3>
                <p className="text-green-100 text-sm">Optimize your investment allocation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
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
              <div className="grid grid-cols-3 gap-3">
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

          <div className="flex space-x-3">
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

// Debt Optimization Modal Component
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Debt Consolidation Options</h3>
                <p className="text-blue-100 text-sm">Reduce your interest payments and simplify debts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
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
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
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

          <div className="flex space-x-3 mt-6">
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

const instructions = [
  {
    category: "Help Center",
    questions: [
      {
        user_input: "change my password",
        response: "To change your password, go to Settings > Security > Change Password. You'll need to enter your current password and choose a new one that meets our security requirements."
      },
      {
        user_input: "update my notification preferences",
        response: "Navigate to Settings > Notifications. Here you can toggle different types of notifications and choose how you'd like to receive them (email, push, or in-app)."
      },
      {
        user_input: "export my transaction history",
        response: "On the Transactions page, click the Export button in the top right. You can choose between CSV, PDF, or Excel formats for your export."
      },
      {
        user_input: "transaction pending",
        response: "Transactions may show as pending for up to 3-5 business days while they're being processed by your bank. Once cleared, they'll update automatically."
      },
      {
        user_input: "security measures",
        response: "We use bank-level 256-bit encryption, two-factor authentication, and regular security audits to protect your data."
      },
      {
        user_input: "enable two-factor authentication",
        response: "Go to Settings > Security > Two-Factor Authentication. You can choose between SMS verification or an authenticator app."
      }
    ]
  },
  {
    category: "Financial Dashboard",
    questions: [
      {
        user_input: "view my income and expenses",
        response: "You can view your total income and expenses on the financial dashboard, which shows an overview of your revenue and spending trends."
      },
      {
        user_input: "change the time range",
        response: "Use the Time Range buttons (Today, Week, Month, Year) to filter transactions based on different time periods."
      },
      {
        user_input: "spending distribution",
        response: "The Spending Distribution chart shows the percentage of expenses per category for better budget management."
      },
      {
        user_input: "recent transactions",
        response: "Your most recent transactions are displayed on the dashboard, and you can search for specific transactions using the search bar."
      },
      {
        user_input: "export financial data",
        response: "Click the Export button in the Transactions section to download your financial data as a CSV, PDF, or Excel file."
      }
    ]
  },
  {
    category: "Payment Center",
    questions: [
      {
        user_input: "add a payment",
        response: "Click the 'Add Payment' button, enter the amount, date, label, category, and select income or expense."
      },
      {
        user_input: "edit a transaction",
        response: "Click on a transaction and select 'Edit' to update the details before saving."
      },
      {
        user_input: "delete a transaction",
        response: "Click on a transaction and select 'Delete' to remove it from your records."
      },
      {
        user_input: "custom categories",
        response: "You can add a custom category when adding a payment by selecting '+ Add Custom Category' and entering a new category name."
      }
    ]
  },
  {
    category: "Transaction Management",
    questions: [
      {
        user_input: "how are transactions stored",
        response: "Transactions are saved locally under your account and are only visible when logged in."
      },
      {
        user_input: "add transactions programmatically",
        response: "Transactions are added using the 'addTransaction' function, which assigns a unique ID and saves it."
      },
      {
        user_input: "how are totals calculated",
        response: "Your total income and expenses are automatically calculated from all transactions and displayed in the dashboard."
      }
    ]
  }
];

const findResponse = (userInput: string) => {
  userInput = userInput.toLowerCase();
  for (const category of instructions) {
    for (const question of category.questions) {
      if (userInput.includes(question.user_input)) {
        return question.response;
      }
    }
  }
  
  // Generate contextual responses based on keywords
  if (userInput.includes('budget') || userInput.includes('spending')) {
    return "I can help you analyze your spending patterns and create better budgets. Based on your transaction history, I can identify areas where you might be overspending and suggest optimizations.";
  }
  if (userInput.includes('save') || userInput.includes('savings')) {
    return "To improve your savings rate, consider automating transfers to your savings account right after payday. I can analyze your income and expenses to suggest an optimal savings amount.";
  }
  if (userInput.includes('invest') || userInput.includes('investment')) {
    return "Based on your financial profile, I recommend diversifying your investments. Consider low-cost index funds and maintaining an age-appropriate stock-to-bond ratio.";
  }
  if (userInput.includes('debt') || userInput.includes('pay off')) {
    return "For debt payoff, I recommend the debt avalanche method - pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money over time.";
  }
  if (userInput.includes('goal') || userInput.includes('target')) {
    return "Setting specific, measurable financial goals is crucial. I can help you break down large goals into manageable monthly targets and track your progress automatically.";
  }
  
  return "I'm here to help with your financial questions! Ask me about budgeting, saving, investing, debt management, or any other financial topics you'd like guidance on.";
};

const AIAdvisor: React.FC<PageProps> = ({
  transactions,
  budgetCategories,
  accounts,
  goals
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello I'm Pennie, your personal AI financial advisor! I've analyzed your financial data and I'm here to help you make smarter financial decisions. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
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

    // Simulate AI processing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: findResponse(currentInput),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  // Calculate financial data
  const savingsBalance = accounts?.filter(a => a.type.toLowerCase() === 'savings').reduce((sum, a) => sum + a.balance, 0) || 0;
  const investmentBalance = accounts?.filter(a => a.type.toLowerCase() === 'investment').reduce((sum, a) => sum + a.balance, 0) || 0;
  const debtBalance = Math.abs(accounts?.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0) || 0);
  const estimatedDebtPayment = Math.max(debtBalance * 0.03, 100);

  // Calculate insights from real data
  const insights = [
    {
      id: 1,
      type: 'alert',
      title: 'Spending Pattern Alert',
      description: budgetCategories?.length > 0 
        ? `Your ${budgetCategories.reduce((max, cat) => cat.spent > max.spent ? cat : max).name} spending is trending higher this month`
        : 'Add budget categories to track spending patterns',
      color: 'orange',
      icon: AlertCircle
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Investment Opportunity',
      description: accounts?.filter(a => a.type.toLowerCase() === 'savings').length > 0
        ? 'Consider moving excess savings to investment accounts for better returns'
        : 'Set up automatic investments to grow your wealth over time',
      color: 'green',
      icon: TrendingUp
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Goal Progress',
      description: goals?.length > 0 
        ? `You're making great progress on your ${goals[0].name} goal`
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
    'What should I invest in?',
    'Help me create a budget',
    'How to pay off debt faster?',
    'Retirement planning advice'
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Financial Advisor</h1>
            <p className="text-gray-600">Get personalized financial insights and recommendations</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <Bot className="w-5 h-5" />
              <span>Ask AI Advisor</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 mb-6 min-h-0 h-[600px] overflow-y-auto">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 relative overflow-visible">
                <img src="/mascot.png" alt="Mascot" className="absolute w-8 h-8 object-contain scale-[1.8]"/> 
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pennie AI Assistant</h3>
                  <p className="text-orange-100">Your personal financial advisor</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start ${message.isBot ? '' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <img src="/mascot.png" alt="Pennie Logo" className="w-13 h-13 object-contain -scale-x-100"/>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.isBot
                        ? 'bg-gray-50 text-gray-900 rounded-bl-none'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <span className={`text-xs mt-2 block ${message.isBot ? 'text-gray-500' : 'text-orange-100'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                    <img src="/mascot.png" alt="Pennie Logo" className="w-9 h-9 object-contain -scale-x-100"/>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl rounded-bl-none">
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

            {/* Quick Actions */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
              </div>
              <div className="space-y-4">
                {insights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div key={insight.id} className={`p-4 bg-white border border-${insight.color}-200 rounded-xl shadow-clean`}>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Star className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
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
                        <div className="flex-1">
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