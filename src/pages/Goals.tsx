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
  Zap,
  X,
  ChevronDown,
  ChevronUp
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedGoalForEmoji, setSelectedGoalForEmoji] = useState<Goal | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  // Add click outside handler to close menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu && !(event.target as Element).closest('.relative')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  // Popular emojis for financial goals
  const popularEmojis = [
    '💰', '💵', '💸', '🏠', '🚗', '✈️', '🎓', '💍', '👶', '🏥',
    '💳', '🏦', '📈', '🎯', '🔥', '⭐', '🚀', '💎', '🌟', '🏆',
    '🛡️', '🌴', '🏖️', '💼', '📚', '🎨', '🏋️', '🍔', '🎮', '📱',
    // Student-oriented emojis
    '📖', '✏️', '🎒', '📝', '💻', '🖥️', '⌨️', '🖱️', '📊', '📉',
    '🧮', '🔬', '🔭', '🧪', '🧬', '🎓', '🏫', '📐', '📏', '🖊️',
    '📌', '📎', '🗂️', '📁', '🗓️', '⏰', '☕', '🍕', '🍜', '🎧'
  ];

  // Calculate goals statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalMonthlyContributions = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  // Categorize goals
  const savingsGoals = goals.filter(goal => goal.type === 'savings');
  const debtGoals = goals.filter(goal => goal.type === 'debt');

  // Get goals by status - FIXED LOGIC
  const completedGoals = goals.filter(goal => goal.current >= goal.target);
  
  const onTrackGoals = goals.filter(goal => {
    if (goal.current >= goal.target) return false; // Already completed
    const { monthsRemaining } = calculateGoalProgress(goal);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return monthsRemaining <= actualMonthsRemaining;
  });

  const behindGoals = goals.filter(goal => {
    if (goal.current >= goal.target) return false; // Already completed
    const { monthsRemaining } = calculateGoalProgress(goal);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return monthsRemaining > actualMonthsRemaining;
  });

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

  const handleEmojiSelect = (emoji: string) => {
    if (selectedGoalForEmoji) {
      setGoals(prev => prev.map(goal => 
        goal.id === selectedGoalForEmoji.id 
          ? { ...goal, emoji } 
          : goal
      ));
      setShowEmojiPicker(false);
      setSelectedGoalForEmoji(null);
    }
  };

  const toggleGoalExpansion = (goalId: number) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setShowDeleteConfirm(false);
      setGoalToDelete(null);
    }
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedGoals(new Set());
      setExpandAll(false);
    } else {
      setExpandedGoals(new Set(goals.map(g => g.id)));
      setExpandAll(true);
    }
    setShowOptionsMenu(false);
  };

  const handleCollapseAll = () => {
    setExpandedGoals(new Set());
    setExpandAll(false);
    setShowOptionsMenu(false);
  };

  const getGoalStatus = (goal: Goal) => {
    const { progressPercent, monthsRemaining } = calculateGoalProgress(goal);
    
    // Check if completed first
    if (goal.current >= goal.target) {
      return { status: 'completed', color: 'green', icon: CheckCircle };
    }
    
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const actualMonthsRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsRemaining <= actualMonthsRemaining) {
      return { status: 'on-track', color: 'blue', icon: TrendingUp };
    }
    
    return { status: 'behind', color: 'red', icon: AlertTriangle };
  };

  const getTimeToCompletion = (goal: Goal) => {
    if (goal.current >= goal.target) return 'Goal reached!';
    
    const { monthsRemaining } = calculateGoalProgress(goal);
    if (monthsRemaining <= 0) return 'Goal reached!';
    if (monthsRemaining < 12) return `${monthsRemaining} months`;
    const years = Math.floor(monthsRemaining / 12);
    const months = monthsRemaining % 12;
    return `${years}y ${months}m`;
  };

  // Calculate estimated completion date
  const getEstimatedCompletion = (goal: Goal) => {
    if (goal.current >= goal.target) return 'Complete!';
    
    const { monthsRemaining } = calculateGoalProgress(goal);
    if (monthsRemaining <= 0) return 'Complete!';
    
    const now = new Date();
    const completionDate = new Date(now.getTime() + (monthsRemaining * 30 * 24 * 60 * 60 * 1000));
    return formatDate(completionDate.toISOString());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
          <p className="text-gray-600">
            Track and reach your savings and debt goals efficiently.
          </p>
        </div>
        <div className="flex space-x-2 relative">
          <div className="relative">
            <button 
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {/* Options Dropdown Menu */}
            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleExpandAll}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Collapse All
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    // Sort by deadline
                    const sorted = [...goals].sort((a, b) => 
                      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                    );
                    setGoals(sorted);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Sort by Deadline
                </button>
                <button
                  onClick={() => {
                    // Sort by progress
                    const sorted = [...goals].sort((a, b) => {
                      const progressA = (a.current / a.target) * 100;
                      const progressB = (b.current / b.target) * 100;
                      return progressB - progressA;
                    });
                    setGoals(sorted);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Sort by Progress
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    // Export goals to CSV
                    const csvContent = [
                      ['Goal Name', 'Type', 'Current Amount', 'Target Amount', 'Monthly Contribution', 'Deadline', 'Status', 'Progress (%)'],
                      ...goals.map(goal => {
                        const { progressPercent } = calculateGoalProgress(goal);
                        const status = getGoalStatus(goal).status;
                        return [
                          goal.name,
                          goal.type,
                          goal.current.toFixed(2),
                          goal.target.toFixed(2),
                          goal.monthlyContribution.toFixed(2),
                          goal.deadline,
                          status,
                          progressPercent.toFixed(2)
                        ];
                      })
                    ].map(row => row.join(',')).join('\n');

                    // Create and download the CSV file
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `financial-goals-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ArrowUp className="w-4 h-4 mr-2 rotate-90" />
                  Export Goals
                </button>
              </div>
            )}
          </div>
          
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Goals</h3>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
          <div className="text-sm text-gray-600">Goals in progress</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Progress</h3>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(overallProgress)}
          </div>
          <div className="text-sm text-gray-600">Across all goals</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Saved</h3>
            <PiggyBank className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCurrentAmount)}
          </div>
          <div className="text-sm text-gray-600">Current progress</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
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
              <span className="text-sm text-gray-600">Completed Goals</span>
              <span className="text-sm font-medium text-green-600">{completedGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">
                {goals.length > 0 ? formatPercentage((completedGoals.length / goals.length) * 100) : '0%'}
              </span>
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
            const StatusIcon = goalStatus.icon;
            const isCompleted = goal.current >= goal.target;
            const isExpanded = expandedGoals.has(goal.id);

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className={`h-32 flex items-center text-white relative overflow-hidden ${
                    goal.type === 'debt' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                    }}></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 px-6 py-5 w-full">
                    <div className="flex items-center justify-between">
                      {/* Left side - Emoji, Title and Amount */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <span className="text-2xl">{goal.emoji}</span>
                        </div>
                        
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {goal.name}
                          </h2>
                          <p className="text-2xl font-bold text-white mt-1">
                            {formatCurrency(goal.current)}
                            <span className="text-sm font-normal text-white/80 ml-2">
                              of {formatCurrency(goal.target)} goal
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Right side - Progress and Status */}
                      <div className="flex items-center space-x-6">
                        {/* Progress */}
                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <div className="w-32">
                              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500 bg-white"
                                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-white whitespace-nowrap">
                              {formatPercentage(progressPercent)} complete
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          isCompleted ? 'bg-white/20 text-white' : 
                          goalStatus.status === 'on-track' ? 'bg-blue-400/20 text-blue-100' : 
                          'bg-red-400/20 text-red-100'
                        }`}>
                          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                          {goalStatus.status.replace('-', ' ').toUpperCase()}
                        </div>
                        
                        {/* Options button */}
                        <button 
                          className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                          onClick={() => {
                            setSelectedGoalForEmoji(goal);
                            setShowEmojiPicker(true);
                          }}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleGoalExpansion(goal.id)}
                    className="flex items-center justify-between w-full mb-4 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Collapsible Details Section */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-200">
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
                            <span className="font-medium">{getEstimatedCompletion(goal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>On Track</span>
                            <span className={`font-medium ${
                              isCompleted ? 'text-green-600' : 
                              goalStatus.status === 'on-track' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isCompleted ? 'Complete!' : goalStatus.status === 'on-track' ? 'Yes' : 'Behind'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Required Monthly</span>
                            <span className="font-medium">
                              {isCompleted ? '$0.00' : formatCurrency(goal.monthlyContribution)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Progress</span>
                            <span className="font-medium">
                              {isCompleted ? '$0.00' : formatCurrency(goal.monthlyContribution * 12)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                        <div className="space-y-2">
                          {!isCompleted && (
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
                          )}
                          {isCompleted && (
                            <div className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Goal Completed!
                            </div>
                          )}
                          <button 
                            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Goal
                          </button>
                          <button 
                            className="w-full text-red-500 hover:text-red-700 py-2 px-4 text-sm flex items-center justify-center"
                            onClick={() => handleDeleteGoal(goal)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Goal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions - Always Visible */}
                  {!isExpanded && (
                    <div className="flex justify-center -mt-1">
                      <span className="text-xs text-gray-400">Click "Show Details" to view actions</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
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
                    {onTrackGoals.length + completedGoals.length} out of {goals.length} goals are on track or completed
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                onClick={handleUpdateProgress}
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker Modal */}
      {showEmojiPicker && selectedGoalForEmoji && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Choose an Icon</h3>
              <button 
                onClick={() => {
                  setShowEmojiPicker(false);
                  setSelectedGoalForEmoji(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select an emoji to represent your "{selectedGoalForEmoji.name}" goal
            </p>
            
            <div className="grid grid-cols-6 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {popularEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-12 h-12 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center text-2xl transition-all hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Tip: Choose an emoji that motivates you to reach your goal!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && goalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Goal?</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete "{goalToDelete.name}"?
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All progress for this goal will be permanently removed.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setGoalToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;