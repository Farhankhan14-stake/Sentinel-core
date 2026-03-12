import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../../stores/useStore';

export function AppLayout() {
  const initSocket = useStore(state => state.initSocket);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
