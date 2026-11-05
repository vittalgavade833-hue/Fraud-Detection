import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, ShieldAlert, Activity, CheckCircle, Ban, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState({ recentTransactions: [], recentAlerts: [] });
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, actRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers({ limit: 10 }),
        adminAPI.getRecentActivity(),
      ]);
      setStats(dashRes.data?.data || {});
      setUsers(usersRes.data?.data || []);
      setActivity(actRes.data?.data || { recentTransactions: [], recentAlerts: [] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId, currentActive) => {
    try {
      await adminAPI.updateUserStatus(userId, { is_active: !currentActive });
      toast.success('User status updated');
      loadAdminData();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Administration</h1>
        <p className="text-gray-400 text-sm">Platform management, operational audits and identity controls</p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Total Users</span>
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          <span className="text-xs text-emerald-400">{stats?.activeUsers || 0} Active</span>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Total Platform Txns</span>
          <p className="text-2xl font-bold">{stats?.totalTransactions || 0}</p>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Suspicious Events</span>
          <p className="text-2xl font-bold text-amber-400">{stats?.suspiciousTransactions || 0}</p>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Confirmed Fraud Cases</span>
          <p className="text-2xl font-bold text-red-400">{stats?.confirmedFraud || 0}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">User Identity Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#252a4a] text-gray-400">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252a4a]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-gray-400">{u.email}</td>
                  <td className="py-3 uppercase text-xs font-bold text-blue-400">{u.role}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${u.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleToggleUser(u.id, u.is_active)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${u.is_active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Activity Feed */}
      <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Live Platform Activity</h2>
        <div className="space-y-3">
          {(activity.recentTransactions || []).slice(0, 5).map(txn => (
            <div key={txn.id} className="p-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl flex items-center justify-between text-sm">
              <div>
                <span className="font-mono text-xs text-blue-400">{txn.transaction_id}</span>
                <p className="text-xs text-gray-400">${txn.amount} via {txn.payment_method}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${txn.risk_level === 'HIGH' ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                {txn.risk_level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

