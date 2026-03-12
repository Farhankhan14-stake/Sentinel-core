import { create } from 'zustand';
import { UserAccount, Analytics, ApiKey, SecurityLog } from '../types';
import { io } from 'socket.io-client';

interface AppState {
  user: UserAccount | null;
  analytics: Analytics | null;
  apiKeys: ApiKey[];
  logs: SecurityLog[];
  reasoningLogs: { timestamp: string; message: string; threat_level: string }[];
  isLoading: boolean;
  
  // Actions
  initSocket: () => void;
  fetchAnalytics: () => Promise<void>;
  fetchApiKeys: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  generateApiKey: (name: string) => Promise<void>;
  revokeApiKey: (id: string) => Promise<void>;
  addLiveLog: (log: SecurityLog) => void;
  addReasoningLog: (message: string, threat_level: string) => void;
}

let socket: any = null;

export const useStore = create<AppState>((set, get) => ({
  user: {
    id: 'u_1',
    name: 'Security Admin',
    email: 'admin@sentinel.ai',
    tier: 'PRO',
  },
  analytics: null,
  apiKeys: [],
  logs: [],
  reasoningLogs: [],
  isLoading: false,

  initSocket: () => {
    if (socket) return;
    
    socket = io();
    
    socket.on('analytics_updated', (data: Analytics) => {
      set({ analytics: data });
    });

    socket.on('keys_updated', (data: ApiKey[]) => {
      set({ apiKeys: data });
    });

    socket.on('new_log', (log: SecurityLog) => {
      get().addLiveLog(log);
    });
  },

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      set({ analytics: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      set({ isLoading: false });
    }
  },

  fetchApiKeys: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/keys');
      const data = await res.json();
      set({ apiKeys: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      set({ isLoading: false });
    }
  },

  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      set({ logs: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      set({ isLoading: false });
    }
  },

  generateApiKey: async (name: string) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const newKey = await res.json();
      // The socket event will update the list, but we can also update locally
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  },

  revokeApiKey: async (id: string) => {
    try {
      await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      // The socket event will update the list
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  },

  addLiveLog: (log: SecurityLog) => {
    set(state => ({ logs: [log, ...state.logs].slice(0, 1000) })); // Keep last 1000
  },

  addReasoningLog: (message: string, threat_level: string) => {
    set(state => ({ 
      reasoningLogs: [{ timestamp: new Date().toLocaleTimeString(), message, threat_level }, ...state.reasoningLogs].slice(0, 100) 
    }));
  }
}));
