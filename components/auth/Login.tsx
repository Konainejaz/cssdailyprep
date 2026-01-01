import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';
import { ViewState } from '../../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface LoginProps {
  onNavigate: (view: ViewState) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, onBack }) => {
  const { signIn, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getAuthErrorMessage = (err: any, fallback: string) => {
    const directMsg = typeof err?.msg === 'string' ? err.msg : '';
    const directMessage = typeof err?.message === 'string' ? err.message : '';
    const maybeJson = directMessage.trim().startsWith('{') ? directMessage : '';
    if (maybeJson) {
      try {
        const parsed = JSON.parse(maybeJson);
        if (typeof parsed?.msg === 'string') return parsed.msg;
        if (typeof parsed?.message === 'string') return parsed.message;
      } catch {}
    }
    return directMsg || directMessage || fallback;
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err, 'Failed to sign in'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
     try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err, 'Google sign in failed'));
    }
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your preparation"
      onBack={onBack}
      backLabel="Back"
    >
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-pakGreen-500">
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
            transition={{ delay: 0.3 }}
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
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between"
        >
          <div className="text-sm">
            <button
              type="button"
              onClick={() => onNavigate('AUTH_FORGOT')}
              className="font-medium text-pakGreen-600 hover:text-pakGreen-500 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                    Signing in...
                </span>
            ) : 'Sign in'}
          </button>
        </motion.div>
      </form>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full inline-flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
          >
             <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
             </svg>
             Google
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm"
      >
        <div className="flex flex-col items-center gap-3">
          <div>
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => onNavigate('AUTH_REGISTER')}
              className="font-bold text-pakGreen-600 hover:text-pakGreen-700 transition-colors"
            >
              Create an account
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

export default Login;
