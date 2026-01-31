
import { Task, UserStats, UserSettings, HistoryEntry, AppNotification } from '../types';
import { supabase } from './supabase';

const DEFAULT_SETTINGS: UserSettings = {
  nameA: 'Partner 1',
  nameB: 'Partner 2',
  currentUserId: 'user_a',
  theme: 'light'
};

export const storage = {
  getTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map(t => ({
      id: t.id,
      text: t.text,
      completedA: t.completed_a,
      completedB: t.completed_b,
      isDueA: t.is_due_a,
      isDueB: t.is_due_b,
      createdAt: t.created_at
    }));
  },
  
  saveTasks: async (tasks: Task[]) => {
    const { error } = await supabase
      .from('tasks')
      .upsert(tasks.map(t => ({
        id: t.id,
        text: t.text,
        completed_a: t.completedA,
        completed_b: t.completedB,
        is_due_a: t.isDueA,
        is_due_b: t.isDueB,
        created_at: t.createdAt
      })));
    if (error) console.error('Error saving tasks:', error);
  },

  deleteTask: async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
  },

  getStats: async (): Promise<Record<string, UserStats>> => {
    const { data, error } = await supabase.from('stats').select('*');
    if (error || !data) return {};
    const stats: Record<string, UserStats> = {};
    data.forEach(s => {
      stats[s.user_id] = {
        userId: s.user_id,
        totalStudyTime: s.total_study_time,
        lastReset: s.last_reset
      };
    });
    return stats;
  },

  saveStats: async (stats: Record<string, UserStats>) => {
    const payload = Object.values(stats).map(s => ({
      user_id: s.userId,
      total_study_time: s.totalStudyTime,
      // Fix: Changed s.last_reset to s.lastReset to match UserStats type in types.ts
      last_reset: s.lastReset
    }));
    const { error } = await supabase.from('stats').upsert(payload);
    if (error) console.error('Error saving stats:', error);
  },

  getSettings: async (): Promise<UserSettings> => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error || !data) return DEFAULT_SETTINGS;
    return {
      nameA: data.name_a,
      nameB: data.name_b,
      currentUserId: data.current_user_id as any,
      theme: data.theme as any
    };
  },

  saveSettings: async (settings: UserSettings) => {
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      name_a: settings.nameA,
      name_b: settings.nameB,
      current_user_id: settings.currentUserId,
      theme: settings.theme
    });
    if (error) console.error('Error saving settings:', error);
  },

  getHistory: async (): Promise<HistoryEntry[]> => {
    const { data, error } = await supabase.from('history').select('*').order('id', { ascending: false });
    if (error) return [];
    return data.map(h => ({
      date: h.date,
      tasks: h.tasks,
      stats: h.stats
    }));
  },

  saveHistoryEntry: async (entry: HistoryEntry) => {
    const { error } = await supabase.from('history').insert({
      date: entry.date,
      tasks: entry.tasks,
      stats: entry.stats
    });
    if (error) console.error('Error saving history:', error);
  },

  getNotifications: async (): Promise<AppNotification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
    if (error) return [];
    return data.map(n => ({
      id: n.id,
      forUserId: n.for_user_id as any,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read
    }));
  },

  saveNotification: async (notif: AppNotification) => {
    await supabase.from('notifications').upsert({
      id: notif.id,
      for_user_id: notif.forUserId,
      message: notif.message,
      timestamp: notif.timestamp,
      read: notif.read
    });
  },

  markNotificationRead: async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }
};
