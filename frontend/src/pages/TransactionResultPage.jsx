import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function TransactionResultPage() {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await transactionAPI.getOne(id);
        setTxn(res.data?.data);
      } catch (err) {
        console.error('Error fetching transaction', err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Transaction records not found.</p>
        <Link to="/transactions" className="text-blue-400">Back to History</Link>
      </div>
    );
  }

  const riskLevel = txn.risk_level || 'LOW';
  const score = txn.risk_score || 0;
  const isHigh = riskLevel === 'HIGH';
  const isMedium = riskLevel === 'MEDIUM';

  const themeColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/transactions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Transactions
      </Link>

      <div className="bg-[#1a1f3a] border border-[#252a4a] rounded-2xl p-8 text-center space-y-6">
        {/* Animated Risk Meter */}
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle cx="88" cy="88" r="70" stroke="#0a0e27" strokeWidth="14" fill="transparent" />
            <circle
              cx="88"
              cy="88"
              r="70"
              stroke={themeColor}
              strokeWidth="14"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold" style={{ color: themeColor }}>{score}</span>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Risk Score</span>
          </div>
        </div>

        <div>
          <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor, border: `1px solid ${themeColor}40` }}>
            {riskLevel} RISK – {txn.prediction || 'Evaluated'}
          </span>
          <h2 className="text-xl font-bold mt-4">Transaction Evaluation Completed</h2>
          <p className="text-gray-400 text-sm mt-1">Transaction ID: <span className="font-mono text-white">{txn.transaction_id}</span></p>
        </div>

        {/* Explainable AI Reasons */}
        <div className="text-left bg-[#0a0e27] border border-[#252a4a] rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm text-gray-300">Explainable AI Risk Factors:</h3>
          {(!txn.reasons || txn.reasons.length === 0) ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> All signals within expected user parameters.
            </div>
          ) : (
            <ul className="space-y-2">
              {txn.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transaction Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-[#252a4a] pt-6">
          <div>
            <span className="text-xs text-gray-400">Amount</span>
            <p className="text-lg font-bold">${parseFloat(txn.amount).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Type</span>
            <p className="text-sm font-medium capitalize">{txn.type}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Method</span>
            <p className="text-sm font-medium capitalize">{txn.payment_method?.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Location</span>
            <p className="text-sm font-medium truncate">{txn.location || 'N/A'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link to="/transactions/new" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-white transition flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Analyze Another
          </Link>
          <Link to="/transactions" className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-white transition flex items-center justify-center">
            View In History
          </Link>
        </div>
      </div>
    </div>
  );
}

