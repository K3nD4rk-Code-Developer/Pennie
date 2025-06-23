import React, { useEffect } from 'react';
import { X, Menu, Sun, Moon, Book, MessageSquare, Bell, Settings, LogOut } from 'lucide-react';
import type { TabId, SidebarItem } from '../types';

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

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  sidebarItems: SidebarItem[];
  user: User;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setShowTour: (show: boolean) => void;
  handleLogout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  sidebarItems,
  user,
  darkMode,
  setDarkMode,
  setShowTour,
  handleLogout
}) => {
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.mobile-sidebar')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, setIsOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Mobile Header - NO LOGO */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 touch-target mobile-menu-toggle"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            {/* REMOVED LOGO FROM HERE */}
            <h1 className="font-semibold text-gray-900 text-lg">
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Pennie'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 touch-target relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            </button>
            <button 
              className="p-2 touch-target"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isOpen ? 'active' : ''}`}>
        {/* Sidebar Header with Logo */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="https://i.postimg.cc/Df4mkhfj/balanceversion5-3-01.png" 
              alt="Pennie Logo" 
              className="w-32 h-auto" 
              onClick={() => {
                setActiveTab('dashboard');
                setIsOpen(false);
              }}
            />
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 touch-target hover:bg-gray-100 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 ml-2">Every cent counts</p>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const hasAlerts = item.id === 'credit'; // Add your alert logic here
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-6 py-4 text-left touch-target transition-colors ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className="font-medium text-base">{item.label}</span>
                {hasAlerts && (
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Bottom Section */}
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-4">
            <button 
              className="flex items-center w-full text-left touch-target text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => {
                setDarkMode(!darkMode);
                setIsOpen(false);
              }}
            >
              {darkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button 
              className="flex items-center w-full text-left touch-target text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => {
                setShowTour(true);
                setIsOpen(false);
              }}
            >
              <Book className="w-5 h-5 mr-3" />
              <span className="font-medium">App Tour</span>
            </button>
            <button className="flex items-center w-full text-left touch-target text-gray-600 hover:text-gray-900 transition-colors">
              <MessageSquare className="w-5 h-5 mr-3" />
              <span className="font-medium">Help & Support</span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center pt-4 border-t border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-800 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.plan} Plan</div>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 touch-target"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;