import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Globe, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthPortalProps {
  onLogin: (email: string) => void;
}

export default function AuthPortal({ onLogin }: AuthPortalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Clear error when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate network delay
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('dealeraff_users') || '{}');
      
      // Default backend account
      const defaultAdminEmail = '890305@wty.com';
      const defaultAdminPass = '890305@wty.com';

      if (mode === 'register') {
        if (fullName !== 'wtylyp') {
          setError('Registration restricted. Please wait for further notification.');
          setIsLoading(false);
          return;
        }

        if (users[email] || email === defaultAdminEmail) {
          setError('该邮箱已被注册。');
          setIsLoading(false);
          return;
        }
        
        // Save user
        users[email] = { password, fullName };
        localStorage.setItem('dealeraff_users', JSON.stringify(users));
        
        // Registration successful, switch to login mode
        setIsLoading(false);
        setMode('login');
        setPassword(''); // Clear password for security
        setSuccess('Registration successful! Please sign in with your credentials.');
      } else {
        // Login logic
        // Check for default admin first
        if (email === defaultAdminEmail && password === defaultAdminPass) {
          // Update admin last login
          const adminData = users[email] || { fullName: 'Admin', role: 'Admin' };
          users[email] = { ...adminData, lastLogin: new Date().toISOString() };
          localStorage.setItem('dealeraff_users', JSON.stringify(users));
          
          setIsLoading(false);
          onLogin(email);
          return;
        }

        const user = users[email];
        if (!user) {
          setError('账号不存在，请先注册。');
          setIsLoading(false);
          return;
        }

        if (user.password !== password) {
          setError('密码错误，请重试。');
          setIsLoading(false);
          return;
        }

        // Update last login
        users[email] = { ...user, lastLogin: new Date().toISOString() };
        localStorage.setItem('dealeraff_users', JSON.stringify(users));

        // Success
        setIsLoading(false);
        onLogin(email);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-slate-700 relative z-10">
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black text-xl">D</div>
              <span className="text-2xl font-bold tracking-tight">dealeraff</span>
            </div>
            <h1 className="text-4xl font-black mb-6 leading-tight">
              Scale Your Performance <br /> With Precision.
            </h1>
            <p className="text-blue-100 text-lg mb-12 max-w-md">
              Join the world's most advanced CPA network. Real-time tracking, exclusive offers, and dedicated support.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Global Reach</h3>
                  <p className="text-sm text-blue-200">Access offers across 150+ countries.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Instant Tracking</h3>
                  <p className="text-sm text-blue-200">Zero-latency conversion reporting.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Secure Payments</h3>
                  <p className="text-sm text-blue-200">Weekly payouts via multiple methods.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <p className="text-blue-200 text-sm">© 2026 Dealeraff Network. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400">
              {mode === 'login' 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Fill in the details below to join our network.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        required
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-bold text-blue-400 hover:text-blue-300">Forgot Password?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex items-start gap-3 px-1">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <button type="button" className="text-blue-400 font-bold">Terms of Service</button> and <button type="button" className="text-blue-400 font-bold">Privacy Policy</button>.
                </span>
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-2 font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {mode === 'login' ? 'Sign Up Now' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
