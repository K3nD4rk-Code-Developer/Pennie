// HelpSupportModal.tsx - Comprehensive Help & Support Component
import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Book, 
  HelpCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  Search,
  ChevronRight,
  FileText,
  Video,
  Users,
  Settings,
  Shield,
  CreditCard,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Calculator,
  Bot,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Send
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
}

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ 
  showHelpSupport, 
  setShowHelpSupport, 
  darkMode,
  user 
}) => {
  const [activeTab, setActiveTab] = useState<'help' | 'contact' | 'feedback'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    includeSystemInfo: true
  });
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    rating: 5,
    message: '',
    includeEmail: true
  });

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I connect my bank account?',
      answer: 'Go to the Accounts page and click "Connect Account". We use bank-level encryption to securely connect to your financial institutions. Follow the prompts to authenticate with your bank.',
      category: 'accounts'
    },
    {
      id: '2',
      question: 'Is my financial data secure?',
      answer: 'Yes! We use 256-bit SSL encryption, the same security banks use. We never store your banking credentials and use read-only access to your accounts. Your data is encrypted both in transit and at rest.',
      category: 'security'
    },
    {
      id: '3',
      question: 'How do I set up a budget?',
      answer: 'Navigate to the Budget page and click "Create Budget". Start with major categories like Food, Transportation, and Entertainment. Pennie will suggest amounts based on your spending history.',
      category: 'budgeting'
    },
    {
      id: '4',
      question: 'Can I track multiple goals at once?',
      answer: 'Absolutely! You can create unlimited savings goals, debt payoff plans, and investment targets. Each goal tracks independently and shows your progress over time.',
      category: 'goals'
    },
    {
      id: '5',
      question: 'How does the AI Advisor work?',
      answer: 'Our AI analyzes your spending patterns, income, and goals to provide personalized recommendations. It learns from your behavior to offer increasingly relevant financial advice.',
      category: 'ai'
    },
    {
      id: '6',
      question: 'Can I export my financial data?',
      answer: 'Yes! Go to Reports and click "Export Data". You can download your transactions, budgets, and account summaries in CSV or PDF format for your records or tax preparation.',
      category: 'data'
    },
    {
      id: '7',
      question: 'What if a transaction is categorized incorrectly?',
      answer: 'Simply click on the transaction and change its category. Pennie learns from your corrections to improve future automatic categorization.',
      category: 'transactions'
    },
    {
      id: '8',
      question: 'How do I cancel my subscription?',
      answer: 'Go to Settings > Account > Billing. You can cancel anytime with no fees. Your data remains accessible until the end of your billing period.',
      category: 'billing'
    }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Pennie',
      description: 'Complete setup guide for new users',
      category: 'basics',
      icon: Book,
      readTime: '5 min'
    },
    {
      id: '2',
      title: 'Connecting Your Accounts',
      description: 'Step-by-step account linking process',
      category: 'accounts',
      icon: CreditCard,
      readTime: '3 min'
    },
    {
      id: '3',
      title: 'Creating Effective Budgets',
      description: 'Best practices for budget planning',
      category: 'budgeting',
      icon: PieChart,
      readTime: '7 min'
    },
    {
      id: '4',
      title: 'Setting and Tracking Goals',
      description: 'Maximize your savings potential',
      category: 'goals',
      icon: Target,
      readTime: '4 min'
    },
    {
      id: '5',
      title: 'Understanding Cash Flow',
      description: 'Monitor your income and expenses',
      category: 'cashflow',
      icon: TrendingUp,
      readTime: '6 min'
    },
    {
      id: '6',
      title: 'Investment Tracking',
      description: 'Monitor your portfolio performance',
      category: 'investments',
      icon: BarChart3,
      readTime: '8 min'
    },
    {
      id: '7',
      title: 'Tax Preparation Features',
      description: 'Organize your finances for tax time',
      category: 'taxes',
      icon: Calculator,
      readTime: '10 min'
    },
    {
      id: '8',
      title: 'Using the AI Advisor',
      description: 'Get personalized financial insights',
      category: 'ai',
      icon: Bot,
      readTime: '5 min'
    },
    {
      id: '9',
      title: 'Security and Privacy',
      description: 'How we protect your data',
      category: 'security',
      icon: Shield,
      readTime: '4 min'
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the contact form to your support system
    console.log('Contact form submitted:', contactForm);
    alert('Your message has been sent! We\'ll get back to you within 24 hours.');
    setContactForm({
      subject: '',
      category: 'general',
      priority: 'medium',
      message: '',
      includeSystemInfo: true
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send feedback to your analytics system
    console.log('Feedback submitted:', feedbackForm);
    alert('Thank you for your feedback! We appreciate your input.');
    setFeedbackForm({
      type: 'suggestion',
      rating: 5,
      message: '',
      includeEmail: true
    });
  };

  if (!showHelpSupport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden theme-transition ${darkMode ? 'modal-bg' : 'bg-white'}`}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('help')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'help' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Help Center
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'contact' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Contact Support
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'feedback' 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'help' && (
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 theme-transition ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search for help articles or FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button className={`p-4 rounded-lg border text-left hover:shadow-md transition-all theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <Video className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className={`font-medium mb-1 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Video Tutorials</h3>
                  <p className={`text-sm theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Step-by-step guides</p>
                </button>
                <button className={`p-4 rounded-lg border text-left hover:shadow-md transition-all theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <h3 className={`font-medium mb-1 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Community Forum</h3>
                  <p className={`text-sm theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Connect with other users</p>
                </button>
                <button className={`p-4 rounded-lg border text-left hover:shadow-md transition-all theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <Lightbulb className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className={`font-medium mb-1 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tips & Tricks</h3>
                  <p className={`text-sm theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Make the most of Pennie</p>
                </button>
              </div>

              {/* Help Articles */}
              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Help Articles {searchQuery && `(${filteredArticles.length} results)`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map((article) => {
                    const Icon = article.icon;
                    return (
                      <button
                        key={article.id}
                        className={`p-4 rounded-lg border text-left hover:shadow-md transition-all theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <Icon className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className={`font-medium mb-1 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>{article.title}</h4>
                              <p className={`text-sm mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{article.description}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {article.readTime}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 theme-transition ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Frequently Asked Questions {searchQuery && `(${filteredFAQs.length} results)`}
                </h3>
                <div className="space-y-3">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className={`border rounded-lg overflow-hidden theme-transition ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className={`w-full p-4 text-left hover:bg-opacity-50 transition-colors theme-transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h4>
                          <ChevronRight className={`w-4 h-4 transform transition-transform theme-transition ${expandedFAQ === faq.id ? 'rotate-90' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className={`px-4 pb-4 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Send us a message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Brief description of your question"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Category
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="general">General Question</option>
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing & Account</option>
                          <option value="security">Security Concern</option>
                          <option value="feature">Feature Request</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Priority
                        </label>
                        <select
                          value={contactForm.priority}
                          onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Please provide details about your question or issue..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeSystemInfo"
                        checked={contactForm.includeSystemInfo}
                        onChange={(e) => setContactForm({...contactForm, includeSystemInfo: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="includeSystemInfo" className={`text-sm theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Include system information to help diagnose technical issues
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Other ways to reach us</h3>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border theme-transition ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center mb-2">
                        <Mail className="w-5 h-5 text-blue-600 mr-3" />
                        <h4 className={`font-medium theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Support</h4>
                      </div>
                      <p className={`text-sm mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>For general questions and support</p>
                      <a href="mailto:support@pennie.app" className="text-blue-600 hover:text-blue-700 text-sm">
                        support@pennie.app
                      </a>
                      <div className="flex items-center mt-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Usually responds within 24 hours
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border theme-transition ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                        <h4 className={`font-medium theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Priority Support</h4>
                      </div>
                      <p className={`text-sm mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>For urgent issues and Pro members</p>
                      <a href="mailto:priority@pennie.app" className="text-orange-600 hover:text-orange-700 text-sm">
                        priority@pennie.app
                      </a>
                      <div className="flex items-center mt-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Usually responds within 4 hours
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border theme-transition ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center mb-2">
                        <ExternalLink className="w-5 h-5 text-purple-600 mr-3" />
                        <h4 className={`font-medium theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Documentation</h4>
                      </div>
                      <p className={`text-sm mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comprehensive guides and API docs</p>
                      <a href="#" className="text-purple-600 hover:text-purple-700 text-sm">
                        docs.pennie.app
                      </a>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className={`mt-6 p-4 rounded-lg border theme-transition ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                    <h4 className={`font-medium mb-2 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Account Info</h4>
                    <div className="text-sm space-y-1">
                      <div className={`theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email: {user.email}</div>
                      <div className={`theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan: {user.plan}</div>
                      <div className={`theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Member since: {new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className={`text-lg font-semibold mb-4 theme-transition ${darkMode ? 'text-white' : 'text-gray-900'}`}>We'd love your feedback!</h3>
                <p className={`mb-6 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your input helps us improve Pennie. Share your thoughts, suggestions, or report issues.
                </p>

                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
                        { value: 'bug', label: 'Bug Report', icon: AlertCircle },
                        { value: 'compliment', label: 'Compliment', icon: CheckCircle }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFeedbackForm({...feedbackForm, type: value})}
                          className={`p-4 border rounded-lg transition-all ${
                            feedbackForm.type === value
                              ? 'border-blue-500 bg-blue-50' + (darkMode ? ' !bg-blue-900 !border-blue-400' : '')
                              : darkMode 
                                ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                                : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${feedbackForm.type === value ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div className={`font-medium ${feedbackForm.type === value ? 'text-blue-700' + (darkMode ? ' !text-blue-300' : '') : darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      How would you rate your experience? (1-5 stars)
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          <span className={star <= feedbackForm.rating ? 'text-yellow-400' : darkMode ? 'text-gray-600' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg theme-transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={
                        feedbackForm.type === 'suggestion' ? 'What feature or improvement would you like to see?' :
                        feedbackForm.type === 'bug' ? 'Please describe the issue you encountered and steps to reproduce it...' :
                        'What did you love about your experience with Pennie?'
                      }
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeEmail"
                      checked={feedbackForm.includeEmail}
                      onChange={(e) => setFeedbackForm({...feedbackForm, includeEmail: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="includeEmail" className={`text-sm theme-transition ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Include my email so you can follow up with me
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;