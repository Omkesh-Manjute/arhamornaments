import React, { useState, useEffect } from 'react';
import { Loader2, Shield, History } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';

const AdminAuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Audit Logs</h3>
          <p className="text-sm text-gray-500">Security history and admin activity tracking</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 hover:bg-[#222222] rounded-lg text-gray-400 transition disabled:opacity-50"
          title="Refresh logs"
        >
          <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={20} />
        </button>
      </div>

      <div className="bg-[#161616] rounded-2xl border border-[#222222] overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#0D0D0D] border-b border-[#222222]">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {auditLogs.length > 0 ? auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-amber-500" />
                    <p className="text-xs font-bold text-gray-300">{log.adminEmail.split('@')[0]}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                    log.action.includes('CREATE') ? 'bg-green-500/10 text-green-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-gray-400 max-w-md line-clamp-2">{log.details}</p>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center">
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto text-gray-500" size={32} />
                  ) : (
                    <>
                      <History className="mx-auto text-gray-700 mb-4" size={48} />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No logs found</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
