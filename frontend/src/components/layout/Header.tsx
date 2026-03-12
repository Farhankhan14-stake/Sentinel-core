import { Search } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function Header() {
  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs, keys..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#32FF7E] animate-pulse"></span>
          <span>Gateway Active</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <NotificationDropdown />
      </div>
    </header>
  );
}
