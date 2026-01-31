
import React from 'react';
import { AppTab } from '../types';
import { ListTodo, Timer, LayoutDashboard, AlertCircle } from 'lucide-react';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab
}) => {
  const tabs = [
    { id: AppTab.TASKS, label: 'Tasks', icon: ListTodo },
    { id: AppTab.DUE, label: 'Due', icon: AlertCircle },
    { id: AppTab.TIMER, label: 'Timer', icon: Timer },
    { id: AppTab.PROGRESS, label: 'Progress', icon: LayoutDashboard },
  ];

  const hapticFeedback = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#F0F4F8] dark:bg-[#202124] border-t border-gray-200 dark:border-gray-800 px-2 pb-6 pt-3 flex justify-between items-center z-40 rounded-t-3xl shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              hapticFeedback();
              setActiveTab(tab.id);
            }}
            className="flex flex-col items-center gap-1 relative group flex-1"
          >
            <div className={`
              px-3 py-1 rounded-full transition-all duration-300
              ${isActive ? 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]' : 'text-[#444746] dark:text-[#C4C7C5]'}
            `}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-medium truncate max-w-full px-1 ${isActive ? 'text-[#041E49] dark:text-[#C2E7FF]' : 'text-[#444746] dark:text-[#C4C7C5]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
