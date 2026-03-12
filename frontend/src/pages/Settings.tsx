import { useStore } from '../stores/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Bell, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details and public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <User className="w-4 h-4 mr-2 text-slate-500" />
                  Full Name
                </label>
                <input 
                  type="text" 
                  defaultValue={user?.name}
                  className="bg-slate-950/50 border border-white/10 rounded-md px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-500" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  className="bg-slate-950/50 border border-white/10 rounded-md px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader>
            <CardTitle>Security Preferences</CardTitle>
            <CardDescription>Configure how Sentinel handles threats and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-slate-950/30">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-indigo-400" />
                    <label className="text-sm font-medium text-slate-200">Strict Mode</label>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">Automatically block any request with a threat score &gt; 80.</p>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-indigo-600 cursor-pointer">
                  <span className="translate-x-4 inline-block h-3 w-3 rounded-full bg-white transition" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-slate-950/30">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-slate-400" />
                    <label className="text-sm font-medium text-slate-200">Email Alerts</label>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">Receive daily summaries of blocked threats.</p>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-700 cursor-pointer">
                  <span className="translate-x-1 inline-block h-3 w-3 rounded-full bg-white transition" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-slate-950/30">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <KeyRound className="w-4 h-4 mr-2 text-slate-400" />
                    <label className="text-sm font-medium text-slate-200">Two-Factor Authentication</label>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-900/10 border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-red-400/70">Irreversible actions for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
