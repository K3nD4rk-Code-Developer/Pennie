// App.tsx - Complete with Proper Dark Mode Implementation
import React, { useState, useEffect } from 'react';
import { 
  Home, Users, CreditCard, TrendingUp, BarChart3, 
  Calendar, Target, PieChart, MessageSquare, 
  ChevronDown, X, Bell, Settings, Bot,
  FileText, Umbrella, Calculator, Shield,
  Sun, Moon, Book,
  ChevronLeft, ChevronRight, PlayCircle, CheckCircle, ArrowRight,
  Menu, Zap  // Add Zap here
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
import HelpSupportModal from './components/HelpSupportModal';
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
  }
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'none';
  beforeShow?: () => void;
  afterComplete?: () => void;
  page?: string;
  content?: React.ReactNode; // Keep this for compatibility
}

// Tour Guide Component (Polished, Better UX)
const TourGuide: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  setActiveTab: (tab: TabId) => void;
  setShowAddAccount: (show: boolean) => void;
  setShowGoalSetup: (show: boolean) => void;
  darkMode: boolean;
}> = ({ isOpen, onClose, setActiveTab, setShowAddAccount, setShowGoalSetup, darkMode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Pennie! 🎉',
      description: 'We built Pennie to help students and young adults better track spending, set saving goals, and avoid financial mistakes early on. Let\'s explore how each feature solves common financial challenges students face!',
      target: 'body',
      position: 'bottom',
      action: 'none'
    },
    {
      id: 'sidebar',
      title: 'Navigation Made Simple 📱',
      description: 'Everything you need to manage your finances is organized here. From tracking daily expenses to planning long-term goals, all features are designed specifically for student financial needs.',
      target: '.sidebar, nav, [role="navigation"]',
      position: 'right',
      action: 'none'
    },
    {
      id: 'dashboard-tab',
      title: 'Your Financial Command Center 📊',
      description: 'This dashboard gives you real-time visibility into your financial status - reducing anxiety by showing your current balance, recent transactions, and spending patterns all in one place. Perfect for busy students who need quick financial insights.',
      target: '[data-tour="dashboard-tab"], .sidebar button:first-child, nav button:first-child, button:contains("Dashboard")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('dashboard');
      }
    },
    {
      id: 'accounts-tab',
      title: 'Track All Your Money Sources 🏦',
      description: 'Connect your checking accounts, savings, student loans, and even cash to track every dollar. This solves the common student problem of not knowing where money is going across multiple accounts and payment methods.',
      target: '[data-tour="accounts-tab"], .sidebar button:nth-child(2), nav button:nth-child(2), button:contains("Accounts")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('accounts');
      }
    },
    {
      id: 'add-account-action',
      title: 'Connect Your Student Accounts 🔗',
      description: 'Add your bank accounts, student loan accounts, and credit cards here. This creates a complete picture of your finances - essential for students managing multiple income sources like jobs, financial aid, and family support.',
      target: 'button:contains("Connect Account"), button:contains("Add Account"), button:contains("Connect"), .bg-orange-600, .bg-orange-500, button[class*="orange"]',
      position: 'bottom',
      action: 'none',
      beforeShow: () => {
        setActiveTab('accounts');
      }
    },
    {
      id: 'transactions-tab',
      title: 'Track Every Dollar In & Out 💳',
      description: 'View, categorize, and analyze all your income and expenses. Students can easily see spending patterns, find specific transactions, and understand where their money goes each month.',
      target: '[data-tour="transactions-tab"], .sidebar button:contains("Transactions"), button:contains("Transactions")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('transactions');
      }
    },
    {
      id: 'add-transaction-action',
      title: 'Add Your Daily Expenses 💸',
      description: 'Easily log your daily spending - from coffee to textbooks. This helps students track where every dollar goes and identify spending patterns.',
      target: 'button:contains("Add Transaction"), button:contains("New Transaction"), .bg-blue-600, .bg-blue-500, button[class*="blue"]',
      position: 'bottom',
      action: 'none',
      beforeShow: () => {
        setActiveTab('transactions');
      }
    },
    {
      id: 'budget-tab',
      title: 'Smart Budget Management 💰',
      description: 'Now let\'s set spending limits for categories like textbooks, food, entertainment, and transportation. This helps students avoid overspending and ensures money lasts the whole semester.',
      target: '[data-tour="budget-tab"], .sidebar button:contains("Budget"), button:contains("Budget")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('budget');
      }
    },
    {
      id: 'set-budget-action',
      title: 'Create Your First Budget 📝',
      description: 'Click "Set Budget" to create spending limits for your categories. This is essential for students to make their money last the whole semester.',
      target: 'button:contains("Set Budget"), button:contains("+ Set Budget"), .bg-orange-600, .bg-orange-500, button[class*="orange"]',
      position: 'bottom',
      action: 'none',
      beforeShow: () => {
        setActiveTab('budget');
      }
    },
    {
      id: 'goals-tab',
      title: 'Achieve Your Financial Dreams 🎯',
      description: 'Set and track savings goals for things like spring break, a new laptop, emergency funds, or paying down student loans. This feature helps students visualize progress and stay motivated to save.',
      target: '[data-tour="goals-tab"], .sidebar button:contains("Goals"), button:contains("Goals")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('goals');
      }
    },
    {
      id: 'add-goal-action',
      title: 'Set Your First Goal 🎯',
      description: 'Create a savings goal for something important to you - like spring break, a new laptop, or an emergency fund. Goals help you stay motivated to save!',
      target: 'button:contains("Add Goal"), button:contains("New Goal"), button:contains("Create Goal"), .bg-green-600, .bg-green-500, button[class*="green"]',
      position: 'bottom',
      action: 'none',
      beforeShow: () => {
        setActiveTab('goals');
      }
    },
    {
      id: 'ai-advisor-tab',
      title: 'Your Personal Financial Coach 🤖',
      description: 'Get AI-powered tips tailored to student life: when to buy textbooks, how to save on dining, budget alerts before you overspend, and personalized advice to build healthy financial habits early.',
      target: '[data-tour="ai-advisor-tab"], .sidebar button:contains("AI Advisor"), button:contains("AI Advisor")',
      position: 'right',
      action: 'none',
      beforeShow: () => {
        setActiveTab('ai-advisor');
      }
    },
    {
      id: 'tour-complete',
      title: 'Ready to Master Your Money! 🚀',
      description: 'You now understand how Pennie addresses the financial literacy gap for students. Each feature tackles common struggles: budgeting tight funds, tracking multiple income sources, saving for goals, and building financial confidence. Start by connecting your first account!',
      target: 'body',
      position: 'bottom',
      action: 'none',
      beforeShow: () => setActiveTab('dashboard')
    }
  ];

  const currentStep = tourSteps[currentStepIndex];

  // Calculate smart modal position based on highlight with smooth transitions
  const calculateModalPosition = () => {
    if (!highlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // If highlighting sidebar (left side), position modal on the right
    if (highlightRect.left < viewportWidth * 0.3) {
      return {
        top: '50%',
        right: '5%',
        transform: 'translateY(-50%)',
        left: 'auto'
      };
    }
    
    // If highlighting center/right area, position modal on left or center
    if (highlightRect.left > viewportWidth * 0.5) {
      return {
        top: '50%',
        left: '5%',
        transform: 'translateY(-50%)',
        right: 'auto'
      };
    }
    
    // Default center position for body highlights
    return {
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      right: 'auto'
    };
  };

  // Update modal position smoothly when highlight changes
  useEffect(() => {
    if (!isOpen) return;
    
    const newPosition = calculateModalPosition();
    setModalPosition(newPosition);
  }, [highlightRect, isOpen]);

  // Enhanced highlight function - back to simple single element highlighting
  const highlightElement = (selector: string) => {
    const selectors = selector.split(', ');
    let targetElement: Element | null = null;
    
    console.log('Looking for selectors:', selectors);
    console.log('Current step:', currentStep.id);
    
    for (const sel of selectors) {
      const trimmedSel = sel.trim();
      
      // Handle button:contains() selectors manually
      if (trimmedSel.includes('button:contains(')) {
        const match = trimmedSel.match(/button:contains\("([^"]+)"\)/);
        if (match) {
          const searchText = match[1];
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const button of buttons) {
            if (button.textContent?.includes(searchText)) {
              targetElement = button;
              console.log('Found button with text:', button.textContent);
              break;
            }
          }
        }
      } else {
        // Regular CSS selector
        try {
          targetElement = document.querySelector(trimmedSel);
        } catch (e) {
          console.warn('Invalid selector:', trimmedSel);
        }
      }
      
      console.log(`Selector "${trimmedSel}" found:`, targetElement);
      if (targetElement) break;
    }
    
    // MANUAL FIXES for broken steps
    if (currentStep.id === 'set-budget-action') {
      // Force target the Set Budget button - try multiple approaches
      targetElement = document.querySelector('button[class*="bg-gradient-to-r"][class*="orange"]') ||
                     document.querySelector('button span:contains("Set Budget")') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent?.includes('Set Budget') || 
                       btn.textContent?.includes('+ Set Budget')
                     ) ||
                     document.querySelector('.bg-orange-600') ||
                     document.querySelector('.bg-orange-500');
      console.log('SET BUDGET MANUAL TARGET:', targetElement);
    }
    
    if (currentStep.id === 'add-goal-action') {
      // Force target any green button or goal-related button
      targetElement = document.querySelector('button[class*="green"]') ||
                     document.querySelector('button[class*="bg-green"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent?.includes('Add Goal') || 
                       btn.textContent?.includes('New Goal') ||
                       btn.textContent?.includes('Create Goal') ||
                       btn.textContent?.includes('Goal')
                     ) ||
                     document.querySelector('.bg-green-600') ||
                     document.querySelector('.bg-green-500');
      console.log('ADD GOAL MANUAL TARGET:', targetElement);
    }
    
    // Special fallbacks for other action buttons
    if (!targetElement && currentStep.id === 'add-account-action') {
      targetElement = document.querySelector('button[class*="orange"]') ||
                     document.querySelector('button[class*="bg-orange"]') ||
                     document.querySelector('.bg-orange-600') ||
                     document.querySelector('.bg-orange-500') ||
                     document.querySelector('button[style*="orange"]');
      console.log('Add account fallback found:', targetElement);
    }
    
    if (!targetElement && currentStep.id === 'add-transaction-action') {
      targetElement = document.querySelector('button[class*="blue"]') ||
                     document.querySelector('button[class*="bg-blue"]') ||
                     document.querySelector('.bg-blue-600') ||
                     document.querySelector('.bg-blue-500') ||
                     document.querySelector('button[style*="blue"]');
      console.log('Add transaction fallback found:', targetElement);
    }
    
    if (!targetElement && currentStep.id === 'add-goal-action') {
      targetElement = document.querySelector('button[class*="green"]') ||
                     document.querySelector('button[class*="bg-green"]') ||
                     document.querySelector('.bg-green-600') ||
                     document.querySelector('.bg-green-500') ||
                     document.querySelector('button[style*="green"]');
      console.log('Add goal fallback found:', targetElement);
    }
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightRect(rect);
      console.log('Highlighting element with rect:', rect);
      
      // Smooth scroll into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    } 
    else {
      console.log('No element found, setting highlightRect to null');
      setHighlightRect(null);
    }
  };

  // Effect to highlight current step - back to normal timing
  useEffect(() => {
    if (!isOpen || !currentStep) return;
    
    if (currentStep.beforeShow) {
      currentStep.beforeShow();
    }
    
    // Normal delay for all steps now that infinite loop is fixed
    const delay = 500;
    
    const timeout = setTimeout(() => {
      try {
        highlightElement(currentStep.target);
        console.log('Highlighting step:', currentStep.id);
      } catch (error) {
        console.error('Error highlighting element:', error);
        setHighlightRect(null);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentStepIndex, isOpen, currentStep]);

  // Handle clicks with proper element searching
  const handleElementClick = (e: React.MouseEvent) => {
    if (currentStep.action === 'click') {
      e.preventDefault();
      e.stopPropagation();
      
      const selectors = currentStep.target.split(', ');
      let clickedElement = false;
      
      for (const selector of selectors) {
        const trimmedSel = selector.trim();
        let element: HTMLElement | null = null;
        
        // Handle button:contains() selectors manually
        if (trimmedSel.includes('button:contains(')) {
          const match = trimmedSel.match(/button:contains\("([^"]+)"\)/);
          if (match) {
            const searchText = match[1];
            const buttons = document.querySelectorAll('button');
            Array.from(buttons).forEach((button) => {
              if (!element && button.textContent?.includes(searchText)) {
                element = button as HTMLElement;
              }
            });
          }
        } else {
          // Regular CSS selector
          try {
            element = document.querySelector(trimmedSel) as HTMLElement;
          } catch (e) {
            console.warn('Invalid selector:', trimmedSel);
          }
        }
        
        if (element) {
          console.log('Clicking element:', element);
          element.click();
          clickedElement = true;
          break;
        }
      }
      
      // If no element found with selectors, try common button patterns
      if (!clickedElement && currentStep.id === 'add-account-action') {
        const fallbackElement = document.querySelector('button[class*="orange"]') as HTMLElement ||
                               document.querySelector('button[class*="bg-orange"]') as HTMLElement ||
                               document.querySelector('.bg-orange-600') as HTMLElement;
        if (fallbackElement) {
          console.log('Clicking fallback element:', fallbackElement);
          fallbackElement.click();
          clickedElement = true;
        }
      }
      
      if (clickedElement) {
        if (currentStep.afterComplete) {
          currentStep.afterComplete();
        }
        
        setTimeout(() => {
          nextStep();
        }, 500);
      } else {
        console.log('No clickable element found, advancing anyway');
        // If we can't find the element, just advance to next step
        setTimeout(() => {
          nextStep();
        }, 100);
      }
    }
  };

  const nextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipTour = () => {
    onClose();
    setCurrentStepIndex(0);
    setHighlightRect(null);
  };

  const completeTour = () => {
    onClose();
    setCurrentStepIndex(0);
    setHighlightRect(null);
    setActiveTab('dashboard');
  };

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === tourSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <>
      {/* Overlay with cutout effect */}
      <div className="fixed inset-0 z-50">
        {/* Create overlay with cutout for highlighted element */}
        {highlightRect && currentStep.id !== 'welcome' && currentStep.id !== 'tour-complete' ? (
          <div className="absolute inset-0">
            {/* Top overlay */}
            <div 
              className="absolute bg-black bg-opacity-50 transition-all duration-700 ease-out"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: Math.max(0, highlightRect.top - 4)
              }}
            />
            {/* Bottom overlay */}
            <div 
              className="absolute bg-black bg-opacity-50 transition-all duration-700 ease-out"
              style={{
                top: highlightRect.bottom + 4,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
            {/* Left overlay */}
            <div 
              className="absolute bg-black bg-opacity-50 transition-all duration-700 ease-out"
              style={{
                top: Math.max(0, highlightRect.top - 4),
                left: 0,
                width: Math.max(0, highlightRect.left - 4),
                height: highlightRect.height + 8
              }}
            />
            {/* Right overlay */}
            <div 
              className="absolute bg-black bg-opacity-50 transition-all duration-700 ease-out"
              style={{
                top: Math.max(0, highlightRect.top - 4),
                left: highlightRect.right + 4,
                right: 0,
                height: highlightRect.height + 8
              }}
            />
            
            {/* Clean highlight border around the cutout */}
            <div
              className="absolute border-4 border-orange-400 cursor-pointer transition-all duration-700 ease-out pointer-events-auto"
              style={{
                left: highlightRect.left - 4,
                top: highlightRect.top - 4,
                width: highlightRect.width + 8,
                height: highlightRect.height + 8,
              }}
              onClick={handleElementClick}
            >
              {/* Enhanced click indicator */}
              {currentStep.action === 'click' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                    {/* Main button */}
                    <div className="relative bg-orange-500 text-white p-3 rounded-full shadow-lg">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No overlay for welcome/complete steps to prevent shadow flash */
          currentStep.id === 'welcome' || currentStep.id === 'tour-complete' ? null : (
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          )
        )}

        {/* Smoothly positioned modal with enhanced transitions */}
        <div 
          className="absolute pointer-events-auto z-10 transition-all duration-700 ease-in-out"
          style={modalPosition}
          key={`modal-${currentStepIndex}`} // Force smooth content transitions
        >
          <div 
            className={`rounded-2xl shadow-2xl border w-96 max-w-[90vw] backdrop-blur-sm transform transition-all duration-700 ease-in-out ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 shadow-black/50' 
                : 'bg-white border-gray-200 shadow-black/20'
            }`}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Gradient header with smooth transitions */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white rounded-t-2xl relative overflow-hidden transition-all duration-700 ease-in-out">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10 transition-opacity duration-700">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                }}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Pennie logo */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-700 ease-in-out transform">
                    <img 
                      src="https://i.postimg.cc/KvdVmZMG/balanceversion5-3-01white.png" 
                      alt="Pennie Logo" 
                      className="w-8 h-8 object-contain transition-all duration-700" 
                    />
                  </div>
                  <div className="transition-all duration-700 ease-in-out transform">
                    <h3 className="text-xl font-bold transition-all duration-700 ease-in-out">{currentStep.title}</h3>
                    <div className="text-orange-100 text-sm transition-all duration-700 ease-in-out">Step {currentStepIndex + 1} of {tourSteps.length}</div>
                  </div>
                </div>
                <button 
                  onClick={skipTour}
                  className="text-white/80 hover:text-white transition-all duration-300 p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Enhanced progress bar with smooth animation */}
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden relative transition-all duration-700 ease-in-out">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000 ease-in-out relative overflow-hidden"
                  style={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Content with smooth transitions */}
            <div className={`p-6 transition-all duration-700 ease-in-out transform ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <p className="text-base leading-relaxed mb-5 transition-all duration-700 ease-in-out opacity-100">{currentStep.description}</p>
              
              {/* Action prompt with skip option */}
              {currentStep.action === 'click' && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center text-orange-800 mb-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 animate-pulse">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Click the highlighted area to continue your tour!</span>
                  </div>
                  {!highlightRect && (
                    <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded-lg">
                      Can't find the button? That's okay - some pages look different. You can skip this step!
                    </div>
                  )}
                </div>
              )}
              
              {/* Page viewing prompt for non-click steps */}
              {currentStep.action === 'none' && currentStep.id !== 'welcome' && currentStep.id !== 'tour-complete' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center text-blue-800 mb-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Take a moment to explore this page!</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    Look around and see what features are available here. Click "Next" when you're ready to continue.
                  </div>
                </div>
              )}
              
              {/* Welcome features showcase - Updated for student focus */}
              {currentStep.id === 'welcome' && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-800">Dashboard</div>
                    <div className="text-xs text-blue-600">Real-time balance</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-800">Transactions</div>
                    <div className="text-xs text-green-600">Track spending</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <PieChart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-purple-800">Budget</div>
                    <div className="text-xs text-purple-600">Control spending</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-orange-800">Goals</div>
                    <div className="text-xs text-orange-600">Save & achieve</div>
                  </div>
                </div>
              )}
              
              {/* Completion celebration - Updated messaging */}
              {currentStep.id === 'tour-complete' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center text-sm font-medium text-green-700 bg-green-50 py-2 px-4 rounded-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Connect accounts to track all your money
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium text-blue-700 bg-blue-50 py-2 px-4 rounded-lg">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Set savings goals for your priorities
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium text-purple-700 bg-purple-50 py-2 px-4 rounded-lg">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Budget to make your money last longer
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced footer */}
            <div className={`px-6 pb-6 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="text-sm text-gray-500 font-medium">
                {Math.round(((currentStepIndex + 1) / tourSteps.length) * 100)}% Complete
              </div>
              
              <div className="flex space-x-3">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>
                )}
                
                {(currentStep.action !== 'click' && !isLastStep) ? (
                  <button
                    onClick={nextStep}
                    className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center text-sm font-medium shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : null}
                
                {isLastStep && (
                  <button
                    onClick={completeTour}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm font-medium shadow-lg"
                  >
                    Start Using Pennie!
                    <PlayCircle className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Floating Menu Button Component
const FloatingMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className="lg:hidden">
      <button
        onClick={onClick}
        className="fixed top-3 right-3 z-50 rounded-full p-3"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAddTransaction, setShowAddTransaction] = useState<boolean>(false);
  const [showHelpSupport, setShowHelpSupport] = useState<boolean>(false);
  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
  const [showGoalSetup, setShowGoalSetup] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const originalFetch = window.fetch;

// Override the global fetch function
window.fetch = function(url, options) {
  // Convert localhost URLs to production API
  if (typeof url === 'string') {
    // Handle various localhost patterns
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000') || url.includes('localhost:3001')) {
      url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, 'https://api.pennieapp.com');
      console.log('🔄 Intercepted and redirected to:', url);
    }
    // Handle relative URLs that would go to localhost
    else if (url.startsWith('/api/') && !url.includes('pennieapp.com')) {
      url = 'https://api.pennieapp.com' + url;
      console.log('🔄 Intercepted relative URL, redirected to:', url);
    }
  }
  
  // Call the original fetch with the modified URL
  return originalFetch.call(this, url, options);
};

console.log('✅ Network interceptor installed - All localhost API calls will redirect to api.pennieapp.com');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Authentication state - using the enhanced User type from ProfessionalLogin
  const [user, setUser] = useState<User | null>(null);

  // Dark mode persistence and DOM class management
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('pennie_dark_mode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('pennie_dark_mode', newDarkMode.toString());
  };

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

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
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

  // Empty State Dashboard for new users
  const EmptyDashboard: React.FC<{ 
    user: User; 
    setActiveTab: (tab: TabId) => void;
    setShowAddAccount: (show: boolean) => void;
    setShowGoalSetup: (show: boolean) => void;
    setShowTour: (show: boolean) => void;
    darkMode: boolean;
  }> = ({ user, setActiveTab, setShowAddAccount, setShowGoalSetup, setShowTour, darkMode }) => {
    return (
      <div className={`p-6 min-h-screen theme-transition ${darkMode ? 'main-bg' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-semibold theme-transition ${darkMode ? 'header-text' : 'text-gray-800'}`}>Welcome to Pennie, {user.name}!</h1>
            <p className={`theme-transition ${darkMode ? 'header-text-muted' : 'text-gray-600'}`}>Let's get your finances organized. Start by connecting your first account.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Accounts</h3>
            <p className="text-gray-600 mb-4">Link your bank accounts, credit cards, and investments.</p>
            <button 
              onClick={() => setShowAddAccount(true)}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Get Started →
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Set Goals</h3>
            <p className="text-gray-600 mb-4">Create savings goals and debt payoff plans.</p>
            <button 
              onClick={() => setShowGoalSetup(true)}
              className="text-green-500 hover:text-green-700 font-medium"
            >
              Create Goal →
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create Budget</h3>
            <p className="text-gray-600 mb-4">Set spending limits for different categories.</p>
            <button 
              onClick={() => setActiveTab('budget')}
              className="text-purple-500 hover:text-purple-700 font-medium"
            >
              Setup Budget →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = (): React.ReactNode => {
    // FORCE empty dashboard for new users - change this condition as needed
    if (activeTab === 'dashboard' && appData.accounts.length === 0) {
      return (
        <EmptyDashboard 
          user={user!}
          setActiveTab={setActiveTab}
          setShowAddAccount={setShowAddAccount}
          setShowGoalSetup={setShowGoalSetup}
          setShowTour={setShowTour}
          darkMode={darkMode}
        />
      );
    }

    // Pass pageProps to all components that need them
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'accounts':
        const handleToggleAccountConnection = (accountId: number) => {
          appData.toggleAccountConnection(accountId);
        };
        
        return (
          <Accounts 
            {...pageProps} 
            refreshAccounts={appData.refreshAccounts} 
            toggleAccountConnection={handleToggleAccountConnection}
            setAccounts={appData.setAccounts}
            setTransactions={appData.setTransactions}
            setShowAddAccount={setShowAddAccount}
            setActiveTab={(tab: string) => setActiveTab(tab as TabId)}
          />
        );
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
        return <Advice {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  // Show professional login screen if user is not authenticated
  if (!user) {
    return <ProfessionalLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen theme-transition ${darkMode ? 'main-bg' : 'bg-gray-50'} ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      {/* Desktop Sidebar - hide on mobile */}
      <div className={`hidden lg:flex w-64 flex-col theme-transition ${darkMode ? 'sidebar-bg sidebar-border' : 'bg-white border-r border-gray-200'}`}>
        {/* Logo */}
        <div className={`p-5 border-b theme-transition ${darkMode ? 'sidebar-border' : 'border-gray-200'}`}>
          <img 
            src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
            onClick={() => setActiveTab('dashboard')}
            alt="Pennie Logo" 
            className="max-w-[140px] w-full h-auto cursor-pointer
              transition-all duration-300 ease-in-out
              hover:scale-100 hover:opacity-80
              active:scale-95"
          />
          <p className={`ml-9 text-sm theme-transition ${darkMode ? 'sidebar-text-muted' : 'text-gray-500'}`}>Every cent counts</p>
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
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg theme-transition group ${
                      activeTab === item.id
                        ? darkMode 
                          ? 'sidebar-active border-r-2 border-orange-400'
                          : 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : darkMode
                          ? 'sidebar-text sidebar-hover'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 theme-transition ${
                      activeTab === item.id 
                        ? darkMode ? 'text-orange-400' : 'text-orange-600'
                        : darkMode 
                          ? 'text-gray-400 group-hover:text-gray-300' 
                          : 'text-gray-400 group-hover:text-gray-600'
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
        <div className={`p-4 border-t theme-transition ${darkMode ? 'sidebar-border' : 'border-gray-200'}`}>
          <div className="space-y-3">
            <button 
              className={`flex items-center w-full text-sm theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button 
              className={`flex items-center w-full text-sm theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setShowTour(true)}
            >
              <Book className="w-4 h-4 mr-2" />
              App Tour
            </button>
            <button 
              className={`flex items-center w-full text-sm theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setShowHelpSupport(true)}
            >
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
                <div className={`text-sm font-medium theme-transition ${darkMode ? 'sidebar-text' : 'text-gray-800'}`}>{user.name}</div>
                <div className={`text-xs theme-transition ${darkMode ? 'sidebar-text-muted' : 'text-gray-500'}`}>{user.plan} Plan</div>
              </div>
              <button 
                className={`theme-transition ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={handleLogout}
                title="Logout"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING MENU BUTTON - Only show on mobile when menu is closed */}
      {!isMobileMenuOpen && <FloatingMenuButton onClick={() => setIsMobileMenuOpen(true)} />}

      {/* Full screen mobile menu - ONLY show when menu is OPEN */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay - click to close */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`absolute left-0 top-0 bottom-0 w-80 shadow-xl theme-transition ${darkMode ? 'sidebar-bg' : 'bg-white'}`}>
            {/* Mobile Menu Header */}
            <div className={`border-b px-4 py-3 theme-transition ${darkMode ? 'sidebar-bg sidebar-border' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <img 
                  src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
                  alt="Pennie Logo" 
                  className="w-32 h-auto" 
                />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 touch-target rounded-lg theme-transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-6 h-6 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-6 py-4 text-left touch-target theme-transition ${
                      isActive 
                        ? darkMode
                          ? 'sidebar-active border-r-4 border-orange-400'
                          : 'bg-orange-50 text-orange-600 border-r-4 border-orange-600'
                        : darkMode
                          ? 'sidebar-text hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mr-4 theme-transition ${isActive ? (darkMode ? 'text-orange-400' : 'text-orange-600') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} />
                    <span className="font-semibold text-lg">{item.label}</span>
                  </button>
                );
              })}
              
              {/* Mobile Menu Bottom Section */}
              <div className={`p-6 border-t mt-4 theme-transition ${darkMode ? 'sidebar-border' : 'border-gray-200'}`}>
                <div className="space-y-4">
                  <button 
                    className={`flex items-center w-full text-left touch-target theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => {
                      toggleDarkMode();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {darkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                    <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button 
                    className={`flex items-center w-full text-left touch-target theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => {
                      setShowTour(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Book className="w-5 h-5 mr-3" />
                    <span className="font-medium">App Tour</span>
                  </button>
                  <button 
                    className={`flex items-center w-full text-left touch-target theme-transition ${darkMode ? 'sidebar-text hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => {
                      setShowHelpSupport(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span className="font-medium">Help & Support</span>
                  </button> 
                  
                  {/* User Profile in Mobile Menu */}
                  <div className={`flex items-center pt-4 border-t theme-transition ${darkMode ? 'sidebar-border' : 'border-gray-200'}`}>
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-800 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium theme-transition ${darkMode ? 'sidebar-text' : 'text-gray-800'}`}>{user.name}</div>
                      <div className={`text-sm theme-transition ${darkMode ? 'sidebar-text-muted' : 'text-gray-500'}`}>{user.plan} Plan</div>
                    </div>
                    <button 
                      className={`touch-target theme-transition ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      title="Logout"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Full Width */}
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
        darkMode={darkMode}
      />

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

      <HelpSupportModal 
        showHelpSupport={showHelpSupport}
        setShowHelpSupport={setShowHelpSupport}
        darkMode={darkMode}
        user={user}
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