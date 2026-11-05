import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Reset link dispatched to your inbox');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">FraudShield AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-gray-400 mt-1">We will send verification instructions to your email</p>
        </div>

        <div className="bg-[#1a1f3a] rounded-2xl border border-[#252a4a] p-8 space-y-5">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-green-400">If an account exists for {email}, you will receive a reset link shortly.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
                {loading ? 'Submitting...' : 'Send Reset Link'}
              </button>
              <div className="text-center mt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

