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
  Star
} from 'lucide-react';
import type { PageProps } from '../types';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

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
      action: 'Compare Rates'
    },
    {
      id: 2,
      title: 'Investment Rebalancing',
      description: 'Optimize your portfolio allocation',
      benefit: 'Reduce risk and improve returns',
      icon: BarChart3,
      color: 'green',
      action: 'Review Portfolio'
    },
    {
      id: 3,
      title: 'Debt Optimization',
      description: 'Consolidate high-interest debt',
      benefit: 'Save on interest payments',
      icon: Shield,
      color: 'blue',
      action: 'Get Quote'
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 mb-6 min-h-0">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center">
                {<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 relative overflow-visible">
                <img src="/mascot.png" alt="Mascot" className="absolute w-8 h-8 object-contain scale-[1.8]"/> 
                </div>}
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
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <img src="/mascot.png" alt="Pennie Logo" className="w-9 h-9 object-contain -scale-x-100"/>
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
                    <div key={insight.id} className={`p-4 bg-gradient-to-r from-${insight.color}-50 to-${insight.color}-100 border border-${insight.color}-200 rounded-xl`}>
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
                          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                            {rec.action} →
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
    </div>
  );
};

export default AIAdvisor;