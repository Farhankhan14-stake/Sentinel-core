import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Shield, ShieldAlert, Check, X, Search, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useStore(state => state.user);

  useEffect(() => {
    // Mock fetch users since we don't have real auth connected in UI yet
    // In a real app, this would be: fetch('/api/admin/users')
    setTimeout(() => {
      setUsers([
        { id: 1, email: 'admin@sentinel.ai', is_active: true, is_admin: true, created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
        { id: 2, email: 'developer@company.com', is_active: true, is_admin: false, created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
        { id: 3, email: 'analyst@company.com', is_active: true, is_admin: false, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 4, email: 'suspended@company.com', is_active: false, is_admin: false, created_at: new Date(Date.now() - 86400000 * 40).toISOString() },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleAdmin = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !u.is_admin } : u));
    // In a real app: fetch(`/api/admin/users/${userId}/toggle-admin`, { method: 'POST' })
  };

  const toggleActive = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    // In a real app: fetch(`/api/admin/users/${userId}/toggle-active`, { method: 'POST' })
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <ShieldAlert className="w-16 h-16 mb-4 text-warning-red opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p>You do not have administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-2">Manage platform users, roles, and access levels.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/50 transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin mr-3" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 mr-3">
                          <span className="text-xs font-bold text-white">{user.email.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="font-medium text-slate-200">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                        user.is_active 
                          ? "bg-cyber-green/10 text-cyber-green border-cyber-green/20" 
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                        user.is_admin 
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                          : "bg-white/5 text-slate-400 border-white/10"
                      )}>
                        {user.is_admin ? (
                          <><Shield className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><Users className="w-3 h-3 mr-1" /> User</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => toggleAdmin(user.id)}
                          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors"
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button 
                          onClick={() => toggleActive(user.id)}
                          className={cn(
                            "px-3 py-1.5 rounded border text-xs font-medium transition-colors",
                            user.is_active 
                              ? "bg-warning-red/10 hover:bg-warning-red/20 border-warning-red/20 text-warning-red" 
                              : "bg-cyber-green/10 hover:bg-cyber-green/20 border-cyber-green/20 text-cyber-green"
                          )}
                        >
                          {user.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
