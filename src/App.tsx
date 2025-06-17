// App.tsx
import React, { useState, useEffect } from 'react';
import { 
  Home, Users, CreditCard, TrendingUp, BarChart3, 
  Calendar, Target, PieChart, MessageSquare, 
  ChevronDown, X, Bell, Settings, Bot,
  FileText, Umbrella, Calculator, Shield, RefreshCw,
  Sun, Moon, Book, Lightbulb,
  ChevronLeft, ChevronRight, PlayCircle, ArrowLeft, Check, ArrowRight
} from 'lucide-react';

// Import the professional login component
import { ProfessionalLogin } from './pages/Login';

// Import types
import type { TabId, SidebarItem } from './types';

// Import pages
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import CashFlow from './pages/CashFlow';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import TaxManagement from './pages/TaxManagement';
import Planning from './pages/Planning';
import Reports from './pages/Reports';
import Recurring from './pages/Recurring';
import AIAdvisor from './pages/AIAdvisor';
import Advice from './pages/Advice';

// Import shared components
import AddTransactionModal from './components/AddTransactionModal';
import AddAccountModal from './components/AddAccountModal';
import GoalSetupModal from './components/GoalSetupModal';
import ExportModal from './components/ExportModal';
import NotificationsDropdown from './components/NotificationsDropdown';

// Import custom hooks
import { useAppData } from './hooks/useAppData';
import { useFilters } from './hooks/useFilters';

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

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tour Guide Component
const TourGuide: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  setActiveTab: (tab: TabId) => void;
  setShowAddAccount: (show: boolean) => void;
  setShowGoalSetup: (show: boolean) => void;
}> = ({ isOpen, onClose, setActiveTab, setShowAddAccount, setShowGoalSetup }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Pennie! 🎉',
      description: 'Your complete personal finance companion',
      content: (
        <div className="space-y-4">
          <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <img 
          src="https://i.postimg.cc/KvdVmZMG/balanceversion5-3-01white.png" 
          alt="Pennie Logo" 
          className="w-16 h-16 object-contain" 
          />
        </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Let's get you started!</h3>
            <p className="text-gray-600">
              This quick tour will show you how to make the most of Pennie's powerful features 
              to take control of your finances.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Bank-level Security</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Smart Insights</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Goal Tracking</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Bot className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium">AI Advisor</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navigation Sidebar 📱',
      description: 'Everything you need is organized in the left sidebar',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The sidebar contains all of Pennie's features organized by category:
          </p>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Home className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-gray-500">Your financial overview</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium">Accounts</div>
                <div className="text-sm text-gray-500">Connect bank accounts & cards</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium">Goals</div>
                <div className="text-sm text-gray-500">Track savings & debt payoff</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <div className="font-medium">Budget</div>
                <div className="text-sm text-gray-500">Manage spending categories</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accounts',
      title: 'Connect Your Accounts 🏦',
      description: 'The foundation of your financial tracking',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Start by connecting your financial accounts to get a complete picture of your finances:
          </p>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">✅ Bank Accounts</h4>
              <p className="text-sm text-gray-600">Checking, savings, and money market accounts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">💳 Credit Cards</h4>
              <p className="text-sm text-gray-600">Track spending and manage balances</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">📈 Investments</h4>
              <p className="text-sm text-gray-600">401k, IRA, brokerage accounts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">🏠 Loans</h4>
              <p className="text-sm text-gray-600">Mortgages, auto loans, student debt</p>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Connect Account Now',
        onClick: () => {
          setActiveTab('accounts');
          setShowAddAccount(true);
        }
      }
    },
    {
      id: 'getting-started',
      title: 'Ready to Start! 🚀',
      description: 'Your next steps to financial success',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">You're all set!</h3>
            <p className="text-gray-600">
              Here's your recommended getting started checklist:
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
              <div>
                <div className="text-m text-gray-800">Connect your main checking account</div>
                <div className="text-sm text-gray-600">Start with your primary spending account</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
              <div>
                <div className="text-m text-gray-800">Add a savings goal</div>
                <div className="text-sm text-gray-600">Emergency fund or vacation savings</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
              <div>
                <div className="text-m text-gray-800">Create your first budget</div>
                <div className="text-sm text-gray-600">Start with 3-4 main categories</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
              <div>
                <div className="text-m text-gray-800">Explore your dashboard</div>
                <div className="text-sm text-gray-600">Watch the insights grow over time</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-800 text-white rounded-lg text-center">
            <p className="text-m text-white">Need help? We're here for you!</p>
            <p className="text-sm opacity-90">Use the "Help & Support" link in the sidebar anytime.</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentTourStep.title}</h2>
              <p className="opacity-90">{currentTourStep.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm opacity-90 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {currentTourStep.content}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-3">
              {currentTourStep.action && (
                <button
                  onClick={() => {
                    currentTourStep.action!.onClick();
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {currentTourStep.action.label}
                </button>
              )}
              
              {currentStep < tourSteps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Get Started!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Dashboard for new users
const EmptyDashboard: React.FC<{ 
  user: User; 
  setActiveTab: (tab: TabId) => void;
  setShowAddAccount: (show: boolean) => void;
  setShowGoalSetup: (show: boolean) => void;
  setShowTour: (show: boolean) => void;
}> = ({ user, setActiveTab, setShowAddAccount, setShowGoalSetup, setShowTour }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome to Pennie, {user.name}!</h1>
          <p className="text-gray-600">Let's get your finances organized. Start by connecting your first account.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-800 rounded-lg p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">🎉 Welcome to your financial journey!</h2>
        <p className="text-lg mb-6 opacity-90">
          Pennie helps you track spending, reach goals, and make smarter money decisions.
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowAddAccount(true)}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Connect Your First Account
          </button>
          <button 
            onClick={() => setShowTour(true)}
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors flex items-center"
          >
            <Book className="w-4 h-4 mr-2" />
            Take a Tour
          </button>
        </div>
      </div>

      {/* Quick Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-gray-800 mb-2">Connect Accounts</h3>
          <p className="text-gray-600 mb-4">Link your bank accounts, credit cards, and investments to get a complete picture.</p>
          <button 
            onClick={() => setShowAddAccount(true)}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Get Started →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-gray-800 mb-2">Set Goals</h3>
          <p className="text-gray-600 mb-4">Create savings goals, debt payoff plans, and track your progress automatically.</p>
          <button 
            onClick={() => setShowGoalSetup(true)}
            className="text-green-500 hover:text-green-700 font-medium"
          >
            Create Goal →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-gray-800 mb-2">Create Budget</h3>
          <p className="text-gray-600 mb-4">Set spending limits for different categories and get alerts when you're close.</p>
          <button 
            onClick={() => setActiveTab('budget')}
            className="text-purple-500 hover:text-purple-700 font-medium"
          >
            Setup Budget →
          </button>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 text-gray-800 mb-6">What you can do with Pennie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Track all your transactions automatically</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Monitor your cash flow and spending trends</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Manage your investment portfolio</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <Bot className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Get AI-powered financial insights</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Prepare for taxes with organized records</span>
            </div>
            <div className="flex items-center">
              <Umbrella className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Track insurance policies and coverage</span>
            </div>
            <div className="flex items-center">
              <Calculator className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-gray-700">Plan for retirement and major life events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAddTransaction, setShowAddTransaction] = useState<boolean>(false);
  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
  const [showGoalSetup, setShowGoalSetup] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  
  // Authentication state - using the enhanced User type from ProfessionalLogin
  const [user, setUser] = useState<User | null>(null);

  // Get all app data and handlers from custom hook
  const appData = useAppData();

  // Get transaction filters
  const {
    filters: transactionFilters,
    setFilters: setTransactionFilters,
    filteredTransactions,
  } = useFilters({
    transactions: appData.transactions,
    accounts: appData.accounts
  });

  // Check for existing session on component mount
  useEffect(() => {
    // Check for existing session using the session manager from ProfessionalLogin
    const sessionData = localStorage.getItem('pennie_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        
        // Check if session is expired
        if (Date.now() < parsed.expiryTime) {
          setUser(parsed.user);
        } else {
          // Clear expired session
          localStorage.removeItem('pennie_session');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('pennie_session');
      }
    }
  }, []);

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'insurance', label: 'Insurance', icon: Umbrella },
    { id: 'planning', label: 'Planning', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'recurring', label: 'Recurring', icon: Calendar },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
    { id: 'advice', label: 'Advice', icon: MessageSquare },
  ];

  // Authentication handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    // Clear session from localStorage
    localStorage.removeItem('pennie_session');
  };

  // Common props for all pages
  const pageProps = {
    ...appData,
    setActiveTab,
    setShowAddTransaction,
    setShowAddAccount,
    setShowGoalSetup,
    setShowExportModal,
    // Transaction filtering props
    filteredTransactions,
    transactionFilters,
    setTransactionFilters,
  };

  const renderContent = (): React.ReactNode => {
    // Show empty dashboard for new users with no data
    if (activeTab === 'dashboard' && appData.accounts.length === 0) {
      return (
        <EmptyDashboard 
          user={user!} 
          setActiveTab={setActiveTab}
          setShowAddAccount={setShowAddAccount}
          setShowGoalSetup={setShowGoalSetup}
          setShowTour={setShowTour}
        />
      );
    }

    // Pass pageProps to all components that need them
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'accounts':
        return <Accounts {...pageProps} refreshAccounts={appData.refreshAccounts} toggleAccountConnection={appData.toggleAccountConnection} />;
      case 'transactions':
        return <Transactions {...pageProps} />;
      case 'cashflow':
        return <CashFlow {...pageProps} />;
      case 'budget':
        return <Budget {...pageProps} />;
      case 'goals':
        return <Goals {...pageProps} />;
      case 'investments':
        return <Investments {...pageProps} />;
      case 'taxes':
        return <TaxManagement {...pageProps} />;
      case 'planning':
        return <Planning {...pageProps} />;
      case 'reports':
        return <Reports {...pageProps} />;
      case 'recurring':
        return <Recurring {...pageProps} />;
      case 'ai-advisor':
        return <AIAdvisor {...pageProps} />;
      case 'advice':
        return <Advice />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  // Show professional login screen if user is not authenticated
  if (!user) {
    return <ProfessionalLogin onLogin={handleLogin} />;
  }

  return (
  <div className="flex h-screen bg-gray-50">
    {/* Sidebar */}
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <img 
          src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
          onClick={() => setActiveTab('dashboard')}
          alt="Pennie Logo" 
          className="max-w-[140px] w-full h-auto cursor-pointer
            transition-all duration-300 ease-in-out
            hover:scale-100 hover:opacity-80
            active:scale-95"
        />
      </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const hasAlerts = item.id === 'credit' && 
                appData.alerts.some(a => a.type === 'security' && !a.read);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                      activeTab === item.id
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      activeTab === item.id ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {item.label}
                    {hasAlerts && (
                      <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <button 
              className="flex items-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button 
              className="flex items-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowTour(true)}
            >
              <Book className="w-4 h-4 mr-2" />
              App Tour
            </button>
            <button className="flex items-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <MessageSquare className="w-4 h-4 mr-2" />
              Help & Support
            </button>
            <div className="flex items-center pt-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-800 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500">{user.plan} Plan</div>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={handleLogout}
                title="Logout"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Tour Guide */}
      <TourGuide 
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        setActiveTab={setActiveTab}
        setShowAddAccount={setShowAddAccount}
        setShowGoalSetup={setShowGoalSetup}
      />

      {/* Modals and Dropdowns */}
      <NotificationsDropdown 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        alerts={appData.alerts}
        markNotificationRead={appData.markNotificationRead}
        deleteNotification={appData.deleteNotification}
      />

      <AddTransactionModal 
        showAddTransaction={showAddTransaction}
        setShowAddTransaction={setShowAddTransaction}
        newTransaction={appData.newTransaction}
        setNewTransaction={appData.setNewTransaction}
        editingTransaction={appData.editingTransaction}
        setEditingTransaction={appData.setEditingTransaction}
        handleAddTransaction={appData.handleAddTransaction}
        accounts={appData.accounts}
      />

      <AddAccountModal 
        showAddAccount={showAddAccount}
        setShowAddAccount={setShowAddAccount}
        newAccount={appData.newAccount}
        setNewAccount={appData.setNewAccount}
        handleAddAccount={appData.handleAddAccount}
        setAccounts={appData.setAccounts}
        setTransactions={appData.setTransactions}
      />

      <GoalSetupModal 
        showGoalSetup={showGoalSetup}
        setShowGoalSetup={setShowGoalSetup}
        newGoal={appData.newGoal}
        setNewGoal={appData.setNewGoal}
        editingGoal={appData.editingGoal}
        setEditingGoal={appData.setEditingGoal}
        handleAddGoal={appData.handleAddGoal}
      />

      <ExportModal 
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        exportData={appData.exportData}
      />
    </div>
  );
};

export default App;