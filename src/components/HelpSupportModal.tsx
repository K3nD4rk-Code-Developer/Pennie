// HelpSupportModal.tsx - Working Help & Support Component
import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Search,
  ChevronRight,
  Video,
  Book,
  CreditCard,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Calculator,
  Bot,
  Lightbulb,
  Clock,
  ChevronLeft,
  Shield,
  PlayCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
  lastLogin: string;
  isVerified: boolean;
  preferences: {
    currency: string;
    timezone: string;
    notifications: boolean;
  };
}

interface HelpSupportModalProps {
  showHelpSupport: boolean;
  setShowHelpSupport: (show: boolean) => void;
  darkMode: boolean;
  user: User;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  readTime: string;
  content: React.ReactNode;
}

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ 
  showHelpSupport, 
  setShowHelpSupport, 
  darkMode,
  user 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I connect my bank account?',
      answer: 'Go to the Accounts page and click "Connect Account". We use bank-level encryption to securely connect to your financial institutions.',
      category: 'accounts'
    },
    {
      id: '2',
      question: 'Is my financial data secure?',
      answer: 'Yes! We use 256-bit SSL encryption, the same security banks use. We never store your banking credentials.',
      category: 'security'
    },
    {
      id: '3',
      question: 'How do I set up a budget?',
      answer: 'Navigate to the Budget page and click "Create Budget". Start with major categories like Food and Transportation.',
      category: 'budgeting'
    },
    {
      id: '4',
      question: 'Can I track multiple goals at once?',
      answer: 'Absolutely! You can create unlimited savings goals, debt payoff plans, and investment targets.',
      category: 'goals'
    }
  ];

  // Video Tutorials Article
  const videoTutorialsArticle: HelpArticle = {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for Pennie',
    category: 'tutorials',
    icon: Video,
    readTime: '15 min',
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Video Tutorials</h2>
          <p className="text-lg mb-6">Learn Pennie through our comprehensive video tutorial library. Follow along with step-by-step instructions to master every feature.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Getting Started (5:30)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complete walkthrough for new users - from signup to your first budget</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>

          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Connecting Accounts (3:45)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Safe and secure account linking with banks and credit cards</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>

          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Budget Creation (4:20)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Build effective budgets that actually work for your lifestyle</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>

          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Goal Setting (6:15)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create and track savings goals, debt payoff plans, and more</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>

          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-teal-500 to-green-500 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Investment Tracking (7:30)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monitor your portfolio performance and asset allocation</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>

          <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Advisor (5:45)</h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get the most from AI-powered financial insights and recommendations</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Watch Now →</button>
          </div>
        </div>


      </div>
    )
  };

  // Tips & Tricks Article
  const tipsAndTricksArticle: HelpArticle = {
    id: 'tips-tricks',
    title: 'Tips & Tricks',
    description: 'Advanced tips to maximize your Pennie experience',
    category: 'tips',
    icon: Lightbulb,
    readTime: '10 min',
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Tips & Tricks</h2>
          <p className="text-lg mb-6">Discover advanced techniques and hidden features to become a Pennie power user and optimize your financial management.</p>
        </div>

        <div className="space-y-6">
          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🏃‍♂️ Quick Transaction Entry</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Use keyboard shortcuts to add transactions faster:</p>
                <div className={`bg-gray-50 p-3 rounded font-mono text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'text-gray-700'}`}>
                  <div>• <strong>Ctrl + E</strong> - Add new expense/transaction</div>
                  <div>• <strong>Ctrl + B</strong> - Add new bank account</div>
                  <div>• <strong>Ctrl + G</strong> - Create new goal</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🏷️ Smart Transaction Categorization</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Help Pennie learn your spending patterns:</p>
                <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Always correct miscategorized transactions</li>
                  <li>• Use specific merchant names for better recognition</li>
                  <li>• Split transactions for mixed purchases (groceries + pharmacy)</li>
                  <li>• Add notes to unusual transactions for context</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🎯 Budget Optimization</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Make your budgets more effective:</p>
                <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Start with 3-4 major categories, add more gradually</li>
                  <li>• Use the 50/30/20 rule as a starting point</li>
                  <li>• Review and adjust monthly based on actual spending</li>
                  <li>• Set up alerts at 80% of category limits</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🤖 AI Advisor Pro Tips</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get the most from AI-powered insights:</p>
                <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Ask specific questions: "Why did my food spending increase?"</li>
                  <li>• Use natural language: "How can I save for vacation?"</li>
                  <li>• Review AI suggestions weekly for best results</li>
                  <li>• Provide feedback to improve recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-red-600 font-bold text-sm">5</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📊 Dashboard Customization</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customize your dashboard for maximum insight:</p>
                <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Drag and drop widgets to rearrange</li>
                  <li>• Hide widgets you don't use regularly</li>
                  <li>• Set custom date ranges for trend analysis</li>
                  <li>• Pin your most important goals to the top</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-teal-600 font-bold text-sm">6</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔔 Smart Notifications</h3>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stay on top of your finances with alerts:</p>
                <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Enable goal milestone notifications</li>
                  <li>• Set up unusual spending alerts</li>
                  <li>• Get weekly spending summaries</li>
                  <li>• Turn on bill due date reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r from-orange-500 to-orange-800 text-white p-6 rounded-lg ${darkMode ? 'opacity-90' : ''}`}>
          <h3 className="font-semibold mb-2">💡 Pro Tip of the Week</h3>
          <p className="text-sm opacity-90">
            Use the export feature to download your transaction data for tax preparation. 
            Go to Reports → Export Data and select "Tax Year Summary" for a clean, organized file your accountant will love!
          </p>
        </div>
      </div>
    )
  };

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Pennie',
      description: 'Complete setup guide for new users',
      category: 'basics',
      icon: Book,
      readTime: '5 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Pennie! 🎉</h2>
            <p className="text-lg mb-6">This comprehensive guide will help you get started with Pennie and make the most of your personal finance management experience.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Step 1: Account Setup</h3>
            <p className="mb-3">After creating your account, you'll want to complete your profile:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> Ensure your name and email are correct</li>
              <li><strong>Security Settings:</strong> Enable two-factor authentication for added security</li>
              <li><strong>Preferences:</strong> Set your currency, timezone, and notification preferences</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Step 2: Connect Your First Account</h3>
            <p className="mb-3">The foundation of Pennie is connecting your financial accounts. Start with your primary checking account:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Navigate to the "Accounts" page in the sidebar</li>
              <li>Click "Connect Account" or the "+" button</li>
              <li>Search for your bank and follow the secure connection process</li>
              <li>Verify the account appears in your accounts list</li>
            </ol>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded">
              <p className="text-blue-800"><strong>Security Note:</strong> We use bank-level encryption and never store your banking credentials. We only access read-only information about your accounts.</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Step 3: Review Your Dashboard</h3>
            <p className="mb-3">Once your first account is connected, your dashboard will start showing:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account balances and recent transactions</li>
              <li>Spending insights and trends</li>
              <li>Cash flow overview</li>
              <li>Recommended actions</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Step 4: Set Up Your First Budget</h3>
            <p className="mb-3">Creating a budget helps you track spending and reach your financial goals:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to the "Budget" page</li>
              <li>Click "Create Budget"</li>
              <li>Start with major categories: Food, Transportation, Entertainment, Utilities</li>
              <li>Set realistic spending limits based on your transaction history</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Pro Tips for Success</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Check Daily:</strong> Spend 2-3 minutes reviewing your dashboard each morning</li>
              <li><strong>Categorize Transactions:</strong> Help Pennie learn by correcting transaction categories</li>
              <li><strong>Use the AI Advisor:</strong> Get personalized recommendations based on your spending patterns</li>
              <li><strong>Set Up Alerts:</strong> Get notified about unusual spending or low balances</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800"><strong>Next Steps:</strong> Once you're comfortable with the basics, explore advanced features like investment tracking, tax preparation tools, and financial planning calculators.</p>
          </div>
        </div>
      )
    },
    {
      id: '2',
      title: 'Connecting Your Accounts',
      description: 'Step-by-step account linking process',
      category: 'accounts',
      icon: CreditCard,
      readTime: '3 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Connecting Your Financial Accounts</h2>
            <p className="text-lg mb-6">Securely linking your bank accounts, credit cards, and investment accounts is the foundation of effective financial tracking with Pennie.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">What Accounts Can You Connect?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">✅ Bank Accounts</h4>
                <ul className="text-sm space-y-1">
                  <li>• Checking accounts</li>
                  <li>• Savings accounts</li>
                  <li>• Money market accounts</li>
                  <li>• Certificates of deposit</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">💳 Credit Accounts</h4>
                <ul className="text-sm space-y-1">
                  <li>• Credit cards</li>
                  <li>• Store credit cards</li>
                  <li>• Lines of credit</li>
                  <li>• Business credit cards</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">How to Connect an Account</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Navigate to Accounts:</strong> Click "Accounts" in the left sidebar</li>
              <li><strong>Start Connection:</strong> Click the "Connect Account" button or "+" icon</li>
              <li><strong>Search for Your Bank:</strong> Type your bank name in the search box</li>
              <li><strong>Enter Credentials:</strong> Use your online banking username and password</li>
              <li><strong>Complete Authentication:</strong> Follow any additional security steps</li>
              <li><strong>Select Accounts:</strong> Choose which accounts to connect</li>
              <li><strong>Verify Connection:</strong> Confirm your accounts appear in the list</li>
            </ol>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <h4 className="text-red-800 font-semibold mb-2">Your Security is Our Priority</h4>
            <ul className="text-red-700 space-y-1">
              <li>• <strong>Bank-Level Encryption:</strong> 256-bit SSL encryption protects all data</li>
              <li>• <strong>Read-Only Access:</strong> We can only view account information, never make transactions</li>
              <li>• <strong>No Stored Credentials:</strong> Your banking passwords are never saved</li>
              <li>• <strong>Secure Partners:</strong> We use Plaid and Yodlee, trusted by major financial institutions</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: '3',
      title: 'Creating Effective Budgets',
      description: 'Best practices for budget planning',
      category: 'budgeting',
      icon: PieChart,
      readTime: '7 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Creating Effective Budgets</h2>
            <p className="text-lg mb-6">A well-planned budget is your roadmap to financial success. Learn how to create realistic, sustainable budgets that actually work.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Types of Budgets in Pennie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">🟢 Zero-Based Budget</h4>
                <p className="text-sm">Every dollar is assigned a purpose. Income minus expenses equals zero.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">🔵 50/30/20 Budget</h4>
                <p className="text-sm">50% needs, 30% wants, 20% savings and debt repayment.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-purple-600 mb-2">🟣 Envelope Budget</h4>
                <p className="text-sm">Allocate specific amounts to spending categories like cash envelopes.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Step 1: Calculate Your Income</h3>
            <p className="mb-3">Start with your after-tax income from all sources:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Salary/Wages:</strong> Your take-home pay after taxes and deductions</li>
              <li><strong>Side Income:</strong> Freelance work, gig economy earnings</li>
              <li><strong>Passive Income:</strong> Dividends, rental income, interest</li>
              <li><strong>Other Sources:</strong> Government benefits, alimony, etc.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Step 2: Apply the 50/30/20 Rule</h3>
            <ul className="space-y-2">
              <li>• <strong>50% for Needs:</strong> Housing, food, transportation, utilities, minimum debt payments</li>
              <li>• <strong>30% for Wants:</strong> Entertainment, dining out, hobbies, non-essential shopping</li>
              <li>• <strong>20% for Savings & Debt:</strong> Emergency fund, retirement, extra debt payments</li>
            </ul>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-800"><strong>Remember:</strong> A budget is a living document. The goal isn't restriction—it's giving every dollar a purpose so you can achieve your financial goals while still enjoying life.</p>
          </div>
        </div>
      )
    },
    {
      id: '4',
      title: 'Setting and Tracking Goals',
      description: 'Maximize your savings potential',
      category: 'goals',
      icon: Target,
      readTime: '4 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Setting and Tracking Financial Goals</h2>
            <p className="text-lg mb-6">Clear financial goals provide direction and motivation for your money decisions. Learn how to set effective goals and track your progress in Pennie.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Types of Financial Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">💚 Savings Goals</h4>
                <ul className="text-sm space-y-1">
                  <li>• Emergency fund</li>
                  <li>• Vacation savings</li>
                  <li>• Down payment fund</li>
                  <li>• New car fund</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">❤️ Debt Payoff Goals</h4>
                <ul className="text-sm space-y-1">
                  <li>• Credit card debt</li>
                  <li>• Student loans</li>
                  <li>• Personal loans</li>
                  <li>• Mortgage payoff</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Setting SMART Financial Goals</h3>
            <p className="mb-3">Use the SMART framework to create achievable goals:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Specific:</strong> Define exactly what you want to achieve</li>
              <li><strong>Measurable:</strong> Include numbers so you can track progress</li>
              <li><strong>Achievable:</strong> Set realistic goals based on your income</li>
              <li><strong>Relevant:</strong> Align with your values and priorities</li>
              <li><strong>Time-bound:</strong> Set a clear deadline for completion</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">How to Create Goals in Pennie</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Navigate to Goals:</strong> Click "Goals" in the left sidebar</li>
              <li><strong>Create New Goal:</strong> Click "Add Goal" or the "+" button</li>
              <li><strong>Choose Goal Type:</strong> Select savings, debt payoff, or investment goal</li>
              <li><strong>Set Target Amount:</strong> Enter your specific dollar target</li>
              <li><strong>Set Timeline:</strong> Choose your target completion date</li>
              <li><strong>Set Monthly Contribution:</strong> Decide how much to save each month</li>
            </ol>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-800"><strong>Pro Tip:</strong> Start with 1-2 goals to avoid overwhelm. Once these become habits, you can add more goals to your plan.</p>
          </div>
        </div>
      )
    },
    {
      id: '5',
      title: 'Understanding Cash Flow',
      description: 'Monitor your income and expenses',
      category: 'cashflow',
      icon: TrendingUp,
      readTime: '6 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Understanding Cash Flow</h2>
            <p className="text-lg mb-6">Cash flow is the movement of money in and out of your accounts. Understanding your cash flow patterns is crucial for financial health and planning.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-lg"><strong>Cash Flow = Money In - Money Out</strong></p>
            <p className="text-blue-700 text-sm mt-2">Positive cash flow means you're earning more than you're spending. Negative cash flow means you're spending more than you earn.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Types of Cash Flow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">💰 Operating Cash Flow</h4>
                <p className="text-sm mb-2">Day-to-day income and expenses from your regular activities</p>
                <ul className="text-xs space-y-1">
                  <li>• Salary and wages</li>
                  <li>• Monthly bills and expenses</li>
                  <li>• Groceries and gas</li>
                  <li>• Entertainment and dining</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">📈 Investment Cash Flow</h4>
                <p className="text-sm mb-2">Money related to your investments and long-term assets</p>
                <ul className="text-xs space-y-1">
                  <li>• Investment contributions</li>
                  <li>• Dividends and interest</li>
                  <li>• Asset purchases/sales</li>
                  <li>• Real estate income</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Improving Your Cash Flow</h3>
            <div>
              <h4 className="font-medium text-green-600 mb-2">💰 Increase Income</h4>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li><strong>Ask for a raise:</strong> Research market rates and present your case</li>
                <li><strong>Side hustles:</strong> Freelancing, gig work, or part-time jobs</li>
                <li><strong>Passive income:</strong> Dividends, rental income, or online courses</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-600 mb-2">💸 Reduce Expenses</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Review subscriptions:</strong> Cancel unused services</li>
                <li><strong>Negotiate bills:</strong> Call providers for better rates</li>
                <li><strong>Reduce discretionary spending:</strong> Focus on needs vs. wants</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
            <p className="text-purple-800"><strong>Remember:</strong> Cash flow management is about timing as much as amounts. Even if you earn enough overall, poor timing can create unnecessary stress and fees.</p>
          </div>
        </div>
      )
    },
    {
      id: '6',
      title: 'Investment Tracking',
      description: 'Monitor your portfolio performance',
      category: 'investments',
      icon: BarChart3,
      readTime: '8 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Investment Tracking</h2>
            <p className="text-lg mb-6">Track your investment portfolio performance, analyze asset allocation, and monitor progress toward your long-term financial goals.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Types of Investment Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">🏢 Employer-Sponsored</h4>
                <ul className="text-sm space-y-1">
                  <li>• 401(k) plans</li>
                  <li>• 403(b) plans (non-profits)</li>
                  <li>• 457 plans (government)</li>
                  <li>• Employee stock plans</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">🏦 Individual Retirement</h4>
                <ul className="text-sm space-y-1">
                  <li>• Traditional IRA</li>
                  <li>• Roth IRA</li>
                  <li>• SEP-IRA (self-employed)</li>
                  <li>• Solo 401(k)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Key Investment Metrics</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Total Return:</strong> Your investment gains or losses including dividends</li>
              <li><strong>Annualized Return:</strong> Your average yearly return</li>
              <li><strong>Asset Allocation:</strong> How your money is divided between stocks and bonds</li>
              <li><strong>Diversification Score:</strong> How well-spread your investments are</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800"><strong>Age-Based Rule:</strong> Stock Percentage = 110 - Your Age</p>
            <p className="text-blue-700 text-sm mt-2">Example: If you're 30, consider 80% stocks, 20% bonds. Adjust based on risk tolerance.</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800"><strong>Investment Success Formula:</strong> Start early + Invest regularly + Keep costs low + Stay diversified + Think long-term = Financial success</p>
          </div>
        </div>
      )
    },
    {
      id: '7',
      title: 'Tax Preparation Features',
      description: 'Organize your finances for tax time',
      category: 'taxes',
      icon: Calculator,
      readTime: '10 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Tax Preparation Features</h2>
            <p className="text-lg mb-6">Stay organized year-round and make tax season stress-free with Pennie's comprehensive tax preparation tools.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Year-Round Tax Organization</h3>
            <p className="mb-4">Good tax preparation starts on January 1st, not April 1st. Pennie helps you stay organized throughout the year:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">📄 Document Management</h4>
                <ul className="text-sm space-y-1">
                  <li>• W-2s and 1099s</li>
                  <li>• Receipts and invoices</li>
                  <li>• Tax forms and statements</li>
                  <li>• Previous year returns</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">💰 Expense Tracking</h4>
                <ul className="text-sm space-y-1">
                  <li>• Business expenses</li>
                  <li>• Medical expenses</li>
                  <li>• Charitable donations</li>
                  <li>• Education expenses</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Available Tax Reports</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tax Summary Report:</strong> Overview of all tax-related transactions</li>
              <li><strong>Business Expense Report:</strong> Schedule C categories and totals</li>
              <li><strong>Charitable Giving Report:</strong> All donations with dates and amounts</li>
              <li><strong>Investment Activity Report:</strong> Capital gains/losses, dividends, interest</li>
              <li><strong>Medical Expense Report:</strong> HSA contributions and medical payments</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2024 Tax Year Updates</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Standard Deduction:</strong> $14,600 (single), $29,200 (married filing jointly)</li>
              <li><strong>401(k) Limit:</strong> $23,000 ($30,500 if 50+)</li>
              <li><strong>IRA Limit:</strong> $7,000 ($8,000 if 50+)</li>
              <li><strong>HSA Limit:</strong> $4,150 (individual), $8,300 (family)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800"><strong>Pro Tip:</strong> Even with a professional, maintaining organized records in Pennie throughout the year will save you time and money when tax season arrives.</p>
          </div>
        </div>
      )
    },
    {
      id: '8',
      title: 'Using the AI Advisor',
      description: 'Get personalized financial insights',
      category: 'ai',
      icon: Bot,
      readTime: '5 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Using the AI Advisor</h2>
            <p className="text-lg mb-6">Pennie's AI Advisor analyzes your financial data to provide personalized insights, recommendations, and answers to your money questions.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">What the AI Advisor Can Do</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">💡 Smart Insights</h4>
                <ul className="text-sm space-y-1">
                  <li>• Spending pattern analysis</li>
                  <li>• Budget optimization suggestions</li>
                  <li>• Goal achievement strategies</li>
                  <li>• Cash flow predictions</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">🎯 Personalized Advice</h4>
                <ul className="text-sm space-y-1">
                  <li>• Investment recommendations</li>
                  <li>• Debt payoff strategies</li>
                  <li>• Savings rate optimization</li>
                  <li>• Tax optimization tips</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Getting Started with AI Advisor</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Navigate to AI Advisor:</strong> Click "AI Advisor" in the left sidebar</li>
              <li><strong>Review Initial Insights:</strong> AI automatically analyzes your connected accounts</li>
              <li><strong>Ask Questions:</strong> Use the chat interface to ask specific questions</li>
              <li><strong>Review Recommendations:</strong> Consider the personalized suggestions provided</li>
              <li><strong>Take Action:</strong> Implement recommendations that align with your goals</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Example Questions to Ask</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">"Why did I spend more on dining out this month?"</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm">"How much should I save monthly to reach my emergency fund goal?"</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm">"Is my portfolio allocation appropriate for my age?"</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800"><strong>Important:</strong> The AI Advisor provides general guidance based on your data, but it's not a replacement for professional financial advice. For complex situations, consider consulting with a certified financial planner.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800"><strong>Pro Tip:</strong> The AI Advisor gets smarter over time. The more you use it and provide feedback, the more personalized and accurate its recommendations become.</p>
          </div>
        </div>
      )
    },
    {
      id: '9',
      title: 'Security and Privacy',
      description: 'How we protect your data',
      category: 'security',
      icon: Shield,
      readTime: '4 min',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Security and Privacy</h2>
            <p className="text-lg mb-6">Your financial data security and privacy are our highest priorities. Learn about the multiple layers of protection that keep your information safe.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Bank-Level Security</h3>
            <p className="mb-4">Pennie uses the same security standards as major financial institutions:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">🔒 256-Bit SSL Encryption</h4>
                <p className="text-sm">All data transmission is encrypted using the same technology banks use for online banking.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">🏦 Trusted Connections</h4>
                <p className="text-sm">We partner with Plaid and Yodlee, trusted by major banks and financial institutions.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-purple-600 mb-2">👀 Read-Only Access</h4>
                <p className="text-sm">We can only view your account information - never move money or make transactions.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-orange-600 mb-2">🚫 No Stored Credentials</h4>
                <p className="text-sm">Your banking passwords are never stored on our servers or accessible to us.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Data Protection Measures</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption Everywhere:</strong> Data is encrypted in transit and at rest</li>
              <li><strong>Access Controls:</strong> Multi-factor authentication available</li>
              <li><strong>Regular Audits:</strong> SOC 2 Type II compliance</li>
              <li><strong>Employee Access:</strong> Strict need-to-know basis with audit logs</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Your Privacy Controls</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data Export:</strong> Download all your data anytime</li>
              <li><strong>Account Deletion:</strong> Permanently delete your account and data</li>
              <li><strong>Selective Sharing:</strong> Choose which accounts to connect</li>
              <li><strong>Analytics Opt-out:</strong> Disable usage analytics collection</li>
            </ul>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <h4 className="text-red-800 font-semibold mb-2">🚫 We Never Sell Your Data</h4>
            <p className="text-red-700 text-sm">Your financial information is never sold to third parties for marketing or any other purposes.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800"><strong>Our Commitment:</strong> We treat your financial data with the same level of security and privacy that we would want for our own. Your trust is the foundation of our business.</p>
          </div>
        </div>
      )
    }
  ];

  const filteredFAQs = faqItems.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!showHelpSupport) return null;

  // Article viewer component
  if (selectedArticle) {
    const Icon = selectedArticle.icon;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden theme-transition ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          {/* Article Header */}
          <div className="p-6 border-b bg-gradient-to-r from-orange-400 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                  <p className="opacity-90">{selectedArticle.description}</p>
                  <div className="flex items-center mt-2 text-sm opacity-75">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedArticle.readTime} read
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                  title="Back to Help Center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowHelpSupport(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                  title="Close Help"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-8">
              <div className={`max-w-none ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {selectedArticle.content}
              </div>
              
              {/* Article Footer */}
              <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="text-right">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Help Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-400 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HelpCircle className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Help & Support</h2>
                <p className="opacity-90">We're here to help you succeed with Pennie</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHelpSupport(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search for help articles or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setSelectedArticle(videoTutorialsArticle)}
                className={`p-4 rounded-lg border text-left hover:shadow-md transition-all ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
              >
                <Video className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Video Tutorials</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Step-by-step guides</p>
              </button>
              <button 
                onClick={() => setSelectedArticle(tipsAndTricksArticle)}
                className={`p-4 rounded-lg border text-left hover:shadow-md transition-all ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
              >
                <Lightbulb className="w-6 h-6 text-orange-600 mb-2" />
                <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tips & Tricks</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Make the most of Pennie</p>
              </button>
            </div>

            {/* Help Articles */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Help Articles {searchQuery && `(${filteredArticles.length} results)`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => {
                  const Icon = article.icon;
                  return (
                    <button
                      key={article.id}
                      onClick={() => {
                        console.log('Article clicked:', article.title);
                        setSelectedArticle(article);
                      }}
                      className={`p-4 rounded-lg border text-left hover:shadow-md transition-all cursor-pointer ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <Icon className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{article.title}</h4>
                            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{article.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readTime}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions {searchQuery && `(${filteredFAQs.length} results)`}
              </h3>
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className={`w-full p-4 text-left hover:bg-opacity-50 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h4>
                        <ChevronRight className={`w-4 h-4 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-90' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className={`px-4 pb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;