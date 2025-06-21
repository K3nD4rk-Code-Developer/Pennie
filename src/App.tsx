// App.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Home, Users, CreditCard, TrendingUp, BarChart3, 
  Calendar, Target, PieChart, MessageSquare, 
  ChevronDown, X, Bell, Settings, Bot,
  FileText, Umbrella, Calculator, Shield, RefreshCw,
  Sun, Moon, Book, Lightbulb,
  ChevronLeft, ChevronRight, PlayCircle, ArrowLeft, Check, ArrowRight,
  Menu
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

// Import mobile CSS
import './mobile.css';

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
              <Home className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-gray-600">Your financial overview</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <div className="font-medium">Accounts</div>
                <div className="text-sm text-gray-600">Manage your bank accounts</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-3" />
              <div>
                <div className="font-medium">Transactions</div>
                <div className="text-sm text-gray-600">Track your spending</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accounts',
      title: 'Connect Your Accounts 🏦',
      description: 'Link your financial accounts securely',
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
      description: 'You\'re all set to begin your financial journey',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            You now know the basics! Here's what to do next:
          </p>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
              <div>
                <div className="font-medium">Connect your first account</div>
                <div className="text-sm text-gray-600">Start with your primary checking account</div>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
              <div>
                <div className="font-medium">Set up your first goal</div>
                <div className="text-sm text-gray-600">Emergency fund, vacation, or debt payoff</div>
              </div>
            </div>
            <div className="flex items-start p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
              <div>
                <div className="font-medium">Explore your dashboard</div>
                <div className="text-sm text-gray-600">Watch your financial picture come together</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentTourStep.title}
            </h3>
            <p className="text-gray-600 mb-4">{currentTourStep.description}</p>
            {currentTourStep.content}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {currentTourStep.action && (
                <button
                  onClick={() => {
                    currentTourStep.action?.onClick();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50"
                >
                  {currentTourStep.action.label}
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showTour, setShowTour] = useState(false);

  // Modal states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme and mobile states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // MOBILE MENU STATE - MOVED TO RIGHT PLACE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Use custom hooks
  const appData = useAppData();
  const filtersHook = useFilters({ 
    transactions: appData.transactions, 
    accounts: appData.accounts 
  });

  // Sidebar items configuration
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'investments', label: 'Investments', icon: BarChart3 },
    { id: 'taxes', label: 'Tax Management', icon: FileText },
    { id: 'planning', label: 'Financial Planning', icon: Umbrella },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'recurring', label: 'Recurring', icon: Calendar },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
    { id: 'advice', label: 'Advice Center', icon: Lightbulb }
  ];

  // Handle mobile responsiveness with better detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|Windows Phone/i.test(userAgent);
      
      // Show mobile UI for screens < 1024px OR mobile devices
      setIsMobile(width < 1024 || isMobileUA);
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Check for first-time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && isAuthenticated && appData.accounts.length === 0) {
      setShowTour(true);
    }
  }, [isAuthenticated, appData.accounts.length]);

  // Handle authentication
  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Render page content
  const renderPageContent = () => {
    const pageProps = {
      ...appData,
      filteredTransactions: filtersHook.filteredTransactions,
      transactionFilters: filtersHook.filters,
      setTransactionFilters: filtersHook.setFilters,
      setShowAddTransaction,
      setShowAddAccount,
      setShowGoalSetup,
      setShowExportModal,
      setActiveTab: (tab: string) => setActiveTab(tab as TabId),
      user
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'accounts':
        return <Accounts {...pageProps} />;
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

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <ProfessionalLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      {/* Desktop Sidebar - hide on mobile with CSS */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Desktop Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" alt="Pennie Logo" className="max-w-[140px] w-full h-auto cursor-pointer
              transition-all duration-300 ease-in-out
              hover:scale-100 hover:opacity-80
              active:scale-95" />
          </div>
            <p className="ml-9 text-sm text-gray-500">Every cent counts</p>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-orange-600">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - ONLY show when menu is CLOSED */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 touch-target"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <img 
                  src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
                  alt="Pennie" 
                  className="w-8 h-8" 
                />
                <h1 className="font-semibold text-gray-900">
                  {sidebarItems.find(item => item.id === activeTab)?.label || 'Pennie'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 touch-target relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              </button>
              <button className="p-2 touch-target">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full screen menu - ONLY show when menu is OPEN */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <img 
                src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
                alt="Pennie Logo" 
                className="w-32 h-auto" 
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 touch-target hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Every cent counts</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left touch-target ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-6 h-6 mr-4 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="font-semibold text-lg">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header - hide on mobile */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                {activeTab === 'dashboard' && 'Welcome back! Here\'s your financial overview.'}
                {activeTab === 'accounts' && 'Manage your connected accounts and view balances.'}
                {activeTab === 'transactions' && 'Track and categorize your spending.'}
                {activeTab === 'goals' && 'Set and monitor your financial goals.'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile-friendly padding */}
          <div className="p-4 lg:p-6">
            {renderPageContent()}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <NotificationsDropdown 
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          alerts={appData.alerts}
          markNotificationRead={appData.markNotificationRead}
          deleteNotification={appData.deleteNotification}
        />
      )}

      {/* Install App Banner - PWA */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-orange-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Install Pennie</h4>
              <p className="text-sm opacity-90">Get the full app experience</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleInstallApp}
                className="bg-white text-orange-600 px-3 py-1 rounded text-sm font-medium touch-target"
              >
                Install
              </button>
              <button 
                onClick={() => setShowInstallPrompt(false)}
                className="text-white opacity-75 touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Guide */}
      <TourGuide 
        isOpen={showTour}
        onClose={() => {
          setShowTour(false);
          localStorage.setItem('hasSeenTour', 'true');
        }}
        setActiveTab={setActiveTab}
        setShowAddAccount={setShowAddAccount}
        setShowGoalSetup={setShowGoalSetup}
      />

      {/* Modals */}
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