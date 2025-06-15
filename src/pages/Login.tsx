import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield, TrendingUp, Target,
  AlertCircle, CheckCircle, User, Loader2, LogIn, UserPlus
} from 'lucide-react';

// Types
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

interface LoginFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  general?: string;
}

interface AuthState {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  sessionExpiry: number | null;
}

// Validation utilities
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const validatePassword = (password: string, isSignUp: boolean = false): string | null => {
  if (!password) return 'Password is required';
  if (isSignUp) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

// Mock database operations
const mockDatabase = {
  users: new Map<string, User>(),
  
  init() {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('pennie_users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        Object.entries(users).forEach(([email, user]) => {
          this.users.set(email, user as User);
        });
      } catch (error) {
        console.error('Error loading users from storage:', error);
      }
    }
  },
  
  save() {
    // Save users to localStorage
    const usersObject = Object.fromEntries(this.users);
    localStorage.setItem('pennie_users', JSON.stringify(usersObject));
  },
  
  async findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.users.get(email.toLowerCase()) || null);
      }, 500); // Simulate network delay
    });
  },
  
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = userData.email.toLowerCase();
        
        if (this.users.has(email)) {
          reject(new Error('An account with this email already exists'));
          return;
        }
        
        const user: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          name: userData.name,
          plan: 'Premium',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isVerified: false, // In a real app, this would require email verification
          preferences: {
            currency: 'USD',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: true
          }
        };
        
        this.users.set(email, user);
        this.save();
        resolve(user);
      }, 800);
    });
  },
  
  async authenticateUser(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.get(email.toLowerCase());
        
        if (!user) {
          reject(new Error('No account found with this email address'));
          return;
        }
        
        // In a real app, you'd hash and compare passwords
        // For demo purposes, we'll accept any password for existing users
        // except we'll simulate some authentication failures
        if (password === 'wrongpassword') {
          reject(new Error('Incorrect password'));
          return;
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.users.set(email.toLowerCase(), user);
        this.save();
        
        resolve(user);
      }, 600);
    });
  }
};

// Session management
const sessionManager = {
  setSession(user: User, rememberMe: boolean) {
    const expiryTime = rememberMe 
      ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      : Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const sessionData = {
      user,
      expiryTime,
      lastActivity: Date.now()
    };
    
    localStorage.setItem('pennie_session', JSON.stringify(sessionData));
    
    // Set up session refresh interval
    this.startSessionRefresh();
  },
  
  getSession(): { user: User; expiryTime: number } | null {
    try {
      const sessionData = localStorage.getItem('pennie_session');
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > parsed.expiryTime) {
        this.clearSession();
        return null;
      }
      
      // Update last activity
      parsed.lastActivity = Date.now();
      localStorage.setItem('pennie_session', JSON.stringify(parsed));
      
      return {
        user: parsed.user,
        expiryTime: parsed.expiryTime
      };
    } catch (error) {
      console.error('Error reading session:', error);
      this.clearSession();
      return null;
    }
  },
  
  clearSession() {
    localStorage.removeItem('pennie_session');
  },
  
  refreshSession() {
    const session = this.getSession();
    if (session) {
      // Extend session by updating last activity
      this.setSession(session.user, true);
    }
  },
  
  startSessionRefresh() {
    // Refresh session every 5 minutes
    setInterval(() => {
      this.refreshSession();
    }, 5 * 60 * 1000);
  }
};

// Rate limiting
const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  
  canAttempt(email: string): boolean {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record) return true;
    
    // Reset after 15 minutes
    if (now - record.lastAttempt > 15 * 60 * 1000) {
      this.attempts.delete(key);
      return true;
    }
    
    // Allow max 5 attempts per 15 minutes
    return record.count < 5;
  },
  
  recordAttempt(email: string) {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
    }
  },
  
  getRemainingTime(email: string): number {
    const record = this.attempts.get(email.toLowerCase());
    if (!record || record.count < 5) return 0;
    
    const resetTime = record.lastAttempt + (15 * 60 * 1000);
    return Math.max(0, resetTime - Date.now());
  }
};

// Export the professional login component
export const ProfessionalLogin: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    user: null,
    isAuthenticated: false,
    sessionExpiry: null
  });
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize on component mount
  useEffect(() => {
    mockDatabase.init();
    
    // Check for existing session
    const session = sessionManager.getSession();
    if (session) {
      setAuthState({
        isLoading: false,
        user: session.user,
        isAuthenticated: true,
        sessionExpiry: session.expiryTime
      });
      onLogin(session.user);
    }
  }, [onLogin]);

  // Form validation
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Password validation
    const passwordError = validatePassword(formData.password, isSignUp);
    if (passwordError) newErrors.password = passwordError;
    
    // Sign up specific validations
    if (isSignUp) {
      const nameError = validateName(formData.name || '');
      if (nameError) newErrors.name = nameError;
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Check rate limiting
    if (!rateLimiter.canAttempt(formData.email)) {
      const remainingTime = rateLimiter.getRemainingTime(formData.email);
      const minutes = Math.ceil(remainingTime / (60 * 1000));
      setErrors({
        general: `Too many failed attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const newUser = await mockDatabase.createUser({
          email: formData.email,
          password: formData.password,
          name: formData.name!
        });
        
        setShowSuccess(true);
        
        // Auto login after successful signup
        setTimeout(() => {
          sessionManager.setSession(newUser, formData.rememberMe);
          setAuthState({
            isLoading: false,
            user: newUser,
            isAuthenticated: true,
            sessionExpiry: Date.now() + (formData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
          });
          onLogin(newUser);
        }, 1500);
        
      } else {
        // Sign in flow
        const user = await mockDatabase.authenticateUser(formData.email, formData.password);
        
        sessionManager.setSession(user, formData.rememberMe);
        setAuthState({
          isLoading: false,
          user,
          isAuthenticated: true,
          sessionExpiry: Date.now() + (formData.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
        });
        
        onLogin(user);
      }
      
    } catch (error) {
      rateLimiter.recordAttempt(formData.email);
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Toggle between sign in and sign up
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      name: '',
      confirmPassword: '',
      password: '',
    }));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pennie!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. You'll be redirected to your dashboard in a moment.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              <span className="ml-2 text-sm text-gray-600">Setting up your account...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-60 h-20 rounded-2xl flex items-center justify-center mx-auto">
            <img 
              src="https://i.postimg.cc/SjbjW9BJ/Pennie-Logo-Trans-Final-Or.png" 
              alt="Pennie Logo" 
              className="w-60 h-30" 
            />
          </div>
          <p className="text-gray-600">Your personal finance companion</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start your journey to financial freedom' 
                : 'Sign in to your account to continue'
              }
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Name field (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required={isSignUp}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg font-semibold text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  required
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg font-semibold text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg font-semibold text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {isSignUp && (
                <div className="mt-2 text-xs text-gray-600">
                  Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
                </div>
              )}
            </div>

            {/* Confirm Password field (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required={isSignUp}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg font-semibold text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Remember Me / Terms (conditionally shown) */}
            <div className="flex items-center justify-between text-sm">
              {!isSignUp ? (
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  />
                  <span className="ml-2 text-gray-600">Remember me for 30 days</span>
                </label>
              ) : (
                <label className="flex items-start">
                  <input 
                    type="checkbox" 
                    required
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-0.5"
                  />
                  <span className="ml-2 text-gray-600">
                    I agree to the{' '}
                    <button type="button" className="text-orange-600 hover:text-orange-700 underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-orange-600 hover:text-orange-700 underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              )}
              
              {!isSignUp && (
                <button type="button" className="text-orange-600 hover:text-orange-700 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-800 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Toggle between sign in/up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                disabled={isSubmitting}
                className="ml-1 text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Demo info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Information</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• New users: Create an account with any email</li>
              <li>• Existing users: Use any password except "wrongpassword"</li>
              <li>• Rate limiting: Max 5 attempts per 15 minutes</li>
              <li>• Session expires in 24 hours (30 days if "Remember me")</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm mx-auto mb-2 flex items-center justify-center">
              <Shield className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Bank-level security</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm mx-auto mb-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Smart insights</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm mx-auto mb-2 flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Goal tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLogin;