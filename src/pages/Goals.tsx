import React, { useState } from 'react';
import { 
  Target, 
  PiggyBank, 
  ArrowUp, 
  MoreHorizontal, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Star,
  Award,
  Clock,
  Calculator,
  Activity,
  Zap
} from 'lucide-react';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { calculateGoalProgress } from '../utils/calculations';
import type { Goal, PageProps } from '../types';

const Goals: React.FC<PageProps> = ({
  goals,
  setGoals,
  updateGoalProgress,
  deleteGoal,
  setShowGoalSetup,
  setEditingGoal,
  setNewGoal
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');

  // Calculate goals statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalMonthlyContributions = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  // Categorize goals
  const savingsGoals = goals.filter(goal => goal.type === 'savings');
  const debtGoals = goals.filter(goal => goal.type === 'debt');

  // Get goals by status
  const onTrackGoals = goals.filter(goal => {
    const { monthsRemaining } = calculateGoalProgress(goal);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return monthsRemaining <= actualMonthsRemaining;
  });

  const behindGoals = goals.filter(goal => {
    const { monthsRemaining } = calculateGoalProgress(goal);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return monthsRemaining > actualMonthsRemaining;
  });

  const completedGoals = goals.filter(goal => goal.current >= goal.target);

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      target: goal.target.toString(),
      current: goal.current.toString(),
      type: goal.type,
      monthlyContribution: goal.monthlyContribution.toString(),
      deadline: goal.deadline
    });
    setShowGoalSetup(true);
  };

  const handleUpdateProgress = () => {
    if (selectedGoal && progressAmount) {
      updateGoalProgress(selectedGoal.id, parseFloat(progressAmount));
      setShowProgressModal(false);
      setProgressAmount('');
      setSelectedGoal(null);
    }
  };

  const getGoalStatus = (goal: Goal) => {
    const { progressPercent, monthsRemaining } = calculateGoalProgress(goal);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (progressPercent >= 100) return { status: 'completed', color: 'green', icon: CheckCircle };
    if (monthsRemaining <= actualMonthsRemaining) return { status: 'on-track', color: 'blue', icon: TrendingUp };
    return { status: 'behind', color: 'red', icon: AlertTriangle };
  };

  const getGoalIcon = (type: string) => {
    return type === 'debt' ? CreditCard : PiggyBank;
  };

  const getTimeToCompletion = (goal: Goal) => {
    const { monthsRemaining } = calculateGoalProgress(goal);
    if (monthsRemaining <= 0) return 'Goal reached!';
    if (monthsRemaining < 12) return `${monthsRemaining} months`;
    const years = Math.floor(monthsRemaining / 12);
    const months = monthsRemaining % 12;
    return `${years}y ${months}m`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Goals</h1>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowGoalSetup(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Goals</h3>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
          <div className="text-sm text-gray-600">Goals in progress</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Progress</h3>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(overallProgress)}
          </div>
          <div className="text-sm text-gray-600">Across all goals</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Saved</h3>
            <PiggyBank className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCurrentAmount)}
          </div>
          <div className="text-sm text-gray-600">Current progress</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Monthly Contributions</h3>
            <ArrowUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalMonthlyContributions)}
          </div>
          <div className="text-sm text-gray-600">Total per month</div>
        </div>
      </div>

      {/* Goal Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Goal Status</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">On Track</span>
              <span className="text-sm font-medium text-blue-600">{onTrackGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Behind Schedule</span>
              <span className="text-sm font-medium text-red-600">{behindGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-green-600">{completedGoals.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Goal Types</h3>
            <Star className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Savings Goals</span>
              <span className="text-sm font-medium text-green-600">{savingsGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Debt Payoff</span>
              <span className="text-sm font-medium text-red-600">{debtGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Target</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(totalTargetAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Performance</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Progress</span>
              <span className="text-sm font-medium text-blue-600">{formatPercentage(overallProgress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Est. Completion</span>
              <span className="text-sm font-medium text-gray-900">Dec 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-6">
          {goals.map(goal => {
            const { progressPercent, monthsRemaining } = calculateGoalProgress(goal);
            const goalStatus = getGoalStatus(goal);
            const GoalIcon = getGoalIcon(goal.type);
            const StatusIcon = goalStatus.icon;

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className={`h-48 flex flex-col justify-center items-center text-white relative ${
                    goal.type === 'debt' 
                      ? 'bg-gradient-to-br from-red-600 to-red-800'
                      : 'bg-gradient-to-br from-green-600 to-green-800'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{goal.emoji}</div>
                    <h2 className="text-2xl font-bold mb-2">{goal.name}</h2>
                    <p className="text-xl mb-1">
                      {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                    </p>
                    <div className="w-80 bg-white bg-opacity-20 rounded-full h-3 mt-4">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-lg mt-3 opacity-90">
                      {formatPercentage(progressPercent)} complete
                    </p>
                  </div>
                  <button 
                    className="absolute top-4 right-4 text-white hover:text-gray-200"
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute top-4 left-4 flex items-center">
                    <StatusIcon className={`w-5 h-5 text-${goalStatus.color}-200 mr-2`} />
                    <span className="text-sm opacity-90 capitalize">{goalStatus.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Progress Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{goal.type === 'debt' ? 'Amount Paid' : 'Amount Saved'}</span>
                          <span className="font-medium">{formatCurrency(goal.current)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Contribution</span>
                          <span className="font-medium">{formatCurrency(goal.monthlyContribution)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Date</span>
                          <span className="font-medium">{formatDate(goal.deadline)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Remaining</span>
                          <span className="font-medium">{getTimeToCompletion(goal)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Projections</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Est. Completion</span>
                          <span className="font-medium">
                            {monthsRemaining <= 0 ? 'Complete!' : getTimeToCompletion(goal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>On Track</span>
                          <span className={`font-medium ${goalStatus.status === 'on-track' ? 'text-green-600' : 'text-red-600'}`}>
                            {goalStatus.status === 'on-track' ? 'Yes' : 'Behind'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Required Monthly</span>
                          <span className="font-medium">{formatCurrency(goal.monthlyContribution)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Progress</span>
                          <span className="font-medium">{formatCurrency(goal.monthlyContribution * 12)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="space-y-2">
                        <button 
                          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowProgressModal(true);
                          }}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Update Progress
                        </button>
                        <button 
                          className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Goal
                        </button>
                        <button 
                          className="w-full text-red-500 hover:text-red-700 py-2 px-4 text-sm flex items-center justify-center"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete Goal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
          <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-gray-600 mb-6">Start by setting your first financial goal to track your progress.</p>
          <button 
            onClick={() => setShowGoalSetup(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Goal Insights */}
      {goals.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 text-blue-900 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Goal Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Financial Progress</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                  <span>
                    You're {formatPercentage(overallProgress)} of the way to achieving all your goals
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                  <span>
                    {onTrackGoals.length} out of {goals.length} goals are on track for completion
                  </span>
                </div>
                {behindGoals.length > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-red-500"></div>
                    <span>
                      Consider increasing contributions for {behindGoals.length} behind-schedule goal{behindGoals.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <Target className="w-3 h-3 mr-2" />
                  <span>Set up automatic transfers to maintain consistent progress</span>
                </div>
                {totalMonthlyContributions > 0 && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>Review and adjust goals quarterly based on income changes</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-2" />
                  <span>Celebrate milestones to maintain motivation for long-term goals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Progress: {selectedGoal.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Amount ({selectedGoal.type === 'debt' ? 'Payment' : 'Contribution'})
                </label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="text-sm text-gray-600">
                Current: {formatCurrency(selectedGoal.current)} / {formatCurrency(selectedGoal.target)}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setShowProgressModal(false);
                  setProgressAmount('');
                  setSelectedGoal(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                onClick={handleUpdateProgress}
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;