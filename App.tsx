
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

const STEPS = ['Pegawai', 'Log', 'Bhg A', 'Bhg B', 'Rumusan'];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ClaimState>(initialClaim);
  const [currentDraftId, setCurrentDraftId] = useState<string>(() => 'draft_' + Date.now());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);
  const [allDrafts, setAllDrafts] = useState<Record<string, DraftEntry>>({});

  // 1. Semak status Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Ambil data draf selepas login
  useEffect(() => {
    if (user) {
      const initData = async () => {
        setSaveStatus('saving');
        const data = await persistence.fetchDraftsForUser(user.uid);
        setAllDrafts(data);
        
        const lastId = Object.keys(data).sort((a, b) => 
          new Date(data[b].lastUpdated).getTime() - new Date(data[a].lastUpdated).getTime()
        )[0];
        
        if (lastId) {
          setCurrentDraftId(lastId);
          setFormData(data[lastId].data);
        }
        setSaveStatus('saved');
      };
      initData();
    }
  }, [user]);

  // 3. Auto-Save
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

  const createNewDraft = () => {
    setCurrentDraftId('draft_' + Date.now());
    setFormData(initialClaim);
    setIsDraftMenuOpen(false);
  };

  const loadDraft = (id: string) => {
    const draft = allDrafts[id];
    if (draft) {
      setCurrentDraftId(id);
      setFormData(draft.data);
      setIsDraftMenuOpen(false);
      setCurrentStep(0);
    }
  };

  if (authChecking) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Memulakan e-Tuntutan...</p>
      </div>
    </div>
  );

  if (!user) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-24 bg-gray-50 flex flex-col">
      {/* Drawer Menu Draf */}
      {isDraftMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end no-print backdrop-blur-sm">
          <div className="w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slideLeft border-l border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-gray-800 uppercase italic tracking-tighter">Draf Perjalanan</h3>
              <button onClick={() => setIsDraftMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <button onClick={createNewDraft} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mb-6 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Tuntutan Baru
            </button>

            <div className="space-y-3">
              {Object.values(allDrafts).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(draft => (
                <div key={draft.id} onClick={() => loadDraft(draft.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${draft.id === currentDraftId ? 'border-blue-500 bg-blue-50' : 'border-gray-50 bg-white hover:border-blue-200'}`}>
                  <div className="font-bold text-sm truncate uppercase">{draft.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-mono">{new Date(draft.lastUpdated).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t">
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Utama */}
      <header className="bg-blue-900 text-white p-6 shadow-xl no-print sticky top-0 z-[60]">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsDraftMenuOpen(true)} className="bg-blue-800 p-3 rounded-2xl hover:bg-blue-700 border border-blue-700 shadow-inner transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">e-Tuntutan <span className="text-blue-400">WP1.4</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest">
                  {user.email} • {saveStatus === 'saving' ? 'Menyelaras...' : 'Terselaras'}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-blue-300 tracking-tighter">Status Akaun</span>
             <span className="text-xs font-bold text-white uppercase">Daftar Aktif</span>
          </div>
        </div>
      </header>

      {/* Langkah & Borang */}
      <main className="max-w-5xl mx-auto px-4 mt-8 flex-grow w-full">
        <div className="flex justify-center gap-2 mb-10 no-print overflow-x-auto py-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${currentStep === idx ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-gray-400 border border-gray-100'}`}>
              <span className="text-sm font-black">{idx + 1}</span>
              <span className="text-[10px] font-bold uppercase hidden md:inline">{step}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200 border border-gray-100 p-8 md:p-12 mb-24 min-h-[500px]">
          {currentStep === 0 && <Step1OfficerInfo info={formData.info} onChange={(i) => setFormData(p => ({ ...p, info: { ...p.info, ...i } }))} />}
          {currentStep === 1 && <Step2JourneyLog logs={formData.logs} onChange={(l) => setFormData(p => ({ ...p, logs: l }))} />}
          {currentStep === 2 && <Step3PartA logs={formData.logs} vehicleType={formData.info.kenderaanJenis} transport={formData.transport} meals={formData.meals} onTransportChange={(t) => setFormData(p => ({ ...p, transport: { ...p.transport, ...t } }))} onMealsChange={(m) => setFormData(p => ({ ...p, meals: { ...p.meals, ...m } }))} />}
          {currentStep === 3 && <Step4PartB lodgings={formData.lodgings} onChange={(l) => setFormData(p => ({ ...p, lodgings: l }))} />}
          {currentStep === 4 && <Step5Summary data={formData} onMiscChange={(m) => setFormData(p => ({ ...p, misc: { ...p.misc, ...m } }))} onAdvanceChange={(a) => setFormData(p => ({ ...p, advance: a }))} />}
        </div>
      </main>

      {/* Navigasi Bawah */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 z-50 no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(p => Math.max(0, p - 1))} 
            disabled={currentStep === 0}
            className={`px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${currentStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Kembali
          </button>
          <button 
            onClick={() => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1))} 
            disabled={currentStep === STEPS.length - 1}
            className={`px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${currentStep === STEPS.length - 1 ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}
          >
            Langkah Seterusnya
          </button>
        </div>
      </footer>
    </div>
  );
}
