
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
  { label: 'Maklumat Pegawai', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Log Perjalanan', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9' },
  { label: 'Bahagian A', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Bahagian B', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Rumusan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
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
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Sila Tunggu...</p>
      </div>
    </div>
  );

  if (!user) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Sidebar for Drafts (Professional clean design) */}
      {isDraftMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-[100] flex justify-end no-print backdrop-blur-[2px]">
          <div className="w-80 bg-white h-full shadow-xl flex flex-col animate-slideLeft">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Senarai Draf</h3>
                <button onClick={() => setIsDraftMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <button onClick={() => { setCurrentDraftId('draft_'+Date.now()); setFormData(initialClaim); setIsDraftMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tuntutan Baru
                </button>
                {Object.values(allDrafts).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(draft => (
                  <div key={draft.id} onClick={() => { setCurrentDraftId(draft.id); setFormData(draft.data); setIsDraftMenuOpen(false); setCurrentStep(0); }} className={`p-4 rounded-lg border cursor-pointer transition-all ${draft.id === currentDraftId ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <div className="font-bold text-xs text-slate-800 truncate uppercase">{draft.name || 'Draf Tanpa Nama'}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(draft.lastUpdated).toLocaleDateString('ms-MY')}</div>
                  </div>
                ))}
             </div>
             <div className="p-6 border-t">
                <button onClick={handleLogout} className="w-full py-2.5 text-slate-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200 rounded-lg">
                   Log Keluar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Modern Professional Header */}
      <header className="bg-white border-b border-slate-200 no-print sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDraftMenuOpen(true)} className="p-2.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Tuntutan Perjalanan Dalam Negeri</h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                  {saveStatus === 'saving' ? 'Sedang Menyimpan...' : 'Data Terselaras'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pengguna Terlog</span>
                <span className="text-xs font-semibold text-slate-700">{user.email}</span>
             </div>
             <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:block">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WP 1.4 Digital</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-6 flex-grow mt-8">
        
        {/* Clean Stepper */}
        <nav className="mb-8 no-print overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] border-b border-slate-200">
            {STEPS.map((step, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-3 py-4 border-b-2 transition-all px-2 ${currentStep === idx ? 'border-blue-600 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${currentStep === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {idx + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide whitespace-nowrap ${currentStep === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-24 min-h-[600px]">
          <div className="p-8 md:p-12 lg:p-16">
            {currentStep === 0 && <Step1OfficerInfo info={formData.info} onChange={(i) => setFormData(p => ({ ...p, info: { ...p.info, ...i } }))} />}
            {currentStep === 1 && <Step2JourneyLog logs={formData.logs} onChange={(l) => setFormData(p => ({ ...p, logs: l }))} />}
            {currentStep === 2 && <Step3PartA logs={formData.logs} vehicleType={formData.info.kenderaanJenis} transport={formData.transport} meals={formData.meals} onTransportChange={(t) => setFormData(p => ({ ...p, transport: { ...p.transport, ...t } }))} onMealsChange={(m) => setFormData(p => ({ ...p, meals: { ...p.meals, ...m } }))} />}
            {currentStep === 3 && <Step4PartB lodgings={formData.lodgings} onChange={(l) => setFormData(p => ({ ...p, lodgings: l }))} />}
            {currentStep === 4 && <Step5Summary data={formData} onMiscChange={(m) => setFormData(p => ({ ...p, misc: { ...p.misc, ...m } }))} onAdvanceChange={(a) => setFormData(p => ({ ...p, advance: a }))} />}
          </div>
        </div>
      </main>

      {/* Professional Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-5 z-50 no-print">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentStep(p => Math.max(0, p - 1)); }} 
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Kembali
          </button>
          
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] hidden sm:block">
            Langkah {currentStep + 1} daripada {STEPS.length}
          </div>

          <button 
            onClick={() => { window.scrollTo(0,0); setCurrentStep(p => Math.min(STEPS.length - 1, p + 1)); }} 
            disabled={currentStep === STEPS.length - 1}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${currentStep === STEPS.length - 1 ? 'bg-green-100 text-green-700 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {currentStep === STEPS.length - 1 ? 'Selesai' : 'Seterusnya'}
            {currentStep < STEPS.length - 1 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
          </button>
        </div>
      </footer>
    </div>
  );
}
