
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
      pergi: { waktuBertolak: '', waktuSampai: '', tempohJam: 0, tempohMinit: 0, dari: 'Pejabat', ke: '', jarak: 0, tol: 0, tolMasuk: '', tolKeluar: '', senaraiTol: [] },
      balik: { waktuBertolak: '', waktuSampai: '', tempohJam: 0, tempohMinit: 0, dari: '', ke: 'Pejabat', jarak: 0, tol: 0, tolMasuk: '', tolKeluar: '', senaraiTol: [] }
    };
    onChange([...logs, newJourney]);
  };

  const calculateArrivalTime = (startTime: string, hours: number, minutes: number): string => {
    if (!startTime) return '';
    const [hStr, mStr] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hStr), parseInt(mStr) + (hours * 60) + minutes);
    
    return date.toTimeString().slice(0, 5);
  };

  const addToll = (id: string, legType: 'pergi' | 'balik') => {
    onChange(logs.map(j => {
      if (j.id === id) {
        const currentLeg = j[legType];
        const currentTolls = currentLeg.senaraiTol || [];
        return {
          ...j,
          [legType]: {
            ...currentLeg,
            senaraiTol: [...currentTolls, { id: Math.random().toString(36).substr(2, 9), tolMasuk: '', tolKeluar: '', amaun: 0 }]
          }
        };
      }
      return j;
    }));
  };

  const updateTollField = (id: string, legType: 'pergi' | 'balik', tollId: string, field: 'tolMasuk' | 'tolKeluar' | 'amaun', value: any) => {
    onChange(logs.map(j => {
      if (j.id === id) {
        const currentLeg = j[legType];
        const currentTolls = currentLeg.senaraiTol || [];
        const newTolls = currentTolls.map(t => t.id === tollId ? { ...t, [field]: value } : t);
        const newTotal = newTolls.reduce((sum, t) => sum + (Number(t.amaun) || 0), 0);
        return {
          ...j,
          [legType]: {
            ...currentLeg,
            senaraiTol: newTolls,
            tol: newTotal > 0 || currentTolls.length > 0 ? newTotal : currentLeg.tol
          }
        };
      }
      return j;
    }));
  };

  const removeToll = (id: string, legType: 'pergi' | 'balik', tollId: string) => {
    onChange(logs.map(j => {
      if (j.id === id) {
        const currentLeg = j[legType];
        const currentTolls = currentLeg.senaraiTol || [];
        const newTolls = currentTolls.filter(t => t.id !== tollId);
        const newTotal = newTolls.reduce((sum, t) => sum + (Number(t.amaun) || 0), 0);
        return {
          ...j,
          [legType]: {
            ...currentLeg,
            senaraiTol: newTolls,
            tol: newTotal
          }
        };
      }
      return j;
    }));
  };

  const updateLeg = (id: string, legType: 'pergi' | 'balik', field: keyof JourneyLeg, value: any) => {
    onChange(logs.map(j => {
      if (j.id === id) {
        let updatedLeg = { ...j[legType], [field]: value };
        
        // Auto-calculate waktu sampai if time or duration changes
        if (['waktuBertolak', 'tempohJam', 'tempohMinit'].includes(field)) {
          const newTime = calculateArrivalTime(
            updatedLeg.waktuBertolak,
            updatedLeg.tempohJam || 0,
            updatedLeg.tempohMinit || 0
          );
          updatedLeg.waktuSampai = newTime;
        }

        const updates: any = { [legType]: updatedLeg };
        if (legType === 'pergi' && field === 'ke') updates.balik = { ...j.balik, dari: value };

        return { ...j, ...updates };
      }
      return j;
    }));
  };

  const removeJourney = (id: string) => onChange(logs.filter(j => j.id !== id));

  const inputClass = "w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";

  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log Perjalanan Rasmi</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Sila masukkan butiran perjalanan mengikut kronologi tarikh.</p>
        </div>
        <button onClick={addJourney} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Tambah Rekod
        </button>
      </div>

      <div className="space-y-6">
        {logs.map((journey, idx) => (
          <div key={journey.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                <input 
                  type="date" value={journey.tarikh} 
                  onChange={(e) => onChange(logs.map(l => l.id === journey.id ? { ...l, tarikh: e.target.value } : l))}
                  className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>
              <button onClick={() => removeJourney(journey.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className={labelClass}>Tujuan / Urusan Rasmi</label>
                <input 
                  type="text" value={journey.tujuan} 
                  onChange={(e) => onChange(logs.map(l => l.id === journey.id ? { ...l, tujuan: e.target.value } : l))}
                  className={`${inputClass} font-bold uppercase`} placeholder="CONTOH: MENGHADIRI MESYUARAT DI PUTRAJAYA"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Perjalanan Pergi */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">A. Perjalanan Pergi</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Bertolak</label>
                      <input type="time" value={journey.pergi.waktuBertolak} onChange={(e) => updateLeg(journey.id, 'pergi', 'waktuBertolak', e.target.value)} className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Jangkaan Tempoh</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Jam" value={journey.pergi.tempohJam || ''} onChange={(e) => updateLeg(journey.id, 'pergi', 'tempohJam', parseInt(e.target.value) || 0)} className={`${inputClass} text-center`} />
                        <span className="text-xs font-bold text-slate-400">J</span>
                        <input type="number" placeholder="Minit" value={journey.pergi.tempohMinit || ''} onChange={(e) => updateLeg(journey.id, 'pergi', 'tempohMinit', parseInt(e.target.value) || 0)} className={`${inputClass} text-center`} />
                        <span className="text-xs font-bold text-slate-400">M</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1/2">
                        <label className={labelClass}>Dari</label>
                        <input type="text" value={journey.pergi.dari} onChange={(e) => updateLeg(journey.id, 'pergi', 'dari', e.target.value)} className={inputClass} />
                      </div>
                      <div className="w-1/2">
                        <label className={labelClass}>Ke</label>
                        <input type="text" value={journey.pergi.ke} onChange={(e) => updateLeg(journey.id, 'pergi', 'ke', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Waktu Sampai (Automatik)</label>
                      <input type="time" readOnly value={journey.pergi.waktuSampai} className={`${inputClass} bg-white border-dashed font-bold text-blue-700 cursor-not-allowed`} />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <label className={`${labelClass} mb-0`}>Senarai Tol</label>
                      <button type="button" onClick={() => addToll(journey.id, 'pergi')} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Tambah Tol
                      </button>
                    </div>
                    {(journey.pergi.senaraiTol || []).map((t, tIdx) => (
                      <div key={t.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="col-span-1 text-center text-[10px] font-black text-slate-400">#{tIdx + 1}</div>
                        <div className="col-span-4">
                          <input type="text" placeholder="Tol Masuk" value={t.tolMasuk} onChange={e => updateTollField(journey.id, 'pergi', t.id, 'tolMasuk', e.target.value)} className={`${inputClass} !py-1.5`} />
                        </div>
                        <div className="col-span-4">
                          <input type="text" placeholder="Tol Keluar" value={t.tolKeluar} onChange={e => updateTollField(journey.id, 'pergi', t.id, 'tolKeluar', e.target.value)} className={`${inputClass} !py-1.5`} />
                        </div>
                        <div className="col-span-2">
                          <input type="number" step="0.01" placeholder="RM" value={t.amaun || ''} onChange={e => updateTollField(journey.id, 'pergi', t.id, 'amaun', parseFloat(e.target.value) || 0)} className={`${inputClass} !py-1.5 text-center`} />
                        </div>
                        <div className="col-span-1 text-center">
                          <button type="button" onClick={() => removeToll(journey.id, 'pergi', t.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!journey.pergi.senaraiTol || journey.pergi.senaraiTol.length === 0) && (
                      <div className="text-[11px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">Tiada rekod tol.</div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <div className="w-1/2">
                      <label className={labelClass}>Jumlah Tol (RM)</label>
                      <input type="number" step="0.01" value={journey.pergi.tol} onChange={(e) => updateLeg(journey.id, 'pergi', 'tol', parseFloat(e.target.value) || 0)} className={`${inputClass} text-right font-bold text-blue-600`} />
                      <p className="text-[9px] text-slate-400 mt-1">*Dikira automatik jika ada senarai tol</p>
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>Jarak (KM)</label>
                      <input type="number" step="0.1" value={journey.pergi.jarak} onChange={(e) => updateLeg(journey.id, 'pergi', 'jarak', parseFloat(e.target.value) || 0)} className={`${inputClass} text-right font-black`} />
                    </div>
                  </div>
                </div>

                {/* Perjalanan Balik */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">B. Perjalanan Balik</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={journey.adaBalik} onChange={(e) => onChange(logs.map(l => l.id === journey.id ? { ...l, adaBalik: e.target.checked } : l))} className="rounded border-slate-300 text-slate-900" />
                      <span className="text-[10px] font-bold text-slate-500">Ada Perjalanan Balik</span>
                    </label>
                  </div>

                  {journey.adaBalik ? (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Bertolak</label>
                          <input type="time" value={journey.balik.waktuBertolak} onChange={(e) => updateLeg(journey.id, 'balik', 'waktuBertolak', e.target.value)} className={inputClass} />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Jangkaan Tempoh</label>
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder="Jam" value={journey.balik.tempohJam || ''} onChange={(e) => updateLeg(journey.id, 'balik', 'tempohJam', parseInt(e.target.value) || 0)} className={`${inputClass} text-center`} />
                            <span className="text-xs font-bold text-slate-400">J</span>
                            <input type="number" placeholder="Minit" value={journey.balik.tempohMinit || ''} onChange={(e) => updateLeg(journey.id, 'balik', 'tempohMinit', parseInt(e.target.value) || 0)} className={`${inputClass} text-center`} />
                            <span className="text-xs font-bold text-slate-400">M</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1/2">
                            <label className={labelClass}>Dari</label>
                            <input type="text" value={journey.balik.dari} onChange={(e) => updateLeg(journey.id, 'balik', 'dari', e.target.value)} className={inputClass} />
                          </div>
                          <div className="w-1/2">
                            <label className={labelClass}>Ke</label>
                            <input type="text" value={journey.balik.ke} onChange={(e) => updateLeg(journey.id, 'balik', 'ke', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Waktu Sampai (Automatik)</label>
                          <input type="time" readOnly value={journey.balik.waktuSampai} className={`${inputClass} bg-white border-dashed font-bold text-blue-700 cursor-not-allowed`} />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <label className={`${labelClass} mb-0`}>Senarai Tol</label>
                          <button type="button" onClick={() => addToll(journey.id, 'balik')} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            Tambah Tol
                          </button>
                        </div>
                        {(journey.balik.senaraiTol || []).map((t, tIdx) => (
                          <div key={t.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="col-span-1 text-center text-[10px] font-black text-slate-400">#{tIdx + 1}</div>
                            <div className="col-span-4">
                              <input type="text" placeholder="Tol Masuk" value={t.tolMasuk} onChange={e => updateTollField(journey.id, 'balik', t.id, 'tolMasuk', e.target.value)} className={`${inputClass} !py-1.5`} />
                            </div>
                            <div className="col-span-4">
                              <input type="text" placeholder="Tol Keluar" value={t.tolKeluar} onChange={e => updateTollField(journey.id, 'balik', t.id, 'tolKeluar', e.target.value)} className={`${inputClass} !py-1.5`} />
                            </div>
                            <div className="col-span-2">
                              <input type="number" step="0.01" placeholder="RM" value={t.amaun || ''} onChange={e => updateTollField(journey.id, 'balik', t.id, 'amaun', parseFloat(e.target.value) || 0)} className={`${inputClass} !py-1.5 text-center`} />
                            </div>
                            <div className="col-span-1 text-center">
                              <button type="button" onClick={() => removeToll(journey.id, 'balik', t.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!journey.balik.senaraiTol || journey.balik.senaraiTol.length === 0) && (
                          <div className="text-[11px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">Tiada rekod tol.</div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-2">
                        <div className="w-1/2">
                          <label className={labelClass}>Jumlah Tol (RM)</label>
                          <input type="number" step="0.01" value={journey.balik.tol} onChange={(e) => updateLeg(journey.id, 'balik', 'tol', parseFloat(e.target.value) || 0)} className={`${inputClass} text-right font-bold text-blue-600`} />
                          <p className="text-[9px] text-slate-400 mt-1">*Dikira automatik jika ada senarai tol</p>
                        </div>
                        <div className="w-1/2">
                          <label className={labelClass}>Jarak (KM)</label>
                          <input type="number" step="0.1" value={journey.balik.jarak} onChange={(e) => updateLeg(journey.id, 'balik', 'jarak', parseFloat(e.target.value) || 0)} className={`${inputClass} text-right font-black`} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Hanya Perjalanan Sehala</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-slate-400 font-medium">Klik butang "Tambah Rekod" untuk memulakan pengisian log.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2JourneyLog;
