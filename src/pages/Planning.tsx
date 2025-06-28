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
  Star,
  Car,
  X,
  Save,
  Clock,
  MapPin,
  Building,
  Users,
  Gift,
  Edit3,
  CalendarDays,
  PlusCircle
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { PageProps } from '../types';

// Create Plan Modal Component
interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan: (plan: FinancialPlan) => void;
}

interface FinancialPlan {
  id: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'retirement' | 'emergency';
  name: string;
  target: number;
  timeline: number; // months
  priority: 'high' | 'medium' | 'low';
  category?: string;
  monthlyContribution?: number;
  description?: string;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, onCreatePlan }) => {
  const [planData, setPlanData] = useState<Partial<FinancialPlan>>({
    type: 'savings',
    priority: 'medium',
    timeline: 12
  });

  const planTypes = [
    { value: 'savings', label: 'Savings Goal', icon: Target, description: 'Save for a specific purchase or milestone' },
    { value: 'debt_payoff', label: 'Debt Payoff', icon: CreditCard, description: 'Create a strategy to eliminate debt' },
    { value: 'investment', label: 'Investment Plan', icon: PieChart, description: 'Build wealth through investments' },
    { value: 'retirement', label: 'Retirement Planning', icon: Calendar, description: 'Secure your financial future' },
    { value: 'emergency', label: 'Emergency Fund', icon: AlertCircle, description: 'Build financial security buffer' }
  ];

  const handleSubmit = () => {
    if (planData.name && planData.target && planData.timeline) {
      const newPlan: FinancialPlan = {
        id: Date.now().toString(),
        type: planData.type as FinancialPlan['type'],
        name: planData.name,
        target: planData.target,
        timeline: planData.timeline,
        priority: planData.priority as FinancialPlan['priority'],
        category: planData.category,
        monthlyContribution: planData.target / planData.timeline,
        description: planData.description
      };
      onCreatePlan(newPlan);
      setPlanData({ type: 'savings', priority: 'medium', timeline: 12 });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Create Financial Plan</h3>
              <p className="text-orange-100 text-sm">Set up a new financial goal or strategy</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Plan Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Plan Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setPlanData(prev => ({ ...prev, type: type.value as FinancialPlan['type'] }))}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      planData.type === type.value 
                        ? 'border-orange-300 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
              <input
                type="text"
                placeholder="e.g., Emergency Fund, Vacation to Japan, Pay off Credit Card"
                value={planData.name || ''}
                onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="10000"
                    value={planData.target || ''}
                    onChange={(e) => setPlanData(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timeline (months)</label>
                <input
                  type="number"
                  placeholder="12"
                  value={planData.timeline || ''}
                  onChange={(e) => setPlanData(prev => ({ ...prev, timeline: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
              <select
                value={planData.priority || 'medium'}
                onChange={(e) => setPlanData(prev => ({ ...prev, priority: e.target.value as FinancialPlan['priority'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                placeholder="Add any additional details about your plan..."
                value={planData.description || ''}
                onChange={(e) => setPlanData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent h-20 resize-none"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          {planData.target && planData.timeline && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Plan Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Monthly Contribution:</span>
                  <div className="font-bold text-orange-900">{formatCurrency(planData.target / planData.timeline)}</div>
                </div>
                <div>
                  <span className="text-orange-700">Target Date:</span>
                  <div className="font-bold text-orange-900">
                    {new Date(Date.now() + planData.timeline * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!planData.name || !planData.target || !planData.timeline}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Life Event Planning Modal Component
interface LifeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: string;
  onCreateGoal: (goal: any) => void;
}

interface EventData {
  timeframe: number;
  location: string;
  participants: number;
}

const LifeEventModal: React.FC<LifeEventModalProps> = ({ isOpen, onClose, eventType, onCreateGoal }) => {
  const [activeTab, setActiveTab] = useState<'goal' | 'calculator' | 'timeline'>('goal');
  const [eventData, setEventData] = useState<EventData>({
    timeframe: 12,
    location: '',
    participants: 1
  });

  const eventDetails = {
    home: {
      title: 'Apartment Planning',
      icon: Home,
      costs: {
        deposit: 2500,
        firstMonth: 1500,
        movingCosts: 800,
        furniture: 3000,
        utilities: 200
      },
      tips: ['Research neighborhoods thoroughly', 'Factor in commute costs', 'Budget for unexpected expenses']
    },
    car: {
      title: 'Car Purchase Planning',
      icon: Car,
      costs: {
        downPayment: 5000,
        monthlyPayment: 350,
        insurance: 150,
        registration: 300,
        maintenance: 100
      },
      tips: ['Consider certified pre-owned vehicles', 'Get pre-approved for financing', 'Factor in depreciation']
    },
    education: {
      title: 'Education Planning',
      icon: Book,
      costs: {
        tuition: 15000,
        books: 1200,
        supplies: 500,
        living: 8000,
        fees: 800
      },
      tips: ['Explore scholarship opportunities', 'Consider in-state vs out-of-state costs', 'Look into employer tuition assistance']
    },
    travel: {
      title: 'Dream Vacation Planning',
      icon: Plane,
      costs: {
        flights: 1200,
        accommodation: 2400,
        food: 1000,
        activities: 800,
        miscellaneous: 600
      },
      tips: ['Book flights in advance', 'Consider travel insurance', 'Research local customs and costs']
    }
  };

  const currentEvent = eventDetails[eventType as keyof typeof eventDetails];
  const totalCost = currentEvent ? Object.values(currentEvent.costs).reduce((sum, cost) => sum + cost, 0) : 0;

  const handleCreateGoal = () => {
    if (currentEvent) {
      const goal = {
        id: Date.now().toString(),
        name: `${currentEvent.title} Fund`,
        target: totalCost,
        current: 0,
        emoji: eventType === 'home' ? '🏠' : eventType === 'car' ? '🚗' : eventType === 'education' ? '📚' : '✈️',
        category: eventType,
        timeline: eventData.timeframe
      };
      onCreateGoal(goal);
      onClose();
    }
  };

  if (!isOpen || !currentEvent) return null;

  const Icon = currentEvent.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Icon className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">{currentEvent.title}</h3>
                <p className="text-blue-100 text-sm">Plan, budget, and achieve your goal</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'goal', label: 'Create Goal', icon: Target },
            { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
            { id: 'timeline', label: 'Timeline Planner', icon: CalendarDays }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Create Goal Tab */}
          {activeTab === 'goal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Goal Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
                        <div className="text-sm text-gray-600">Estimated total cost</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeline (months)</label>
                      <input
                        type="number"
                        value={eventData.timeframe}
                        onChange={(e) => setEventData(prev => ({ ...prev, timeframe: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {eventType === 'travel' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                        <input
                          type="text"
                          placeholder="e.g., Tokyo, Japan"
                          value={eventData.location}
                          onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-blue-800 font-medium mb-2">Monthly Savings Needed</div>
                      <div className="text-xl font-bold text-blue-900">{formatCurrency(totalCost / eventData.timeframe)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(currentEvent.costs).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGoal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Create Savings Goal</span>
                </button>
              </div>
            </div>
          )}

          {/* Cost Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Customize Costs</h4>
                  <div className="space-y-4">
                    {Object.entries(currentEvent.costs).map(([category, defaultAmount]) => (
                      <div key={category}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {category.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            defaultValue={defaultAmount}
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Planning Tips</h4>
                  <div className="space-y-4">
                    {currentEvent.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-800 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Budget Buffer</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Consider adding 10-20% extra to your budget for unexpected costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Planner Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900">Your {currentEvent.title} Timeline</h4>
              <div className="space-y-4">
                {[
                  { phase: 'Planning Phase', duration: '1-2 months', tasks: ['Research options', 'Set budget', 'Create savings plan'] },
                  { phase: 'Saving Phase', duration: `${Math.max(1, eventData.timeframe - 2)} months`, tasks: ['Regular contributions', 'Track progress', 'Adjust as needed'] },
                  { phase: 'Action Phase', duration: '1 month', tasks: ['Make purchase/booking', 'Handle paperwork', 'Celebrate achievement!'] }
                ].map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {phase.duration}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {phase.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Planning: React.FC<PageProps> = ({
  accounts,
  transactions,
  goals
}) => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<string | null>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showLifeEventModal, setShowLifeEventModal] = useState(false);
  const [userPlans, setUserPlans] = useState<FinancialPlan[]>([]);
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
      title: 'Apartment', 
      icon: Home, 
      gradient: 'from-orange-500 to-amber-400'
    },
    { 
      id: 'car', 
      title: 'Car', 
      icon: Car, 
      gradient: 'from-blue-500 to-blue-300'
    },
    { 
      id: 'education', 
      title: 'Education', 
      icon: Book, 
      gradient: 'from-green-500 to-teal-600'
    },
    { 
      id: 'travel', 
      title: 'Dream Vacation', 
      icon: Plane, 
      gradient: 'from-orange-400 to-pink-500'
    }
  ];

  // Handlers
  const handleCreatePlan = (plan: FinancialPlan) => {
    setUserPlans(prev => [...prev, plan]);
    console.log('Created new financial plan:', plan);
  };

  const handleCreateGoal = (goal: any) => {
    console.log('Created new goal:', goal);
    // This would typically update the goals array through a prop
  };

  const handleLifeEventTool = (eventId: string, tool: string) => {
    setSelectedLifeEvent(eventId);
    if (tool === 'goal') {
      setShowLifeEventModal(true);
    }
    console.log(`Opening ${tool} for ${eventId}`);
  };

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
          {event.id === 'home' && 'Is it time to move out yet? Plan for down payments and housing costs!'}
          {event.id === 'car' && 'Time to hit the road? Budget for down payments, insurance, and monthly costs!'}
          {event.id === 'education' && 'Invest in your future. Start saving for college, trade school, or certifications!'}
          {event.id === 'travel' && 'Ready to escape? Plan and budget for your once-in-a-lifetime getaway!'}
        </div>

        {isSelected && (
          <div className="mt-4 p-4 bg-white rounded-xl">
            <h4 className="font-medium text-gray-900 mb-3">Planning Tools</h4>
            <div className="space-y-2 text-sm">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLifeEventTool(event.id, 'goal');
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-orange-600 font-medium flex items-center justify-between"
              >
                Create Savings Goal <ArrowRight className="w-4 h-4" />
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
            <button 
              onClick={() => setShowCreatePlanModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
            <p className="text-gray-600 text-lm font-medium">Retirement Readiness</p>
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lm font-medium">Debt-to-Income</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercentage(((debtData.totalDebt ?? 0) / ((retirementData.monthlyIncome ?? 0) * 12 || 1)) * 100)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lm font-medium">Investment Growth</p>
                <p className="text-xl font-bold text-green-600">+{formatPercentage(retirementData.expectedReturn)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lm font-medium">Active Goals</p>
                <p className="text-xl font-bold text-gray-900">{(goals?.length || 0) + userPlans.length}</p>
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
            {/* User Plans */}
            {userPlans.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Your Financial Plans</h3>
                  <span className="text-sm text-gray-600">{userPlans.length} active plan{userPlans.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPlans.map((plan) => (
                    <div key={plan.id} className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{plan.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          plan.priority === 'high' ? 'bg-red-100 text-red-700' :
                          plan.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {plan.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Target: {formatCurrency(plan.target)} in {plan.timeline} months
                      </div>
                      <div className="text-xs text-gray-500">
                        Monthly: {formatCurrency(plan.monthlyContribution || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                          <div className="bg-white p-4 rounded-xl">
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
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl border border-gray-100 shadow-sm"
                      style={{ boxShadow: '0 -2px 8px 0 rgba(16,30,54,0.08), 0 2px 8px 0 rgba(16,30,54,0.04)' }}
                    >
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

        {/* Modals */}
        <CreatePlanModal
          isOpen={showCreatePlanModal}
          onClose={() => setShowCreatePlanModal(false)}
          onCreatePlan={handleCreatePlan}
        />

        <LifeEventModal
          isOpen={showLifeEventModal}
          onClose={() => setShowLifeEventModal(false)}
          eventType={selectedLifeEvent || 'home'}
          onCreateGoal={handleCreateGoal}
        />
      </div>
    </div>
  );
};

export default Planning;