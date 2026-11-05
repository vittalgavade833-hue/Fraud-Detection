import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, PlusCircle, History, AlertTriangle, BarChart3, Shield, LogOut, Menu, X, Sun, Moon, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions/new', icon: PlusCircle, label: 'Add Transaction' },
  { to: '/transactions', icon: History, label: 'Transaction History' },
  { to: '/alerts', icon: AlertTriangle, label: 'Fraud Alerts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const allNavItems = isAdmin ? [...navItems, { to: '/admin', icon: Shield, label: 'Admin Dashboard' }] : navItems;

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#0a0e27] text-gray-200' : 'bg-gray-100 text-gray-900'}`}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 ${isDark ? 'bg-[#1a1f3a] border-[#252a4a]' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-inherit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">FraudShield</h1>
            <p className="text-xs text-gray-400">AI Detection</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {allNavItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={`px-4 py-4 border-t ${isDark ? 'border-[#252a4a]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role || 'user'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`flex items-center justify-between px-6 py-4 ${isDark ? 'bg-[#1a1f3a]/80 border-[#252a4a]' : 'bg-white/80 border-gray-200'} border-b backdrop-blur-xl lg:hidden`}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold">FraudShield AI</h1>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

