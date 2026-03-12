import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminStore } from '../../stores/adminStore';
import { DataTable } from '../../components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { SecurityLog } from '../../types';
import { Search, Filter, TerminalSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminLogs() {
  const { logs } = useAdminStore();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const columns: ColumnDef<SecurityLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => <span className="text-slate-400 text-xs font-mono">{format(new Date(row.getValue('timestamp')), 'MMM dd, HH:mm:ss')}</span>,
    },
    {
      accessorKey: 'userEmail',
      header: 'User',
      cell: ({ row }) => <span className="font-medium text-white text-sm">{row.getValue('userEmail')}</span>,
    },
    {
      accessorKey: 'threatType',
      header: 'Threat Type',
      cell: ({ row }) => {
        const type = row.getValue('threatType') as string;
        return (
          <span className={cn(
            "text-xs font-bold",
            type === 'None' ? "text-slate-500" :
            type === 'Prompt Injection' ? "text-warning-red" :
            type === 'PII Leak' ? "text-amber" : "text-blue-400"
          )}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={cn(
            "px-2 py-1 rounded text-xs font-bold border",
            status === 'CLEAN' ? "bg-cyber-green/10 text-cyber-green border-cyber-green/20" :
            status === 'BLOCKED' ? "bg-warning-red/10 text-warning-red border-warning-red/20" :
            "bg-amber/10 text-amber border-amber/20"
          )}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isExpanded = expandedLogId === row.original.id;
        return (
          <button 
            onClick={() => setExpandedLogId(isExpanded ? null : row.original.id)}
            className="flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            <TerminalSquare className="w-4 h-4 mr-1" />
            JSON
            {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        );
      },
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Admin-level threat monitoring and raw log inspection.</p>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <button className="flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter by Threat
        </button>
        <button className="flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter by Status
        </button>
      </div>

      <div className="space-y-4">
        <DataTable columns={columns} data={logs} searchKey="userEmail" />
        
        {/* Expanded JSON View (Mocked for the selected row) */}
        <AnimatePresence>
          {expandedLogId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/80 border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-mono text-slate-400">Raw Payload: {expandedLogId}</span>
                <button onClick={() => setExpandedLogId(null)} className="text-slate-500 hover:text-white text-xs">Close</button>
              </div>
              <pre className="p-4 text-xs font-mono text-cyber-green/80 overflow-x-auto">
                {JSON.stringify(JSON.parse(logs.find(l => l.id === expandedLogId)?.rawJson || '{}'), null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
