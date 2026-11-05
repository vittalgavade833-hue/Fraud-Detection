import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [dailyVol, setDailyVol] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [riskDist, setRiskDist] = useState([]);
  const [amountDist, setAmountDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [dailyRes, weeklyRes, riskRes, amountRes] = await Promise.all([
          analyticsAPI.getDailyVolume({ days: 14 }),
          analyticsAPI.getWeeklyTrends({ weeks: 8 }),
          analyticsAPI.getRiskDistribution(),
          analyticsAPI.getAmountAnalysis(),
        ]);
        setDailyVol(dailyRes.data?.data || []);
        setWeeklyTrends(weeklyRes.data?.data || []);
        setRiskDist(riskRes.data?.data || []);
        setAmountDist(amountRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleExport = async () => {
    try {
      const res = await analyticsAPI.exportReport();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Intelligence</h1>
          <p className="text-gray-400 text-sm">Longitudinal fraud distribution and volume telemetry</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-[#1a1f3a] border border-[#252a4a] hover:bg-white/5 rounded-xl text-sm font-medium flex items-center gap-2 transition">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transaction Volume */}
        <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Daily Transaction Volume
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVol}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a4a" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0e27', borderColor: '#252a4a' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Fraud Velocity */}
        <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" /> Weekly Incident Velocity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a4a" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0e27', borderColor: '#252a4a' }} />
                <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Amount Bracket Analysis */}
        <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Transaction Amount Brackets</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a4a" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0e27', borderColor: '#252a4a' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Table */}
        <div className="p-5 bg-[#1a1f3a] border border-[#252a4a] rounded-2xl flex flex-col justify-between">
          <h2 className="text-lg font-semibold mb-4">Risk Stratification Summary</h2>
          <div className="space-y-4">
            {riskDist.map(r => (
              <div key={r.level} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.level} Risk</span>
                  <span className="text-gray-400 font-bold">{r.count}</span>
                </div>
                <div className="w-full bg-[#0a0e27] h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (r.count / (riskDist.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%`,
                      backgroundColor: r.level === 'HIGH' ? '#ef4444' : r.level === 'MEDIUM' ? '#f59e0b' : '#10b981'
                    }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-6">ML classification accuracy optimized via automated ensemble thresholding.</p>
        </div>
      </div>
    </div>
  );
}

