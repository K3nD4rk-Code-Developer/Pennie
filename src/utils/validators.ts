export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date <= new Date();
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  // Basic validation for account number (should be digits and/or special chars)
  const accountRegex = /^[\d\*\-]+$/;
  return accountRegex.test(accountNumber) && accountNumber.length >= 4;
};