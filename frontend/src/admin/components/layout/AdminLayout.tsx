import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Users, Key, Terminal, CreditCard, Activity, Settings, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'API Keys', path: '/admin/api-keys', icon: Key },
  { name: 'Security Logs', path: '/admin/logs', icon: Terminal },
  { name: 'Billing', path: '/admin/billing', icon: CreditCard },
  { name: 'System Health', path: '/admin/system-health', icon: Activity },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-cyber-green/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <ShieldAlert className="w-6 h-6 text-warning-red mr-2" />
          <span className="font-bold text-lg tracking-tight">Sentinel Admin</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Platform Management</div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white shadow-[inset_2px_0_0_0_#32FF7E]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-cyber-green" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-green to-blue-500 flex items-center justify-center text-slate-950 font-bold text-sm mr-3">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@sentinel.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Topbar */}
        <header className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search users, API keys, or logs..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-all text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning-red rounded-full"></span>
            </button>
            <Link to="/dashboard" className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-md border border-white/10 transition-colors">
              Exit Admin
            </Link>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
