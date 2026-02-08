
import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase';

interface Props {
  onLoginSuccess: () => void;
}

export default function Auth({ onLoginSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError('E-mel atau kata laluan tidak sah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="bg-slate-900 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tuntutan Perjalanan</h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-2">Sistem Pengurusan WP 1.4</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-xs font-bold border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mel Rasmi</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg p-3 outline-none transition-all text-sm font-medium"
                placeholder="emel@jabatan.gov.my"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kata Laluan</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-lg p-3 outline-none transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${loading ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
            >
              {loading ? 'Sila Tunggu...' : isLogin ? 'Log Masuk' : 'Daftar Akaun'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              {isLogin ? 'Tiada Akaun? Daftar Sini' : 'Sudah Berdaftar? Log Masuk'}
            </button>
          </div>
        </div>
        <p className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-8 italic">© 2025 Portal Tuntutan WP 1.4 Digital</p>
      </div>
    </div>
  );
}
