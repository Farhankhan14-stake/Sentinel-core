import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, Activity, CreditCard, Power, Search, AlertTriangle, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const mockApiData = [
  { name: 'Mon', calls: 45000 },
  { name: 'Tue', calls: 52000 },
  { name: 'Wed', calls: 48000 },
  { name: 'Thu', calls: 61000 },
  { name: 'Fri', calls: 59000 },
  { name: 'Sat', calls: 38000 },
  { name: 'Sun', calls: 42000 },
];

const initialUsers = [
  { id: 'usr_101', email: 'alice@example.com', plan: 'Enterprise', status: 'Active' },
  { id: 'usr_102', email: 'bob@startup.io', plan: 'Pro', status: 'Active' },
  { id: 'usr_103', email: 'charlie@dev.net', plan: 'Free', status: 'Banned' },
  { id: 'usr_104', email: 'diana@corp.com', plan: 'Enterprise', status: 'Active' },
  { id: 'usr_105', email: 'evan@test.org', plan: 'Free', status: 'Active' },
];

export default function AdminPortal() {
  const user = useStore(state => state.user);
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemKilled, setSystemKilled] = useState(false);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleBan = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' };
      }
      return u;
    }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans light-theme">
      {/* Dark Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <ShieldCheck className="w-6 h-6 text-indigo-400 mr-3" />
          <span className="font-bold text-lg text-white tracking-tight">Command Center</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <div className="px-3 py-2 bg-indigo-500/10 text-indigo-300 rounded-lg flex items-center font-medium">
            <LayoutDashboardIcon className="w-5 h-5 mr-3" />
            Overview
          </div>
          <div className="px-3 py-2 hover:bg-slate-800 rounded-lg flex items-center font-medium cursor-pointer transition-colors">
            <Users className="w-5 h-5 mr-3" />
            Users
          </div>
          <div className="px-3 py-2 hover:bg-slate-800 rounded-lg flex items-center font-medium cursor-pointer transition-colors">
            <Activity className="w-5 h-5 mr-3" />
            API Usage
          </div>
          <div className="px-3 py-2 hover:bg-slate-800 rounded-lg flex items-center font-medium cursor-pointer transition-colors">
            <CreditCard className="w-5 h-5 mr-3" />
            Revenue
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Exit to Dashboard
          </Link>
        </div>
      </aside>

      {/* Light Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Admin Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              System Online
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Revenue & System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Revenue</h3>
                <CreditCard className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">$124,500</p>
              <p className="text-sm text-emerald-600 mt-2 font-medium">+12.5% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Subscriptions</h3>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">1,245</p>
              <p className="text-sm text-emerald-600 mt-2 font-medium">+45 new this week</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Health</h3>
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">AI Processing Status</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    systemKilled ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {systemKilled ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>
                <button
                  onClick={() => setSystemKilled(!systemKilled)}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all",
                    systemKilled 
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-700" 
                      : "bg-red-500 hover:bg-red-600 text-white"
                  )}
                  title={systemKilled ? "Resume AI Processing" : "Kill Switch: Pause AI"}
                >
                  <Power className="w-6 h-6" />
                </button>
              </div>
              {systemKilled && (
                <p className="text-xs text-red-600 mt-2 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> All AI requests are currently blocked.
                </p>
              )}
            </div>
          </div>

          {/* Global API Usage Monitor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Global API Usage Monitor</h2>
              <p className="text-sm text-slate-500">Total Gemini API calls across all users (7 days)</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockApiData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
                <p className="text-sm text-slate-500">Manage user accounts and access.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">User ID</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Plan Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No users found matching "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            u.plan === 'Enterprise' ? "bg-purple-50 text-purple-700 border-purple-200" :
                            u.plan === 'Pro' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            u.status === 'Active' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          )}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleBan(u.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                              u.status === 'Active' 
                                ? "bg-white text-red-600 border-red-200 hover:bg-red-50" 
                                : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            )}
                          >
                            {u.status === 'Active' ? 'Ban User' : 'Unban User'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
