import React, { useState } from 'react';
import { Menu, X, Bell, Settings } from 'lucide-react';
import type { TabId, SidebarItem } from '../types';

interface MobileHeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  sidebarItems: SidebarItem[];
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  sidebarItems 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeItem = sidebarItems.find(item => item.id === activeTab);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 touch-target"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/KvdVmZMG/balanceversion5-3-01white.png" 
                alt="Pennie" 
                className="w-8 h-8" 
              />
              <h1 className="font-semibold text-gray-900">
                {activeItem?.label || 'Pennie'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 touch-target">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 touch-target">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsMenuOpen(false)} />
          
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            {/* Menu Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://i.postimg.cc/KvdVmZMG/balanceversion5-3-01white.png" 
                    alt="Pennie" 
                    className="w-10 h-10" 
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">Pennie</h2>
                    <p className="text-sm text-gray-500">Every cent counts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 touch-target"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left touch-target ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;