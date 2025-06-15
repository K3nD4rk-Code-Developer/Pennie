import React from 'react';
import { X } from 'lucide-react';
import type { GoalSetupModalProps } from '../types';
import { GOAL_TYPES } from '../utils/constants';

const GoalSetupModal: React.FC<GoalSetupModalProps> = ({ 
  showGoalSetup, 
  setShowGoalSetup, 
  newGoal, 
  setNewGoal, 
  editingGoal, 
  setEditingGoal, 
  handleAddGoal 
}) => {
  if (!showGoalSetup) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddGoal();
    setShowGoalSetup(false);
    setEditingGoal(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingGoal ? 'Edit Goal' : 'Create Financial Goal'}
          </h3>
          <button 
            onClick={() => {
              setShowGoalSetup(false);
              setEditingGoal(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              placeholder="e.g., Emergency Fund"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <input 
              type="number" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.target}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              placeholder="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.current}
              onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
            <select 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.type}
              onChange={(e) => setNewGoal({...newGoal, type: e.target.value as any})}
            >
              {GOAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.monthlyContribution}
              onChange={(e) => setNewGoal({...newGoal, monthlyContribution: e.target.value})}
              placeholder="500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => {
                setShowGoalSetup(false);
                setEditingGoal(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalSetupModal;