import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, TrendingUp, CreditCard, ExternalLink, Target, Shield, 
  Calculator, BookOpen, Users, Award, ChevronRight, X, CheckCircle,
  ArrowRight, TrendingDown, AlertCircle, Info, Lightbulb, Star,
  Clock, Eye, Heart, DollarSign, BarChart3, Home, Plane, GraduationCap,
  Coffee, Car, Receipt, Play, Pause, Volume2, VolumeX, Search,
  Filter, Bookmark, Share, ThumbsUp, MessageCircle, Calendar
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { PageProps } from '../types';

// Advice Modal Component
interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: AdviceItem;
}

interface AdviceItem {
  id: string;
  title: string;
  category: string;
  content: string;
  actionSteps: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const AdviceModal: React.FC<AdviceModalProps> = ({ isOpen, onClose, advice }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepIndex)
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  if (!isOpen) return null;

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-2">{advice.title}</h3>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[advice.priority]}`}>
                  {advice.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[advice.difficulty]}`}>
                  {advice.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Impact</span>
              </div>
              <p className="text-blue-700 font-semibold">{advice.estimatedImpact}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Time</span>
              </div>
              <p className="text-green-700 font-semibold">{advice.timeToComplete}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Category</span>
              </div>
              <p className="text-purple-700 font-semibold">{advice.category}</p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Why This Matters</h4>
            <p className="text-gray-700 leading-relaxed">{advice.content}</p>
          </div>

          {/* Action Steps */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Action Steps</h4>
            <div className="space-y-3">
              {advice.actionSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleStepCompletion(index)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      completedSteps.includes(index)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {completedSteps.includes(index) && <CheckCircle className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm ${completedSteps.includes(index) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {completedSteps.length}/{advice.actionSteps.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / advice.actionSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Mark all steps as completed
              setCompletedSteps(advice.actionSteps.map((_, i) => i));
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Mark All Complete
          </button>
        </div>
      </div>
    </div>
  );
};

// Article Reading Modal
interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  content: string;
  author: string;
  publishDate: string;
  tags: string[];
  likes: number;
  isBookmarked: boolean;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, article }) => {
  const [isReading, setIsReading] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked);

  if (!isOpen) return null;

  const paragraphs = article.content.split('\n\n');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-2">{article.title}</h3>
              <div className="flex items-center space-x-4 text-purple-100">
                <span>By {article.author}</span>
                <span>•</span>
                <span>{article.readTime}</span>
                <span>•</span>
                <span>{article.publishDate}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Article Controls */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsReading(!isReading)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isReading ? 'Pause' : 'Read Aloud'}</span>
              </button>
              <span className="text-sm text-gray-600">
                Reading progress: {Math.round((currentParagraph / paragraphs.length) * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`mb-4 text-gray-700 leading-relaxed transition-all ${
                  isReading && index === currentParagraph ? 'bg-yellow-100 p-2 rounded' : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Tags</h5>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{article.likes + (isLiked ? 1 : 0)} likes</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Discuss</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};

const Advice: React.FC<PageProps> = ({
  transactions,
  accounts,
  budgetCategories,
  goals
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState<AdviceItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPersonalizedModal, setShowPersonalizedModal] = useState(false);

  // Calculate user's financial health metrics
  const financialHealth = useMemo(() => {
    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
    const monthlyIncome = transactions?.filter(t => t.amount > 0 && t.category === 'Income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const monthlyExpenses = Math.abs(transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0);
    const emergencyFundMonths = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const debtBalance = accounts?.filter(a => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0) || 0;
    const investmentBalance = accounts?.filter(a => a.type.toLowerCase() === 'investment').reduce((sum, a) => sum + a.balance, 0) || 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      emergencyFundMonths,
      savingsRate,
      debtBalance,
      investmentBalance,
      netWorth: totalBalance - debtBalance
    };
  }, [accounts, transactions]);

  // Generate personalized advice based on user data
  const personalizedAdvice = useMemo<AdviceItem[]>(() => {
    const advice: AdviceItem[] = [];

    // Emergency fund advice
    if (financialHealth.emergencyFundMonths < 3) {
      advice.push({
        id: 'emergency-fund',
        title: 'Build Your Emergency Fund',
        category: 'Savings',
        content: `You currently have ${financialHealth.emergencyFundMonths.toFixed(1)} months of expenses saved. Financial experts recommend 3-6 months of expenses for emergencies. Building this fund should be your top priority as it provides crucial financial security.`,
        actionSteps: [
          'Open a high-yield savings account specifically for emergencies',
          `Set up automatic transfers of ${formatCurrency((financialHealth.monthlyExpenses * 3 - financialHealth.totalBalance) / 12)} monthly`,
          'Keep emergency funds separate from regular savings',
          'Only use emergency funds for true emergencies',
          'Consider a money market account for higher interest rates'
        ],
        priority: 'high',
        estimatedImpact: 'High - Financial Security',
        timeToComplete: '6-12 months',
        difficulty: 'easy'
      });
    }

    // Debt payoff advice
    if (financialHealth.debtBalance > 0) {
      advice.push({
        id: 'debt-payoff',
        title: 'Accelerate Debt Payoff',
        category: 'Debt Management',
        content: `You have ${formatCurrency(financialHealth.debtBalance)} in debt. Paying this off faster will save you thousands in interest and free up money for investments and goals.`,
        actionSteps: [
          'List all debts with balances and interest rates',
          'Choose debt avalanche (highest interest first) or snowball (smallest balance first) method',
          'Consider debt consolidation if you qualify for lower rates',
          'Pay more than minimum payments when possible',
          'Avoid taking on new debt while paying off existing debt'
        ],
        priority: 'high',
        estimatedImpact: 'High - Interest Savings',
        timeToComplete: '1-3 years',
        difficulty: 'medium'
      });
    }

    // Investment advice
    if (financialHealth.investmentBalance < financialHealth.monthlyIncome * 3) {
      advice.push({
        id: 'start-investing',
        title: 'Start Investing for Long-term Growth',
        category: 'Investing',
        content: 'Your investment balance is lower than recommended. Starting to invest early takes advantage of compound interest and can significantly impact your long-term wealth.',
        actionSteps: [
          'Open a brokerage account with a reputable firm',
          'Start with low-cost index funds or ETFs',
          'Set up automatic monthly investments',
          'Consider a target-date fund for simplicity',
          'Gradually increase investment amount as income grows'
        ],
        priority: 'medium',
        estimatedImpact: 'Very High - Long-term Wealth',
        timeToComplete: '1-2 weeks to start',
        difficulty: 'easy'
      });
    }

    // Savings rate advice
    if (financialHealth.savingsRate < 20) {
      advice.push({
        id: 'increase-savings',
        title: 'Boost Your Savings Rate',
        category: 'Budgeting',
        content: `Your current savings rate is ${financialHealth.savingsRate.toFixed(1)}%. Aim for at least 20% to build wealth effectively and reach financial independence faster.`,
        actionSteps: [
          'Track all expenses for one month to identify spending patterns',
          'Identify unnecessary subscriptions and recurring charges',
          'Look for ways to reduce major expense categories',
          'Automate savings to pay yourself first',
          'Consider increasing income through side hustles or skills development'
        ],
        priority: 'medium',
        estimatedImpact: 'High - Wealth Building',
        timeToComplete: '1-3 months',
        difficulty: 'medium'
      });
    }

    return advice;
  }, [financialHealth]);

  // Sample articles with full content
  const articles: Article[] = [
    {
      id: 'emergency-fund-guide',
      title: '5 Ways to Maximize Your 401(k) Contributions',
      category: 'Retirement',
      readTime: '5 min read',
      author: 'Sarah Johnson, CFP',
      publishDate: 'December 15, 2024',
      content: `Maximizing your 401(k) contributions is one of the most effective ways to build wealth for retirement. Here are five proven strategies to get the most out of your employer-sponsored retirement plan.\n\nFirst, always contribute enough to get your full employer match. This is essentially free money that can add up to thousands of dollars per year. If your employer matches 50% of contributions up to 6% of your salary, make sure you're contributing at least 6%.\n\nSecond, increase your contribution rate annually. Many plans offer automatic escalation features that increase your contribution by 1-2% each year. This helps you gradually build your savings without feeling a sudden impact on your budget.\n\nThird, consider Roth 401(k) contributions if available. While traditional contributions reduce your current taxable income, Roth contributions grow tax-free and won't be taxed in retirement. This can be especially beneficial if you expect to be in a higher tax bracket later.\n\nFourth, time your contributions strategically. If you receive bonuses or have irregular income, consider making larger contributions during high-income months to maximize tax benefits.\n\nFinally, don't forget about catch-up contributions if you're over 50. In 2024, you can contribute an additional $7,500 beyond the standard limit, helping you accelerate your retirement savings in your peak earning years.`,
      tags: ['401k', 'retirement planning', 'employer match', 'tax benefits'],
      likes: 234,
      isBookmarked: false
    },
    {
      id: 'emergency-fund-amount',
      title: 'Emergency Fund: How Much Do You Really Need?',
      category: 'Savings',
      readTime: '4 min read',
      author: 'Michael Chen, CFA',
      publishDate: 'December 12, 2024',
      content: `The traditional advice of saving 3-6 months of expenses for emergencies might not be sufficient in today's economic climate. Here's how to determine the right emergency fund size for your situation.\n\nStart by calculating your essential monthly expenses - not your total spending, but what you absolutely need to survive. This includes housing, utilities, food, insurance, minimum debt payments, and transportation. Non-essential expenses like dining out, entertainment, and subscriptions shouldn't be included.\n\nYour job stability plays a crucial role in determining the right amount. If you work in a stable industry with predictable income, 3-4 months might suffice. However, if you're in a volatile industry, work as a contractor, or have irregular income, consider saving 6-12 months of expenses.\n\nConsider your family situation and health. Single individuals might need less than families with children. If you have chronic health conditions or aging parents who might need financial support, increase your emergency fund accordingly.\n\nDon't forget about insurance gaps. If you have high deductibles on health, auto, or home insurance, factor these potential out-of-pocket costs into your emergency fund calculation.\n\nRemember, your emergency fund should be easily accessible but separate from your checking account. High-yield savings accounts or money market accounts are ideal, offering better interest rates while maintaining liquidity.`,
      tags: ['emergency fund', 'financial security', 'budgeting', 'savings strategy'],
      likes: 189,
      isBookmarked: true
    },
    {
      id: 'tax-advantaged-accounts',
      title: 'Tax-Advantaged Accounts: HSA vs 401(k) vs IRA',
      category: 'Taxes',
      readTime: '8 min read',
      author: 'Lisa Rodriguez, EA',
      publishDate: 'December 10, 2024',
      content: `Understanding the differences between tax-advantaged accounts can save you thousands in taxes and accelerate your wealth building. Let's break down the key features of HSAs, 401(k)s, and IRAs.\n\nHealth Savings Accounts (HSAs) offer triple tax benefits: tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. After age 65, you can withdraw funds for any purpose (with income tax but no penalty), making HSAs excellent retirement accounts.\n\n401(k) plans are employer-sponsored accounts with higher contribution limits than IRAs. Traditional 401(k)s reduce current taxable income, while Roth 401(k)s provide tax-free retirement income. The key advantage is often the employer match, which provides immediate returns on your investment.\n\nIndividual Retirement Accounts (IRAs) offer more investment flexibility than most 401(k)s. Traditional IRAs provide current tax deductions, while Roth IRAs offer tax-free retirement income. Income limits apply to Roth IRA contributions, but backdoor Roth conversions can work around these limits.\n\nThe optimal strategy often involves using multiple account types. Start with maximizing any employer 401(k) match, then consider maximizing HSA contributions if eligible, followed by IRA contributions based on your tax situation.\n\nConsider your current vs. expected future tax rates when choosing between traditional and Roth options. If you expect to be in a lower tax bracket in retirement, traditional accounts might be better. If you expect higher tax rates or want more flexibility, Roth accounts could be advantageous.`,
      tags: ['tax planning', 'retirement accounts', 'HSA', '401k', 'IRA', 'tax strategy'],
      likes: 312,
      isBookmarked: false
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get featured advice based on highest priority
  const featuredAdvice = personalizedAdvice.find(advice => advice.priority === 'high') || personalizedAdvice[0];

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen },
    { id: 'savings', name: 'Saving Strategies', icon: PiggyBank },
    { id: 'investing', name: 'Investment Basics', icon: TrendingUp },
    { id: 'debt management', name: 'Debt Management', icon: CreditCard },
    { id: 'retirement', name: 'Retirement Planning', icon: Target },
    { id: 'taxes', name: 'Tax Planning', icon: Calculator },
    { id: 'budgeting', name: 'Budgeting', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Advice</h1>
            <p className="text-gray-600">Get expert tips and strategies to improve your financial well-being.</p>
          </div>
          <button 
            onClick={() => setShowPersonalizedModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 mt-4 md:mt-0 shadow-lg"
          >
            Get Personalized Advice
          </button>
        </div>

        {/* Featured Advice */}
        {featuredAdvice && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-6 h-6 mr-2" />
                  <h2 className="text-xl font-bold">💡 Your Priority Financial Advice</h2>
                </div>
                <h3 className="text-2xl font-bold mb-3">{featuredAdvice.title}</h3>
                <p className="text-lg mb-4 text-orange-100">
                  {featuredAdvice.content.substring(0, 200)}...
                </p>
                <div className="flex items-center space-x-4 text-orange-100 text-sm mb-4">
                  <span>Impact: {featuredAdvice.estimatedImpact}</span>
                  <span>•</span>
                  <span>Time: {featuredAdvice.timeToComplete}</span>
                </div>
              </div>
              <div className="ml-6">
                <button 
                  onClick={() => {
                    setSelectedAdvice(featuredAdvice);
                    setShowAdviceModal(true);
                  }}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  View Full Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Advice Grid */}
        {personalizedAdvice.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedAdvice.map(advice => (
                <div key={advice.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setSelectedAdvice(advice);
                       setShowAdviceModal(true);
                     }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          advice.priority === 'high' ? 'bg-red-100 text-red-700' :
                          advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {advice.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{advice.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{advice.content.substring(0, 120)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{advice.category}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advice Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
               onClick={() => setSelectedCategory('savings')}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <PiggyBank className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Saving Strategies</h3>
            <p className="text-gray-600 mb-4">Learn effective ways to boost your savings and reach your financial goals faster.</p>
            <div className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium">
              View Saving Tips <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
               onClick={() => setSelectedCategory('investing')}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Basics</h3>
            <p className="text-gray-600 mb-4">Understand the fundamentals of investing and building long-term wealth.</p>
            <div className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium">
              Learn Investing <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
               onClick={() => setSelectedCategory('debt management')}>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Debt Management</h3>
            <p className="text-gray-600 mb-4">Strategies to pay off debt efficiently and improve your financial health.</p>
            <div className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium">
              Manage Debt <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Financial Articles & Guides</h3>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div key={article.id} 
                   className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                   onClick={() => {
                     setSelectedArticle(article);
                     setShowArticleModal(true);
                   }}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{article.title}</h4>
                    {article.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-4">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{article.category}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span>By {article.author}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{article.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-700 p-2">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">💡 Quick Financial Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Automate Your Savings</h4>
              <p className="text-sm text-blue-100">Set up automatic transfers to save without thinking about it.</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Track Your Net Worth</h4>
              <p className="text-sm text-blue-100">Monitor your assets minus liabilities monthly to see progress.</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Review and Adjust</h4>
              <p className="text-sm text-blue-100">Check your financial plan quarterly and make necessary adjustments.</p>
            </div>
          </div>
        </div>

        {/* Modals */}
        {selectedAdvice && (
          <AdviceModal
            isOpen={showAdviceModal}
            onClose={() => {
              setShowAdviceModal(false);
              setSelectedAdvice(null);
            }}
            advice={selectedAdvice}
          />
        )}

        {selectedArticle && (
          <ArticleModal
            isOpen={showArticleModal}
            onClose={() => {
              setShowArticleModal(false);
              setSelectedArticle(null);
            }}
            article={selectedArticle}
          />
        )}

        {/* Personalized Advice Summary Modal */}
        {showPersonalizedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Your Personalized Financial Advice</h3>
                    <p className="text-orange-100 text-sm">Based on your current financial situation</p>
                  </div>
                  <button onClick={() => setShowPersonalizedModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {personalizedAdvice.map((advice, index) => (
                    <div key={advice.id} className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              advice.priority === 'high' ? 'bg-red-100 text-red-700' :
                              advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {advice.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className="text-sm text-gray-500">#{index + 1}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{advice.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{advice.content.substring(0, 150)}...</p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedAdvice(advice);
                            setShowAdviceModal(true);
                            setShowPersonalizedModal(false);
                          }}
                          className="ml-4 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                        >
                          View Guide
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>Impact: {advice.estimatedImpact}</div>
                        <div>Time: {advice.timeToComplete}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advice;