import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RISK_BADGES = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll({
        page,
        limit: 10,
        search: search || undefined,
        riskLevel: riskFilter || undefined,
        type: typeFilter || undefined
      });
      setTransactions(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, riskFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleExport = async () => {
    try {
      const res = await transactionAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export initiated');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-gray-400 text-sm">Full audit trail of logged financial operations</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-[#1a1f3a] border border-[#252a4a] hover:bg-white/5 rounded-xl text-sm font-medium flex items-center gap-2 transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#1a1f3a] border border-[#252a4a] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, merchant or description..."
            className="w-full pl-9 pr-4 py-2 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-sm text-white outline-none focus:border-blue-500" />
        </form>

        <div className="flex gap-2">
          <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-sm text-gray-300 outline-none">
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-sm text-gray-300 outline-none">
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="transfer">Transfer</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#1a1f3a] border border-[#252a4a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#252a4a] text-gray-400 bg-white/5">
                <th className="p-4 font-medium">Txn ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Risk Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252a4a]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No matching transactions found</td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono font-medium">{t.transaction_id}</td>
                    <td className="p-4 text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold">${parseFloat(t.amount || 0).toFixed(2)}</td>
                    <td className="p-4 capitalize">{t.type}</td>
                    <td className="p-4 font-bold">{t.risk_score || 0}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full border font-semibold ${RISK_BADGES[t.risk_level || 'LOW']}`}>
                        {t.risk_level || 'LOW'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/transactions/result/${t.id}`} className="inline-flex p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#252a4a] flex items-center justify-between text-sm text-gray-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-[#0a0e27] border border-[#252a4a] hover:bg-white/5 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-[#0a0e27] border border-[#252a4a] hover:bg-white/5 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
