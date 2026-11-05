import { useState, useEffect } from 'react';
import { fraudAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ShieldAlert, CheckCircle, HelpCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FraudAlertsPage() {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [noteModal, setNoteModal] = useState({ open: false, alertId: null, note: '' });

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        fraudAPI.getAlerts({ status: activeTab || undefined }),
        fraudAPI.getAlertStats()
      ]);
      setAlerts(alertsRes.data?.data || []);
      setStats(statsRes.data?.data?.overview || {});
    } catch (err) {
      console.error(err);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [activeTab]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await fraudAPI.updateAlertStatus(alertId, { status: newStatus });
      toast.success(`Alert marked as ${newStatus}`);
      loadAlerts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteModal.note) return;
    try {
      await fraudAPI.addNote(noteModal.alertId, { notes: noteModal.note });
      toast.success('Investigation note saved');
      setNoteModal({ open: false, alertId: null, note: '' });
      loadAlerts();
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fraud Alert Incident Desk</h1>
        <p className="text-gray-400 text-sm">Review, investigate and classify anomalous activity indicators</p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Total Alerts</span>
          <p className="text-xl font-bold">{stats?.totalAlerts || 0}</p>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Pending Review</span>
          <p className="text-xl font-bold text-amber-400">{stats?.newAlerts || 0}</p>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Under Investigation</span>
          <p className="text-xl font-bold text-blue-400">{stats?.investigating || 0}</p>
        </div>
        <div className="p-4 bg-[#1a1f3a] border border-[#252a4a] rounded-xl">
          <span className="text-xs text-gray-400">Confirmed Fraud</span>
          <p className="text-xl font-bold text-red-400">{stats?.confirmedFraud || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#252a4a] gap-6 text-sm">
        {['', 'new', 'investigating', 'confirmed_fraud', 'false_positive'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium capitalize transition relative ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
            {tab === '' ? 'All Incidents' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incidents Card Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Checking alert feed...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">No alerts found under this view.</div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                    {a.alert_type}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                  <span className="text-xs font-mono text-gray-400">Score: {a.risk_score}</span>
                </div>
                <h3 className="font-semibold text-base">{a.description}</h3>
                {a.reasons && a.reasons.length > 0 && (
                  <p className="text-xs text-gray-400">Signals: {a.reasons.join(', ')}</p>
                )}
                {a.investigation_notes && (
                  <div className="p-2.5 bg-[#0a0e27] border border-[#252a4a] rounded-lg text-xs font-mono text-blue-300">
                    {a.investigation_notes}
                  </div>
                )}
              </div>

              {/* Status / Admin Actions */}
              <div className="flex flex-row md:flex-col items-end justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-white/5 border border-white/10 text-gray-300">
                  Status: {a.status?.replace('_', ' ')}
                </span>

                {isAdmin && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <button onClick={() => setNoteModal({ open: true, alertId: a.id, note: '' })}
                      className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Note
                    </button>
                    <button onClick={() => handleUpdateStatus(a.id, 'confirmed_fraud')}
                      className="px-2.5 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium">
                      Confirm Fraud
                    </button>
                    <button onClick={() => handleUpdateStatus(a.id, 'false_positive')}
                      className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-medium">
                      False Positive
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note modal */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddNote} className="bg-[#1a1f3a] border border-[#252a4a] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Add Investigation Record</h3>
            <textarea required rows="4" value={noteModal.note} onChange={e => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Record forensic review details..."
              className="w-full p-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-sm text-white outline-none focus:border-blue-500" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNoteModal({ open: false, alertId: null, note: '' })}
                className="px-4 py-2 text-sm rounded-xl hover:bg-white/5 text-gray-400">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium">Save Note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

