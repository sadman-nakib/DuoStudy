
import React from 'react';
import { UserSettings } from '../types';
import { User, Moon, Sun, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const Profile: React.FC<ProfileProps> = ({ settings, onUpdateSettings }) => {
  const haptic = (strength: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(strength);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (settings.currentUserId === 'user_a') {
      onUpdateSettings({ ...settings, nameA: newName });
    } else {
      onUpdateSettings({ ...settings, nameB: newName });
    }
  };

  const toggleTheme = () => {
    haptic(20);
    onUpdateSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const setRole = (role: 'user_a' | 'user_b') => {
    haptic(30);
    onUpdateSettings({ ...settings, currentUserId: role });
  };

  const currentName = settings.currentUserId === 'user_a' ? settings.nameA : settings.nameB;

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Profile</h1>
        <p className="text-[#49454F] dark:text-[#CAC4D0]">Personalize your experience</p>
      </header>

      <section className="space-y-4">
        <label className="block text-sm font-medium text-[#49454F] dark:text-[#CAC4D0] ml-2">Display Name</label>
        <div className="relative">
          <input
            type="text"
            value={currentName}
            onChange={handleNameChange}
            placeholder="Enter your name"
            className="w-full bg-white dark:bg-[#2B2930] rounded-3xl px-6 py-4 shadow-sm border border-transparent focus:border-[#6750A4] focus:outline-none transition-all text-lg pl-14"
          />
          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6750A4]" size={20} />
        </div>
      </section>

      <section className="space-y-4">
        <label className="block text-sm font-medium text-[#49454F] dark:text-[#CAC4D0] ml-2">Role (Who are you?)</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRole('user_a')}
            className={`p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-2 ${settings.currentUserId === 'user_a' ? 'bg-[#D3E3FD] dark:bg-[#004A77] border-[#0061A4] text-[#041E49] dark:text-[#C2E7FF]' : 'bg-white dark:bg-[#2B2930] border-transparent text-[#49454F] dark:text-[#CAC4D0] shadow-sm'}`}
          >
            <ShieldCheck size={32} />
            <span className="font-bold">Block Piece 1</span>
          </button>
          <button
            onClick={() => setRole('user_b')}
            className={`p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-2 ${settings.currentUserId === 'user_b' ? 'bg-[#D3E3FD] dark:bg-[#004A77] border-[#0061A4] text-[#041E49] dark:text-[#C2E7FF]' : 'bg-white dark:bg-[#2B2930] border-transparent text-[#49454F] dark:text-[#CAC4D0] shadow-sm'}`}
          >
            <ShieldCheck size={32} />
            <span className="font-bold">Block Piece 2</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <label className="block text-sm font-medium text-[#49454F] dark:text-[#CAC4D0] ml-2">Appearance</label>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-6 bg-white dark:bg-[#2B2930] rounded-[32px] shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#EADDFF] dark:bg-[#4F378B] rounded-2xl text-[#21005D] dark:text-[#EADDFF]">
              {settings.theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
            </div>
            <div className="text-left">
              <span className="block font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Dark Mode</span>
              <span className="text-sm text-[#49454F] dark:text-[#CAC4D0]">{settings.theme === 'dark' ? 'On' : 'Off'}</span>
            </div>
          </div>
          <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.theme === 'dark' ? 'bg-[#6750A4]' : 'bg-[#E7E0EC]'}`}>
             <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </button>
      </section>

      <div className="p-6 bg-[#E7E0EC] dark:bg-[#49454F] rounded-[32px] text-center text-sm text-[#49454F] dark:text-[#CAC4D0]">
        Settings are saved locally to this device.
      </div>
    </div>
  );
};
