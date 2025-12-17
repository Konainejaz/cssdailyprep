import React from 'react';
import { ViewState } from '../types';
import ProfileDropdown from './ProfileDropdown';
import { MenuIcon, SearchIcon, ChevronLeftIcon } from './Icons';

interface TopBarProps {
  onNavigate: (view: ViewState) => void;
  onMenuClick: () => void;
  title?: string;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  actionButton?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ 
  onNavigate, 
  onMenuClick, 
  title,
  onBack,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  actionButton
}) => {
  return (
    <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-2.5 flex items-center justify-between shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
            <MenuIcon className="w-6 h-6" />
        </button>

        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        <div className="flex flex-col min-w-0">
           {title && (
            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-serif tracking-tight truncate">
                {title}
            </h2>
           )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
        {onSearchChange && (
          <div className="hidden md:flex relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-pakGreen-500 transition-colors" />
            <input 
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Search...'}
              className="w-48 lg:w-64 bg-gray-100/50 border border-transparent focus:bg-white focus:border-pakGreen-200 focus:ring-2 focus:ring-pakGreen-100 rounded-full py-2 pl-9 pr-4 text-sm transition-all"
            />
          </div>
        )}

        {actionButton}
        
        <div className="h-6 w-px bg-gray-200 hidden md:block" />
        
        <ProfileDropdown onNavigate={onNavigate} />
      </div>

      {/* Mobile Search Bar (Expandable or separate row - simpler to just have it below if needed, but for now let's keep it compact) */}
      {/* If we strictly want it IN the top bar on mobile, we might need a search icon that expands. 
          For now, keeping it hidden on mobile to avoid clutter, or we can add a mobile search toggle later. 
          The user asked for "compact", so hiding full search input on mobile header is better. 
          Maybe we can add a search icon that toggles a search bar. */}
    </div>
  );
};

export default TopBar;
