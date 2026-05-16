import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Bug, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Terminal,
  Filter
} from 'lucide-react';
import { errorLogService } from '../../services/errorLogService';
import { ErrorLog } from '../../types';

const AdminErrorLogs: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filter, setFilter] = useState<ErrorLog['status'] | 'all'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await errorLogService.getErrorLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ErrorLog['status']) => {
    try {
      await errorLogService.updateErrorStatus(id, status);
      setLogs(prev => prev.map(log => log.id === id ? { ...log, status } : log));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this error log?')) return;
    try {
      await errorLogService.deleteErrorLog(id);
      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (error) {
      console.error("Failed to delete log:", error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('CRITICAL: Clear ALL error logs? This cannot be undone.')) return;
    try {
      await errorLogService.clearAllLogs();
      setLogs([]);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle size={14} className="text-green-500" />;
      case 'investigating': return <Clock size={14} className="text-amber-500 animate-pulse" />;
      case 'new': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Bug size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bug className="text-red-500" />
            Bug Reports & Error Logs
          </h3>
          <p className="text-sm text-gray-500">Real-time application monitoring and crash reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#161616] rounded-xl border border-[#222222] p-1">
            {(['all', 'new', 'investigating', 'resolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  filter === s ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 bg-[#161616] hover:bg-[#222222] border border-[#222222] rounded-xl text-gray-400 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
          <button
            onClick={handleClearAll}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 transition-all active:scale-95"
            title="Clear all logs"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#161616] rounded-3xl border border-[#222222] overflow-hidden shadow-2xl">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-[#222222]">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`group transition-all ${expandedLog === log.id ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                {/* Log Header */}
                <div 
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                    <AlertTriangle size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                      {log.message}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-lg border border-white/5">
                      {getStatusIcon(log.status)}
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{log.status}</span>
                    </div>
                    {expandedLog === log.id ? <ChevronUp className="text-gray-600" size={20} /> : <ChevronDown className="text-gray-600" size={20} />}
                  </div>
                </div>

                {/* Log Details (Expanded) */}
                {expandedLog === log.id && (
                  <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Technical Specs */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1">
                            <Terminal size={12} />
                            Stack Trace
                          </label>
                          <pre className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[11px] text-gray-400 font-mono overflow-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-[#222222]">
                            {log.stack || 'No stack trace available'}
                          </pre>
                        </div>
                        {log.componentStack && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Component Tree</label>
                            <pre className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[11px] text-gray-400 font-mono overflow-auto max-h-[200px] leading-relaxed">
                              {log.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Context & Actions */}
                      <div className="space-y-6">
                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-4">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Context</h5>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] text-gray-600 font-bold uppercase">URL</p>
                              <p className="text-xs text-blue-400 break-all flex items-center gap-1">
                                {log.url}
                                <ExternalLink size={10} />
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-600 font-bold uppercase">User</p>
                              <p className="text-xs text-gray-300">{log.userEmail || 'Anonymous'}</p>
                              <p className="text-[9px] text-gray-500 font-mono">{log.userId}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-600 font-bold uppercase">User Agent</p>
                              <p className="text-[10px] text-gray-500 leading-tight">{log.userAgent}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Update Status</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleUpdateStatus(log.id, 'investigating')}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                log.status === 'investigating' ? 'bg-amber-500 text-black' : 'bg-[#222222] text-gray-400 hover:text-white'
                              }`}
                            >
                              <Clock size={12} />
                              Investigate
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(log.id, 'resolved')}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                log.status === 'resolved' ? 'bg-green-500 text-black' : 'bg-[#222222] text-gray-400 hover:text-white'
                              }`}
                            >
                              <CheckCircle size={12} />
                              Resolve
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 border border-red-500/20"
                          >
                            <Trash2 size={12} />
                            Delete Log
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">System Healthy</h4>
            <p className="text-gray-500 text-sm">No error logs found for the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminErrorLogs;
