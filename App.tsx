
import React, { useState, useEffect } from 'react';
import { ClaimState, JourneyGroup, HotelLodging } from './types';
import { KADAR_MAKAN } from './constants';
import { persistence, DraftEntry } from './persistence';
import { auth, onAuthStateChanged, signOut } from './firebase';
import Step1OfficerInfo from './Step1OfficerInfo';
import Step2JourneyLog from './Step2JourneyLog';
import Step3PartA from './Step3PartA';
import Step4PartB from './Step4PartB';
import Step5Summary from './Step5Summary';
import Auth from './Auth';

const initialClaim: ClaimState = {
  info: {
    nama: '', ic: '', jawatan: '', gred: '', akaunBank: '', namaBank: '', telefon: '',
    gaji: 0, elaun: 0, kenderaanJenis: 'Kereta', kenderaanModel: '', noPendaftaran: '',
    alamatPejabat: '', alamatRumah: ''
  },
  logs: [],
  transport: { teksi: 0, bas: 0, keretaApi: 0, feri: 0, lainLain: 0 },
  meals: {
    sarapan: { bil: 0, hari: 0, kadar: KADAR_MAKAN.SARAPAN },
    makanTengahHari: { bil: 0, hari: 0, kadar: KADAR_MAKAN.MAKAN_TENGAH_HARI },
    makanMalam: { bil: 0, hari: 0, kadar: KADAR_MAKAN.MAKAN_MALAM },
    harian: { bil: 0, hari: 0, kadar: KADAR_MAKAN.HARIAN },
  },
  lodgings: [],
  misc: { telefon: 0, pos: 0, dobi: 0, airportTax: 0, lebihanBagasi: 0, parking: 0, tol: 0 },
  advance: 0
};

const STEPS = [
  { label: 'MAKLUMAT PEGAWAI', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'LOG PERJALANAN', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9' },
  { label: 'BAHAGIAN A', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'BAHAGIAN B', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'RUMUSAN', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ClaimState>(initialClaim);
  const [currentDraftId, setCurrentDraftId] = useState<string>(() => 'draft_' + Date.now());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);
  const [allDrafts, setAllDrafts] = useState<Record<string, DraftEntry>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const initData = async () => {
        setSaveStatus('saving');
        const data = await persistence.fetchDraftsForUser(user.uid);
        setAllDrafts(data);
        const lastId = Object.keys(data).sort((a, b) => new Date(data[b].lastUpdated).getTime() - new Date(data[a].lastUpdated).getTime())[0];
        if (lastId) {
          setCurrentDraftId(lastId);
          setFormData(data[lastId].data);
        }
        setSaveStatus('saved');
      };
      initData();
    }
  }, [user]);

  useEffect(() => {
    if (user && (formData.info.nama || formData.logs.length > 0)) {
      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        const name = formData.info.nama || 'Tuntutan Tanpa Nama';
        const success = await persistence.saveDraft(currentDraftId, user.uid, name, formData);
        setAllDrafts(persistence.getAllDrafts());
        setSaveStatus(success ? 'saved' : 'error');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, currentDraftId, user]);

  const handleLogout = async () => {
    await signOut(auth);
    setFormData(initialClaim);
    setCurrentStep(0);
  };

  if (authChecking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Memuatkan Sistem...</p>
      </div>
    </div>
  );

  if (!user) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Sidebar for Drafts (Professional clean design) */}
      {isDraftMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-[100] flex justify-end no-print backdrop-blur-[2px]">
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col animate-slideLeft border-l border-slate-100">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Arkib Tuntutan</h3>
                <button onClick={() => setIsDraftMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <button onClick={() => { setCurrentDraftId('draft_'+Date.now()); setFormData(initialClaim); setIsDraftMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  TUNTUTAN BARU
                </button>
                <div className="h-px bg-slate-100 w-full my-2"></div>
                {Object.values(allDrafts).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(draft => (
                  <div key={draft.id} onClick={() => { setCurrentDraftId(draft.id); setFormData(draft.data); setIsDraftMenuOpen(false); setCurrentStep(0); }} className={`p-4 rounded-xl border transition-all cursor-pointer ${draft.id === currentDraftId ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <div className="font-bold text-xs text-slate-800 truncate uppercase tracking-tight">{draft.name || 'Draf Tanpa Nama'}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5 font-semibold">{new Date(draft.lastUpdated).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
             </div>
             <div className="p-6 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full py-3 text-slate-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-200 rounded-xl">
                   LOG KELUAR SISTEM
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Header Korporat */}
      <header className="bg-white border-b border-slate-200 no-print sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsDraftMenuOpen(true)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">Tuntutan Perjalanan Dalam Negeri</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                  {saveStatus === 'saving' ? 'Menyelaras Data...' : 'Sistem Terselaras'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pegawai Terlog</span>
                <span className="text-xs font-bold text-slate-700">{user.email}</span>
             </div>
             <div className="bg-slate-900 px-3 py-1.5 rounded-lg hidden sm:block">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">WP 1.4 Digital</span>
             </div>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto w-full px-6 flex-grow mt-10">
        
        {/* Stepper Korporat */}
        <nav className="mb-10 no-print">
          <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto no-scrollbar">
            {STEPS.map((step, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-3 py-5 border-b-2 transition-all px-4 ${currentStep === idx ? 'border-slate-900' : 'border-transparent opacity-40 hover:opacity-70'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${currentStep === idx ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap ${currentStep === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Kad Konten */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-24 min-h-[600px]">
          <div className="p-8 md:p-12 lg:p-16">
            {currentStep === 0 && <Step1OfficerInfo info={formData.info} onChange={(i) => setFormData(p => ({ ...p, info: { ...p.info, ...i } }))} />}
            {currentStep === 1 && <Step2JourneyLog logs={formData.logs} onChange={(l) => setFormData(p => ({ ...p, logs: l }))} />}
            {currentStep === 2 && <Step3PartA logs={formData.logs} vehicleType={formData.info.kenderaanJenis} transport={formData.transport} meals={formData.meals} onTransportChange={(t) => setFormData(p => ({ ...p, transport: { ...p.transport, ...t } }))} onMealsChange={(m) => setFormData(p => ({ ...p, meals: { ...p.meals, ...m } }))} />}
            {currentStep === 3 && <Step4PartB lodgings={formData.lodgings} onChange={(l) => setFormData(p => ({ ...p, lodgings: l }))} />}
            {currentStep === 4 && <Step5Summary data={formData} onMiscChange={(m) => setFormData(p => ({ ...p, misc: { ...p.misc, ...m } }))} onAdvanceChange={(a) => setFormData(p => ({ ...p, advance: a }))} />}
          </div>
        </div>
      </main>

      {/* Bar Kawalan Bawah */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-5 z-50 no-print">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentStep(p => Math.max(0, p - 1)); }} 
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            KEMBALI
          </button>
          
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] hidden sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>

          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentStep(p => Math.min(STEPS.length - 1, p + 1)); }} 
            disabled={currentStep === STEPS.length - 1}
            className={`flex items-center gap-2 px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === STEPS.length - 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
          >
            {currentStep === STEPS.length - 1 ? 'SELESAI' : 'SETERUSNYA'}
            {currentStep < STEPS.length - 1 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>}
          </button>
        </div>
      </footer>
    </div>
  );
}
