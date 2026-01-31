
import React from 'react';
import { Task } from '../types';
import { Check, User, AlertCircle } from 'lucide-react';

interface DueProps {
  tasks: Task[];
  currentUser: string;
  onToggleTask: (id: string) => void;
  onToggleDue: (id: string) => void;
}

export const Due: React.FC<DueProps> = ({ tasks, currentUser, onToggleTask, onToggleDue }) => {
  // Show tasks that are marked as due by either user
  const dueTasks = tasks.filter(t => t.isDueA || t.isDueB);
  
  const haptic = (strength: number = 15) => {
    if ('vibrate' in navigator) navigator.vibrate(strength);
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-32 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3">
            <AlertCircle className="text-[#BA1A1A] dark:text-[#FFB4AB]" size={32} />
            <h1 className="text-3xl font-bold tracking-tight text-[#1D1B20] dark:text-[#E6E1E5]">Due</h1>
        </div>
        <p className="text-[#49454F] dark:text-[#CAC4D0]">Urgent tasks marked by you or your partner</p>
      </header>

      <div className="space-y-4">
        {dueTasks.length === 0 ? (
          <div className="text-center py-20 text-[#79747E] bg-white dark:bg-[#2B2930] rounded-[32px] border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-lg">Nothing is due!</p>
            <p className="text-sm">Tasks marked with the alert icon appear here.</p>
          </div>
        ) : (
          dueTasks.map((task) => {
            const isCompletedMe = currentUser === 'user_a' ? task.completedA : task.completedB;
            const isCompletedPartner = currentUser === 'user_a' ? task.completedB : task.completedA;
            const isDueMe = currentUser === 'user_a' ? task.isDueA : task.isDueB;
            const isDuePartner = currentUser === 'user_a' ? task.isDueB : task.isDueA;

            return (
              <div
                key={task.id}
                className={`
                  group flex items-center justify-between p-5 bg-white dark:bg-[#2B2930] rounded-[32px] transition-all duration-200 shadow-md border-l-8
                  ${isDueMe ? 'border-[#BA1A1A] dark:border-[#FFB4AB]' : 'border-gray-300 dark:border-gray-700'}
                  ${isCompletedMe ? 'opacity-70' : ''}
                `}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => { haptic(); onToggleTask(task.id); }}
                >
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                    ${isCompletedMe ? 'bg-[#6750A4] border-[#6750A4]' : 'border-[#49454F] dark:border-[#938F99]'}
                  `}>
                    {isCompletedMe && <Check size={20} className="text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xl font-medium transition-all ${isCompletedMe ? 'line-through text-[#938F99]' : 'text-[#1D1B20] dark:text-[#E6E1E5]'}`}>
                      {task.text}
                    </span>
                    <div className="flex gap-2 mt-1">
                        {isDueMe && <span className="text-[9px] px-1.5 py-0.5 bg-[#F9DEDC] text-[#410E0B] rounded-full font-bold">DUE FOR ME</span>}
                        {isDuePartner && <span className="text-[9px] px-1.5 py-0.5 bg-[#E7E0EC] text-[#49454F] rounded-full font-bold uppercase tracking-tighter">Due for Partner</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex flex-col items-center gap-1 transition-opacity ${isCompletedPartner ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-10 h-10 rounded-full border flex items-center justify-center relative ${isCompletedPartner ? 'bg-[#EADDFF] dark:bg-[#4F378B] border-transparent' : 'border-dashed border-gray-400'}`}>
                      <User size={18} className={isCompletedPartner ? 'text-[#21005D] dark:text-[#EADDFF]' : 'text-gray-400'} />
                      {isDuePartner && (
                            <div className="absolute -top-1 -right-1 bg-[#BA1A1A] rounded-full p-0.5 border border-white dark:border-gray-900">
                                <AlertCircle size={8} className="text-white" fill="currentColor" />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-[#49454F] dark:text-[#CAC4D0]">Partner</span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); haptic(10); onToggleDue(task.id); }}
                    className={`p-2 rounded-full ${isDueMe ? 'text-[#BA1A1A] bg-[#F9DEDC]' : 'text-[#49454F] hover:bg-gray-100'}`}
                  >
                    <AlertCircle size={20} fill={isDueMe ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {dueTasks.length > 0 && (
          <div className="p-6 bg-[#F9DEDC] dark:bg-[#410E0B] rounded-[32px] text-[#410E0B] dark:text-[#F9DEDC]">
             <p className="font-bold text-lg mb-1">Status Update</p>
             <p className="text-sm opacity-90">Partners mark tasks as "Due" to signal they need focus. One person's "Due" status is independent of the other's.</p>
          </div>
      )}
    </div>
  );
};
