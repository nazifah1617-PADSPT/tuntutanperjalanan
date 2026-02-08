
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
  const totalKm = data.logs.reduce((sum, j) => sum + j.pergi.jarak + (j.adaBalik ? j.balik.jarak : 0), 0);
  const totalTolLogs = data.logs.reduce((sum, j) => sum + j.pergi.tol + (j.adaBalik ? j.balik.tol : 0), 0);
  
  const isKereta = data.info.kenderaanJenis === 'Kereta';
  const kadar = isKereta ? KADAR_KERETA : KADAR_MOTOSIKAL;
  
  const km1 = Math.min(totalKm, 500);
  const km2 = Math.max(0, totalKm - 500);
  const amt1 = km1 * kadar.pertama;
  const amt2 = km2 * kadar.seterusnya;
  const mileageTotal = amt1 + amt2;

  const transportTotal = data.transport.teksi + data.transport.bas + data.transport.keretaApi + data.transport.feri + data.transport.lainLain;
  
  const mealTotal = 
    (data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar) +
    (data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar) +
    (data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar);

  const harianTotal = (data.meals.harian.bil * data.meals.harian.hari * data.meals.harian.kadar);
  
  const sectionAMealHarianTotal = mealTotal + harianTotal;
  const partATotal = mileageTotal + transportTotal + sectionAMealHarianTotal;
  const partBTotal = data.lodgings.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0);
  
  const miscManualTotal = (Object.entries(data.misc)
    .filter(([key]) => key !== 'tol' && key !== 'saringan' && key !== 'kemasukanPremis')
    .map(([_, v]) => v) as number[])
    .reduce((sum, val) => sum + val, 0);
  
  const miscTotal = miscManualTotal + totalTolLogs + data.misc.tol + data.misc.saringan + data.misc.kemasukanPremis;
  
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - data.advance;

  // Split lodgings for Bahagian B display
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
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gunakan format A4 untuk hasil cetakan terbaik.</p>
        </div>
      </div>

      <div className="print-only">
        {/* MUKA SURAT 1: MAKLUMAT PEGAWAI */}
        <div className="header-right uppercase">Lampiran C</div>
        <div className="title-box">
          KENYATAAN TUNTUTAN ELAUN PERJALANAN DALAM NEGERI WP1.4<br/>
          BAGI BULAN {bulanTuntutan}
        </div>

        <table>
          <thead>
            <tr><th colSpan={3} className="text-center py-1 uppercase font-bold tracking-widest bg-gray-100">MAKLUMAT PEGAWAI</th></tr>
          </thead>
          <tbody className="text-[10pt]">
            <tr><td className="w-[35%]">Nama (Huruf Besar)</td><td colSpan={2}>: <strong>{data.info.nama.toUpperCase() || '____________________'}</strong></td></tr>
            <tr><td>No. Kad Pengenalan</td><td colSpan={2}>: {data.info.ic || '____________________'}</td></tr>
            <tr><td>Jawatan</td><td colSpan={2}>: {data.info.jawatan || '____________________'}</td></tr>
            <tr><td>Gred</td><td colSpan={2}>: {data.info.gred || '____________________'}</td></tr>
            <tr><td>No. Akaun Bank</td><td colSpan={2}>: {data.info.akaunBank || '____________________'}</td></tr>
            <tr><td>Nama / Alamat Bank</td><td colSpan={2}>: {data.info.namaBank || '____________________'}</td></tr>
            <tr><td>No. Telefon (Pejabat/Bimbit)</td><td colSpan={2}>: {data.info.telefon || '____________________'}</td></tr>
            <tr><td rowSpan={3}>Pendapatan (RM)</td><td className="w-24 border-r-0">Gaji</td><td>: RM {data.info.gaji.toFixed(2)}</td></tr>
            <tr><td className="border-r-0">Elaun-elaun</td><td>: RM {data.info.elaun.toFixed(2)}</td></tr>
            <tr><td className="border-r-0 font-bold">Jumlah</td><td className="font-bold">: RM {(data.info.gaji + data.info.elaun).toFixed(2)}</td></tr>
            <tr><td rowSpan={2} className="align-middle">Kenderaan</td><td className="text-center font-bold bg-gray-50">Kereta</td><td className="text-center font-bold bg-gray-50">Motosikal</td></tr>
            <tr><td>Jenis/Model: {isKereta ? data.info.kenderaanModel : '-'}<br/>No. Plat: {isKereta ? data.info.noPendaftaran : '-'}</td><td>Jenis/Model: {!isKereta ? data.info.kenderaanModel : '-'}<br/>No. Plat: {!isKereta ? data.info.noPendaftaran : '-'}</td></tr>
            <tr><td>Alamat Pejabat</td><td colSpan={2}>{data.info.alamatPejabat || '____________________'}</td></tr>
            <tr><td>Alamat Rumah Pegawai</td><td colSpan={2}>{data.info.alamatRumah || '____________________'}</td></tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        {/* MUKA SURAT 2: LOG */}
        <div className="title-box">KENYATAAN TUNTUTAN</div>
        <table>
          <thead>
            <tr className="bg-gray-100">
              <th className="w-[15%] text-center py-2" rowSpan={2}>Tarikh</th>
              <th className="text-center py-2" colSpan={2}>Waktu</th>
              <th className="text-center py-2" rowSpan={2}>Tujuan / Tempat / Butiran Tol</th>
              <th className="w-[12%] text-center py-2" rowSpan={2}>Jarak (KM)</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="w-[12%] text-center py-2">Bertolak</th>
              <th className="w-[12%] text-center py-2">Sampai</th>
            </tr>
          </thead>
          <tbody className="text-[9pt]">
            {data.logs.map((j, i) => (
              <React.Fragment key={i}>
                <tr>
                  <td className="text-center align-middle p-2 font-bold" rowSpan={j.adaBalik ? 2 : 1}>{formatDate(j.tarikh)}</td>
                  <td className="text-center py-4">{formatTime(j.pergi.waktuBertolak)}</td>
                  <td className="text-center py-4">{formatTime(j.pergi.waktuSampai)}</td>
                  <td className="px-3 py-4 leading-normal">
                    <div className="font-bold mb-1 uppercase text-[8.5pt]">{j.tujuan}</div>
                    <div className="text-[8pt] mb-1 italic">Dari {j.pergi.dari} ke {j.pergi.ke}</div>
                    {(j.pergi.tol > 0) && (
                      <div className="text-[7.5pt] text-blue-700 mt-2 pt-2 border-t border-gray-100">
                        <span className="font-bold uppercase tracking-tighter">Butiran Tol:</span> {j.pergi.tolMasuk || '-'} &rarr; {j.pergi.tolKeluar || '-'} (RM {j.pergi.tol.toFixed(2)})
                      </div>
                    )}
                  </td>
                  <td className="text-center py-4">{j.pergi.jarak.toFixed(1)}</td>
                </tr>
                {j.adaBalik && (
                  <tr>
                    <td className="text-center py-4 border-l-0">{formatTime(j.balik.waktuBertolak)}</td>
                    <td className="text-center py-4">{formatTime(j.balik.waktuSampai)}</td>
                    <td className="px-3 py-4 leading-normal">
                      <div className="text-[8pt] mb-1 italic">Dari {j.balik.dari} ke {j.balik.ke}</div>
                      {(j.balik.tol > 0) && (
                        <div className="text-[7.5pt] text-amber-700 mt-2 pt-2 border-t border-gray-100">
                          <span className="font-bold uppercase tracking-tighter">Butiran Tol:</span> {j.balik.tolMasuk || '-'} &rarr; {j.balik.tolKeluar || '-'} (RM {j.balik.tol.toFixed(2)})
                        </div>
                      )}
                    </td>
                    <td className="text-center py-4">{j.balik.jarak.toFixed(1)}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-50">
              <td colSpan={4} className="text-right py-3 pr-4 uppercase text-[10pt]">Jumlah Jarak (KM):</td>
              <td className="text-center py-3 text-[10pt]">{totalKm.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        {/* MUKA SURAT 3: BAHAGIAN A */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[11pt] border-b-[1.5px] border-black bg-white">BAHAGIAN A</div>
          <div className="text-center font-bold py-1 uppercase text-[10pt] border-b-[1.5px] border-black bg-white">ELAUN PERJALANAN KENDERAAN</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[9pt]">
                <th className="w-[18%] text-center border-r border-black font-bold">Jenis Kenderaan</th>
                <th className="w-[16%] text-center border-r border-black font-bold">Kiraan Kilometer</th>
                <th className="w-[20%] text-center border-r border-black font-bold">Jarak (KM)</th>
                <th className="w-[22%] text-center border-r border-black font-bold">Kadar Sekilometer</th>
                <th className="text-center font-bold">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="text-[9pt]">
              <tr className="border-t border-black">
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-black uppercase">Kereta</td>
                <td className="px-2 py-2 border-r border-black text-center leading-tight">500 km pertama</td>
                <td className="text-center border-r border-black align-middle font-bold">{isKereta ? km1.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black align-middle">RM <span className="font-bold">{isKereta ? KADAR_KERETA.pertama.toFixed(2) : '0.85'}</span> sen/km</td>
                <td className="text-right px-2 align-middle font-bold">{isKereta ? amt1.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-t border-black">
                <td className="px-2 py-2 border-r border-black text-center leading-tight">501 km dan seterusnya</td>
                <td className="text-center border-r border-black align-middle font-bold">{isKereta ? km2.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black align-middle">RM <span className="font-bold">{isKereta ? KADAR_KERETA.seterusnya.toFixed(2) : '0.75'}</span> sen/km</td>
                <td className="text-right px-2 align-middle font-bold">{isKereta ? amt2.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-t border-black">
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-black uppercase">Motosikal</td>
                <td className="px-2 py-2 border-r border-black text-center leading-tight">500 km pertama</td>
                <td className="text-center border-r border-black align-middle font-bold">{!isKereta ? km1.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black align-middle">RM <span className="font-bold">{!isKereta ? KADAR_MOTOSIKAL.pertama.toFixed(2) : '0.55'}</span> sen/km</td>
                <td className="text-right px-2 align-middle font-bold">{!isKereta ? amt1.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-t border-black">
                <td className="px-2 py-2 border-r border-black text-center leading-tight">501 km dan seterusnya</td>
                <td className="text-center border-r border-black align-middle font-bold">{!isKereta ? km2.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black align-middle">RM <span className="font-bold">{!isKereta ? KADAR_MOTOSIKAL.seterusnya.toFixed(2) : '0.45'}</span> sen/km</td>
                <td className="text-right px-2 align-middle font-bold">{!isKereta ? amt2.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-t-[1.5px] border-black font-bold">
                <td colSpan={4} className="text-right pr-4 py-2 uppercase text-[9.5pt]">Jumlah</td>
                <td className="text-right px-2 py-2 text-[9.5pt]">{mileageTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center font-bold py-1 uppercase text-[10pt] border-y-[1.5px] border-black bg-white">TUNTUTAN TAMBANG PENGANGKUTAN AWAM</div>
          <table className="w-full border-collapse">
            <tbody className="text-[9.5pt]">
              <tr className="border-b border-black">
                <td className="w-[80%] px-4 py-1 leading-6">Teksi/Kereta Sewa [Resit ..........................................................................]</td>
                <td className="border-l border-black w-10 text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.teksi > 0 ? data.transport.teksi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1 leading-6">Bas [Resit ............................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.bas > 0 ? data.transport.bas.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1 leading-6">Kereta Api [Resit ................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.keretaApi > 0 ? data.transport.keretaApi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1 leading-6">Feri [Resit ...........................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.feri > 0 ? data.transport.feri.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="px-4 py-1 leading-6">Lain-Lain [Resit......................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.lainLain > 0 ? data.transport.lainLain.toFixed(2) : ''}</td>
              </tr>
              <tr className="font-bold text-[10pt]">
                <td className="text-right pr-4 py-1.5 uppercase tracking-wide">Jumlah</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2">{transportTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border-t-[1.5px] border-black">
            <thead>
              <tr className="text-[8.5pt]">
                <th className="w-1/2 border-r border-black font-bold py-1 uppercase text-center px-1">TUNTUTAN ELAUN MAKAN/ ELAUN HARIAN<br/>(SEMENANJUNG MALAYSIA)</th>
                <th className="w-1/2 font-bold py-1 uppercase text-center px-1">TUNTUTAN ELAUN MAKAN/ ELAUN HARIAN<br/>(SABAH/ SARAWAK/ LABUAN)</th>
              </tr>
            </thead>
            <tbody className="text-[8.5pt]">
              <tr>
                <td className="border-r border-black p-0 align-top">
                  <div className="font-bold px-2 py-1 border-y border-black uppercase bg-gray-50/30">ELAUN MAKAN</div>
                  <table className="w-full border-none border-collapse text-[8pt]">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="border-r border-black text-left px-2 py-1">Bahagian Makan</th>
                        <th className="border-r border-black text-center w-12 font-bold">Bil. Dituntut</th>
                        <th className="border-r border-black text-center w-12 font-bold">Bil. Hari</th>
                        <th className="text-center w-16 font-bold">RM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black"><td className="border-r border-black px-2 py-1">• Sarapan Pagi</td><td className="border-r border-black text-center">{data.meals.sarapan.bil || ''}</td><td className="border-r border-black text-center">{data.meals.sarapan.hari || ''}</td><td className="text-right px-2">{(data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar).toFixed(2)}</td></tr>
                      <tr className="border-b border-black"><td className="border-r border-black px-2 py-1">• Makan Tengah Hari</td><td className="border-r border-black text-center">{data.meals.makanTengahHari.bil || ''}</td><td className="border-r border-black text-center">{data.meals.makanTengahHari.hari || ''}</td><td className="text-right px-2">{(data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar).toFixed(2)}</td></tr>
                      <tr className="border-b border-black"><td className="border-r border-black px-2 py-1">• Makan Malam</td><td className="border-r border-black text-center">{data.meals.makanMalam.bil || ''}</td><td className="border-r border-black text-center">{data.meals.makanMalam.hari || ''}</td><td className="text-right px-2">{(data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar).toFixed(2)}</td></tr>
                      <tr className="font-bold border-b-[1.5px] border-black bg-white"><td colSpan={3} className="text-right pr-4 py-1 uppercase">Jumlah</td><td className="text-right px-2 py-1">{mealTotal.toFixed(2)}</td></tr>
                    </tbody>
                  </table>
                  <div className="px-2 py-2 text-[8pt]">Elaun Makan x {data.meals.sarapan.hari || '....'} sebanyak RM {mealTotal > 0 ? (mealTotal / (data.meals.sarapan.hari || 1)).toFixed(2) : '...........'} /hari</div>
                  <div className="flex justify-between px-2 font-bold py-1 border-y border-black uppercase text-[8.5pt]"><span>Jumlah (RM)</span><span>{mealTotal.toFixed(2)}</span></div>
                  <div className="font-bold px-2 py-1 border-b border-black uppercase bg-gray-50/30">ELAUN HARIAN</div>
                  <div className="px-2 py-2 text-[8pt]">Elaun Harian x {data.meals.harian.hari || '....'} sebanyak RM {data.meals.harian.kadar.toFixed(2)} /hari</div>
                  <div className="flex justify-between px-2 font-bold py-1 border-y border-black uppercase text-[8.5pt]"><span>Jumlah (RM)</span><span>{harianTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between px-2 font-black py-2 bg-gray-100 uppercase border-b border-black"><span>Jumlah (RM)</span><span>RM {sectionAMealHarianTotal.toFixed(2)}</span></div>
                </td>
                <td className="align-top p-0"><div className="font-bold px-2 py-1 border-y border-black uppercase bg-gray-50/30">ELAUN MAKAN</div><div className="px-2 py-2 text-[8pt]">Elaun Makan x ............ sebanyak RM ............... /hari</div><div className="flex justify-between px-2 font-bold py-1 border-y border-black uppercase text-[8.5pt]"><span>Jumlah (RM)</span><span></span></div><div className="font-bold px-2 py-1 border-b border-black uppercase bg-gray-50/30">ELAUN HARIAN</div><div className="px-2 py-2 text-[8pt]">Elaun Harian x ............ sebanyak RM ............... /hari</div><div className="flex justify-between px-2 font-bold py-1 border-y border-black uppercase text-[8.5pt]"><span>Jumlah (RM)</span><span></span></div></td>
              </tr>
            </tbody>
          </table>
          <div className="border-t border-black bg-gray-100 flex justify-end px-4 py-2 font-black text-[11pt] uppercase">JUMLAH (BAHAGIAN A) RM {partATotal.toFixed(2)}</div>
        </div>

        <div className="page-break"></div>

        {/* ========================================================== */}
        {/* MUKA SURAT 4: BAHAGIAN B (IKUT SCREENSHOT) */}
        {/* ========================================================== */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[12pt] border-b-[1.5px] border-black bg-white tracking-[0.2em]">BAHAGIAN B</div>
          
          <table className="w-full border-collapse border-none">
            <thead>
              <tr className="text-[8.5pt]">
                <th className="w-1/2 border-r border-black font-bold py-2 uppercase text-center px-1">TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SEMENANJUNG MALAYSIA)</th>
                <th className="w-1/2 font-bold py-2 uppercase text-center px-1">TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SABAH/ SARAWAK /WP LABUAN)</th>
              </tr>
            </thead>
            <tbody className="text-[8pt]">
              {/* BSH Row 1 */}
              <tr className="border-t border-black">
                <td className="border-r border-black p-2 align-top relative min-h-[90px]">
                  <div className="leading-tight">BSH x <span className="font-bold">{hotels[0]?.bilangan || '........'}</span> sebanyak RM <span className="font-bold">{hotels[0]?.kadar.toFixed(2) || '........'}</span>/hari.</div>
                  <div className="text-[7.5pt] mt-1 leading-tight">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</div>
                  <div className="text-[7.5pt] mt-6">[Resit <span className="font-bold">{hotels[0] ? 'Disertakan' : '...................'}</span>]</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold">{hotels[0] ? (hotels[0].bilangan * hotels[0].kadar).toFixed(2) : ''}</div>
                  </div>
                </td>
                <td className="p-2 align-top relative min-h-[90px]">
                  <div className="leading-tight">BSH x ................. sebanyak RM ................./hari.</div>
                  <div className="text-[7.5pt] mt-1 leading-tight">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</div>
                  <div className="text-[7.5pt] mt-6">[Resit .................................]</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1"></div>
                  </div>
                </td>
              </tr>
              {/* BSH Row 2 */}
              <tr className="border-t border-black">
                <td className="border-r border-black p-2 align-top relative min-h-[90px]">
                  <div className="leading-tight">BSH x <span className="font-bold">{hotels[1]?.bilangan || '........'}</span> sebanyak RM <span className="font-bold">{hotels[1]?.kadar.toFixed(2) || '........'}</span>/hari.</div>
                  <div className="text-[7.5pt] mt-1 leading-tight">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</div>
                  <div className="text-[7.5pt] mt-6">[Resit <span className="font-bold">{hotels[1] ? 'Disertakan' : '...................'}</span>]</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold">{hotels[1] ? (hotels[1].bilangan * hotels[1].kadar).toFixed(2) : ''}</div>
                  </div>
                </td>
                <td className="p-2 align-top relative min-h-[90px]">
                  <div className="leading-tight">BSH x ................. sebanyak RM ................./hari.</div>
                  <div className="text-[7.5pt] mt-1 leading-tight">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</div>
                  <div className="text-[7.5pt] mt-6">[Resit .................................]</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1"></div>
                  </div>
                </td>
              </tr>
              {/* Lojing Headers */}
              <tr className="border-t border-black font-bold">
                <td className="border-r border-black py-2 uppercase text-center px-1">TUNTUTAN ELAUN LOJING<br/>(SEMENANJUNG MALAYSIA)</td>
                <td className="py-2 uppercase text-center px-1">TUNTUTAN ELAUN LOJING<br/>(SABAH/ SARAWAK /WP LABUAN)</td>
              </tr>
              {/* Lojing Calculations Row */}
              <tr className="border-t border-black">
                <td className="border-r border-black p-2 align-top relative min-h-[45px]">
                  <div className="leading-tight">Elaun Lojing x <span className="font-bold">{lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + l.bilangan, 0) : '........'}</span> sebanyak RM <span className="font-bold">{lojingsOnly[0]?.kadar.toFixed(2) || '........'}</span>/hari.</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold">{lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0).toFixed(2) : ''}</div>
                  </div>
                </td>
                <td className="p-2 align-top relative min-h-[45px]">
                  <div className="leading-tight">Elaun Lojing x ............ sebanyak RM ............/hari.</div>
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
                    <div className="flex-1"></div>
                  </div>
                </td>
              </tr>
              {/* Lojing Details Row 1 */}
              <tr className="border-t border-black">
                <td className="border-r border-black p-2 align-top min-h-[120px]">
                   <div className="text-[8.5pt] mb-2 leading-relaxed">Tarikh Lojing: <span className="font-bold">{lojingsOnly[0]?.tarikh ? formatDate(lojingsOnly[0].tarikh) : '.........................'}</span></div>
                   <div className="text-[8.5pt] leading-relaxed">Alamat Lojing: <br/> <span className="font-bold text-justify uppercase">{lojingsOnly[0]?.alamat || '................................................................................................................................................................................................................................................................................................................................'}</span></div>
                </td>
                <td className="p-2 align-top min-h-[120px]">
                   <div className="text-[8.5pt] mb-2 leading-relaxed">Tarikh Lojing: .........................</div>
                   <div className="text-[8.5pt] leading-relaxed">Alamat Lojing: <br/> ................................................................................................................................................................................................................................................................................................................................</div>
                </td>
              </tr>
              {/* Lojing Details Row 2 */}
              <tr className="border-t border-black">
                <td className="border-r border-black p-2 align-top min-h-[120px]">
                   <div className="text-[8.5pt] mb-2 leading-relaxed">Tarikh Lojing: <span className="font-bold">{lojingsOnly[1]?.tarikh ? formatDate(lojingsOnly[1].tarikh) : '.........................'}</span></div>
                   <div className="text-[8.5pt] leading-relaxed">Alamat Lojing: <br/> <span className="font-bold text-justify uppercase">{lojingsOnly[1]?.alamat || '................................................................................................................................................................................................................................................................................................................................'}</span></div>
                </td>
                <td className="p-2 align-top min-h-[120px]">
                   <div className="text-[8.5pt] mb-2 leading-relaxed">Tarikh Lojing: .........................</div>
                   <div className="text-[8.5pt] leading-relaxed">Alamat Lojing: <br/> ................................................................................................................................................................................................................................................................................................................................</div>
                </td>
              </tr>
              {/* Column Subtotals */}
              <tr className="border-t-[1.5px] border-black font-bold">
                <td className="border-r border-black p-1 text-right pr-28 relative uppercase">Jumlah
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2">{partBTotal.toFixed(2)}</div>
                  </div>
                </td>
                <td className="p-1 text-right pr-28 relative uppercase">Jumlah
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex">
                    <div className="w-8 border-r border-black flex items-center justify-center">RM</div>
                    <div className="flex-1"></div>
                  </div>
                </td>
              </tr>
              {/* Final Grand Total Bahagian B */}
              <tr className="border-t border-black font-black bg-gray-50/30">
                <td colSpan={2} className="text-right p-2 pr-28 relative uppercase">JUMLAH (BAHAGIAN B)
                  <div className="absolute right-0 top-0 h-full border-l border-black w-24 flex items-center justify-between px-2 bg-white">
                    <span className="font-bold">RM</span>
                    <span className="font-bold">{partBTotal.toFixed(2)}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7pt] italic mt-1 font-medium">- Sila tambah ruangan jika tidak mencukupi</div>

        <div className="page-break"></div>

        {/* MUKA SURAT 5: BAHAGIAN C & PENGAKUAN */}
        <div className="border-[1.5px] border-black mt-10">
          <div className="text-center font-bold py-2 uppercase text-[12pt] border-b-[1.5px] border-black bg-white">BAHAGIAN C</div>
          <div className="text-center font-bold py-1 uppercase text-[10pt] border-b-[1.5px] border-black bg-white">BELANJA PELBAGAI</div>
          <table className="w-full border-collapse">
            <tbody className="text-[9.5pt]">
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Telefon, Telegram , Faks [Resit ..........................................................................]</td>
                <td className="border-l border-black w-8 text-center font-bold">RM</td>
                <td className="border-l border-black w-32 text-right px-2 font-bold">{data.misc.telefon > 0 ? data.misc.telefon.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Pos [Resit ............................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.pos > 0 ? data.misc.pos.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Dobi [Resit ...........................................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.dobi > 0 ? data.misc.dobi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Cukai Lapangan Terbang [Resit...............................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.airportTax > 0 ? data.misc.airportTax.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Lebihan Bagasi [ Resit.............................................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.lebihanBagasi > 0 ? data.misc.lebihanBagasi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Tempat Letak Kereta [Resit/Penyata <i>Touch&Go</i> /Lain-lain........................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.parking > 0 ? data.misc.parking.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Tol [Resit/Penyata <i>Touch&Go</i> /RFID/Lain-lain: .......................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{ (totalTolLogs + data.misc.tol) > 0 ? (totalTolLogs + data.misc.tol).toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 leading-6">Saringan/ Pengesanan/ Vaksin [Resit .......................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.saringan > 0 ? data.misc.saringan.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="px-4 py-1.5 leading-6">Kemasukan ke Premis/Kawasan [Resit .......................................................................]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.misc.kemasukanPremis > 0 ? data.misc.kemasukanPremis.toFixed(2) : ''}</td>
              </tr>
              <tr className="font-bold text-[10.5pt] bg-gray-50/30">
                <td className="text-right pr-4 py-2 uppercase">JUMLAH (BAHAGIAN C)</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2">{miscTotal.toFixed(2)}</td>
              </tr>
              <tr className="font-black text-[11pt] border-t-[1.5px] border-black bg-gray-100">
                <td className="text-right pr-4 py-3 uppercase">JUMLAH KESELURUHAN TUNTUTAN (BAHAGIAN A+B+C)</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2">{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-[1.5px] border-black p-6 mt-8">
          <div className="font-bold uppercase text-center text-[11pt] mb-6 tracking-widest">PENGAKUAN</div>
          <div className="text-[9.5pt] font-medium leading-relaxed space-y-2">
            <p>Saya mengaku bahawa:</p>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(a)</span>
              <p className="flex-1 text-justify">perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(b)</span>
              <p className="flex-1 text-justify">tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa dan/atau peraturan berkursus yang berkuat kuasa;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(c)</span>
              <p className="flex-1 text-justify">perbelanjaan yang tidak disokong dengan resit berjumlah sebanyak RM........................................ telah sebenarnya dilakukan dan dibayar oleh saya;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(d)</span>
              <p className="flex-1 text-justify">perbelanjaan yang tidak disokong dengan resit bukan atas nama saya berjumlah sebanyak RM........................................ telah sebenarnya dilakukan dan dibayar bagi pihak saya atas urusan rasmi dan tuntutan adalah berdasarkan kelayakan saya;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(e)</span>
              <p className="flex-1 text-justify">semua butiran yang dinyatakan di atas adalah tepat dan benar dan saya bertanggungjawab terhadap semua maklumat yang dinyatakan; dan</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(f)</span>
              <p className="flex-1 text-justify">sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah seksyen 18, Akta Suruhanjaya Pencegahan Rasuah Malaysia 2009 [Akta 694] (Kesalahan dengan maksud untuk memperdayakan prinsipal oleh ejen).</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-20">
             <div className="w-1/2 flex items-end pb-4 font-bold text-[10pt]">
                Tarikh: .....................................................
             </div>
             <div className="w-1/2 text-center">
                <div className="h-14 border-b border-black w-64 mx-auto border-dotted flex items-end justify-center"></div>
                <div className="pt-2 font-bold uppercase text-[10pt]">(Tandatangan Pemohon)</div>
                <div className="text-[9.5pt] font-bold mt-2 uppercase text-blue-800">{data.info.nama || '____________________'}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;
