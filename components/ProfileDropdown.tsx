import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';
import { 
  UserIcon, LogOutIcon, ShieldIcon, SettingsIcon, ChevronDownIcon 
} from './Icons';

interface ProfileDropdownProps {
  onNavigate: (view: ViewState) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onNavigate }) => {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (!profile) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pakGreen-500"
      >
        <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-bold text-gray-700">{profile.full_name || 'User'}</span>
            <span className="text-xs text-gray-500">{profile.role === 'admin' ? 'Administrator' : 'Aspirant'}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pakGreen-500 to-pakGreen-700 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-pakGreen-600 font-bold text-lg">
                        {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                    </span>
                )}
            </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden origin-top-right"
          >
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            </div>
            
            <div className="p-2 space-y-1">
                <button 
                    onClick={() => handleAction(() => onNavigate('PROFILE'))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    My Profile
                </button>
                
                {profile.role === 'admin' && (
                    <button 
                        onClick={() => handleAction(() => onNavigate('ADMIN_PANEL'))}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <ShieldIcon className="w-4 h-4 text-purple-500" />
                        Admin Panel
                    </button>
                )}
            </div>

            <div className="p-2 border-t border-gray-50">
                <button 
                    onClick={() => handleAction(signOut)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                    <LogOutIcon className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
