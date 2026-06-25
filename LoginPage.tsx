import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, LogIn, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
  redirectEventId?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, redirectEventId }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Quick Account Helper Tooltip
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await login({ email, password });
      
      // Navigate based on redirection parameter
      if (redirectEventId) {
        onNavigate('event-details', { eventId: redirectEventId });
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDemoCreds = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div id="login-page" className="max-w-md mx-auto py-12 px-4 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-slate-500 text-xs">
            Enter your credentials to book seats and view registrations
          </p>
        </div>

        {localError && (
          <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. student@college.edu"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <button
                type="button"
                onClick={() => alert('Demo account credentials can be used below. If you registered a new account, write it down safely as password retrieval is disabled on demo databases.')}
                className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Signup */}
        <p className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          New student?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </p>
      </div>

      {/* Demo credentials helper card */}
      {showDemoAccounts && (
        <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              Developer Demo Accounts
            </span>
            <button
              onClick={() => setShowDemoAccounts(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Hide
            </button>
          </div>
          
          <div className="space-y-2.5">
            {/* Student User */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-150 text-xs">
              <div>
                <span className="font-bold text-slate-800">Student Account:</span>
                <p className="text-slate-500 text-[11px] font-mono">student@college.edu | student123</p>
              </div>
              <button
                onClick={() => handleApplyDemoCreds('student@college.edu', 'student123')}
                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px] cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Admin User */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-150 text-xs">
              <div>
                <span className="font-bold text-slate-800">Admin Account:</span>
                <p className="text-slate-500 text-[11px] font-mono">kanchipatiharika2006@gmail.com | admin123</p>
              </div>
              <button
                onClick={() => handleApplyDemoCreds('kanchipatiharika2006@gmail.com', 'admin123')}
                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px] cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
