import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, ScrollText, Key, CreditCard, Settings, BookOpen, TerminalSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserDropdown } from './UserDropdown';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: TerminalSquare, label: 'Playground', path: '/app/playground' },
  { icon: ScrollText, label: 'Live Logs', path: '/app/logs' },
  { icon: Key, label: 'API Keys', path: '/app/api-keys' },
  { icon: CreditCard, label: 'Billing', path: '/app/billing' },
  { icon: BookOpen, label: 'Documentation', path: '/app/docs' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Shield className="w-6 h-6 text-indigo-500 mr-3" />
        <span className="font-bold text-lg tracking-tight">Sentinel</span>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-500/10 text-indigo-400" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-50"
            )}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <UserDropdown />
      </div>
    </aside>
  );
}
