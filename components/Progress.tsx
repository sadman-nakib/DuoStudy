
import React, { useState, useEffect } from 'react';
import { Task, UserStats, HistoryEntry } from '../types';
import { Clock, CheckCircle2, History as HistoryIcon, Calendar } from 'lucide-react';

interface ProgressProps {
  tasks: Task[];
  stats: Record<string, UserStats>;
  history: HistoryEntry[];
  currentUser: string;
  nameA: string;
  nameB: string;
}

export const Progress: React.FC<ProgressProps> = ({ tasks, stats, history, currentUser, nameA, nameB }) => {
  const [syncedTime, setSyncedTime] = useState<string>('');

  // Fetch Bangladesh Time on mount
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Dhaka');
        const data = await res.json();
        const bstDate = new Date(data.datetime);
        setSyncedTime(bstDate.toLocaleDateString('en-BD', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Dhaka'
        }));
      } catch (e) {
        setSyncedTime(new Date().toLocaleDateString('en-BD', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Dhaka'
        }));
      }
    };
    fetchTime();
  }, []);

  const users = [
    { id: 'user_a', name: nameA },
    { id: 'user_b', name: nameB }
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgressData = (uid: string, currentTasks: Task[], currentStats: Record<string, UserStats>) => {
    const completed = currentTasks.filter(t => uid === 'user_a' ? t.completedA : t.completedB).length;
    const total = currentTasks.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const time = currentStats[uid]?.totalStudyTime || 0;
    return { completed, total, percentage, time };
  };

  const formatDate = (isoDate: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[#49454F] dark:text-[#CAC4D0] text-sm">{syncedTime || 'Syncing Bangladesh Time...'}</p>
        </div>
      </header>

      {/* Current Progress Cards */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => {
          const { completed, total, percentage, time } = getProgressData(user.id, tasks, stats);
          const isMe = user.id === currentUser;
          
          return (
            <div 
              key={user.id}
              className={`p-6 rounded-[32px] transition-all duration-500 shadow-sm flex flex-col space-y-6 ${isMe ? 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF]' : 'bg-white dark:bg-[#2B2930] text-[#1D1B20] dark:text-[#E6E1E5]'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold truncate">{user.name} {isMe && '(You)'}</h2>
                  <p className="text-sm opacity-80">Studying today</p>
                </div>
                <div className="w-12 h-12 shrink-0 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold text-lg">
                  {percentage}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white bg-opacity-20">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Tasks</p>
                    <p className="text-md font-semibold">{completed}/{total}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white bg-opacity-20">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Time</p>
                    <p className="text-md font-semibold">{formatDuration(time)}</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-2 bg-black bg-opacity-10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${isMe ? 'bg-[#0061A4] dark:bg-[#78D1FF]' : 'bg-[#6750A4] dark:bg-[#D0BCFF]'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HistoryIcon size={20} className="text-[#6750A4] dark:text-[#D0BCFF]" />
          <h2 className="text-xl font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Past Days</h2>
        </div>

        {history.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-[#2B2930] rounded-[32px] border border-dashed border-[#CAC4D0] dark:border-[#49454F]">
            <Calendar className="mx-auto mb-3 opacity-20" size={40} />
            <p className="text-[#79747E]">No history yet. Your daily progress will appear here after a reset.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, idx) => {
              const dataA = getProgressData('user_a', entry.tasks, entry.stats);
              const dataB = getProgressData('user_b', entry.tasks, entry.stats);
              
              return (
                <div 
                  key={entry.date + idx}
                  className="bg-white dark:bg-[#2B2930] p-5 rounded-[24px] shadow-sm border border-transparent hover:border-[#D3E3FD] dark:hover:border-[#004A77] transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">{formatDate(entry.date)}</span>
                    <span className="text-[11px] px-2 py-1 bg-[#F0F4F8] dark:bg-[#1A1C1E] rounded-full text-[#49454F] dark:text-[#CAC4D0] font-bold">
                      {entry.tasks.length} GOALS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col p-2 bg-[#F7F9FF] dark:bg-[#1A1C1E] rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#79747E] mb-1 truncate">{nameA}</span>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold">{dataA.percentage}%</span>
                        <span className="text-[10px] opacity-70">{formatDuration(dataA.time)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col p-2 bg-[#F7F9FF] dark:bg-[#1A1C1E] rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#79747E] mb-1 truncate">{nameB}</span>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold">{dataB.percentage}%</span>
                        <span className="text-[10px] opacity-70">{formatDuration(dataB.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-[#2B2930] rounded-[32px] border border-[#CAC4D0] dark:border-[#49454F] shadow-sm">
        <h3 className="text-lg font-bold mb-2">Study Tip</h3>
        <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">
          Consistency is the key to mastering any subject. Even 15 minutes of focused study is better than zero. Keep going!
        </p>
      </div>
    </div>
  );
};
