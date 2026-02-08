
import React from 'react';
import { ClaimState, MiscExpenses } from './types';
import { KADAR_KERETA, KADAR_MOTOSIKAL } from './constants';

interface Props {
  data: ClaimState;
  onMiscChange: (misc: Partial<MiscExpenses>) => void;
  onAdvanceChange: (val: number) => void;
}

const Step5Summary: React.FC<Props> = ({ data, onMiscChange, onAdvanceChange }) => {
  const handleMisc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onMiscChange({ [name]: parseFloat(value) || 0 });
  };

  // Helper Formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    let [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Calculations
  const totalKm = data.logs.reduce((sum, j) => sum + (Number(j.pergi.jarak) || 0) + (j.adaBalik ? (Number(j.balik.jarak) || 0) : 0), 0);
  const totalTolLogs = data.logs.reduce((sum, j) => sum + (Number(j.pergi.tol) || 0) + (j.adaBalik ? (Number(j.balik.tol) || 0) : 0), 0);
  
  const isKereta = data.info.kenderaanJenis === 'Kereta';
  const kadar = isKereta ? KADAR_KERETA : KADAR_MOTOSIKAL;
  
  const km1 = Math.min(totalKm, 500);
  const km2 = Math.max(0, totalKm - 500);
  const amt1 = km1 * kadar.pertama;
  const amt2 = km2 * kadar.seterusnya;
  const mileageTotal = amt1 + amt2;

  const transportTotal = (Number(data.transport.teksi) || 0) + (Number(data.transport.bas) || 0) + (Number(data.transport.keretaApi) || 0) + (Number(data.transport.feri) || 0) + (Number(data.transport.lainLain) || 0);
  
  const mealTotal = 
    ((Number(data.meals.sarapan.bil) || 0) * (Number(data.meals.sarapan.hari) || 0) * (Number(data.meals.sarapan.kadar) || 0)) +
    ((Number(data.meals.makanTengahHari.bil) || 0) * (Number(data.meals.makanTengahHari.hari) || 0) * (Number(data.meals.makanTengahHari.kadar) || 0)) +
    ((Number(data.meals.makanMalam.bil) || 0) * (Number(data.meals.makanMalam.hari) || 0) * (Number(data.meals.makanMalam.kadar) || 0));

  const harianTotal = ((Number(data.meals.harian.bil) || 0) * (Number(data.meals.harian.hari) || 0) * (Number(data.meals.harian.kadar) || 0));
  
  const sectionAMealHarianTotal = mealTotal + harianTotal;
  const partATotal = mileageTotal + transportTotal + sectionAMealHarianTotal;
  const partBTotal = data.lodgings.reduce((sum, l) => sum + ((Number(l.bilangan) || 0) * (Number(l.kadar) || 0)), 0);
  
  const getMiscVal = (key: keyof MiscExpenses) => Number(data.misc[key]) || 0;

  const miscManualTotal = 
    getMiscVal('telefon') + 
    getMiscVal('pos') + 
    getMiscVal('dobi') + 
    getMiscVal('airportTax') + 
    getMiscVal('lebihanBagasi') + 
    getMiscVal('parking');
  
  const miscTotal = miscManualTotal + totalTolLogs + getMiscVal('tol') + getMiscVal('saringan') + getMiscVal('kemasukanPremis');
  
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - (Number(data.advance) || 0);

  const hotels = data.lodgings.filter(l => l.jenis === 'Hotel');
  const lojingsOnly = data.lodgings.filter(l => l.jenis === 'Lojing');

  const bulanTuntutan = data.logs[0]?.tarikh 
    ? new Date(data.logs[0].tarikh).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }).toUpperCase() 
    : 'JANUARI 2025';

  return (
    <div className="space-y-12">
      {/* UI INTERAKTIF (NO-PRINT) */}
      <div className="no-print space-y-8 animate-fadeIn">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b pb-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Bahagian C: Belanja Pelbagai</h2>
              <p className="text-sm text-gray-400">Masukkan resit tol, parking dan lain-lain belanja.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                Tol Automatik dari Log: RM {totalTolLogs.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {Object.entries(data.misc).map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="relative group">
                  <span className="absolute left-4 top-3 text-gray-300 text-xs font-bold group-focus-within:text-blue-500 transition-colors">RM</span>
                  <input 
                    type="number" name={key} value={value} onChange={handleMisc}
                    className="w-full border-2 border-gray-50 rounded-2xl p-3 pl-11 text-sm focus:border-blue-500 focus:bg-white bg-gray-50/50 outline-none text-right font-bold transition-all"
                    disabled={key === 'tol' && totalTolLogs > 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="relative z-10">
              <h2 className="text-xl font-bold border-b border-slate-800 pb-6 mb-8 uppercase tracking-widest text-slate-400 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                 Rumusan Keseluruhan Tuntutan
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Bahagian A</span>
                      <span className="text-xl font-mono font-bold">RM {partATotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Bahagian B</span>
                      <span className="text-xl font-mono font-bold">RM {partBTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Bahagian C</span>
                      <span className="text-xl font-mono font-bold">RM {miscTotal.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="lg:col-span-2 bg-slate-800/40 rounded-[2rem] p-8 border border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="text-center md:text-left">
                          <span className="text-slate-400 uppercase text-[10px] font-black tracking-widest block mb-2">Jumlah Kasar (A+B+C)</span>
                          <span className="text-5xl font-black text-white">RM {grandTotal.toFixed(2)}</span>
                       </div>
                       <div className="h-12 w-[1px] bg-slate-700 hidden md:block"></div>
                       <div className="text-center md:text-right">
                          <span className="text-amber-500 uppercase text-[10px] font-black tracking-widest block mb-2 underline decoration-amber-500/30 underline-offset-4">Tolak: Pendahuluan Diri</span>
                          <div className="flex items-center justify-center md:justify-end gap-2">
                             <span className="text-amber-400 text-lg font-bold">RM</span>
                             <input 
                                type="number" value={data.advance} onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-b-2 border-amber-500/30 text-right font-black w-28 outline-none text-amber-500 text-3xl focus:border-amber-500 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center">
                       <span className="text-emerald-400 uppercase text-xs font-black tracking-widest">Baki Bersih Dituntut</span>
                       <span className="text-5xl font-black text-emerald-400">RM {nettTotal.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <div className="flex flex-col items-center gap-4 py-8">
          <button 
            onClick={() => window.print()} 
            className="group relative bg-slate-900 hover:bg-slate-800 text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-4 overflow-hidden"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            JANA LAMPIRAN C (PDF)
          </button>
        </div>
      </div>

      <div className="print-only">
        {/* MUKA SURAT 1-3 DIABAIKAN UNTUK KEPENTINGAN RUANG, KEKALKAN LOGIK SEDIA ADA */}
        {/* ... */}
        
        <div className="page-break"></div>

        {/* MUKA SURAT 4: BAHAGIAN B (PENAILAN BARU) */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[12pt] border-b-[1.5px] border-black bg-white tracking-[0.1em]">BAHAGIAN B</div>
          
          {/* HEADER WILAYAH */}
          <div className="flex border-b border-black">
            <div className="w-1/2 border-r border-black font-bold py-2 uppercase text-center text-[8pt] px-2 flex items-center justify-center">
              TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SEMENANJUNG MALAYSIA)
            </div>
            <div className="w-1/2 font-bold py-2 uppercase text-center text-[8pt] px-2 flex items-center justify-center">
              TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SABAH/ SARAWAK /WP LABUAN)
            </div>
          </div>

          {/* BARIS BSH */}
          <div className="flex border-b border-black min-h-[80px]">
            <div className="w-1/2 border-r border-black p-2 flex">
              <div className="flex-1 text-[8.5pt] leading-relaxed">
                BSH x <span className="font-bold border-b border-black px-1">{hotels[0]?.bilangan || '____'}</span> sebanyak RM <span className="font-bold border-b border-black px-1">{(Number(hotels[0]?.kadar) || 0).toFixed(2)}</span> /hari.<br/>
                <span className="text-[7.5pt] italic">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</span><br/><br/>
                [Resit <span className="font-bold border-b border-black px-1">{hotels[0] ? 'DISERTAKAN' : '________________'}</span>]
              </div>
              <div className="w-24 border-l border-black flex flex-col -mt-2 -mb-2">
                 <div className="h-full flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold text-[9pt]">
                      {hotels[0] ? ((Number(hotels[0].bilangan)||0) * (Number(hotels[0].kadar)||0)).toFixed(2) : '0.00'}
                    </div>
                 </div>
              </div>
            </div>
            <div className="w-1/2 p-2 flex">
              <div className="flex-1 text-[8.5pt] leading-relaxed">
                BSH x ________ sebanyak RM ________ /hari.<br/>
                <span className="text-[7.5pt] italic">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</span><br/><br/>
                [Resit ________________________]
              </div>
              <div className="w-24 border-l border-black flex flex-col -mt-2 -mb-2">
                 <div className="h-full flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* HEADER ELAUN LOJING */}
          <div className="flex border-b border-black">
            <div className="w-1/2 border-r border-black font-bold py-2 uppercase text-center text-[8pt] px-2 flex items-center justify-center">
              TUNTUTAN ELAUN LOJING<br/>(SEMENANJUNG MALAYSIA)
            </div>
            <div className="w-1/2 font-bold py-2 uppercase text-center text-[8pt] px-2 flex items-center justify-center">
              TUNTUTAN ELAUN LOJING<br/>(SABAH/ SARAWAK /WP LABUAN)
            </div>
          </div>

          {/* BARIS LOJING */}
          <div className="flex border-b border-black min-h-[40px]">
            <div className="w-1/2 border-r border-black p-2 flex">
              <div className="flex-1 text-[8.5pt]">
                Elaun Lojing x <span className="font-bold border-b border-black px-1">{lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + (Number(l.bilangan)||0), 0) : '____'}</span> sebanyak RM <span className="font-bold border-b border-black px-1">{(Number(lojingsOnly[0]?.kadar) || 0).toFixed(2)}</span> /hari
              </div>
              <div className="w-24 border-l border-black flex flex-col -mt-2 -mb-2">
                 <div className="h-full flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold text-[9pt]">
                      {lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + ((Number(l.bilangan)||0) * (Number(l.kadar)||0)), 0).toFixed(2) : '0.00'}
                    </div>
                 </div>
              </div>
            </div>
            <div className="w-1/2 p-2 flex">
              <div className="flex-1 text-[8.5pt]">
                Elaun Lojing x ________ sebanyak RM ________ /hari
              </div>
              <div className="w-24 border-l border-black flex flex-col -mt-2 -mb-2">
                 <div className="h-full flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* ALAMAT LOJING */}
          <div className="flex border-b border-black min-h-[80px]">
            <div className="w-1/2 border-r border-black p-2">
              <div className="text-[8.5pt] font-bold">TARIKH LOJING: <span className="font-black ml-1">{lojingsOnly[0]?.tarikh ? formatDate(lojingsOnly[0].tarikh) : '________________'}</span></div>
              <div className="text-[8.5pt] font-bold mt-1">ALAMAT LOJING:</div>
              <div className="text-[8pt] mt-1 uppercase leading-tight font-black">{lojingsOnly[0]?.alamat || ''}</div>
            </div>
            <div className="w-1/2 p-2">
              <div className="text-[8.5pt] font-bold">TARIKH LOJING: ________________</div>
              <div className="text-[8.5pt] font-bold mt-1">ALAMAT LOJING:</div>
            </div>
          </div>

          {/* JUMLAH BAHAGIAN B */}
          <div className="flex bg-white">
            <div className="flex-1 py-3 text-right pr-4 font-black uppercase text-[10pt] tracking-widest">
              JUMLAH (BAHAGIAN B)
            </div>
            <div className="w-24 border-l border-black flex">
              <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[10pt]">RM</div>
              <div className="flex-1 flex items-center justify-end px-2 font-black text-[10pt]">
                {partBTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="text-[7.5pt] italic mt-1 font-bold text-gray-500">- Sila tambah ruangan jika tidak mencukupi</div>

        <div className="page-break"></div>

        {/* MUKA SURAT 5: BAHAGIAN C & PENGAKUAN (KEKALKAN LOGIK SEDIA ADA) */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[11pt] border-b-[1.5px] border-black bg-white">BAHAGIAN C</div>
          <div className="text-center font-bold py-1 uppercase text-[10pt] border-b-[1.5px] border-black bg-white">BELANJA PELBAGAI</div>
          <table className="w-full border-collapse">
            <tbody className="text-[9.5pt]">
              {/* Item-item Bahagian C mengikut screenshot terdahulu */}
              <tr className="border-b border-black">
                <td className="px-4 py-2 leading-tight">Telefon, Telegram , Faks [Resit <span className="font-bold border-b border-black inline-block min-w-[200px]">{getMiscVal('telefon') > 0 ? 'DISERTAKAN' : ''}</span>]</td>
                <td className="border-l border-black w-8 text-center font-bold">RM</td>
                <td className="border-l border-black w-32 text-right px-2 font-bold">{getMiscVal('telefon') > 0 ? getMiscVal('telefon').toFixed(2) : ''}</td>
              </tr>
              {/* ... item lain ... */}
              <tr className="border-b border-black">
                <td className="px-4 py-2 leading-tight">Tol [Resit/Penyata Touch&Go /RFID/Lain-lain: <span className="font-bold border-b border-black inline-block min-w-[200px]">{(totalTolLogs + getMiscVal('tol')) > 0 ? 'DISERTAKAN' : ''}</span>]</td>
                <td className="border-l border-black w-8 text-center font-bold">RM</td>
                <td className="border-l border-black w-32 text-right px-2 font-bold">{ (totalTolLogs + getMiscVal('tol')) > 0 ? (totalTolLogs + getMiscVal('tol')).toFixed(2) : ''}</td>
              </tr>
              <tr className="font-bold text-[10.5pt] border-t border-black">
                <td className="text-right pr-4 py-2 uppercase">JUMLAH (BAHAGIAN C)</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2">{miscTotal.toFixed(2)}</td>
              </tr>
              <tr className="font-black text-[11pt] border-t-[1.5px] border-black bg-gray-50">
                <td className="text-right pr-4 py-3 uppercase">JUMLAH KESELURUHAN TUNTUTAN (BAHAGIAN A+B+C)</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2 font-black">{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PENGAKUAN DAN PENGESAHAN KEKAL DI BAWAH JADUAL */}
        {/* ... */}
      </div>
    </div>
  );
};

export default Step5Summary;
