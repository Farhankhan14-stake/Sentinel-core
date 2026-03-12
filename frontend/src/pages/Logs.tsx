import { useEffect, useState, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Filter, ChevronDown, ChevronRight, Copy, Check, Play, Square } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { SecurityLog } from '../types';

export default function Logs() {
  const { logs, fetchLogs, addLiveLog, isLoading } = useStore();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [displayedLogs, setDisplayedLogs] = useState<SecurityLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (isLiveStream) {
      setDisplayedLogs(logs);
    }
  }, [logs, isLiveStream]);

  const handleCopy = (log: SecurityLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded"></div>
        <div className="h-[600px] bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Logs</h1>
          <p className="text-slate-400 mt-1">Real-time stream of AI gateway requests and threat detections.</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={isLiveStream ? "destructive" : "outline"} 
            className={isLiveStream ? "bg-red-900/50 text-red-400 border-red-800/50 hover:bg-red-900/70" : "text-slate-300"}
            onClick={() => setIsLiveStream(!isLiveStream)}
          >
            {isLiveStream ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isLiveStream ? 'Stop Stream' : 'Live Stream'}
          </Button>
          <Button variant="outline" className="text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              className="bg-slate-900/50 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all w-64"
            />
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-slate-900/40 border-white/5">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Threat Type</div>
          <div className="col-span-2">API Key</div>
          <div className="col-span-2">Tokens</div>
          <div className="col-span-1 text-right">Details</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence initial={false}>
            {displayedLogs.map((log) => (
              <motion.div 
                key={log.id} 
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-lg border border-transparent hover:border-white/5 bg-transparent hover:bg-slate-800/30 transition-colors"
              >
                <div 
                  className="grid grid-cols-12 gap-4 p-3 items-center cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="col-span-2 text-sm font-mono text-slate-300">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={log.status.toLowerCase() as any}>{log.status}</Badge>
                  </div>
                  <div className="col-span-3 text-sm text-slate-300">
                    {log.threat_type !== 'NONE' ? log.threat_type : '-'}
                  </div>
                  <div className="col-span-2 text-sm font-mono text-slate-400">
                    {log.api_key_id}
                  </div>
                  <div className="col-span-2 text-sm text-slate-400">
                    {log.tokens_used}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {expandedLog === log.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedLog === log.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-white/5 mt-2 bg-slate-950/30 rounded-b-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw JSON Payload</span>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(log); }} className="h-6 text-xs text-slate-400">
                            {copiedId === log.id ? <Check className="h-3 w-3 mr-1 text-[#32FF7E]" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copiedId === log.id ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="p-4 rounded-md bg-[#0d1117] border border-white/5 text-xs font-mono text-slate-300 overflow-x-auto">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
