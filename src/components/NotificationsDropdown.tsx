import React from 'react';
import { X, Bell } from 'lucide-react';
import type { NotificationsDropdownProps } from '../types';
import { formatDate } from '../utils/formatters';

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ 
  showNotifications, 
  setShowNotifications, 
  alerts, 
  markNotificationRead, 
  deleteNotification 
}) => {
  if (!showNotifications) return null;

  return (
    <div className="fixed right-6 top-16 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Notifications</h3>
          <button 
            onClick={() => setShowNotifications(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {alerts.map(alert => (
          <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-yellow-500' :
                    alert.severity === 'positive' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(alert.date)}</p>
              </div>
              <button 
                onClick={() => deleteNotification(alert.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {alerts.length === 0 && (
        <div className="p-8 text-center">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;