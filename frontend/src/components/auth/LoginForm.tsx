// src/components/auth/LoginForm.tsx
import { useState, useCallback } from 'react';
import { Mail, Lock, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// Create a simple Toast component inline
const Toast = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void;
}) => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className={`fixed top-4 left-1/2 z-50 max-w-md w-full mx-auto p-4 rounded-lg border shadow-lg ${styles[type]}`}
    >
      <div className="flex items-center space-x-3">
        <span>{icons[type]}</span>
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

// Validation schema
const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Only destructure what you actually use from useAuth
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Form submission started for email:', data.email);

      // Validate form data before sending
      if (!data.email || !data.password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Call login with proper error handling
      const result = await login(data.email, data.password);

      console.log('Login attempt completed. Success:', result?.success);

      // Handle successful login
      if (result && result.success) {
        showToast('Login successful! Welcome back.', 'success');
        reset();
        return;
      }

      // Handle login failure with specific error message
      const errorMessage = result?.message || 'Login failed. Please check your credentials and try again.';
      console.log('Login failed with message:', errorMessage);
      showToast(errorMessage, 'error');
      
      // Reset sensitive fields
      setValue('password', '');
      setValue('twoFactorCode', '');

    } catch (error) {
      console.error('Login form error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Provide more specific error messages based on error type
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Server error')) {
          errorMessage = 'Server is currently unavailable. Please try again in a few moments.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid request. Please check your input and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      showToast(errorMessage, 'error');
      
      // Reset sensitive fields
      setValue('password', '');
      setValue('twoFactorCode', '');
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Check if backend is reachable (optional diagnostic)
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        showToast('Server connection is working!', 'success');
      } else {
        showToast(`Server responded with status: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      showToast('Cannot connect to server. Please check if the server is running on port 5000.', 'error');
    }
  }, [showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-2">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <GraduationCap className="w-8 h-8 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white tracking-wide">EduConnect Login</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                onClick={() => showToast('Password reset feature coming soon!', 'info')}
              >
                Forgot password?
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold text-lg shadow hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) ? (
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="text-center space-y-2">
              <a href="/request-verification" className="block text-blue-600 hover:underline">
                Need an account? Request verification here
              </a>
              
              {/* Debug button - remove in production */}
              <button
                type="button"
                onClick={testConnection}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Test Server Connection
              </button>
            </div>
          </form>
          
          {/* Toast Notifications */}
          <AnimatePresence>
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}