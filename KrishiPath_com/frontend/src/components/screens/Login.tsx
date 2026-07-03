import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Shield, Users, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

type LoginMode = 'root' | 'employee';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>('root');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast('Please enter your credentials', 'error'); return; }
    if (mode === 'employee' && !companyId) { toast('Please enter your Company ID', 'error'); return; }
    setLoading(true);
    try {
      await login(email, password, mode as UserRole);
      navigate('/');
      toast(`Welcome back! Logged in as ${mode === 'root' ? 'Company Root' : 'Team Member'}`, 'success');
    } catch (error) {
      toast('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #F4F7F4 0%, #E8F5E9 50%, #F9FBE7 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-primary p-10 shrink-0" style={{ background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-tight">KrishiPath</p>
              <p className="text-white/60 text-xs">Company Portal</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Reach millions of farmers.<br />
            <span className="text-secondary">Grow your brand.</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            KrishiPath connects agricultural companies directly with farming communities across India through reward-based engagement campaigns.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '🌾', stat: '2.4M+', label: 'Active Farmers' },
            { icon: '📍', stat: '18 States', label: 'Pan-India Coverage' },
            { icon: '🏆', stat: '3.2× avg ROI', label: 'For Companies' },
          ].map(s => (
            <div key={s.stat} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-white font-bold">{s.stat}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-text-primary">KrishiPath</span>
          </div>

          {/* Mode Toggle */}
          <div className="bg-white border border-border rounded-2xl p-1.5 flex mb-8 shadow-sm">
            <button
              onClick={() => setMode('root')}
              className={[
                'flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                mode === 'root' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Shield size={16} />
              Company Root Login
            </button>
            <button
              onClick={() => setMode('employee')}
              className={[
                'flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                mode === 'employee' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Users size={16} />
              Employee Login
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-border shadow-lg p-7">
            <div className="mb-6">
              {mode === 'root' ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={18} className="text-primary" />
                    <h1 className="text-xl font-bold text-text-primary">Root Account Login</h1>
                  </div>
                  <p className="text-sm text-text-secondary">Full administrative access to your company account</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={18} className="text-indigo-600" />
                    <h1 className="text-xl font-bold text-text-primary">Employee Login</h1>
                  </div>
                  <p className="text-sm text-text-secondary">Login with your team credentials and Company ID</p>
                </>
              )}
            </div>

            <div className="space-y-4">
              {mode === 'employee' && (
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    Company ID <span className="text-error">*</span>
                    <span className="text-[10px] font-normal text-text-muted ml-1">(provided by your company admin)</span>
                  </label>
                  <input
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value.toUpperCase())}
                    placeholder="KP-C-00842"
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors font-mono tracking-wider"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'root' ? 'admin@yourcompany.com' : 'yourname@yourcompany.com'}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Password <span className="text-error">*</span></label>
                  <button className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</button>
                </div>
                <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••"
                    className="flex-1 px-4 py-2.5 text-sm text-text-primary outline-none"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="px-3 text-text-muted hover:text-text-primary cursor-pointer">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === 'root' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary w-3.5 h-3.5" />
                  <span className="text-xs text-text-secondary">Keep me signed in on this device</span>
                </label>
              )}

              <Button fullWidth size="lg" onClick={handleLogin} loading={loading} rightIcon={<ArrowRight size={16} />}>
                {loading ? 'Signing in…' : mode === 'root' ? 'Sign in as Root' : 'Sign in as Employee'}
              </Button>
            </div>

            {mode === 'root' && (
              <div className="mt-5 pt-5 border-t border-border text-center">
                <p className="text-xs text-text-muted">
                  New company?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:underline">Register on KrishiPath</Link>
                </p>
              </div>
            )}

            {mode === 'root' && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <Lock size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Root account</strong> has full access to billing, team management, and all campaign data. Use employee accounts for daily operations.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-text-muted mt-5">
            © 2026 KrishiPath. All rights reserved. ·{' '}
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
