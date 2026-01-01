import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, onBack, backLabel }) => {
  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Panel - Decorative / Branding (Hidden on mobile, visible on lg) */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative bg-pakGreen-900 text-white flex-col justify-between p-12 overflow-hidden"
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-pakGreen-900 to-pakGreen-800 z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-pakGreen-500 blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-pakGreen-400 blur-3xl opacity-20" />
        
        {/* Geometric Shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L 100 0 L 100 100 Z" fill="currentColor" />
            </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-wider">CSS Prep</span>
           </div>
        </div>

        <div className="relative z-10 mb-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-bold mb-6 leading-tight"
          >
            Master Your <br/>
            <span className="text-pakGreen-300">CSS Exams</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-pakGreen-100 text-lg max-w-md leading-relaxed"
          >
            Join thousands of aspirants preparing smarter with our comprehensive study tools, past papers, and expert resources.
          </motion.p>
        </div>

        <div className="relative z-10 text-sm text-pakGreen-300/80">
           © {new Date().getFullYear()} CSS Daily Prep. All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {onBack && (
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="absolute top-6 left-6 lg:top-12 lg:left-12 inline-flex items-center gap-2 text-gray-500 hover:text-pakGreen-600 transition-colors z-20 group"
            >
                <div className="p-2 rounded-full group-hover:bg-pakGreen-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </div>
                <span className="text-sm font-medium">{backLabel || 'Back'}</span>
            </motion.button>
        )}

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full max-w-md space-y-8"
        >
            <div className="text-center lg:text-left">
                <div className="lg:hidden flex justify-center mb-6">
                    <div className="h-12 w-12 bg-pakGreen-100 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-pakGreen-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                <p className="mt-2 text-gray-500 text-lg">{subtitle}</p>
            </div>
            
            {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
