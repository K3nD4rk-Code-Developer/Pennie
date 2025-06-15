import React from 'react';
import { X, FileText, FileSpreadsheet } from 'lucide-react';
import type { ExportModalProps } from '../types';

const ExportModal: React.FC<ExportModalProps> = ({ 
  showExportModal, 
  setShowExportModal, 
  exportData 
}) => {
  if (!showExportModal) return null;

  const handleExport = () => {
    exportData('csv', 'This Month');
    setShowExportModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Export Report</h3>
          <button 
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="format" value="pdf" className="mr-2" defaultChecked />
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                PDF Report
              </label>
              <label className="flex items-center">
                <input type="radio" name="format" value="excel" className="mr-2" />
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel Spreadsheet
              </label>
              <label className="flex items-center">
                <input type="radio" name="format" value="csv" className="mr-2" />
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                CSV Data
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowExportModal(false)}
          >
            Cancel
          </button>
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            onClick={handleExport}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;