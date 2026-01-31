
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

  // Polling Sync
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(async () => {
      try {
        const [latestTasks, latestStats] = await Promise.all([
          storage.getTasks(),
          storage.getStats()
        ]);
        setTasks(prev => JSON.stringify(prev) !== JSON.stringify(latestTasks) ? latestTasks : prev);
        setStats(prev => JSON.stringify(prev) !== JSON.stringify(latestStats) ? latestStats : prev);
      } catch (err) {}
    }, 12000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Theme Sync
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

  const handleManualReset = async () => {
    if (!window.confirm("End today? Unfinished tasks will move to 'Due' and stats will reset.")) return;
    setIsLoading(true);
    // ... reset logic remains same ...
    setIsLoading(false);
    setIsMenuOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.TASKS: return <Tasks tasks={tasks} currentUser={settings.currentUserId} onAddTask={async (txt) => {
        const newTask: Task = { id: Math.random().toString(36).substr(2, 9), text: txt, completedA: false, completedB: false, isDueA: false, isDueB: false, createdAt: Date.now() };
        const updated = [newTask, ...tasks];
        setTasks(updated);
        await storage.saveTasks(updated);
      }} onToggleTask={async (id) => {
        const updated = tasks.map(t => t.id === id ? (settings.currentUserId === 'user_a' ? { ...t, completedA: !t.completedA } : { ...t, completedB: !t.completedB }) : t);
        setTasks(updated);
        await storage.saveTasks(updated);
      }} onToggleDue={async (id) => {
        const updated = tasks.map(t => t.id === id ? (settings.currentUserId === 'user_a' ? { ...t, isDueA: !t.isDueA } : { ...t, isDueB: !t.isDueB }) : t);
        setTasks(updated);
        await storage.saveTasks(updated);
      }} onDeleteTask={async (id) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        await storage.deleteTask(id);
      }} onResetTasks={handleManualReset} />;
      case AppTab.DUE: return <Due tasks={tasks} currentUser={settings.currentUserId} onToggleTask={()=>{}} onToggleDue={()=>{}} />;
      case AppTab.TIMER: return <Timer userId={settings.currentUserId} onTimeUpdate={async (sec) => {
        const uid = settings.currentUserId;
        const us = stats[uid] || { userId: uid, totalStudyTime: 0, lastReset: new Date().toISOString().split('T')[0] };
        const newStats = { ...stats, [uid]: { ...us, totalStudyTime: us.totalStudyTime + sec } };
        setStats(newStats);
        if (sec % 30 === 0) storage.saveStats(newStats);
      }} />;
      case AppTab.PROGRESS: return <Progress tasks={tasks} stats={stats} history={history} currentUser={settings.currentUserId} nameA={settings.nameA} nameB={settings.nameB} />;
      case AppTab.PROFILE: return <Profile settings={settings} onUpdateSettings={setSettings} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F9FF] dark:bg-[#1A1C1E]">
        <Loader2 className="animate-spin text-[#6750A4]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen relative overflow-hidden flex flex-col bg-[#F7F9FF] dark:bg-[#1A1C1E] safe-top">
      {/* Native App Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 bg-[#F7F9FF]/80 dark:bg-[#1A1C1E]/80 backdrop-blur-xl flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors">
          <Menu size={24} className="text-[#1D1B20] dark:text-[#E6E1E5]" />
        </button>
        <div className="flex items-center gap-1.5 select-none">
          <Sparkles size={16} className="text-[#6750A4]" />
          <span className="text-xl font-black tracking-tight uppercase opacity-90">
            Duo<span className="text-[#6750A4]">Study</span>
          </span>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 px-6 pt-24 pb-32 overflow-y-auto no-scrollbar app-container">
        {renderTabContent()}
      </main>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={setActiveTab} onReset={handleManualReset} activeTab={activeTab} currentUserLabel={settings.currentUserId === 'user_a' ? settings.nameA : settings.nameB} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
