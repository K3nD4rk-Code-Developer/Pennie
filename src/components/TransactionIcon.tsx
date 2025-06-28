// components/TransactionIcon.tsx
import React, { useState } from 'react';
import { 
  Coffee, Car, ShoppingCart, Tv, Receipt, Heart, DollarSign, 
  FileText, MapPin, Scissors, Gift, Building, Calculator 
} from 'lucide-react';
import { getMerchantLogo } from '../utils/merchantCategorization';
import type { CategoryType } from '../types';

interface TransactionIconProps {
  merchant: string;
  category: CategoryType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({ 
  merchant, 
  category, 
  size = 'md',
  className = '' 
}) => {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  
  // Size mappings - made smaller and more compact
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8', 
    xl: 'w-10 h-10'
  };

  // Get merchant logo
  const merchantLogo = getMerchantLogo(merchant);
  
  // Category icon mapping
  const getCategoryIcon = (categoryName: CategoryType) => {
    const iconProps = iconSizes[size];
    const iconMap: Record<CategoryType, { icon: React.ReactNode; color: string }> = {
      'Food & Dining': { icon: <Coffee className={iconProps} />, color: 'text-orange-600' },
      'Auto & Transport': { icon: <Car className={iconProps} />, color: 'text-blue-600' },
      'Shopping': { icon: <ShoppingCart className={iconProps} />, color: 'text-purple-600' },
      'Entertainment': { icon: <Tv className={iconProps} />, color: 'text-pink-600' },
      'Bills & Utilities': { icon: <Receipt className={iconProps} />, color: 'text-gray-600' },
      'Healthcare': { icon: <Heart className={iconProps} />, color: 'text-red-600' },
      'Income': { icon: <DollarSign className={iconProps} />, color: 'text-green-600' },
      'Education': { icon: <FileText className={iconProps} />, color: 'text-indigo-600' },
      'Travel': { icon: <MapPin className={iconProps} />, color: 'text-teal-600' },
      'Personal Care': { icon: <Scissors className={iconProps} />, color: 'text-pink-500' },
      'Gifts & Donations': { icon: <Gift className={iconProps} />, color: 'text-purple-500' },
      'Business': { icon: <Building className={iconProps} />, color: 'text-slate-600' },
      'Taxes': { icon: <Calculator className={iconProps} />, color: 'text-amber-600' },
      'Other': { icon: <Receipt className={iconProps} />, color: 'text-gray-600' }
    };
    
    return iconMap[categoryName] || iconMap['Other'];
  };

  const categoryInfo = getCategoryIcon(category);
  
  // Show company logo if available and not errored
  if (merchantLogo && !logoError) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm`}>
        {logoLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
        )}
        <img 
          src={merchantLogo}
          alt={`${merchant} logo`}
          className={`${sizeClasses[size]} object-contain p-1.5`}
          onLoad={() => setLogoLoading(false)}
          onError={() => {
            setLogoError(true);
            setLogoLoading(false);
          }}
          style={{ display: logoLoading ? 'none' : 'block' }}
        />
      </div>
    );
  }
  
  // Fallback to category icon
  return (
    <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-xl flex items-center justify-center shadow-sm`}>
      <span className={categoryInfo.color}>
        {categoryInfo.icon}
      </span>
    </div>
  );
};

export default TransactionIcon;