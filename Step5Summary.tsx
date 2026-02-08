
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
    // Fix: Changed 'mengahHari' to 'makanTengahHari' to match the MealAllowance interface
    (data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar) +
    (data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar);

  const harianTotal = (data.meals.harian.bil * data.meals.harian.hari * data.meals.harian.kadar);
  
  const sectionAMealHarianTotal = mealTotal + harianTotal;
  const partATotal = mileageTotal + transportTotal + sectionAMealHarianTotal;
  const partBTotal = data.lodgings.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0);
  
  const miscManualTotal = (Object.entries(data.misc)
    .filter(([key]) => key !== 'tol')
    .map(([_, v]) => v) as number[])
    .reduce((sum, val) => sum + val, 0);
  
  const miscTotal = miscManualTotal + totalTolLogs + data.misc.tol;
  
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - data.advance;

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

      {/* ========================================================== */}
      {/* SEKSYEN CETAKAN (IKUT FORMAT WP1.4) */}
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
            <tr>
              <td className="w-[35%]">Nama (Huruf Besar)</td>
              <td colSpan={2}>: <strong>{data.info.nama.toUpperCase() || '____________________'}</strong></td>
            </tr>
            <tr>
              <td>No. Kad Pengenalan</td>
              <td colSpan={2}>: {data.info.ic || '____________________'}</td>
            </tr>
            <tr>
              <td>Jawatan</td>
              <td colSpan={2}>: {data.info.jawatan || '____________________'}</td>
            </tr>
            <tr>
              <td>Gred</td>
              <td colSpan={2}>: {data.info.gred || '____________________'}</td>
            </tr>
            <tr>
              <td>No. Akaun Bank</td>
              <td colSpan={2}>: {data.info.akaunBank || '____________________'}</td>
            </tr>
            <tr>
              <td>Nama / Alamat Bank</td>
              <td colSpan={2}>: {data.info.namaBank || '____________________'}</td>
            </tr>
            <tr>
              <td>No. Telefon (Pejabat/Bimbit)</td>
              <td colSpan={2}>: {data.info.telefon || '____________________'}</td>
            </tr>
            <tr>
              <td rowSpan={3}>Pendapatan (RM)</td>
              <td className="w-24 border-r-0">Gaji</td>
              <td>: RM {data.info.gaji.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border-r-0">Elaun-elaun</td>
              <td>: RM {data.info.elaun.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border-r-0 font-bold">Jumlah</td>
              <td className="font-bold">: RM {(data.info.gaji + data.info.elaun).toFixed(2)}</td>
            </tr>
            <tr>
              <td rowSpan={2} className="align-middle">Kenderaan</td>
              <td className="text-center font-bold bg-gray-50">Kereta</td>
              <td className="text-center font-bold bg-gray-50">Motosikal</td>
            </tr>
            <tr>
              <td>
                Jenis / Model: {isKereta ? data.info.kenderaanModel : '-'}<br/>
                No. Plat: {isKereta ? data.info.noPendaftaran : '-'}
              </td>
              <td>
                Jenis / Model: {!isKereta ? data.info.kenderaanModel : '-'}<br/>
                No. Plat: {!isKereta ? data.info.noPendaftaran : '-'}
              </td>
            </tr>
            <tr>
              <td>Alamat Pejabat</td>
              <td colSpan={2}>{data.info.alamatPejabat || '____________________'}</td>
            </tr>
            <tr>
              <td>Alamat Rumah Pegawai</td>
              <td colSpan={2}>{data.info.alamatRumah || '____________________'}</td>
            </tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        {/* MUKA SURAT 2: KENYATAAN TUNTUTAN */}
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
                  {/* KOLUM TARIKH FORMAT DD/MM/YYYY */}
                  <td className="text-center align-middle p-2 font-bold" rowSpan={j.adaBalik ? 2 : 1}>
                    {formatDate(j.tarikh)}
                  </td>

                  <td className="text-center py-4">{formatTime(j.pergi.waktuBertolak)}</td>
                  <td className="text-center py-4">{formatTime(j.pergi.waktuSampai)}</td>
                  <td className="px-3 py-4 leading-normal">
                    <div className="font-bold mb-1 uppercase text-[8.5pt]">{j.tujuan}</div>
                    <div className="text-[8pt] mb-1">
                      Dari {j.pergi.dari} ke {j.pergi.ke}
                    </div>
                  </td>
                  <td className="text-center py-4">{j.pergi.jarak.toFixed(1)}</td>
                </tr>

                {j.adaBalik && (
                  <tr>
                    <td className="text-center py-4 border-l-0">{formatTime(j.balik.waktuBertolak)}</td>
                    <td className="text-center py-4">{formatTime(j.balik.waktuSampai)}</td>
                    <td className="px-3 py-4 leading-normal">
                      <div className="text-[8pt] mb-1">
                         Dari {j.balik.dari} ke {j.balik.ke}
                      </div>
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
        <div className="border-2 border-black">
          <div className="bg-white border-b-2 border-black text-center font-bold py-1 uppercase text-[11pt]">BAHAGIAN A</div>
          <div className="bg-white border-b border-black text-center font-bold py-1 uppercase text-[10pt]">ELAUN PERJALANAN KENDERAAN</div>
          
          <table className="w-full border-none">
            <thead>
              <tr className="bg-white">
                <th className="w-[20%] text-center border-r border-black">Jenis Kenderaan</th>
                <th className="w-[20%] text-center border-r border-black">Kiraan Kilometer</th>
                <th className="w-[20%] text-center border-r border-black">Jarak (KM)</th>
                <th className="w-[20%] text-center border-r border-black">Kadar (RM)</th>
                <th className="text-center">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-black">Kereta</td>
                <td className="border-r border-black">500 km pertama</td>
                <td className="text-center border-r border-black">{isKereta ? km1.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black">RM {KADAR_KERETA.pertama.toFixed(2)}</td>
                <td className="text-right">{isKereta ? amt1.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black">Seterusnya</td>
                <td className="text-center border-r border-black">{isKereta ? km2.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black">RM {KADAR_KERETA.seterusnya.toFixed(2)}</td>
                <td className="text-right">{isKereta ? amt2.toFixed(2) : ''}</td>
              </tr>
              <tr>
                <td rowSpan={2} className="text-center align-middle font-bold border-r border-black">Motosikal</td>
                <td className="border-r border-black">500 km pertama</td>
                <td className="text-center border-r border-black">{!isKereta ? km1.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black">RM {KADAR_MOTOSIKAL.pertama.toFixed(2)}</td>
                <td className="text-right">{!isKereta ? amt1.toFixed(2) : ''}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black">Seterusnya</td>
                <td className="text-center border-r border-black">{!isKereta ? km2.toFixed(2) : ''}</td>
                <td className="text-center border-r border-black">RM {KADAR_MOTOSIKAL.seterusnya.toFixed(2)}</td>
                <td className="text-right">{!isKereta ? amt2.toFixed(2) : ''}</td>
              </tr>
              <tr className="bg-white border-b-2 border-black">
                <td colSpan={4} className="text-right font-bold pr-4">Jumlah (Mileage)</td>
                <td className="text-right font-bold">{mileageTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-white border-b border-black text-center font-bold py-1 uppercase text-[10pt]">TAMBANG PENGANGKUTAN AWAM</div>
          <table className="w-full border-none">
            <tbody>
              <tr>
                <td className="w-[80%] border-r border-black">Teksi/Bas/Lain-lain</td>
                <td className="w-[5%] text-center border-r border-black font-bold">RM</td>
                <td className="text-right">{transportTotal.toFixed(2)}</td>
              </tr>
              <tr className="bg-white border-b-2 border-black font-bold">
                <td className="text-right pr-4 border-r border-black uppercase">Jumlah Tambang</td>
                <td className="text-center border-r border-black">RM</td>
                <td className="text-right">{transportTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-white border-b border-black text-center font-bold py-1 uppercase text-[10pt]">ELAUN MAKAN / HARIAN</div>
          <table className="w-full border-none">
            <tbody>
              <tr>
                <td className="w-[80%] border-r border-black">Elaun Makan (Sarapan/Tengahari/Malam)</td>
                <td className="w-[5%] text-center border-r border-black font-bold">RM</td>
                <td className="text-right">{mealTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border-r border-black">Elaun Harian</td>
                <td className="text-center border-r border-black font-bold">RM</td>
                <td className="text-right">{harianTotal.toFixed(2)}</td>
              </tr>
              <tr className="bg-white border-b-2 border-black font-bold">
                <td className="text-right pr-4 border-r border-black uppercase">Jumlah Elaun</td>
                <td className="text-center border-r border-black">RM</td>
                <td className="text-right">{sectionAMealHarianTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex justify-end font-bold text-[11pt] p-2 pr-4 bg-gray-50 uppercase">
             <span>JUMLAH BESAR (BAHAGIAN A) RM {partATotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 4: BAHAGIAN B & C & PENGAKUAN */}
        <div className="title-box">BAHAGIAN B (HOTEL/LOJING) & C (PELBAGAI)</div>
        <table>
          <tbody className="text-[10pt]">
            <tr>
              <td className="w-[80%] font-bold">JUMLAH BAHAGIAN B (Hotel / Lojing)</td>
              <td className="text-right font-bold">RM {partBTotal.toFixed(2)}</td>
            </tr>
            <tr className="border-b-2 border-black">
              <td colSpan={2} className="text-[8pt] italic text-gray-500 py-1">Butiran alamat hotel/lojing disertakan bersama resit asal.</td>
            </tr>
            <tr><td className="pt-4">Telefon / Pos / Dobi</td><td className="text-right pt-4">{ (data.misc.telefon + data.misc.pos + data.misc.dobi).toFixed(2) }</td></tr>
            <tr><td>Parking / Tol</td><td className="text-right">{ (data.misc.parking + miscTotal - (data.misc.telefon + data.misc.pos + data.misc.dobi)).toFixed(2) }</td></tr>
            <tr className="font-bold border-t border-black"><td className="text-right uppercase">Jumlah (Bahagian C)</td><td className="text-right">RM {miscTotal.toFixed(2)}</td></tr>
            <tr className="font-black bg-gray-100 text-[11pt] border-t-2 border-black"><td className="text-right uppercase py-3">Jumlah Keseluruhan (A+B+C)</td><td className="text-right py-3">RM {grandTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <div className="border-2 border-black p-6 mt-10">
          <div className="font-bold underline mb-6 uppercase text-center text-[11pt]">PENGAKUAN</div>
          <div className="text-[9.5pt] leading-relaxed space-y-3">
            <p>Saya mengaku bahawa:</p>
            <p>(a) perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;</p>
            <p>(b) tuntutan ini dibuat mengikut kadar dan syarat di bawah peraturan WP1.4 yang berkuat kuasa;</p>
            <p>(c) perbelanjaan yang tidak disokong dengan resit berjumlah RM <strong>{miscManualTotal.toFixed(2)}</strong> sebenarnya dibayar oleh saya;</p>
            <p>(d) sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah Seksyen 18, Akta SPRM 2009.</p>
          </div>
          
          <div className="flex justify-between mt-16">
             <div className="w-1/2">Tarikh: {new Date().toLocaleDateString('ms-MY')}</div>
             <div className="w-1/2 text-center">
                <div className="h-12"></div>
                <div className="border-t border-black w-64 mx-auto pt-2 font-bold uppercase">(Tandatangan Pemohon)</div>
                <div className="text-[9pt]">{data.info.nama.toUpperCase()}</div>
             </div>
          </div>
        </div>

        {/* PENDAHULUAN DIRI (PDF FOOTER) */}
        <div className="mt-12 border-2 border-black p-4">
          <div className="font-bold uppercase text-[9pt] mb-4">Ringkasan Pembayaran:</div>
          <table className="w-full border-none text-[10pt]">
             <tbody>
                <tr><td>Jumlah Tuntutan Kasar</td><td className="text-right font-bold">RM {grandTotal.toFixed(2)}</td></tr>
                <tr><td>Tolak: Pendahuluan Diri</td><td className="text-right">RM {data.advance.toFixed(2)}</td></tr>
                <tr className="border-t border-black font-black"><td>Baki Bersih Dituntut</td><td className="text-right text-[12pt]">RM {nettTotal.toFixed(2)}</td></tr>
             </tbody>
          </table>
        </div>

        <div className="mt-10 flex justify-between px-4 text-gray-400 italic text-[7pt]">
           <div>Sistem e-Tuntutan WP1.4 Digital</div>
           <div>Dicetak pada: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;
