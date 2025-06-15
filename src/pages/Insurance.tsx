import React, { useState } from 'react';
import { Shield, DollarSign, FileText, Calendar, Car, Heart, User, Home as HomeIcon, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { PageProps } from '../types';

interface InsurancePolicy {
  id: number;
  type: 'Auto' | 'Health' | 'Life' | 'Renters' | 'Homeowners' | 'Disability';
  provider: string;
  premium: number;
  coverage: number;
  renewal: string;
  status: 'active' | 'inactive' | 'pending';
  policyNumber?: string;
  deductible?: number;
}

const Insurance: React.FC<PageProps> = () => {
  // In a real app, this would come from the app state/props
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([
    // Start with empty array - user needs to add policies
  ]);

  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    type: 'Auto' as const,
    provider: '',
    premium: '',
    coverage: '',
    renewal: '',
    policyNumber: '',
    deductible: ''
  });

  const handleAddPolicy = () => {
    if (!newPolicy.provider || !newPolicy.premium || !newPolicy.coverage) return;

    const policy: InsurancePolicy = {
      id: Date.now(),
      type: newPolicy.type,
      provider: newPolicy.provider,
      premium: parseFloat(newPolicy.premium),
      coverage: parseFloat(newPolicy.coverage),
      renewal: newPolicy.renewal,
      status: 'active',
      policyNumber: newPolicy.policyNumber,
      deductible: newPolicy.deductible ? parseFloat(newPolicy.deductible) : undefined
    };

    setInsurancePolicies([...insurancePolicies, policy]);
    setNewPolicy({
      type: 'Auto',
      provider: '',
      premium: '',
      coverage: '',
      renewal: '',
      policyNumber: '',
      deductible: ''
    });
    setShowAddPolicy(false);
  };

  // Calculate totals from actual policies
  const totalCoverage = insurancePolicies.reduce((sum, policy) => sum + policy.coverage, 0);
  const totalPremiums = insurancePolicies.reduce((sum, policy) => sum + policy.premium, 0);
  const activePolicies = insurancePolicies.filter(p => p.status === 'active').length;

  // Find next renewal
  const getNextRenewal = () => {
    if (insurancePolicies.length === 0) return 'No policies';
    
    const upcomingRenewals = insurancePolicies
      .filter(p => p.renewal)
      .map(p => ({ ...p, renewalDate: new Date(p.renewal) }))
      .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

    if (upcomingRenewals.length === 0) return 'No renewal dates set';
    
    const nextRenewal = upcomingRenewals[0];
    return formatDate(nextRenewal.renewal);
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'Auto':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'Health':
        return <Heart className="w-5 h-5 text-green-600" />;
      case 'Life':
        return <User className="w-5 h-5 text-purple-600" />;
      case 'Renters':
      case 'Homeowners':
        return <HomeIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Insurance Management</h1>
        <button 
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
          onClick={() => setShowAddPolicy(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </button>
      </div>

      {/* Insurance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Total Coverage</h3>
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {formatCurrency(totalCoverage)}
          </div>
          <p className="text-sm text-gray-600">Across all policies</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Annual Premiums</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {formatCurrency(totalPremiums)}
          </div>
          <p className="text-sm text-gray-600">Total yearly cost</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Policies</h3>
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {activePolicies}
          </div>
          <p className="text-sm text-gray-600">Currently covered</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Next Renewal</h3>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-orange-600 mb-2">
            {getNextRenewal()}
          </div>
          <p className="text-sm text-gray-600">Upcoming renewal</p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Policies</h3>
        
        {insurancePolicies.length > 0 ? (
          <div className="space-y-4">
            {insurancePolicies.map((policy) => (
              <div key={policy.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      policy.type === 'Auto' ? 'bg-blue-100' :
                      policy.type === 'Health' ? 'bg-green-100' :
                      policy.type === 'Life' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {getPolicyIcon(policy.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{policy.type} Insurance</h4>
                      <p className="text-sm text-gray-600">{policy.provider}</p>
                      {policy.renewal && (
                        <p className="text-xs text-gray-500">Renews: {formatDate(policy.renewal)}</p>
                      )}
                      {policy.policyNumber && (
                        <p className="text-xs text-gray-500">Policy: {policy.policyNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(policy.coverage)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(policy.premium)}/year
                    </div>
                    {policy.deductible && (
                      <div className="text-xs text-gray-500">
                        ${policy.deductible} deductible
                      </div>
                    )}
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      policy.status === 'active' ? 'bg-green-100 text-green-800' : 
                      policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Policies</h3>
            <p className="text-gray-600 mb-6">
              Add your insurance policies to track coverage, premiums, and renewal dates in one place.
            </p>
            
            {/* Suggested Policy Types */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
              {[
                { type: 'Auto', icon: Car, description: 'Vehicle coverage' },
                { type: 'Health', icon: Heart, description: 'Medical insurance' },
                { type: 'Life', icon: User, description: 'Life protection' },
                { type: 'Renters', icon: HomeIcon, description: 'Property coverage' }
              ].map(({ type, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => {
                    setNewPolicy({ ...newPolicy, type: type as any });
                    setShowAddPolicy(true);
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <Icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{type}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </button>
              ))}
            </div>

            <button 
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
              onClick={() => setShowAddPolicy(true)}
            >
              Add Your First Policy
            </button>
          </div>
        )}
      </div>

      {/* Insurance Tips */}
      {insurancePolicies.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Insurance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="mb-2">
                <strong>Total Annual Cost:</strong> You're spending {formatCurrency(totalPremiums)} per year on insurance premiums.
              </p>
              <p>
                <strong>Coverage Analysis:</strong> Review your policies annually to ensure adequate coverage as your life changes.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Money-Saving Tip:</strong> Consider bundling policies with the same provider for potential discounts.
              </p>
              <p>
                <strong>Renewal Reminder:</strong> Set calendar reminders 30 days before renewal dates to shop for better rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Insurance Policy</h3>
              <button 
                onClick={() => setShowAddPolicy(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.type}
                  onChange={(e) => setNewPolicy({...newPolicy, type: e.target.value as any})}
                >
                  <option value="Auto">Auto Insurance</option>
                  <option value="Health">Health Insurance</option>
                  <option value="Life">Life Insurance</option>
                  <option value="Renters">Renters Insurance</option>
                  <option value="Homeowners">Homeowners Insurance</option>
                  <option value="Disability">Disability Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.provider}
                  onChange={(e) => setNewPolicy({...newPolicy, provider: e.target.value})}
                  placeholder="e.g., State Farm, Geico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Premium</label>
                <input 
                  type="number" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.premium}
                  onChange={(e) => setNewPolicy({...newPolicy, premium: e.target.value})}
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount</label>
                <input 
                  type="number" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.coverage}
                  onChange={(e) => setNewPolicy({...newPolicy, coverage: e.target.value})}
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.renewal}
                  onChange={(e) => setNewPolicy({...newPolicy, renewal: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.policyNumber}
                  onChange={(e) => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                  placeholder="Policy number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductible (Optional)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPolicy.deductible}
                  onChange={(e) => setNewPolicy({...newPolicy, deductible: e.target.value})}
                  placeholder="500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowAddPolicy(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                onClick={handleAddPolicy}
              >
                Add Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;