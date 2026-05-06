
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

  const getMiscVal = (key: keyof MiscExpenses) => Number(data.misc[key]) || 0;

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

  // Susun logs mengikut tarikh (Awal ke Akhir) untuk kegunaan Cetakan/PDF
  const sortedLogs = [...data.logs].sort((a, b) => {
    if (!a.tarikh) return 1;
    if (!b.tarikh) return -1;
    return a.tarikh.localeCompare(b.tarikh);
  });

  // Calculations (Gunakan data asal atau sorted adalah sama untuk jumlah)
  const totalKm = data.logs.reduce((sum, j) => sum + (Number(j.pergi.jarak) || 0) + (j.adaBalik ? (Number(j.balik.jarak) || 0) : 0), 0);
  const totalTolLogs = data.logs.reduce((sum, j) => sum + (Number(j.pergi.tol) || 0) + (j.adaBalik ? (Number(j.balik.tol) || 0) : 0), 0);
  
  const isKereta = data.info.kenderaanJenis === 'Kereta';
  const kadarPertama = isKereta ? data.mileageRates!.keretaPertama : data.mileageRates!.motosikalPertama;
  const kadarSeterusnya = isKereta ? data.mileageRates!.keretaSeterusnya : data.mileageRates!.motosikalSeterusnya;
  
  const km1 = Math.min(totalKm, 500);
  const km2 = Math.max(0, totalKm - 500);
  const amt1 = km1 * kadarPertama;
  const amt2 = km2 * kadarSeterusnya;
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

  // Ambil bulan dari log pertama yang telah disusun
  const bulanTuntutan = sortedLogs[0]?.tarikh 
    ? new Date(sortedLogs[0].tarikh).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }).toUpperCase() 
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

      {/* ========================================================== */}
      {/* SEKSYEN CETAKAN (6 MUKA SURAT LENGKAP) */}
      {/* ========================================================== */}
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

        {/* MUKA SURAT 2: LOG PERJALANAN (SUSUNAN KRONOLOGI) */}
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
            {sortedLogs.map((j, i) => (
              <React.Fragment key={i}>
                <tr>
                  <td className="text-center align-middle p-2 font-bold" rowSpan={j.adaBalik ? 2 : 1}>{formatDate(j.tarikh)}</td>
                  <td className="text-center py-4">{formatTime(j.pergi.waktuBertolak)}</td>
                  <td className="text-center py-4">{formatTime(j.pergi.waktuSampai)}</td>
                  <td className="px-3 py-4 leading-normal">
                    <div className="font-bold mb-1 uppercase text-[8.5pt]">{j.tujuan}</div>
                    <div className="text-[8pt] mb-1 italic">Dari {j.pergi.dari} ke {j.pergi.ke}</div>
                    {((j.pergi.senaraiTol && j.pergi.senaraiTol.length > 0) || Number(j.pergi.tol) > 0) && (
                      <div className="text-[7.5pt] text-blue-700 mt-2">
                        <span className="font-bold uppercase tracking-tighter">Butiran Tol:</span>{' '}
                        {j.pergi.senaraiTol && j.pergi.senaraiTol.length > 0 ? (
                          j.pergi.senaraiTol.map((t, idx) => (
                            <span key={t.id}>
                              {idx > 0 && ', '}
                              {t.tolMasuk || '-'} &rarr; {t.tolKeluar || '-'}
                            </span>
                          ))
                        ) : (
                          <span>
                            {j.pergi.tolMasuk || '-'} &rarr; {j.pergi.tolKeluar || '-'}
                            {j.pergi.tolMasuk2 && j.pergi.tolKeluar2 && `, ${j.pergi.tolMasuk2} \u2192 ${j.pergi.tolKeluar2}`}
                          </span>
                        )}
                        {' '}(RM {(Number(j.pergi.tol)||0).toFixed(2)})
                      </div>
                    )}
                  </td>
                  <td className="text-center py-4">{(Number(j.pergi.jarak)||0).toFixed(1)}</td>
                </tr>
                {j.adaBalik && (
                  <tr>
                    <td className="text-center py-4 border-l-0">{formatTime(j.balik.waktuBertolak)}</td>
                    <td className="text-center py-4">{formatTime(j.balik.waktuSampai)}</td>
                    <td className="px-3 py-4 leading-normal">
                      <div className="text-[8pt] mb-1 italic">Dari {j.balik.dari} ke {j.balik.ke}</div>
                      {((j.balik.senaraiTol && j.balik.senaraiTol.length > 0) || Number(j.balik.tol) > 0) && (
                        <div className="text-[7.5pt] text-amber-700 mt-2">
                          <span className="font-bold uppercase tracking-tighter">Butiran Tol:</span>{' '}
                          {j.balik.senaraiTol && j.balik.senaraiTol.length > 0 ? (
                            j.balik.senaraiTol.map((t, idx) => (
                              <span key={t.id}>
                                {idx > 0 && ', '}
                                {t.tolMasuk || '-'} &rarr; {t.tolKeluar || '-'}
                              </span>
                            ))
                          ) : (
                            <span>
                              {j.balik.tolMasuk || '-'} &rarr; {j.balik.tolKeluar || '-'}
                              {j.balik.tolMasuk2 && j.balik.tolKeluar2 && `, ${j.balik.tolMasuk2} \u2192 ${j.balik.tolKeluar2}`}
                            </span>
                          )}
                          {' '}(RM {(Number(j.balik.tol)||0).toFixed(2)})
                        </div>
                      )}
                    </td>
                    <td className="text-center py-4">{(Number(j.balik.jarak)||0).toFixed(1)}</td>
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
              <tr className="text-[8.5pt] font-bold text-center">
                <th className="border-r border-black py-2 w-[18%]">Jenis Kenderaan</th>
                <th className="border-r border-black py-2 w-[18%]">Kiraan Kilometer</th>
                <th className="border-r border-black py-2 w-[18%]">Jarak (km)</th>
                <th className="border-r border-black py-2 w-[28%]">Kadar Sekilometer</th>
                <th className="py-2 w-[18%]">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="text-[9pt]">
              <tr>
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-t border-black uppercase">Kereta</td>
                <td className="px-2 py-2 border-r border-t border-black">500 km pertama</td>
                <td className="text-center border-r border-t border-black font-bold">{isKereta ? km1.toFixed(2) : '0'}</td>
                <td className="text-center border-r border-t border-black">RM {(data.mileageRates?.keretaPertama || 0).toFixed(2)} / km</td>
                <td className="text-right px-2 border-t border-black font-bold">{isKereta ? amt1.toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td className="px-2 py-2 border-r border-t border-black">501 km dan seterusnya</td>
                <td className="text-center border-r border-t border-black font-bold">{isKereta ? km2.toFixed(2) : '0'}</td>
                <td className="text-center border-r border-t border-black">RM {(data.mileageRates?.keretaSeterusnya || 0).toFixed(2)} / km</td>
                <td className="text-right px-2 border-t border-black font-bold">{isKereta ? amt2.toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-t border-black uppercase">Motosikal</td>
                <td className="px-2 py-2 border-r border-t border-black">500 km pertama</td>
                <td className="text-center border-r border-t border-black font-bold">{!isKereta ? km1.toFixed(2) : '0'}</td>
                <td className="text-center border-r border-t border-black">RM {(data.mileageRates?.motosikalPertama || 0).toFixed(2)} / km</td>
                <td className="text-right px-2 border-t border-black font-bold">{!isKereta ? amt1.toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td className="px-2 py-2 border-r border-t border-black">501 km dan seterusnya</td>
                <td className="text-center border-r border-t border-black font-bold">{!isKereta ? km2.toFixed(2) : '0'}</td>
                <td className="text-center border-r border-t border-black">RM {(data.mileageRates?.motosikalSeterusnya || 0).toFixed(2)} / km</td>
                <td className="text-right px-2 border-t border-black font-bold">{!isKereta ? amt2.toFixed(2) : '0.00'}</td>
              </tr>
              <tr className="border-t-[1.5px] border-black font-bold bg-white">
                <td colSpan={4} className="text-right pr-4 py-2 uppercase text-[9.5pt]">Jumlah</td>
                <td className="text-right px-2 py-2 text-[9.5pt]">{mileageTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center font-bold py-1 uppercase text-[10pt] border-y-[1.5px] border-black bg-white">TUNTUTAN TAMBANG PENGANGKUTAN AWAM</div>
          <table className="w-full border-collapse">
            <tbody className="text-[9pt]">
              <tr className="border-b border-black">
                <td className="px-4 py-1.5 w-[82%]">Teksi/Kereta Sewa [Resit <span className="font-bold border-b border-black px-4">{data.transport.teksi > 0 ? 'DISERTAKAN' : ' '}</span>]</td>
                <td className="border-l border-black w-8 text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold w-24">{data.transport.teksi > 0 ? data.transport.teksi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5">Bas [Resit <span className="font-bold border-b border-black px-4">{data.transport.bas > 0 ? 'DISERTAKAN' : ' '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.bas > 0 ? data.transport.bas.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5">Kereta Api [Resit <span className="font-bold border-b border-black px-4">{data.transport.keretaApi > 0 ? 'DISERTAKAN' : ' '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.keretaApi > 0 ? data.transport.keretaApi.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5">Feri [Resit <span className="font-bold border-b border-black px-4">{data.transport.feri > 0 ? 'DISERTAKAN' : ' '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.feri > 0 ? data.transport.feri.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-1.5">Lain-lain [Resit <span className="font-bold border-b border-black px-4">{data.transport.lainLain > 0 ? 'DISERTAKAN' : ' '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{data.transport.lainLain > 0 ? data.transport.lainLain.toFixed(2) : ''}</td>
              </tr>
              <tr className="font-bold bg-white">
                <td className="text-right pr-4 py-2 uppercase">Jumlah</td>
                <td className="border-l border-black text-center">RM</td>
                <td className="border-l border-black text-right px-2">{transportTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex border-t-[1.5px] border-black text-[7.5pt] font-bold text-center">
            <div className="w-1/2 border-r border-black py-2 px-1 uppercase leading-tight">TUNTUTAN ELAUN MAKAN/ ELAUN HARIAN<br/>(SEMENANJUNG MALAYSIA)</div>
            <div className="w-1/2 py-2 px-1 uppercase leading-tight">TUNTUTAN ELAUN MAKAN/ ELAUN HARIAN<br/>(SABAH/ SARAWAK/ WP LABUAN)</div>
          </div>
          <div className="flex border-t border-black">
            <div className="w-1/2 border-r border-black flex flex-col">
              <div className="text-center font-bold border-b border-black py-1 text-[8pt] uppercase">ELAUN MAKAN</div>
              <table className="w-full border-none text-[8pt]">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black text-left px-2 py-1 w-2/5">Bahagian Makan</th>
                    <th className="border-r border-black py-1">Bil. Dituntut</th>
                    <th className="border-r border-black py-1">Bil. Hari</th>
                    <th className="py-1">RM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-2">Sarapan Pagi</td>
                    <td className="border-r border-black text-center">{data.meals.sarapan.bil || ''}</td>
                    <td className="border-r border-black text-center">{data.meals.sarapan.hari || ''}</td>
                    <td className="text-right px-1 font-bold">{(data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-2">Makan Tengah Hari</td>
                    <td className="border-r border-black text-center">{data.meals.makanTengahHari.bil || ''}</td>
                    <td className="border-r border-black text-center">{data.meals.makanTengahHari.hari || ''}</td>
                    <td className="text-right px-1 font-bold">{(data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-2">Makan Malam</td>
                    <td className="border-r border-black text-center">{data.meals.makanMalam.bil || ''}</td>
                    <td className="border-r border-black text-center">{data.meals.makanMalam.hari || ''}</td>
                    <td className="text-right px-1 font-bold">{(data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar).toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-white">
                    <td colSpan={3} className="text-right pr-2">Jumlah</td>
                    <td className="text-right px-1">{mealTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-2 text-[7.5pt] border-t border-black space-y-1">
                <div>Elaun Makan x <span className="border-b border-black px-2 font-bold">{data.meals.sarapan.hari || ' '}</span> sebanyak RM <span className="border-b border-black px-2 font-bold">{data.meals.sarapan.kadar.toFixed(2)}</span> /hari</div>
                <div className="font-bold">Jumlah (RM) <span className="border-b border-black px-4">{mealTotal.toFixed(2)}</span></div>
              </div>
              <div className="text-center font-bold border-y border-black py-1 text-[8pt] uppercase">ELAUN HARIAN</div>
              <div className="p-2 text-[7.5pt] space-y-1">
                <div>Elaun Harian x <span className="border-b border-black px-2 font-bold">{data.meals.harian.hari || ' '}</span> sebanyak RM <span className="border-b border-black px-2 font-bold">{data.meals.harian.kadar.toFixed(2)}</span> /hari</div>
                <div className="font-bold">Jumlah (RM) <span className="border-b border-black px-4">{harianTotal.toFixed(2)}</span></div>
              </div>
              <div className="mt-auto border-t border-black font-black text-[9pt] p-2 flex justify-between bg-white">
                <span>Jumlah (RM)</span>
                <span>{sectionAMealHarianTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col">
              <div className="text-center font-bold border-b border-black py-1 text-[8pt] uppercase">ELAUN MAKAN</div>
              <table className="w-full border-none text-[8pt]">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black text-left px-2 py-1 w-2/5">Bahagian Makan</th>
                    <th className="border-r border-black py-1">Bil. Dituntut</th>
                    <th className="border-r border-black py-1">Bil. Hari</th>
                    <th className="py-1">RM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black px-2">Sarapan Pagi</td>
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black px-2">Makan Tengah Hari</td>
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black px-2">Makan Malam</td>
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="font-bold h-5"><td colSpan={3} className="text-right pr-2">Jumlah</td><td></td></tr>
                </tbody>
              </table>
              <div className="p-2 text-[7.5pt] border-t border-black space-y-1">
                <div>Elaun Makan x ________ sebanyak RM ________ /hari</div>
                <div className="font-bold">Jumlah (RM) ________________</div>
              </div>
              <div className="text-center font-bold border-y border-black py-1 text-[8pt] uppercase">ELAUN HARIAN</div>
              <div className="p-2 text-[7.5pt] space-y-1">
                <div>Elaun Harian x ________ sebanyak RM ________ /hari</div>
                <div className="font-bold">Jumlah (RM) ________________</div>
              </div>
              <div className="mt-auto border-t border-black font-black text-[9pt] p-2 flex justify-between bg-white">
                <span>Jumlah (RM)</span>
                <span>0.00</span>
              </div>
            </div>
          </div>
          <div className="flex bg-white font-black text-[10pt] border-t-[1.5px] border-black">
            <div className="flex-1 py-3 text-right pr-6 uppercase tracking-wider">JUMLAH (BAHAGIAN A)</div>
            <div className="w-32 border-l border-black flex items-center justify-center">
              <div className="w-8 border-r border-black flex items-center justify-center h-full">RM</div>
              <div className="flex-1 text-right px-2">{partATotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="text-[7.5pt] italic mt-1 font-bold text-gray-500">- Sila tambah ruangan jika tidak mencukupi.</div>

        <div className="page-break"></div>

        {/* MUKA SURAT 4: BAHAGIAN B */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[12pt] border-b-[1.5px] border-black bg-white tracking-[0.1em]">BAHAGIAN B</div>
          
          <div className="flex border-b border-black text-[8pt] font-bold text-center">
            <div className="w-1/2 border-r border-black py-2 px-2 flex items-center justify-center">TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SEMENANJUNG MALAYSIA)</div>
            <div className="w-1/2 py-2 px-2 flex items-center justify-center">TUNTUTAN BAYARAN SEWA HOTEL (BSH)<br/>(SABAH/ SARAWAK /WP LABUAN)</div>
          </div>

          <div className="flex border-b border-black min-h-[100px]">
            <div className="w-1/2 border-r border-black p-2 flex">
              <div className="flex-1 text-[8.5pt] leading-relaxed">
                BSH x <span className="font-bold border-b border-black px-1">{hotels[0]?.bilangan || '____'}</span> sebanyak RM <span className="font-bold border-b border-black px-1">{(Number(hotels[0]?.kadar)||0).toFixed(2)}</span> /hari.<br/>
                <span className="text-[7.5pt] italic">(Termasuk Bayaran Perkhidmatan & Cukai Perkhidmatan)</span><br/><br/>
                [Resit <span className="font-bold border-b border-black px-1">{hotels[0] ? 'DISERTAKAN' : '________________'}</span>]
              </div>
              <div className="w-24 border-l border-black flex items-center justify-center h-full">
                 <div className="w-full flex h-full">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold text-[9pt]">{hotels[0] ? ((Number(hotels[0].bilangan)||0) * (Number(hotels[0].kadar)||0)).toFixed(2) : '0.00'}</div>
                 </div>
              </div>
            </div>
            <div className="w-1/2 p-2 flex">
              <div className="flex-1 text-[8.5pt]">BSH x ______ sebanyak RM ______ /hari.<br/><br/>[Resit ________________]</div>
              <div className="w-24 border-l border-black flex items-center justify-center h-full">
                 <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                 <div className="flex-1"></div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-black text-[8pt] font-bold text-center">
            <div className="w-1/2 border-r border-black py-2 uppercase">TUNTUTAN ELAUN LOJING (SEMENANJUNG)</div>
            <div className="w-1/2 py-2 uppercase">TUNTUTAN ELAUN LOJING (SABAH/SARAWAK)</div>
          </div>

          <div className="flex border-b border-black min-h-[60px]">
            <div className="w-1/2 border-r border-black p-2 flex">
              <div className="flex-1 text-[8.5pt] py-2">
                Elaun Lojing x <span className="font-bold border-b border-black px-1">{lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + (Number(l.bilangan)||0), 0) : '____'}</span> sebanyak RM <span className="font-bold border-b border-black px-1">{(Number(lojingsOnly[0]?.kadar)||0).toFixed(2)}</span> /hari
              </div>
              <div className="w-24 border-l border-black flex items-center justify-center h-full">
                 <div className="w-full flex h-full">
                    <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                    <div className="flex-1 flex items-center justify-end px-2 font-bold text-[9pt]">{lojingsOnly.length > 0 ? lojingsOnly.reduce((sum, l) => sum + ((Number(l.bilangan)||0) * (Number(l.kadar)||0)), 0).toFixed(2) : '0.00'}</div>
                 </div>
              </div>
            </div>
            <div className="w-1/2 p-2 flex">
              <div className="flex-1 text-[8.5pt] py-2">Elaun Lojing x ______ sebanyak RM ______ /hari</div>
              <div className="w-24 border-l border-black flex items-center justify-center h-full">
                 <div className="w-8 border-r border-black flex items-center justify-center font-bold text-[9pt]">RM</div>
                 <div className="flex-1"></div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-black min-h-[90px] text-[8.5pt]">
            <div className="w-1/2 border-r border-black p-2">
              <div className="font-bold">TARIKH LOJING: <span className="font-black border-b border-black px-1">{lojingsOnly[0]?.tarikh ? formatDate(lojingsOnly[0].tarikh) : '________________'}</span></div>
              <div className="font-bold mt-2 uppercase tracking-tight">ALAMAT LOJING:</div>
              <div className="mt-1 uppercase font-black text-[8pt] leading-tight">{lojingsOnly[0]?.alamat || ''}</div>
            </div>
            <div className="w-1/2 p-2">
              <div className="font-bold">TARIKH LOJING: ________________</div>
              <div className="font-bold mt-2 uppercase tracking-tight">ALAMAT LOJING:</div>
            </div>
          </div>

          <div className="flex font-black uppercase text-[10pt] bg-gray-50">
            <div className="flex-1 py-3 text-right pr-6 tracking-widest">JUMLAH (BAHAGIAN B)</div>
            <div className="w-24 border-l border-black flex">
               <div className="w-8 border-r border-black flex items-center justify-center font-bold">RM</div>
               <div className="flex-1 flex items-center justify-end px-2">{partBTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 5: BAHAGIAN C & PENGAKUAN */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[11pt] border-b-[1.5px] border-black bg-white">BAHAGIAN C</div>
          <div className="text-center font-bold py-1 uppercase text-[10pt] border-b-[1.5px] border-black bg-white">BELANJA PELBAGAI</div>
          <table className="w-full border-collapse">
            <tbody className="text-[9.5pt]">
              <tr className="border-b border-black">
                <td className="px-4 py-2">Telefon, Telegram, Faks [Resit <span className="font-bold border-b border-black px-2">{getMiscVal('telefon') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black w-8 text-center font-bold">RM</td>
                <td className="border-l border-black w-32 text-right px-2 font-bold">{getMiscVal('telefon') > 0 ? getMiscVal('telefon').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Pos [Resit <span className="font-bold border-b border-black px-2">{getMiscVal('pos') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('pos') > 0 ? getMiscVal('pos').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Dobi [Resit <span className="font-bold border-b border-black px-2">{getMiscVal('dobi') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('dobi') > 0 ? getMiscVal('dobi').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Cukai Lapangan Terbang [ Resit <span className="font-bold border-b border-black px-2">{getMiscVal('airportTax') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('airportTax') > 0 ? getMiscVal('airportTax').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Lebihan Bagasi [ Resit <span className="font-bold border-b border-black px-2">{getMiscVal('lebihanBagasi') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('lebihanBagasi') > 0 ? getMiscVal('lebihanBagasi').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Tempat Letak Kereta [Resit/Penyata Touch&Go /Lain-lain <span className="font-bold border-b border-black px-2">{getMiscVal('parking') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('parking') > 0 ? getMiscVal('parking').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Tol [Resit/Penyata Touch&Go /RFID/Lain-lain: <span className="font-bold border-b border-black px-2">{(getMiscVal('tol') + totalTolLogs) > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{(getMiscVal('tol') + totalTolLogs) > 0 ? (getMiscVal('tol') + totalTolLogs).toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Saringan/ Pengesanan/ Vaksin [Resit <span className="font-bold border-b border-black px-2">{getMiscVal('saringan') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('saringan') > 0 ? getMiscVal('saringan').toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2">Kemasukan ke Premis/Kawasan [Resit <span className="font-bold border-b border-black px-2">{getMiscVal('kemasukanPremis') > 0 ? 'DISERTAKAN' : '                '}</span>]</td>
                <td className="border-l border-black text-center font-bold">RM</td>
                <td className="border-l border-black text-right px-2 font-bold">{getMiscVal('kemasukanPremis') > 0 ? getMiscVal('kemasukanPremis').toFixed(2) : ''}</td>
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
        <div className="text-[7.5pt] italic mt-1 font-bold text-gray-500">- Sila tambah ruangan jika tidak mencukupi.</div>

        <div className="border-[1.5px] border-black p-6 mt-6">
          <div className="font-bold uppercase text-center text-[11pt] mb-4 tracking-widest underline underline-offset-4">PENGAKUAN</div>
          <div className="text-[9pt] space-y-2 leading-tight">
            <p>Saya mengaku bahawa:</p>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(a)</span>
              <p className="flex-1">perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(b)</span>
              <p className="flex-1">tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa dan/atau peraturan berkursus yang berkuat kuasa;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(c)</span>
              <p className="flex-1">perbelanjaan yang tidak disokong dengan resit berjumlah sebanyak RM.................................................. telah sebenarnya dilakukan dan dibayar oleh saya;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(d)</span>
              <p className="flex-1">perbelanjaan yang disokong dengan resit bukan atas nama saya berjumlah sebanyak RM…........................... telah sebenarnya dilakukan dan dibayar bagi pihak saya atas urusan rasmi dan tuntutan adalah berdasarkan kelayakan saya;</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(e)</span>
              <p className="flex-1">semua butiran yang dinyatakan di atas adalah tepat dan benar dan saya bertanggungjawab terhadap semua maklumat yang dinyatakan; dan</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 font-bold">(f)</span>
              <p className="flex-1">sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah seksyen 18, Akta Suruhanjaya Pencegahan Rasuah Malaysia 2009 [Akta 694] (Kesalahan dengan maksud untuk memperdayakan prinsipal oleh ejen).</p>
            </div>
          </div>
          <div className="flex justify-between mt-12">
             <div className="w-1/2 flex items-end font-bold text-[9pt]">Tarikh: ..................................</div>
             <div className="w-1/2 text-center">
                <div className="h-10 border-b border-black w-64 mx-auto border-dotted"></div>
                <div className="pt-2 font-bold uppercase text-[9pt]">(Tandatangan Pemohon)</div>
                <div className="font-black uppercase text-blue-900 text-[9pt]">{data.info.nama}</div>
             </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 6: PENGESAHAN & PENDAHULUAN DIRI */}
        <div className="border-[1.5px] border-black">
          <div className="text-center font-bold py-2 uppercase text-[12pt] border-b-[1.5px] border-black bg-white tracking-[0.1em]">PENGESAHAN</div>
          <div className="p-4 text-[10pt] text-justify leading-relaxed border-b-[1.5px] border-black">
            Berdasarkan pengakuan yang dinyatakan oleh pegawai yang memohon, disahkan bahawa perjalanan tersebut telah dilaksanakan atas urusan rasmi dan kelayakan tuntutan pegawai mematuhi peraturan kewangan yang berkuat kuasa.
          </div>
          <div className="flex border-b-[1.5px] border-black">
            <div className="w-[60%] border-r border-black p-4">
              <div className="mt-2 font-bold text-[10pt]">Tarikh: ...........................................</div>
            </div>
            <div className="w-[40%] p-4 text-center flex flex-col items-center">
              <div className="mt-12 w-full border-b border-black border-dotted"></div>
              <div className="text-[9pt] font-bold mt-1">(Tandatangan)</div>
              
              <div className="mt-8 w-full border-b border-black border-dotted"></div>
              <div className="text-[9pt] font-bold mt-1">(Nama)</div>
              
              <div className="mt-8 w-full border-b border-black border-dotted"></div>
              <div className="text-[9pt] font-bold mt-1">(Jawatan)</div>
              <div className="text-[8.5pt] font-bold mt-2 leading-tight">b.p. Ketua Setiausaha/ Pegawai Pengawal</div>
            </div>
          </div>

          <div className="text-center font-bold py-2 uppercase text-[11pt] border-b-[1.5px] border-black bg-white tracking-[0.05em]">PENDAHULUAN DIRI (JIKA ADA)</div>
          <table className="w-full border-collapse border-none">
            <tbody className="text-[10pt]">
              <tr className="border-b border-black">
                <td className="px-4 py-2.5">Pendahuluan Diri diberi</td>
                <td className="w-20 text-center border-l border-black font-bold">RM</td>
              </tr>
              <tr className="border-b border-black">
                <td className="px-4 py-2.5">Tolak: Tuntutan sekarang</td>
                <td className="w-20 text-center border-l border-black font-bold">RM</td>
              </tr>
              <tr className="">
                <td className="px-4 py-2.5">Baki dituntut/Baki dibayar balik</td>
                <td className="w-20 text-center border-l border-black font-bold">RM</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-[7pt] text-gray-400 italic">Sistem e-Tuntutan WP1.4 Digital | Dicetak pada: {new Date().toLocaleString('ms-MY')}</div>
      </div>
    </div>
  );
};

export default Step5Summary;
