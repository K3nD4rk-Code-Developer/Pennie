// utils/merchantCategorization.ts
import type { CategoryType } from '../types';

// Merchant mapping for automatic categorization
export const MERCHANT_CATEGORY_MAP: Record<string, CategoryType> = {
  // Food & Dining
  'KFC': 'Food & Dining',
  'MCDONALD\'S': 'Food & Dining',
  'MCDONALDS': 'Food & Dining',
  'BURGER KING': 'Food & Dining',
  'SUBWAY': 'Food & Dining',
  'TACO BELL': 'Food & Dining',
  'PIZZA HUT': 'Food & Dining',
  'DOMINOS': 'Food & Dining',
  'CHIPOTLE': 'Food & Dining',
  'STARBUCKS': 'Food & Dining',
  'DUNKIN': 'Food & Dining',
  'WENDY\'S': 'Food & Dining',
  'CHICK-FIL-A': 'Food & Dining',
  'PANDA EXPRESS': 'Food & Dining',
  'OLIVE GARDEN': 'Food & Dining',
  'APPLEBEES': 'Food & Dining',
  'RED LOBSTER': 'Food & Dining',
  'IHOP': 'Food & Dining',
  'DENNY\'S': 'Food & Dining',
  'CRACKER BARREL': 'Food & Dining',
  'PANERA': 'Food & Dining',
  'GRUBHUB': 'Food & Dining',
  'DOORDASH': 'Food & Dining',
  'UBER EATS': 'Food & Dining',
  'POSTMATES': 'Food & Dining',
  
  // Shopping
  'WALMART': 'Shopping',
  'TARGET': 'Shopping',
  'AMAZON': 'Shopping',
  'COSTCO': 'Shopping',
  'HOME DEPOT': 'Shopping',
  'LOWES': 'Shopping',
  'BEST BUY': 'Shopping',
  'KROGER': 'Shopping',
  'SAFEWAY': 'Shopping',
  'MACY\'S': 'Shopping',
  'NORDSTROM': 'Shopping',
  'KOHLS': 'Shopping',
  'JC PENNEY': 'Shopping',
  'CVS': 'Shopping',
  'WALGREENS': 'Shopping',
  'RITE AID': 'Shopping',
  
  // Auto & Transport
  'SHELL': 'Auto & Transport',
  'EXXON': 'Auto & Transport',
  'CHEVRON': 'Auto & Transport',
  'BP': 'Auto & Transport',
  'MOBIL': 'Auto & Transport',
  'TEXACO': 'Auto & Transport',
  'CITGO': 'Auto & Transport',
  'UBER': 'Auto & Transport',
  'LYFT': 'Auto & Transport',
  'JIFFY LUBE': 'Auto & Transport',
  'VALVOLINE': 'Auto & Transport',
  'AAA': 'Auto & Transport',
  'ENTERPRISE': 'Auto & Transport',
  'HERTZ': 'Auto & Transport',
  'BUDGET': 'Auto & Transport',
  
  // Bills & Utilities
  'VERIZON': 'Bills & Utilities',
  'AT&T': 'Bills & Utilities',
  'T-MOBILE': 'Bills & Utilities',
  'SPRINT': 'Bills & Utilities',
  'COMCAST': 'Bills & Utilities',
  'SPECTRUM': 'Bills & Utilities',
  'XFINITY': 'Bills & Utilities',
  'COX': 'Bills & Utilities',
  'DIRECTV': 'Bills & Utilities',
  'DISH': 'Bills & Utilities',
  'NETFLIX': 'Bills & Utilities',
  'HULU': 'Bills & Utilities',
  'DISNEY+': 'Bills & Utilities',
  
  // Entertainment
  'REGAL': 'Entertainment',
  'AMC': 'Entertainment',
  'CINEMARK': 'Entertainment',
  'SPOTIFY': 'Entertainment',
  'APPLE MUSIC': 'Entertainment',
  'STEAM': 'Entertainment',
  'PLAYSTATION': 'Entertainment',
  'XBOX': 'Entertainment',
  'NINTENDO': 'Entertainment',
  
  // Healthcare
  'CVS PHARMACY': 'Healthcare',
  'WALGREENS PHARMACY': 'Healthcare',
  'KAISER': 'Healthcare',
  'BLUE CROSS': 'Healthcare',
  'AETNA': 'Healthcare',
  'HUMANA': 'Healthcare',
  'CIGNA': 'Healthcare',
  'UNITED HEALTHCARE': 'Healthcare',
  
  // Travel
  'DELTA': 'Travel',
  'AMERICAN AIRLINES': 'Travel',
  'UNITED': 'Travel',
  'UNITED AIRLINES': 'Travel',
  'SOUTHWEST': 'Travel',
  'JETBLUE': 'Travel',
  'MARRIOTT': 'Travel',
  'HILTON': 'Travel',
  'HYATT': 'Travel',
  'HOLIDAY INN': 'Travel',
  'EXPEDIA': 'Travel',
  'BOOKING.COM': 'Travel',
  'AIRBNB': 'Travel',
  
  // Shopping & Retail
  'MADISON BICYCLE SHOP': 'Shopping',
  'BICYCLE SHOP': 'Shopping',
  'BIKE SHOP': 'Shopping',
  
  // Entertainment & Recreation
  'TOUCHSTONE CLIMBING': 'Entertainment',
  'CLIMBING': 'Entertainment',
  'GYM': 'Entertainment',
  'FITNESS': 'Entertainment',
  'FUN': 'Entertainment',
  
  // Business & Work
  'TECTRA INC': 'Business',
  'TECTRA': 'Business',
  'GUSTO PAY': 'Income',
  'PAYROLL': 'Income',
  'SALARY': 'Income',
  
  // Banking & Financial
  'AUTOMATIC PAYMENT': 'Bills & Utilities',
  'ACH ELECTRONIC': 'Bills & Utilities',
  'CREDIT CARD PAYMENT': 'Bills & Utilities',
  'INTRST PYMNT': 'Income',
  'INTEREST PAYMENT': 'Income',
  'CD DEPOSIT': 'Income',
  'DEPOSIT': 'Income',
};

// Company logos mapping (using public CDN or data URLs)
export const MERCHANT_LOGO_MAP: Record<string, string> = {
  // Food & Dining
  'KFC': 'https://logo.clearbit.com/kfc.com',
  'MCDONALD\'S': 'https://logo.clearbit.com/mcdonalds.com',
  'MCDONALDS': 'https://logo.clearbit.com/mcdonalds.com',
  'BURGER KING': 'https://logo.clearbit.com/bk.com',
  'SUBWAY': 'https://logo.clearbit.com/subway.com',
  'TACO BELL': 'https://logo.clearbit.com/tacobell.com',
  'STARBUCKS': 'https://logo.clearbit.com/starbucks.com',
  
  // Transport & Travel
  'UBER': 'https://logo.clearbit.com/uber.com',
  'LYFT': 'https://logo.clearbit.com/lyft.com',
  'UNITED AIRLINES': 'https://logo.clearbit.com/united.com',
  'UNITED': 'https://logo.clearbit.com/united.com',
  'AMERICAN AIRLINES': 'https://logo.clearbit.com/aa.com',
  'DELTA': 'https://logo.clearbit.com/delta.com',
  'SOUTHWEST': 'https://logo.clearbit.com/southwest.com',
  
  // Shopping & Retail
  'WALMART': 'https://logos-world.net/wp-content/uploads/2020/04/Walmart-Logo.png',
  'TARGET': 'https://logos-world.net/wp-content/uploads/2020/04/Target-Logo.png',
  'AMAZON': 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png',
  'COSTCO': 'https://logos-world.net/wp-content/uploads/2020/04/Costco-Logo.png',
  'HOME DEPOT': 'https://logos-world.net/wp-content/uploads/2020/04/Home-Depot-Logo.png',
  'BEST BUY': 'https://logos-world.net/wp-content/uploads/2020/04/Best-Buy-Logo.png',
  
  // Generic category icons for shops without specific logos
  'MADISON BICYCLE SHOP': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyQzIxIDEzLjEgMjAuMSAxNSAxOSAxNUMxNy45IDE1IDE3IDEzLjEgMTcgMTJIMTZWMTBIMTdDMTcgOC45IDE3LjkgNyAxOSA3QzIwLjEgNyAyMSA4LjkgMjEgMTBWMTJaIiBmaWxsPSIjNjM2NjcwIi8+CjxwYXRoIGQ9Ik03IDEyQzcgMTMuMSA2LjEgMTUgNSAxNUM4IDEzIDUgMTUgNSAxMkg0VjEwSDVDNSA4LjkgNS45IDcgNyA3QzguMSA3IDkgOC45IDkgMTBWMTJaIiBmaWxsPSIjNjM2NjcwIi8+CjxwYXRoIGQ9Ik0xNiAxMEg4VjEySDEyVjE4SDEyVjEySDEyVjEwWiIgZmlsbD0iIzYzNjY3MCIvPgo8L3N2Zz4K',
  'BICYCLE SHOP': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyQzIxIDEzLjEgMjAuMSAxNSAxOSAxNUMxNy45IDE1IDE3IDEzLjEgMTcgMTJIMTZWMTBIMTdDMTcgOC45IDE3LjkgNyAxOSA3QzIwLjEgNyAyMSA4LjkgMjEgMTBWMTJaIiBmaWxsPSIjNjM2NjcwIi8+CjxwYXRoIGQ9Ik03IDEyQzcgMTMuMSA2LjEgMTUgNSAxNUM4IDEzIDUgMTUgNSAxMkg0VjEwSDVDNSA4LjkgNS45IDcgNyA3QzguMSA3IDkgOC45IDkgMTBWMTJaIiBmaWxsPSIjNjM2NjcwIi8+CjxwYXRoIGQ9Ik0xNiAxMEg4VjEySDEyVjE4SDEyVjEySDEyVjEwWiIgZmlsbD0iIzYzNjY3MCIvPgo8L3N2Zz4K',
  
  // Business logos
  'TECTRA INC': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPg==',
  'TECTRA': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPg==',
  
  // Entertainment & Recreation
  'TOUCHSTONE CLIMBING': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUgMTJMMTAgN0wxNSAxMkwxMCAxN0w1IDEyWiIgZmlsbD0iIzMzNzNkYyIvPgo8L3N2Zz4K',
  
  // Add more as needed
};

/**
 * Automatically categorizes a transaction based on merchant name
 */
export function categorizeTransaction(merchantName: string): CategoryType {
  if (!merchantName) return 'Other';
  
  // Clean the merchant name for better matching
  const cleanMerchant = merchantName.toUpperCase().trim();
  
  // Direct match
  if (MERCHANT_CATEGORY_MAP[cleanMerchant]) {
    return MERCHANT_CATEGORY_MAP[cleanMerchant];
  }
  
  // Fuzzy matching for partial matches
  for (const [merchant, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (cleanMerchant.includes(merchant) || merchant.includes(cleanMerchant)) {
      return category;
    }
  }
  
  // Keyword-based categorization as fallback
  return categorizeByKeywords(cleanMerchant);
}

/**
 * Fallback categorization based on keywords
 */
function categorizeByKeywords(merchantName: string): CategoryType {
  const merchant = merchantName.toLowerCase();
  
  // Banking & Financial keywords (check first for bank transactions)
  if (merchant.includes('payment') || merchant.includes('ach electronic') ||
      merchant.includes('credit card') || merchant.includes('automatic') ||
      merchant.includes('transfer') || merchant.includes('fee') ||
      merchant.includes('thank') || merchant.includes('pymnt')) {
    return 'Bills & Utilities';
  }
  
  // Income keywords
  if (merchant.includes('deposit') || merchant.includes('interest') ||
      merchant.includes('intrst') || merchant.includes('payroll') ||
      merchant.includes('salary') || merchant.includes('gusto') ||
      merchant.includes('direct deposit') || merchant.includes('refund')) {
    return 'Income';
  }
  
  // Food & Dining keywords
  if (merchant.includes('restaurant') || merchant.includes('cafe') || 
      merchant.includes('coffee') || merchant.includes('pizza') ||
      merchant.includes('burger') || merchant.includes('food') ||
      merchant.includes('diner') || merchant.includes('bakery') ||
      merchant.includes('bar') || merchant.includes('grill') ||
      merchant.includes('kitchen') || merchant.includes('bistro')) {
    return 'Food & Dining';
  }
  
  // Auto & Transport keywords
  if (merchant.includes('gas') || merchant.includes('fuel') ||
      merchant.includes('auto') || merchant.includes('car') ||
      merchant.includes('tire') || merchant.includes('mechanic') ||
      merchant.includes('parking') || merchant.includes('toll') ||
      merchant.includes('uber') || merchant.includes('lyft')) {
    return 'Auto & Transport';
  }
  
  // Shopping keywords
  if (merchant.includes('store') || merchant.includes('shop') ||
      merchant.includes('market') || merchant.includes('mall') ||
      merchant.includes('retail') || merchant.includes('department') ||
      merchant.includes('bicycle') || merchant.includes('bike')) {
    return 'Shopping';
  }
  
  // Entertainment & Recreation keywords
  if (merchant.includes('climbing') || merchant.includes('gym') ||
      merchant.includes('fitness') || merchant.includes('fun') ||
      merchant.includes('movie') || merchant.includes('theater') ||
      merchant.includes('entertainment') || merchant.includes('game') ||
      merchant.includes('music') || merchant.includes('streaming') ||
      merchant.includes('club') || merchant.includes('recreation')) {
    return 'Entertainment';
  }
  
  // Travel keywords
  if (merchant.includes('airline') || merchant.includes('flight') ||
      merchant.includes('hotel') || merchant.includes('motel') ||
      merchant.includes('travel') || merchant.includes('airport') ||
      merchant.includes('vacation') || merchant.includes('resort')) {
    return 'Travel';
  }
  
  // Bills & Utilities keywords
  if (merchant.includes('electric') || merchant.includes('gas company') ||
      merchant.includes('water') || merchant.includes('internet') ||
      merchant.includes('phone') || merchant.includes('cable') ||
      merchant.includes('utility') || merchant.includes('power')) {
    return 'Bills & Utilities';
  }
  
  // Healthcare keywords
  if (merchant.includes('medical') || merchant.includes('doctor') ||
      merchant.includes('hospital') || merchant.includes('pharmacy') ||
      merchant.includes('dental') || merchant.includes('clinic')) {
    return 'Healthcare';
  }
  
  // Business keywords
  if (merchant.includes('inc') || merchant.includes('llc') ||
      merchant.includes('corp') || merchant.includes('company') ||
      merchant.includes('business') || merchant.includes('consulting')) {
    return 'Business';
  }
  
  return 'Other';
}

/**
 * Gets company logo URL for a merchant
 */
export function getMerchantLogo(merchantName: string): string | null {
  if (!merchantName) return null;
  
  const cleanMerchant = merchantName.toUpperCase().trim();
  
  // Direct match
  if (MERCHANT_LOGO_MAP[cleanMerchant]) {
    return MERCHANT_LOGO_MAP[cleanMerchant];
  }
  
  // Fuzzy matching
  for (const [merchant, logo] of Object.entries(MERCHANT_LOGO_MAP)) {
    if (cleanMerchant.includes(merchant) || merchant.includes(cleanMerchant)) {
      return logo;
    }
  }
  
  return null;
}

/**
 * Enhanced function to update existing transactions with automatic categorization
 */
export function bulkCategorizeTransactions(transactions: any[]): any[] {
  return transactions.map(transaction => ({
    ...transaction,
    category: transaction.category === 'Other' ? 
      categorizeTransaction(transaction.merchant) : 
      transaction.category
  }));
}