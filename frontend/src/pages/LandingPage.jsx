import { Link } from 'react-router-dom';
import { Shield, Zap, Brain, Bell, BarChart3, Lock, ArrowRight, ChevronRight, Activity } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Real-time Detection', desc: 'Analyze transactions instantly with sub-50ms response times.' },
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Ensemble ML models combining Isolation Forest and Random Forest.' },
  { icon: Activity, title: 'Risk Scoring', desc: 'Generate fraud risk scores from 0-100 with explainable reasons.' },
  { icon: BarChart3, title: 'Pattern Recognition', desc: 'Detect unusual spending patterns, velocity, and location anomalies.' },
  { icon: Bell, title: 'Instant Alerts', desc: 'Automated fraud alerts with investigation workflow management.' },
  { icon: Lock, title: 'Detailed Reports', desc: 'Comprehensive analytics with CSV export and trend visualization.' },
];

const steps = [
  { num: '01', title: 'Submit Transaction', desc: 'Enter transaction details including amount, location, and device info.' },
  { num: '02', title: 'AI Analysis', desc: 'Our ML pipeline analyzes the transaction against trained models.' },
  { num: '03', title: 'Risk Assessment', desc: 'Get a risk score (0-100) with LOW, MEDIUM, or HIGH classification.' },
  { num: '04', title: 'Instant Results', desc: 'View explainable reasons and recommended actions immediately.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">FraudShield AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition text-sm">How It Works</a>
            <a href="#technology" className="text-gray-400 hover:text-white transition text-sm">Technology</a>
            <Link to="/login" className="text-gray-400 hover:text-white transition text-sm">Login</Link>
            <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
            <Zap className="w-4 h-4" /> AI-Powered Fraud Detection Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Detect Fraud<br /><span className="gradient-text">Before It Happens.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Protect your financial transactions with advanced machine learning. Our AI analyzes patterns in real-time to identify and prevent fraudulent activities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-medium text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
              Explore Dashboard <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: '99.7%', label: 'Detection Rate' },
              { value: '500K+', label: 'Transactions Analyzed' },
              { value: '<50ms', label: 'Response Time' },
              { value: '$10M+', label: 'Fraud Prevented' },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">Everything you need to detect, analyze, and prevent financial fraud.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#1a1f3a] border border-[#252a4a] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
                  <f.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[#1a1f3a]/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">Four simple steps from transaction to fraud detection.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built with Modern Technology</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">Enterprise-grade security with state-of-the-art ML models.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['React.js', 'Node.js', 'Supabase', 'Python', 'Scikit-learn', 'Tailwind CSS', 'Flask', 'JWT Auth'].map((t, i) => (
              <span key={i} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="font-bold">FraudShield AI</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 FraudShield AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

