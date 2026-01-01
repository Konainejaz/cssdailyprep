import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { ViewState } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface RegisterProps {
  onNavigate: (view: ViewState) => void;
  onBack?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate, onBack }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, fullName);

      if (signUpError) throw signUpError;
      try {
        localStorage.setItem('cssprep:post_auth_redirect_view', 'PRICING');
      } catch {}
      toast.success('Account created successfully!');
      onNavigate('AUTH_LOGIN');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your preparation journey today"
      onBack={onBack}
      backLabel="Back"
    >
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="space-y-5">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
          >
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-pakGreen-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pakGreen-500/20 focus:border-pakGreen-500 transition-all duration-200 sm:text-sm"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
            </div>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-pakGreen-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pakGreen-500/20 focus:border-pakGreen-500 transition-all duration-200 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-pakGreen-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pakGreen-500/20 focus:border-pakGreen-500 transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
          >
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-pakGreen-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pakGreen-500/20 focus:border-pakGreen-500 transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
          </motion.div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-pakGreen-600 hover:bg-pakGreen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pakGreen-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                </span>
            ) : 'Sign up'}
          </button>
        </motion.div>
      </form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm"
      >
        <div className="flex flex-col items-center gap-3">
          <div>
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={() => onNavigate('AUTH_LOGIN')}
              className="font-bold text-pakGreen-600 hover:text-pakGreen-700 transition-colors"
            >
              Sign in
            </button>
          </div>
          <button
            onClick={() => onNavigate('PRICING')}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            View pricing
          </button>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
