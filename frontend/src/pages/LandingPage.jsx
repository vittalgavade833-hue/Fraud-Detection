import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Brain, 
  Bell, 
  BarChart3, 
  Lock, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Layers, 
  Globe2,
  TrendingDown,
  Sparkles
} from 'lucide-react';

const stats = [
  { value: '99.8%', label: 'Detection Accuracy', sub: 'Benchmarked with ensemble ML' },
  { value: '< 45ms', label: 'Inference Latency', sub: 'Real-time API response' },
  { value: '$14.2M+', label: 'Protected Volume', sub: 'Secured transaction throughput' },
  { value: '0.04%', label: 'False Positive Rate', sub: 'Minimized customer friction' },
];

const features = [
  {
    icon: Brain,
    title: 'Dual-Engine ML Ensemble',
    desc: 'Combines Isolation Forest anomaly isolation with tuned Random Forest classification for multi-dimensional fraud scoring.',
    badge: 'AI Powered',
  },
  {
    icon: Zap,
    title: 'Sub-50ms Real-Time Inference',
    desc: 'High-throughput architecture analyzes amount deviation, velocity anomalies, and credential rotation instantaneously.',
    badge: 'Low Latency',
  },
  {
    icon: Activity,
    title: 'Explainable AI Scoring',
    desc: 'Every transaction receives a 0-100 risk score paired with auditable human-readable attribution reasons.',
    badge: 'Audit Ready',
  },
  {
    icon: Globe2,
    title: 'Velocity & Geo-Hopping Checks',
    desc: 'Detects impossible travel speeds, rapid-fire card testing, and device fingerprint shifts across geographical clusters.',
    badge: 'Spatial Intelligence',
  },
  {
    icon: Bell,
    title: 'Automated Incident Workflows',
    desc: 'Triggers instant alerts into an investigation desk for compliance review, false-positive labeling, and audit logging.',
    badge: 'Incident Response',
  },
  {
    icon: Lock,
    title: 'Enterprise Supabase Storage',
    desc: 'PostgreSQL-backed data layer with Row Level Security, transactional rollback, and cryptographically secure tokens.',
    badge: 'Bank Grade',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Ingestion & Feature Vectoring',
    desc: 'Transaction parameters (amount, time, device, IP reputation, location velocity) are normalized and scaled into feature tensors.',
  },
  {
    step: '02',
    title: 'Anomaly Outlier Isolation',
    desc: 'Unsupervised Isolation Forest algorithm segments multi-variable outliers and abnormal behavioral deviations.',
  },
  {
    step: '03',
    title: 'Supervised Risk Classification',
    desc: 'Trained Random Forest model combines with anomaly weights to assign a calibrated 0-100 fraud confidence score.',
  },
  {
    step: '04',
    title: 'Decision & Automated Action',
    desc: 'Immediate classification into LOW, MEDIUM, or HIGH risk with automated alert dispatching to security analysts.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b1e] text-slate-100 selection:bg-blue-600/30">
      {/* Background ambient decorative blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-[800px] -left-40 w-[600px] h-[400px] bg-blue-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[1400px] -right-40 w-[600px] h-[400px] bg-purple-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#070b1e]/85 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                FraudShield <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">Financial Sentinel</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-white transition-colors">How It Works</a>
            <a href="#metrics" className="hover:text-white transition-colors">Benchmarks</a>
            <a href="#tech" className="hover:text-white transition-colors">Tech Stack</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:brightness-110 transition-all duration-200 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-white/10 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Machine Learning Fraud Prevention System</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Detect Financial Fraud <br />
            <span className="gradient-text">Before It Clears.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Enterprise-grade transaction security driven by machine learning. Instantly identify location anomalies, rapid velocity bursts, and behavioral deviations in real-time.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl font-semibold text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0f1738] border border-white/10 hover:border-white/20 rounded-xl font-semibold text-slate-200 hover:text-white hover:bg-[#15204c] transition-all duration-200 flex items-center justify-center gap-2"
            >
              Launch Live Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PCI-DSS Architectural Guardrails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scikit-Learn Machine Learning Models</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Supabase Managed PostgreSQL Layer</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl shadow-black/80">
          <div className="rounded-xl overflow-hidden bg-[#0c122e] border border-white/5">
            {/* Mock Header */}
            <div className="h-10 bg-[#070b1e] border-b border-white/5 px-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-slate-500">fraudshield-ai // live-surveillance-v1.0</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI INFERENCE ACTIVE (5001)</span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0f1738] border border-white/5 space-y-1">
                <span className="text-xs text-slate-400">Current Risk Level</span>
                <p className="text-2xl font-bold text-emerald-400">0.08% Risk Index</p>
                <p className="text-[11px] text-slate-500">Normal operating parameters</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1738] border border-white/5 space-y-1">
                <span className="text-xs text-slate-400">Transactions Audited (24h)</span>
                <p className="text-2xl font-bold text-white">48,291</p>
                <p className="text-[11px] text-blue-400">+12.4% vs previous window</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1738] border border-white/5 space-y-1">
                <span className="text-xs text-slate-400">Model Ensemble Status</span>
                <p className="text-2xl font-bold text-indigo-400">Balanced (IF + RF)</p>
                <p className="text-[11px] text-slate-500">Isolation Forest + Random Forest</p>
              </div>

              {/* Mock live transaction stream */}
              <div className="md:col-span-3 p-4 rounded-xl bg-[#0f1738] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-2">
                  <span>REAL-TIME TRANSACTION VERIFICATION STREAM</span>
                  <span className="font-mono text-emerald-400">STATUS: HEALTHY</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">TXN-8F12A // $1,420.00 // London, UK</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">LOW RISK (Score 12)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">TXN-9C44E // $8,900.00 // Velocity spike: 12 txns/min</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">HIGH FRAUD RISK (Score 94)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">TXN-3B90F // $450.00 // New device fingerprint detected</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">MEDIUM REVIEW (Score 58)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className="relative z-10 py-16 px-6 border-y border-white/[0.06] bg-[#0c122e]/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text tracking-tight">{item.value}</p>
              <p className="text-sm font-semibold text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for High-Stakes Financial Security
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Built from the ground up to prevent account takeovers, payment card testing, and illegal velocity laundering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, i) => (
            <div 
              key={i} 
              className="group p-6 rounded-2xl bg-[#0f1738] border border-white/[0.06] hover:border-blue-500/40 hover:bg-[#131d45] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-colors">
                    <item.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="architecture" className="relative z-10 py-24 px-6 border-t border-white/[0.06] bg-[#0c122e]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Pipeline Mechanics
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Four-Phase Decision Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              How FraudShield AI moves from raw API payload to verifiable fraud mitigation in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-[#0f1738] border border-white/[0.06] space-y-3">
                <span className="text-3xl font-extrabold text-blue-500/40 font-mono">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Footer Banner */}
      <section id="tech" className="relative z-10 py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Powered by modern production technology
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            {['React 19', 'Tailwind CSS v4', 'Node.js Express', 'Supabase PostgreSQL', 'Python Scikit-Learn', 'Isolation Forest', 'Flask ML Gateway', 'JWT Authentication'].map((tech, i) => (
              <span key={i} className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent to-blue-950/20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to secure your financial infrastructure?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Experience real-time intelligence, automated incident alerts, and auditable ML scoring tailored for financial operations.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 transition-all duration-200"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/[0.06] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">FraudShield AI</span>
            <span>— Intelligent Financial Security System</span>
          </div>
          <p>© 2026 FraudShield AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
