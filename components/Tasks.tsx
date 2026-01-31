
import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash2, CalendarX, User, AlertCircle } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  currentUser: string;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onToggleDue: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onResetTasks: () => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  currentUser,
  onAddTask,
  onToggleTask,
  onToggleDue,
  onDeleteTask,
  onResetTasks
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const haptic = (strength: number = 15) => {
    if ('vibrate' in navigator) navigator.vibrate(strength);
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-32 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1D1B20] dark:text-[#E6E1E5]">Shared Goals</h1>
          <p className="text-[#49454F] dark:text-[#CAC4D0]">Added for both of you</p>
        </div>
        <button 
          onClick={() => { haptic(30); onResetTasks(); }}
          className="p-3 bg-[#EADDFF] dark:bg-[#4F378B] rounded-2xl text-[#21005D] dark:text-[#EADDFF] shadow-sm active:scale-95 transition-transform"
          title="Reset daily tasks"
        >
          <CalendarX size={20} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a goal for both..."
          className="w-full bg-white dark:bg-[#2B2930] rounded-3xl px-6 py-4 shadow-sm border border-transparent focus:border-[#6750A4] focus:outline-none transition-all pr-14 text-lg"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#6750A4] text-white rounded-full shadow-md disabled:opacity-50 disabled:bg-gray-400"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-20 text-[#79747E]">
            <p className="text-lg">No tasks for today.</p>
            <p className="text-sm">Start by adding a goal above!</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompletedMe = currentUser === 'user_a' ? task.completedA : task.completedB;
            const isCompletedPartner = currentUser === 'user_a' ? task.completedB : task.completedA;
            const isDueMe = currentUser === 'user_a' ? task.isDueA : task.isDueB;
            const isDuePartner = currentUser === 'user_a' ? task.isDueB : task.isDueA;

            return (
              <div
                key={task.id}
                className={`
                  group flex items-center justify-between p-4 bg-white dark:bg-[#2B2930] rounded-3xl transition-all duration-200
                  ${isCompletedMe ? 'opacity-80 bg-opacity-50' : 'shadow-sm hover:shadow-md'}
                  ${isDueMe ? 'border-2 border-[#BA1A1A] dark:border-[#FFB4AB]' : 'border-2 border-transparent'}
                `}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => { haptic(); onToggleTask(task.id); }}
                >
                  <div className={`
                    w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors
                    ${isCompletedMe ? 'bg-[#6750A4] border-[#6750A4]' : 'border-[#49454F] dark:border-[#938F99]'}
                  `}>
                    {isCompletedMe && <Check size={18} className="text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-lg transition-all ${isCompletedMe ? 'line-through text-[#938F99]' : 'text-[#1D1B20] dark:text-[#E6E1E5]'}`}>
                      {task.text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); haptic(20); onToggleDue(task.id); }}
                    className={`p-2 rounded-xl transition-colors ${isDueMe ? 'bg-[#BA1A1A] text-white' : 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title={isDueMe ? "Remove my Due status" : "Mark as Due for me"}
                  >
                    <AlertCircle size={20} fill={isDueMe ? "currentColor" : "none"} />
                  </button>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`flex flex-col items-center justify-center transition-opacity ${isCompletedPartner ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center relative ${isCompletedPartner ? 'bg-[#EADDFF] dark:bg-[#4F378B] border-transparent' : 'border-dashed border-gray-400'}`}>
                        <User size={14} className={isCompletedPartner ? 'text-[#21005D] dark:text-[#EADDFF]' : 'text-gray-400'} />
                        {isDuePartner && (
                            <div className="absolute -top-1 -right-1 bg-[#BA1A1A] rounded-full p-0.5 border border-white dark:border-gray-900">
                                <AlertCircle size={8} className="text-white" fill="currentColor" />
                            </div>
                        )}
                        </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); haptic(5); onDeleteTask(task.id); }}
                    className="p-2 text-[#BA1A1A] dark:text-[#FFB4AB] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
