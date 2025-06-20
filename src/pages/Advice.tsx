import React from 'react';
import { PiggyBank, TrendingUp, CreditCard, ExternalLink } from 'lucide-react';

const Advice: React.FC = () => {
  const articles = [
    { title: "5 Ways to Maximize Your 401(k) Contributions", category: "Retirement", readTime: "5 min read" },
    { title: "Emergency Fund: How Much Do You Really Need?", category: "Savings", readTime: "4 min read" },
    { title: "Tax-Advantaged Accounts: HSA vs 401(k) vs IRA", category: "Taxes", readTime: "8 min read" }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Advice</h1>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Get Personalized Advice
        </button>
      </div>

      {/* Featured Advice */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-800 rounded-lg p-6 text-white mb-8">
        <h2 className="text-xl font-bold mb-2">💡 Today's Featured Advice</h2>
        <p className="text-lg mb-4">
          Consider increasing your emergency fund to 6 months of expenses. You're currently at 3.2 months coverage.
        </p>
        <button className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-gray-100">
          Learn More
        </button>
      </div>

      {/* Advice Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <PiggyBank className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Saving Strategies</h3>
          <p className="text-gray-600 mb-4">Learn effective ways to boost your savings and reach your financial goals faster.</p>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            View Saving Tips →
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Basics</h3>
          <p className="text-gray-600 mb-4">Understand the fundamentals of investing and building long-term wealth.</p>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Learn Investing →
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Debt Management</h3>
          <p className="text-gray-600 mb-4">Strategies to pay off debt efficiently and improve your financial health.</p>
          <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Manage Debt →
          </button>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Financial Articles</h3>
        <div className="space-y-4">
          {articles.map((article, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">{article.title}</h4>
                <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Advice;