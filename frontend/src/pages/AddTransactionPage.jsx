import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { Send, MapPin, DollarSign, Smartphone, Globe, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'purchase',
    paymentMethod: 'credit_card',
    location: 'New York, US',
    country: 'US',
    currency: 'USD',
    merchantName: 'Amazon',
    merchantCategory: 'Retail',
    deviceInfo: navigator.userAgent || 'Chrome / Windows',
    ipAddress: '192.168.1.100',
    description: 'Routine online purchase',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount)) return toast.error('Please enter a valid amount');
    setLoading(true);

    try {
      const res = await transactionAPI.create(formData);
      const createdTxn = res.data?.data;
      toast.success('Transaction submitted and analyzed!');
      if (createdTxn?.id) {
        navigate(`/transactions/result/${createdTxn.id}`);
      } else {
        navigate('/transactions');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit New Transaction</h1>
        <p className="text-gray-400 text-sm">Enter transaction parameters for immediate ML fraud scoring</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1f3a] border border-[#252a4a] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="number" step="0.01" min="0" required name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 450.00"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
            <select name="type" value={formData.type} onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition">
              <option value="purchase">Purchase</option>
              <option value="transfer">Transfer</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="deposit">Deposit</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition">
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="digital_wallet">Digital Wallet</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Origin Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, US"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Merchant Name</label>
            <input type="text" name="merchantName" value={formData.merchantName} onChange={handleChange} placeholder="e.g. Apple Store"
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Origin IP Address</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" name="ipAddress" value={formData.ipAddress} onChange={handleChange} placeholder="e.g. 192.168.1.1"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Device Information</label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" name="deviceInfo" value={formData.deviceInfo} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description / Notes</label>
          <textarea rows="3" name="description" value={formData.description} onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white outline-none focus:border-blue-500 transition" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium text-white text-base hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50">
          <Send className="w-5 h-5" />
          {loading ? 'Evaluating with AI Pipeline...' : 'Analyze Transaction'}
        </button>
      </form>
    </div>
  );
}

