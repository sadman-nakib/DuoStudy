
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Task, UserStats, UserSettings, HistoryEntry, AppNotification } from './types';
import { storage } from './services/storage';
import { Navigation } from './components/Navigation';
import { Tasks } from './components/Tasks';
import { Due } from './components/Due';
import { Timer } from './components/Timer';
import { Progress } from './components/Progress';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { Menu, Sparkles, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TASKS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Record<string, UserStats>>({});
  const [settings, setSettings] = useState<UserSettings>({
    nameA: 'Partner 1',
    nameB: 'Partner 2',
    currentUserId: 'user_a',
    theme: 'light'
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        const [t, s, st, h, n] = await Promise.all([
          storage.getTasks(),
          storage.getStats(),
          storage.getSettings(),
          storage.getHistory(),
          storage.getNotifications()
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const ensuredStats = { ...s };
        if (!ensuredStats.user_a) ensuredStats.user_a = { userId: 'user_a', totalStudyTime: 0, lastReset: today };
        if (!ensuredStats.user_b) ensuredStats.user_b = { userId: 'user_b', totalStudyTime: 0, lastReset: today };

        setTasks(t);
        setStats(ensuredStats);
        setSettings(st);
        setHistory(h);
        setNotifications(n);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Sync state with Partner (Polling)
  useEffect(() => {
    if (isLoading) return;
    const pollSync = async () => {
      try {
        const [latestTasks, latestStats, latestNotifs] = await Promise.all([
          storage.getTasks(),
          storage.getStats(),
          storage.getNotifications()
        ]);

        setTasks(prev => JSON.stringify(prev) !== JSON.stringify(latestTasks) ? latestTasks : prev);
        setStats(prev => JSON.stringify(prev) !== JSON.stringify(latestStats) ? latestStats : prev);
        setNotifications(prev => JSON.stringify(prev) !== JSON.stringify(latestNotifs) ? latestNotifs : prev);
      } catch (err) {
        console.warn("Sync polling failed, will retry:", err);
      }
    };
    const interval = setInterval(pollSync, 10000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle Push Notifications
  useEffect(() => {
    if (isLoading) return;
    
    const unread = notifications.filter(n => n.forUserId === settings.currentUserId && !n.read);
    
    if (unread.length > 0) {
      unread.forEach(n => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('DuoStudy', {
            body: n.message,
            icon: '/favicon.ico'
          });
        }
        storage.markNotificationRead(n.id);
      });

      setNotifications(prev => prev.map(n => 
        (n.forUserId === settings.currentUserId && !n.read) ? { ...n, read: true } : n
      ));
    }
  }, [notifications, settings.currentUserId, isLoading]);

  // Theme Management
  useEffect(() => {
    if (isLoading) return;
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storage.saveSettings(settings);
  }, [settings.theme, settings, isLoading]);

  const archiveCurrentDay = async (date: string, currentTasks: Task[], currentStats: Record<string, UserStats>) => {
    const totalTime: number = Object.values(currentStats).reduce((acc, s) => acc + (s.totalStudyTime || 0), 0);
    if (currentTasks.length > 0 || totalTime > 0) {
      const newEntry: HistoryEntry = { date, tasks: [...currentTasks], stats: { ...currentStats } };
      setHistory(prev => [newEntry, ...prev].slice(0, 30));
      await storage.saveHistoryEntry(newEntry);
    }
  };

  const resetDayLogic = async (today: string) => {
    const nextTasks = tasks.map(t => ({
      ...t,
      isDueA: !t.completedA ? true : t.isDueA,
      isDueB: !t.completedB ? true : t.isDueB,
      completedA: false,
      completedB: false,
    }));

    const nextStats = {
      user_a: { userId: 'user_a', totalStudyTime: 0, lastReset: today },
      user_b: { userId: 'user_b', totalStudyTime: 0, lastReset: today }
    };

    setTasks(nextTasks);
    setStats(nextStats);

    await Promise.all([
      storage.saveTasks(nextTasks),
      storage.saveStats(nextStats)
    ]);
  };

  const handleManualReset = async () => {
    if (!window.confirm("End today? Unfinished tasks will move to 'Due' and stats will reset.")) return;
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = stats[settings.currentUserId]?.lastReset || today;
    setIsLoading(true);
    const [latestTasks, latestStats] = await Promise.all([storage.getTasks(), storage.getStats()]);
    await archiveCurrentDay(lastResetDate, latestTasks, latestStats);
    await resetDayLogic(today);
    if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
    setIsMenuOpen(false);
    setActiveTab(AppTab.TASKS);
    setIsLoading(false);
  };

  const notifyPartner = async (message: string) => {
    const partnerId = settings.currentUserId === 'user_a' ? 'user_b' : 'user_a';
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      forUserId: partnerId as any,
      message,
      timestamp: Date.now(),
      read: false
    };
    storage.saveNotification(newNotif);
  };

  const handleAddTask = async (text: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text, completedA: false, completedB: false, isDueA: false, isDueB: false, createdAt: Date.now()
    };
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);
    await storage.saveTasks(newTasks);
  };

  const handleToggleTask = async (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const isMeA = settings.currentUserId === 'user_a';
        const isNowCompleted = isMeA ? !t.completedA : !t.completedB;
        if (isNowCompleted) {
          const myName = isMeA ? settings.nameA : settings.nameB;
          notifyPartner(`${myName} completed a goal: ${t.text}`);
        }
        return isMeA ? { ...t, completedA: !t.completedA } : { ...t, completedB: !t.completedB };
      }
      return t;
    });
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
  };

  const handleToggleDue = async (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const isMeA = settings.currentUserId === 'user_a';
        const willBeDue = isMeA ? !t.isDueA : !t.isDueB;
        if (willBeDue) {
          const myName = isMeA ? settings.nameA : settings.nameB;
          notifyPartner(`${myName} marked a task as DUE: ${t.text}`);
        }
        return isMeA ? { ...t, isDueA: willBeDue } : { ...t, isDueB: willBeDue };
      }
      return t;
    });
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);
  };

  const handleDeleteTask = async (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    await storage.deleteTask(id);
  };

  const handleTimeUpdate = async (seconds: number) => {
    const uid = settings.currentUserId;
    const us = stats[uid] || { userId: uid, totalStudyTime: 0, lastReset: new Date().toISOString().split('T')[0] };
    const newStats = { ...stats, [uid]: { ...us, totalStudyTime: us.totalStudyTime + seconds } };
    setStats(newStats);
    if (seconds % 30 === 0) storage.saveStats(newStats); 
  };

  useEffect(() => {
    const saveOnLeave = () => storage.saveStats(stats);
    window.addEventListener('beforeunload', saveOnLeave);
    window.addEventListener('pagehide', saveOnLeave);
    return () => {
      window.removeEventListener('beforeunload', saveOnLeave);
      window.removeEventListener('pagehide', saveOnLeave);
    };
  }, [stats]);

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.TASKS: return <Tasks tasks={tasks} currentUser={settings.currentUserId} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onToggleDue={handleToggleDue} onDeleteTask={handleDeleteTask} onResetTasks={handleManualReset} />;
      case AppTab.DUE: return <Due tasks={tasks} currentUser={settings.currentUserId} onToggleTask={handleToggleTask} onToggleDue={handleToggleDue} />;
      case AppTab.TIMER: return <Timer userId={settings.currentUserId} onTimeUpdate={handleTimeUpdate} />;
      case AppTab.PROGRESS: return <Progress tasks={tasks} stats={stats} history={history} currentUser={settings.currentUserId} nameA={settings.nameA} nameB={settings.nameB} />;
      case AppTab.PROFILE: return <Profile settings={settings} onUpdateSettings={setSettings} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden flex flex-col bg-[#F7F9FF] dark:bg-[#1A1C1E]">
      <header className="fixed top-0 left-0 right-0 z-30 px-6 pt-6 pb-2 bg-[#F7F9FF]/90 dark:bg-[#1A1C1E]/90 backdrop-blur-xl flex items-center justify-between transition-all border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90">
          <Menu size={20} className="text-[#1D1B20] dark:text-[#E6E1E5]" />
        </button>
        <div className="flex flex-col items-center select-none">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              <Sparkles size={10} className="text-[#6750A4] dark:text-[#D0BCFF] absolute -top-1 -right-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#6750A4] dark:bg-[#D0BCFF]"></div>
            </div>
            <span className="text-lg font-[900] tracking-tighter text-[#1D1B20] dark:text-[#E6E1E5] opacity-90 uppercase">
              Duo<span className="text-[#6750A4] dark:text-[#D0BCFF]">Study</span>
            </span>
          </div>
        </div>
        <div className="w-8"></div>
      </header>
      <main className="flex-1 px-6 pt-28 pb-32 overflow-y-auto no-scrollbar">
        {renderTabContent()}
      </main>
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={setActiveTab} onReset={handleManualReset} activeTab={activeTab} currentUserLabel={settings.currentUserId === 'user_a' ? settings.nameA : settings.nameB} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
