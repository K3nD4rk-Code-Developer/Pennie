import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  DollarSign, 
  RefreshCw, 
  Plus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  Target,
  Calendar,
  Info,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { Investment, PageProps } from '../types';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment?: Investment;
  onSave: (investment: Partial<Investment>) => void;
  isEditing?: boolean;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, investment, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    symbol: investment?.symbol || '',
    shares: investment?.shares?.toString() || '',
    currentPrice: investment?.currentPrice?.toString() || '',
    sector: investment?.sector || 'Technology'
  });

  const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Real Estate', 'Utilities'];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.symbol || !formData.shares || !formData.currentPrice) return;
    
    const shares = parseInt(formData.shares);
    const currentPrice = parseFloat(formData.currentPrice);
    
    onSave({
      symbol: formData.symbol.toUpperCase(),
      shares,
      currentPrice,
      totalValue: shares * currentPrice,
      change: 0,
      changePercent: 0,
      sector: formData.sector
    });
    onClose();
    setFormData({ symbol: '', shares: '', currentPrice: '', sector: 'Technology' });
  };

  const handleClose = () => {
    onClose();
    setFormData({ symbol: '', shares: '', currentPrice: '', sector: 'Technology' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Investment' : 'Add Investment'}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              required
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="e.g., AAPL, MSFT, GOOGL"
              disabled={isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Shares
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price per Share
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              {isEditing ? 'Update' : 'Add Investment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Investments: React.FC<PageProps> = ({
  investments,
  setInvestments
}) => {
  const [activeTab, setActiveTab] = useState('Portfolio');
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate totals
  const totals = useMemo(() => {
    if (!investments || investments.length === 0) {
      return { totalValue: 0, totalChange: 0, totalChangePercent: 0 };
    }
    
    const totalValue = investments.reduce((sum: number, inv: Investment) => sum + inv.totalValue, 0);
    const totalChange = investments.reduce((sum: number, inv: Investment) => sum + inv.change, 0);
    const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
    
    return { totalValue, totalChange, totalChangePercent };
  }, [investments]);

  const handleSaveInvestment = (investmentData: Partial<Investment>) => {
    if (editingInvestment) {
      const updatedInvestments = investments.map((inv: Investment) =>
        inv.symbol === editingInvestment.symbol
          ? { ...inv, ...investmentData }
          : inv
      );
      setInvestments(updatedInvestments);
    } else {
      const newInvestment: Investment = {
        symbol: investmentData.symbol!,
        shares: investmentData.shares!,
        currentPrice: investmentData.currentPrice!,
        totalValue: investmentData.totalValue!,
        change: 0,
        changePercent: 0,
        sector: investmentData.sector!
      };
      setInvestments([...investments, newInvestment]);
    }
    setEditingInvestment(undefined);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowModal(true);
  };

  const handleDeleteInvestment = (symbol: string) => {
    const filteredInvestments = investments.filter((inv: Investment) => inv.symbol !== symbol);
    setInvestments(filteredInvestments);
  };

  const updateInvestmentPrices = () => {
    if (!investments || investments.length === 0) return;
    
    // Simulate price updates with realistic changes
    const updatedInvestments = investments.map((inv: Investment) => {
      const changePercent = (Math.random() - 0.5) * 0.06; // Random change between -3% and +3%
      const newPrice = inv.currentPrice * (1 + changePercent);
      const change = (newPrice - inv.currentPrice) * inv.shares;
      
      return {
        ...inv,
        currentPrice: newPrice,
        totalValue: inv.shares * newPrice,
        change: change,
        changePercent: changePercent * 100
      };
    });
    setInvestments(updatedInvestments);
  };

  const getSectorAllocation = () => {
    if (!investments || investments.length === 0) return [];
    
    const sectorTotals = investments.reduce((acc: Record<string, number>, inv: Investment) => {
      acc[inv.sector] = (acc[inv.sector] || 0) + inv.totalValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorTotals).map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / totals.totalValue) * 100
    }));
  };

  const sectorAllocation = getSectorAllocation();

  const getBestPerformer = () => {
    if (!investments || investments.length === 0) return null;
    return investments.reduce((prev: Investment, current: Investment) => 
      (prev.changePercent > current.changePercent) ? prev : current
    );
  };

  const bestPerformer = getBestPerformer();

  const InvestmentCard = ({ investment }: { investment: Investment }) => {
    const sectorColors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-600',
      'Healthcare': 'bg-green-100 text-green-600', 
      'Finance': 'bg-purple-100 text-purple-600',
      'Energy': 'bg-yellow-100 text-yellow-600',
      'Consumer': 'bg-pink-100 text-pink-600',
      'Industrial': 'bg-gray-100 text-gray-600',
      'Real Estate': 'bg-indigo-100 text-indigo-600',
      'Utilities': 'bg-teal-100 text-teal-600'
    };

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="font-bold text-orange-600 text-sm">{investment.symbol}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{investment.symbol}</h3>
              <p className={`text-xs px-2 py-1 rounded-full ${sectorColors[investment.sector] || 'bg-gray-100 text-gray-600'}`}>
                {investment.sector}
              </p>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditInvestment(investment)}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteInvestment(investment.symbol)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shares</span>
            <span className="font-semibold">{investment.shares.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per Share</span>
            <span className="font-semibold">{formatCurrency(investment.currentPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value</span>
            <span className="font-bold text-lg">{formatCurrency(investment.totalValue)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Gain/Loss</span>
            <div className={`text-sm font-medium flex items-center ${
              investment.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {investment.changePercent >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {investment.changePercent >= 0 ? '+' : ''}{formatCurrency(investment.change)} ({formatPercentage(Math.abs(investment.changePercent))})
            </div>
          </div>

          <div className="text-xs text-gray-500">
            {formatPercentage((investment.totalValue / totals.totalValue) * 100)} of portfolio
          </div>
        </div>
      </div>
    );
  };

  // Show empty state if no investments
  if (!investments || investments.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
        <div className="h-full max-w-full mx-auto flex flex-col">
          <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Investment</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center mx-6 mb-6 overflow-hidden">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Investment Journey</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Build and track your investment portfolio. Add stocks, monitor performance, and achieve your financial goals.
            </p>
            
            {/* Suggested Investments */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 px-4">
              {[
                { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 150 },
                { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', price: 280 },
                { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology', price: 120 },
                { symbol: 'TSLA', name: 'Tesla', sector: 'Automotive', price: 200 }
              ].map(stock => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    handleSaveInvestment({
                      symbol: stock.symbol,
                      shares: 10,
                      currentPrice: stock.price,
                      totalValue: 10 * stock.price,
                      sector: stock.sector
                    });
                  }}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="font-bold text-orange-600 text-xs">{stock.symbol}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{stock.symbol}</div>
                  <div className="text-xs text-gray-500">{formatCurrency(stock.price)}</div>
                </button>
              ))}
            </div>

            <button 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              onClick={() => setShowModal(true)}
            >
              Add Your First Investment
            </button>
          </div>

          {/* Modal */}
          <InvestmentModal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingInvestment(undefined); }}
            investment={editingInvestment}
            onSave={handleSaveInvestment}
            isEditing={!!editingInvestment}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-0 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
              <p className="text-gray-600">Track your investments and grow your wealth</p>
            </div>
            <div className="flex space-x-2">
              {['Portfolio', 'Holdings', 'Performance', 'Analysis'].map(tab => (
                <button 
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                }`}
              >
                <BarChart className="w-4 h-4" />
              </button>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-800 flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors"
              onClick={updateInvestmentPrices}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <div className="flex items-center text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">June 2025</span>
            </div>
            <button
              onClick={() => { setEditingInvestment(undefined); setShowModal(true); }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Investment</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalValue)}</p>
                <p className="text-sm text-gray-500">Portfolio value</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totals.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.totalChangePercent >= 0 ? '+' : ''}{formatCurrency(totals.totalChange)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(Math.abs(totals.totalChangePercent))} {totals.totalChangePercent >= 0 ? 'gain' : 'loss'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                totals.totalChangePercent >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {totals.totalChangePercent >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
                <p className="text-sm text-gray-500">Investments</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Diversification</p>
                <p className="text-2xl font-bold text-gray-900">{sectorAllocation.length}</p>
                <p className="text-sm text-gray-500">Sectors</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 mb-4 min-h-0">
          {/* Holdings */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Holdings</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>June 2025</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
                {investments.map((investment) => (
                  <InvestmentCard key={investment.symbol} investment={investment} />
                ))}
              </div>
            </div>
          </div>

          {/* Sector Allocation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Sector Allocation</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {sectorAllocation.length > 0 ? (
                <div className="space-y-4">
                  {sectorAllocation.map((sector, idx) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: `hsl(${idx * 60}, 70%, 50%)` }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{sector.sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(sector.value)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(sector.percentage)}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Portfolio Balance */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Portfolio Balance</span>
                      <Target className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Most Weighted:</span>
                        <span className="font-medium">{sectorAllocation[0]?.sector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Allocation:</span>
                        <span className="font-medium">{formatPercentage(sectorAllocation[0]?.percentage || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No allocation data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investment Insights */}
        {bestPerformer && (
          <div className="flex-shrink-0 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 mx-6 mb-6">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Investment Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="text-orange-800">
                  <span className="font-semibold">Portfolio Diversification:</span> You have investments across {sectorAllocation.length} sectors
                </p>
                <p className="text-orange-800">
                  <span className="font-semibold">Top Performer:</span> {bestPerformer.symbol} is {bestPerformer.changePercent >= 0 ? 'up' : 'down'} {formatPercentage(Math.abs(bestPerformer.changePercent))}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-orange-800">
                  <span className="font-semibold">Portfolio Value:</span> {formatCurrency(totals.totalValue)} total value
                </p>
                <p className="text-orange-800">
                  <span className="font-semibold">Recommendation:</span> {sectorAllocation.length < 3 ? 'Consider diversifying across more sectors' : 'Well diversified portfolio'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <InvestmentModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingInvestment(undefined); }}
          investment={editingInvestment}
          onSave={handleSaveInvestment}
          isEditing={!!editingInvestment}
        />
      </div>
    </div>
  );
};

export default Investments;