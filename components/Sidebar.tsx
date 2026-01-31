
import React from 'react';
import { User2, RefreshCw, X, ChevronRight, Info } from 'lucide-react';
import { AppTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
  onReset: () => void;
  activeTab: AppTab;
  currentUserLabel: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onReset, 
  activeTab,
  currentUserLabel 
}) => {
  const haptic = () => { if ('vibrate' in navigator) navigator.vibrate(10); };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 w-80 bg-[#F7F9FF] dark:bg-[#1A1C1E] z-[60] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-3xl flex flex-col`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6750A4] flex items-center justify-center text-white">
              <User2 size={24} />
            </div>
            <div>
              <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Active Role</p>
              <p className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">{currentUserLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          <button 
            onClick={() => { haptic(); onNavigate(AppTab.PROFILE); onClose(); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === AppTab.PROFILE ? 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[#49454F] dark:text-[#E6E1E5]'}`}
          >
            <div className="flex items-center gap-4">
              <User2 size={22} />
              <span className="font-medium">Profile Settings</span>
            </div>
            <ChevronRight size={18} />
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
          
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-[#938F99] mb-2">System</p>
          
          <button 
            onClick={() => { haptic(); onReset(); }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F9DEDC] dark:hover:bg-[#410E0B] text-[#BA1A1A] dark:text-[#FFB4AB] transition-all"
          >
            <RefreshCw size={22} />
            <span className="font-medium">Reset Day</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2B2930] rounded-br-3xl">
          <div className="flex items-center gap-3 text-[#79747E]">
            <Info size={16} />
            <p className="text-xs">
              Resetting moves incompleted tasks to your "Due" list and archives today's progress.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
