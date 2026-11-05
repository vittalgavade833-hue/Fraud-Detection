import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const data = await login(email, password, isAdmin);
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
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
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Admin/User toggle */}
        <div className="flex rounded-xl bg-[#1a1f3a] p-1 mb-6">
          <button onClick={() => setIsAdmin(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${!isAdmin ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
            <Users className="w-4 h-4 inline mr-2" />User Login
          </button>
          <button onClick={() => setIsAdmin(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${isAdmin ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
            <Shield className="w-4 h-4 inline mr-2" />Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1f3a] rounded-2xl border border-[#252a4a] p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                className="w-full pl-11 pr-12 py-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

