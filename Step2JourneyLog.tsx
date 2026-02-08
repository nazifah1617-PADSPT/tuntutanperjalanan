
import React from 'react';
import { JourneyGroup, JourneyLeg } from './types';

interface Props {
  logs: JourneyGroup[];
  onChange: (logs: JourneyGroup[]) => void;
}

const Step2JourneyLog: React.FC<Props> = ({ logs, onChange }) => {
  const addJourney = () => {
    const newJourney: JourneyGroup = {
      id: Math.random().toString(36).substr(2, 9),
      tarikh: logs.length > 0 ? logs[logs.length - 1].tarikh : '',
      tujuan: '',
      adaBalik: true,
      pergi: { waktuBertolak: '', waktuSampai: '', dari: 'Pejabat', ke: '', jarak: 0, tol: 0 },
      balik: { waktuBertolak: '', waktuSampai: '', dari: '', ke: 'Pejabat', jarak: 0, tol: 0 }
    };
    onChange([...logs, newJourney]);
  };

  const updateJourney = (id: string, updates: Partial<JourneyGroup>) => {
    onChange(logs.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const updateLeg = (id: string, legType: 'pergi' | 'balik', field: keyof JourneyLeg, value: any) => {
    onChange(logs.map(j => {
      if (j.id === id) {
        const updatedLeg = { ...j[legType], [field]: value };
        
        // Cipta objek kemas kini asas
        const updates: any = { [legType]: updatedLeg };

        // Logik Tambahan: Jika kemas kini destinasi 'pergi', automatik kemas kini punca 'balik'
        if (legType === 'pergi' && field === 'ke') {
          updates.balik = { ...j.balik, dari: value };
        }

        return { ...j, ...updates };
      }
      return j;
    }));
  };

  const removeJourney = (id: string) => {
    onChange(logs.filter(j => j.id !== id));
  };

  const totalKm = logs.reduce((sum, j) => sum + j.pergi.jarak + (j.adaBalik ? j.balik.jarak : 0), 0);
  const totalTol = logs.reduce((sum, j) => sum + j.pergi.tol + (j.adaBalik ? j.balik.tol : 0), 0);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Kenyataan Tuntutan</h2>
          <p className="text-sm text-gray-500">Masukkan maklumat perjalanan anda mengikut tugasan.</p>
        </div>
        <button 
          onClick={addJourney}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Tambah Tugasan Baru
        </button>
      </div>

      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-gray-400 font-medium">Tiada rekod perjalanan</h3>
            <p className="text-gray-300 text-sm">Klik butang di atas untuk memulakan tuntutan anda.</p>
          </div>
        ) : logs.map((journey, idx) => (
          <div key={journey.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header Kad */}
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-2xl flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <input 
                    type="date" value={journey.tarikh} 
                    onChange={(e) => updateJourney(journey.id, { tarikh: e.target.value })}
                    className="bg-transparent border-none text-sm font-bold text-gray-700 p-0 focus:ring-0"
                  />
                </div>
              </div>
              <button 
                onClick={() => removeJourney(journey.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            {/* Kandungan Kad */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tujuan / Nama Program (Contoh: Mesyuarat PTG)</label>
                <input 
                  type="text" value={journey.tujuan} 
                  onChange={(e) => updateJourney(journey.id, { tujuan: e.target.value })}
                  className="w-full text-lg font-bold border-none p-0 focus:ring-0 placeholder-gray-200"
                  placeholder="MASUKKAN TUJUAN PERJALANAN..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                {/* Bahagian Pergi */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Perjalanan Pergi</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                         <span className="text-[9px] text-gray-400 font-bold uppercase">Waktu Bertolak</span>
                         <input type="time" value={journey.pergi.waktuBertolak} onChange={(e) => updateLeg(journey.id, 'pergi', 'waktuBertolak', e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] text-gray-400 font-bold uppercase">Waktu Sampai</span>
                         <input type="time" value={journey.pergi.waktuSampai} onChange={(e) => updateLeg(journey.id, 'pergi', 'waktuSampai', e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" value={journey.pergi.dari} onChange={(e) => updateLeg(journey.id, 'pergi', 'dari', e.target.value)} placeholder="Dari..." className="w-1/2 border-b border-gray-200 bg-transparent text-xs p-1 focus:outline-none focus:border-blue-500" />
                      <span className="text-gray-300 text-xs">→</span>
                      <input type="text" value={journey.pergi.ke} onChange={(e) => updateLeg(journey.id, 'pergi', 'ke', e.target.value)} placeholder="Ke..." className="w-1/2 border-b border-gray-200 bg-transparent text-xs p-1 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="relative">
                         <span className="absolute left-2 top-2 text-[9px] font-bold text-gray-400">RM</span>
                         <input type="number" step="0.01" value={journey.pergi.tol} onChange={(e) => updateLeg(journey.id, 'pergi', 'tol', parseFloat(e.target.value) || 0)} placeholder="Tol" className="w-full border rounded-lg p-2 pl-7 text-xs text-right font-mono" title="Tol" />
                       </div>
                       <div className="relative">
                         <span className="absolute right-2 top-2 text-[9px] font-bold text-gray-400">KM</span>
                         <input type="number" step="0.1" value={journey.pergi.jarak} onChange={(e) => updateLeg(journey.id, 'pergi', 'jarak', parseFloat(e.target.value) || 0)} placeholder="Jarak" className="w-full border rounded-lg p-2 pr-7 text-xs text-right font-mono font-bold" title="Jarak" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Bahagian Balik */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Perjalanan Balik</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={journey.adaBalik} onChange={(e) => updateJourney(journey.id, { adaBalik: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Sama Hari</span>
                    </label>
                  </div>
                  {journey.adaBalik ? (
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <span className="text-[9px] text-gray-400 font-bold uppercase">Waktu Bertolak</span>
                           <input type="time" value={journey.balik.waktuBertolak} onChange={(e) => updateLeg(journey.id, 'balik', 'waktuBertolak', e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                         </div>
                         <div className="space-y-1">
                           <span className="text-[9px] text-gray-400 font-bold uppercase">Waktu Sampai</span>
                           <input type="time" value={journey.balik.waktuSampai} onChange={(e) => updateLeg(journey.id, 'balik', 'waktuSampai', e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={journey.balik.dari} onChange={(e) => updateLeg(journey.id, 'balik', 'dari', e.target.value)} placeholder="Dari..." className="w-1/2 border-b border-gray-200 bg-transparent text-xs p-1 focus:outline-none focus:border-blue-500" />
                        <span className="text-gray-300 text-xs">→</span>
                        <input type="text" value={journey.balik.ke} onChange={(e) => updateLeg(journey.id, 'balik', 'ke', e.target.value)} placeholder="Ke..." className="w-1/2 border-b border-gray-200 bg-transparent text-xs p-1 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                           <span className="absolute left-2 top-2 text-[9px] font-bold text-gray-400">RM</span>
                           <input type="number" step="0.01" value={journey.balik.tol} onChange={(e) => updateLeg(journey.id, 'balik', 'tol', parseFloat(e.target.value) || 0)} placeholder="Tol" className="w-full border rounded-lg p-2 pl-7 text-xs text-right font-mono" title="Tol" />
                         </div>
                         <div className="relative">
                           <span className="absolute right-2 top-2 text-[9px] font-bold text-gray-400">KM</span>
                           <input type="number" step="0.1" value={journey.balik.jarak} onChange={(e) => updateLeg(journey.id, 'balik', 'jarak', parseFloat(e.target.value) || 0)} placeholder="Jarak" className="w-full border rounded-lg p-2 pr-7 text-xs text-right font-mono font-bold" title="Jarak" />
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/50 rounded-2xl p-10 border-2 border-dashed border-gray-100 flex items-center justify-center">
                       <span className="text-[10px] font-bold text-gray-300 uppercase italic">Tiada perjalanan balik direkodkan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-end gap-6">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-gray-400 uppercase">Subjumlah Tol</span>
                   <span className="text-sm font-mono text-blue-600">RM {(journey.pergi.tol + (journey.adaBalik ? journey.balik.tol : 0)).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-gray-400 uppercase">Subjumlah Jarak</span>
                   <span className="text-sm font-mono font-bold text-gray-700">{(journey.pergi.jarak + (journey.adaBalik ? journey.balik.jarak : 0)).toFixed(1)} KM</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Rumusan */}
      <div className="mt-8 bg-blue-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
            <div className="bg-blue-800 p-3 rounded-2xl">
               <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
               <h4 className="text-xs font-bold text-blue-300 uppercase tracking-widest">Kiraan Automatik</h4>
               <p className="text-sm text-blue-100">Jumlah dari semua kad perjalanan di atas.</p>
            </div>
         </div>
         <div className="flex gap-12">
            <div className="text-right">
               <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Tol</span>
               <span className="text-3xl font-black font-mono">RM {totalTol.toFixed(2)}</span>
            </div>
            <div className="text-right">
               <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Jarak</span>
               <span className="text-3xl font-black font-mono">{totalKm.toFixed(1)} <small className="text-sm font-bold">KM</small></span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Step2JourneyLog;
