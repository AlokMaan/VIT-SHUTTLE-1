import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth as authApi } from '../../services/api';
import { setAuth } from '../../utils/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user?.role === 'admin') {
        setAuth({
          token: res.token,
          name: res.user?.name || email.split('@')[0],
          email: res.user?.email || email,
          role: res.user?.role,
          userId: res.user?.id,
        });
        toast.success('Welcome to Admin Portal');
        navigate('/admin');
      } else if (res.success && res.user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--red)] opacity-[0.03] blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--orange)] opacity-[0.03] blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--red)] to-[var(--orange)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--red)]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-[var(--text-3)] text-center">
              Sign in to manage VIT Shuttle services
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-2)] ml-1">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-3)]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-white placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                  placeholder="admin@vit.ac.in"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-2)] ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-3)]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-white placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--red)] to-[var(--orange)] hover:opacity-90 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[var(--red)]/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-[var(--text-3)] text-xs mt-6">
          Authorized personnel only. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
