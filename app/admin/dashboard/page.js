'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AdminSettingsView from '@/components/AdminSettingsView';
import AdminUserManagement from '@/components/AdminUserManagement';
import MobileBottomNav from '@/components/MobileBottomNav';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Settings, 
  Users, 
  Database, 
  LogOut, 
  ArrowLeft,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, login, logout, settings, dbStatus } = useApp();
  const [adminTab, setAdminTab] = useState('users'); // 'users' | 'branding' | 'database'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials');
      } else if (res.user?.role !== 'admin') {
        setErrorMsg('Access denied. Administrator privileges required.');
        logout();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdminAuthenticated = currentUser && currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onCloseMobile={() => setMobileMenuOpen(false)} 
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-y-auto pb-24 lg:pb-8">
          
          {!isAdminAuthenticated ? (
            /* ADMIN LOGIN GATE */
            <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Admin Panel Login
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please sign in with administrator credentials to access <span className="font-mono text-indigo-500 font-bold">/admin/dashboard</span>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
                </button>
              </form>

              <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div>Default Root Credentials:</div>
                <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  username: <span className="text-indigo-600">admin</span> | password: <span className="text-indigo-600">admin123</span>
                </div>
              </div>

            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div className="space-y-6">

              {/* Admin Top Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      🛡️ Administrator Active
                    </span>
                    <span className="text-xs text-slate-500 font-mono">@{currentUser.username}</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Admin Control Center
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Frontend</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors border border-rose-200 dark:border-rose-900"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Admin Tab Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-fit">
                <button
                  onClick={() => setAdminTab('users')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'users'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>User Accounts</span>
                </button>

                <button
                  onClick={() => setAdminTab('branding')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'branding'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Branding & Logo</span>
                </button>
              </div>

              {/* Tab Contents */}
              {adminTab === 'users' && <AdminUserManagement />}
              {adminTab === 'branding' && <AdminSettingsView />}

            </div>
          )}

        </main>
      </div>

      <MobileBottomNav />

    </div>
  );
}

