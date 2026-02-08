
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
    (data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar) +
    (data.meals.harian.bil * data.meals.harian.hari * data.meals.harian.kadar);

  const partATotal = mileageTotal + transportTotal + mealTotal;
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
    : 'JANUARI 2026';

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

        <section className="bg-blue-900 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="relative z-10">
              <h2 className="text-xl font-bold border-b border-blue-800 pb-6 mb-8 uppercase tracking-widest text-blue-300 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                 Rumusan Keseluruhan Tuntutan
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center py-3 border-b border-blue-800/50">
                      <span className="text-blue-300 uppercase text-[10px] font-black tracking-widest">Bahagian A</span>
                      <span className="text-xl font-mono font-bold">RM {partATotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-blue-800/50">
                      <span className="text-blue-300 uppercase text-[10px] font-black tracking-widest">Bahagian B</span>
                      <span className="text-xl font-mono font-bold">RM {partBTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-blue-800/50">
                      <span className="text-blue-300 uppercase text-[10px] font-black tracking-widest">Bahagian C</span>
                      <span className="text-xl font-mono font-bold">RM {miscTotal.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="lg:col-span-2 bg-blue-950/40 rounded-[2rem] p-8 border border-blue-800/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="text-center md:text-left">
                          <span className="text-blue-400 uppercase text-[10px] font-black tracking-widest block mb-2">Jumlah Kasar (A+B+C)</span>
                          <span className="text-5xl font-black text-white">RM {grandTotal.toFixed(2)}</span>
                       </div>
                       <div className="h-12 w-[1px] bg-blue-800 hidden md:block"></div>
                       <div className="text-center md:text-right">
                          <span className="text-orange-400 uppercase text-[10px] font-black tracking-widest block mb-2 underline decoration-orange-500/30 underline-offset-4">Tolak: Pendahuluan Diri</span>
                          <div className="flex items-center justify-center md:justify-end gap-2">
                             <span className="text-orange-300 text-lg font-bold">RM</span>
                             <input 
                                type="number" value={data.advance} onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-b-2 border-orange-500/30 text-right font-black w-28 outline-none text-orange-400 text-3xl focus:border-orange-500 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-blue-800/50 flex justify-between items-center">
                       <span className="text-green-400 uppercase text-xs font-black tracking-widest">Baki Bersih Dituntut</span>
                       <span className="text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]">RM {nettTotal.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <div className="flex flex-col items-center gap-4 py-8">
          <button 
            onClick={() => window.print()} 
            className="group relative bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            JANA LAMPIRAN C (PDF)
          </button>
          <p className="text-gray-400 text-xs font-medium animate-pulse">Sila gunakan pelayar Chrome atau Edge untuk hasil cetakan terbaik.</p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SEKSYEN CETAKAN (IKUT FORMAT PDF SEBIJIK) */}
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
            <tr><th colSpan={3} className="text-center py-1 uppercase font-bold tracking-widest">MAKLUMAT PEGAWAI</th></tr>
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
        <div className="text-[8pt] italic mt-1">- Sila tambah ruangan jika tidak mencukupi.</div>
        <div className="text-[8pt] mt-1">* Diisi oleh pegawai yang layak menuntut tuntutan Perjalanan di bawah PP WP1.4</div>

        <div className="page-break"></div>

        {/* MUKA SURAT 2: KENYATAAN TUNTUTAN (IKUT SCREENSHOT) */}
        <div className="title-box">KENYATAAN TUNTUTAN</div>
        <table>
          <thead>
            <tr className="bg-gray-100">
              <th className="w-[15%] text-center py-2" rowSpan={2}>Tarikh</th>
              <th className="text-center py-2" colSpan={2}>Waktu</th>
              <th className="text-center py-2" rowSpan={2}>Tujuan/Tempat</th>
              <th className="w-[15%] text-center py-2" rowSpan={2}>Tambang / Jarak</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="w-[12%] text-center py-2">Bertolak</th>
              <th className="w-[12%] text-center py-2">Sampai</th>
            </tr>
          </thead>
          <tbody className="text-[9.5pt]">
            {data.logs.map((j, i) => (
              <React.Fragment key={i}>
                {/* Baris 1: Perjalanan Pergi */}
                <tr>
                  <td className="text-center align-middle font-normal" rowSpan={j.adaBalik ? 2 : 1}>
                    {j.tarikh}
                  </td>
                  <td className="text-center py-4">{j.pergi.waktuBertolak}</td>
                  <td className="text-center py-4">{j.pergi.waktuSampai}</td>
                  <td className="px-3 py-4 leading-normal">
                    <div className="font-bold mb-2 uppercase">{j.tujuan}</div>
                    <div>
                      Dari {j.pergi.dari} ke {j.pergi.ke} dengan memandu {data.info.kenderaanJenis.toLowerCase()} sendiri
                    </div>
                  </td>
                  <td className="text-center py-4">{j.pergi.jarak.toFixed(1)} km</td>
                </tr>
                {/* Baris 2: Perjalanan Balik (Jika ada) */}
                {j.adaBalik && (
                  <tr>
                    <td className="text-center py-4 border-l-0">{j.balik.waktuBertolak}</td>
                    <td className="text-center py-4">{j.balik.waktuSampai}</td>
                    <td className="px-3 py-4 leading-normal">
                      Dari {j.balik.dari} ke {j.balik.ke} dengan memandu {data.info.kenderaanJenis.toLowerCase()} sendiri
                    </td>
                    <td className="text-center py-4">{j.balik.jarak.toFixed(1)} km</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {/* Baris Jumlah di hujung jadual */}
            <tr className="font-bold bg-gray-50">
              <td colSpan={4} className="text-right py-3 pr-4 uppercase">Jumlah Jarak Tuntutan Elaun Kenderaan:</td>
              <td className="text-center py-3">{totalKm.toFixed(1)} KM</td>
            </tr>
          </tbody>
        </table>
        <div className="text-right text-[8pt] mt-2 italic">(bersambung)</div>

        <div className="page-break"></div>

        {/* MUKA SURAT 3: BAHAGIAN A */}
        <div className="title-box">BAHAGIAN A</div>
        <div className="font-bold text-center mb-2 uppercase">ELAUN PERJALANAN KENDERAAN</div>
        <table>
          <thead className="text-[8.5pt]">
            <tr className="bg-gray-100">
              <th>Jenis Kenderaan</th>
              <th>Kiraan Kilometer</th>
              <th>Jarak (km)</th>
              <th>Kadar Sekilometer</th>
              <th>Jumlah (RM)</th>
            </tr>
          </thead>
          <tbody className="text-[9pt]">
            <tr>
              <td className="text-center font-bold" rowSpan={2}>{data.info.kenderaanJenis}</td>
              <td>500 km pertama</td>
              <td className="text-center">{km1.toFixed(2)}</td>
              <td className="text-center">RM {kadar.pertama.toFixed(2)}</td>
              <td className="text-right">{amt1.toFixed(2)}</td>
            </tr>
            <tr>
              <td>501 km dan seterusnya</td>
              <td className="text-center">{km2.toFixed(2)}</td>
              <td className="text-center">RM {kadar.seterusnya.toFixed(2)}</td>
              <td className="text-right">{amt2.toFixed(2)}</td>
            </tr>
            <tr className="font-bold bg-gray-50">
               <td colSpan={4} className="text-right uppercase">Jumlah</td>
               <td className="text-right">{mileageTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="font-bold text-center mt-6 mb-2 uppercase">TUNTUTAN TAMBANG PENGANGKUTAN AWAM</div>
        <table>
           <tbody className="text-[9pt]">
              <tr><td className="w-[75%]">Teksi/Kereta Sewa [Resit: {data.transport.teksi > 0 ? 'Ada' : 'Tiada'}]</td><td className="text-right">{data.transport.teksi > 0 ? data.transport.teksi.toFixed(2) : '-'}</td></tr>
              <tr><td>Bas [Resit: {data.transport.bas > 0 ? 'Ada' : 'Tiada'}]</td><td className="text-right">{data.transport.bas > 0 ? data.transport.bas.toFixed(2) : '-'}</td></tr>
              <tr><td>Kereta Api [Resit: {data.transport.keretaApi > 0 ? 'Ada' : 'Tiada'}]</td><td className="text-right">{data.transport.keretaApi > 0 ? data.transport.keretaApi.toFixed(2) : '-'}</td></tr>
              <tr><td>Feri [Resit: {data.transport.feri > 0 ? 'Ada' : 'Tiada'}]</td><td className="text-right">{data.transport.feri > 0 ? data.transport.feri.toFixed(2) : '-'}</td></tr>
              <tr><td>Lain-lain [Resit: {data.transport.lainLain > 0 ? 'Ada' : 'Tiada'}]</td><td className="text-right">{data.transport.lainLain > 0 ? data.transport.lainLain.toFixed(2) : '-'}</td></tr>
              <tr className="font-bold bg-gray-50"><td className="text-right uppercase">Jumlah</td><td className="text-right">{transportTotal.toFixed(2)}</td></tr>
           </tbody>
        </table>

        <div className="grid grid-cols-2 mt-6 gap-0">
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Elaun Makan/Harian (Semenanjung Malaysia)</div>
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Elaun Makan/Harian (Sabah/Sarawak/WP Labuan)</div>
          <div className="border border-black p-0">
             <table className="border-none w-full text-[8pt]">
                <thead><tr className="bg-gray-100"><th>Bahagian Makan</th><th>Bil. Dituntut</th><th>Bil. Hari</th><th>RM</th></tr></thead>
                <tbody>
                   <tr><td>Sarapan Pagi</td><td className="text-center">{data.meals.sarapan.bil}</td><td className="text-center">{data.meals.sarapan.hari}</td><td className="text-right">{(data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar).toFixed(2)}</td></tr>
                   <tr><td>Makan Tengah Hari</td><td className="text-center">{data.meals.makanTengahHari.bil}</td><td className="text-center">{data.meals.makanTengahHari.hari}</td><td className="text-right">{(data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar).toFixed(2)}</td></tr>
                   <tr><td>Makan Malam</td><td className="text-center">{data.meals.makanMalam.bil}</td><td className="text-center">{data.meals.makanMalam.hari}</td><td className="text-right">{(data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar).toFixed(2)}</td></tr>
                   <tr className="font-bold border-t border-black"><td>Jumlah (Makan)</td><td colSpan={3} className="text-right">{mealTotal.toFixed(2)}</td></tr>
                </tbody>
             </table>
          </div>
          <div className="border border-black flex items-center justify-center italic text-gray-400 text-[8pt]">- Tiada -</div>
        </div>
        <div className="border border-black border-t-0 bg-gray-50 p-1 flex justify-between font-bold text-[10pt]">
           <span className="uppercase ml-4">Jumlah (Bahagian A)</span>
           <span className="mr-2">RM {partATotal.toFixed(2)}</span>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 4: BAHAGIAN B */}
        <div className="title-box">BAHAGIAN B</div>
        <div className="grid grid-cols-2 gap-0">
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Bayaran Sewa Hotel (BSH) (Semenanjung Malaysia)</div>
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Bayaran Sewa Hotel (BSH) (Sabah/Sarawak/WP Labuan)</div>
          <div className="border border-black min-h-[150px] p-2">
             {data.lodgings.filter(l => l.jenis === 'Hotel').map((l, i) => (
               <div key={i} className="text-[8pt] mb-2">
                  RM {l.kadar.toFixed(2)} x {l.bilangan} hari = <strong>RM {(l.kadar * l.bilangan).toFixed(2)}</strong><br/>
                  (Termasuk Bayaran Perkhidmatan & Cukai)<br/>
                  [Resit: Ada] - {l.alamat}
               </div>
             ))}
          </div>
          <div className="border border-black"></div>
          
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Elaun Lojing (Semenanjung Malaysia)</div>
          <div className="border border-black p-2 font-bold text-center uppercase text-[8pt]">Tuntutan Elaun Lojing (Sabah/Sarawak/WP Labuan)</div>
          <div className="border border-black min-h-[100px] p-2">
             {data.lodgings.filter(l => l.jenis === 'Lojing').map((l, i) => (
                <div key={i} className="text-[8pt] mb-1">
                   RM {l.kadar.toFixed(2)} x {l.bilangan} hari = <strong>RM {(l.kadar * l.bilangan).toFixed(2)}</strong>
                </div>
             ))}
          </div>
          <div className="border border-black"></div>
        </div>
        <div className="border border-black border-t-0 bg-gray-50 p-1 flex justify-between font-bold text-[10pt]">
           <span className="uppercase ml-4">Jumlah (Bahagian B)</span>
           <span className="mr-2">RM {partBTotal.toFixed(2)}</span>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 5: BAHAGIAN C & PENGAKUAN */}
        <div className="title-box">BAHAGIAN C</div>
        <div className="font-bold text-center mb-2 uppercase">BELANJA PELBAGAI</div>
        <table>
          <tbody className="text-[9pt]">
            <tr><td className="w-[85%]">Telefon, Telegram, Faks [Resit: {data.misc.telefon > 0 ? 'Ada' : '-'}]</td><td className="text-right">{data.misc.telefon > 0 ? data.misc.telefon.toFixed(2) : '-'}</td></tr>
            <tr><td>Pos [Resit: {data.misc.pos > 0 ? 'Ada' : '-'}]</td><td className="text-right">{data.misc.pos > 0 ? data.misc.pos.toFixed(2) : '-'}</td></tr>
            <tr><td>Dobi [Resit: {data.misc.dobi > 0 ? 'Ada' : '-'}]</td><td className="text-right">{data.misc.dobi > 0 ? data.misc.dobi.toFixed(2) : '-'}</td></tr>
            <tr><td>Cukai Lapangan Terbang [Resit: {data.misc.airportTax > 0 ? 'Ada' : '-'}]</td><td className="text-right">{data.misc.airportTax > 0 ? data.misc.airportTax.toFixed(2) : '-'}</td></tr>
            <tr><td>Lebihan Bagasi [Resit: {data.misc.lebihanBagasi > 0 ? 'Ada' : '-'}]</td><td className="text-right">{data.misc.lebihanBagasi > 0 ? data.misc.lebihanBagasi.toFixed(2) : '-'}</td></tr>
            <tr><td>Tempat Letak Kereta [Resit/Penyata Touch&Go/RFID/Lain-lain]</td><td className="text-right">{data.misc.parking > 0 ? data.misc.parking.toFixed(2) : '-'}</td></tr>
            <tr><td>Tol [Resit/Penyata Touch&Go/RFID/Lain-lain]</td><td className="text-right">{miscTotal.toFixed(2)}</td></tr>
            <tr className="font-bold bg-gray-50"><td className="text-right uppercase">Jumlah (Bahagian C)</td><td className="text-right">{miscTotal.toFixed(2)}</td></tr>
            <tr className="font-bold bg-blue-50"><td className="text-right uppercase py-2">Jumlah Keseluruhan Tuntutan (Bahagian A+B+C)</td><td className="text-right py-2">RM {grandTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <div className="border border-black p-4 mt-8">
          <div className="font-bold underline mb-4 uppercase text-center">PENGAKUAN</div>
          <div className="text-[9pt] leading-relaxed space-y-2">
            <p>Saya mengaku bahawa:</p>
            <p>(a) perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;</p>
            <p>(b) tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa;</p>
            <p>(c) perbelanjaan yang tidak disokong dengan resit berjumlah sebanyak RM <strong>{miscManualTotal.toFixed(2)}</strong> telah sebenarnya dilakukan dan dibayar oleh saya;</p>
            <p>(d) perbelanjaan yang disokong dengan resit bukan atas nama saya berjumlah sebanyak RM __________ telah sebenarnya dilakukan dan dibayar oleh saya bagi pihak saya atas urusan rasmi dan tuntutan adalah berdasarkan kelayakan saya;</p>
            <p>(e) semua butiran yang dinyatakan di atas adalah tepat dan benar dan saya bertanggungjawab terhadap semua maklumat yang dinyatakan; dan</p>
            <p>(f) sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah Seksyen 18, Akta Suruhanjaya Pencegahan Rasuah Malaysia 2009 [Akta 694] (Kesalahan dengan maksud untuk memperdayakan prinsipal oleh ejen).</p>
          </div>
          
          <div className="flex justify-between mt-12 mb-4">
             <div className="w-1/2">Tarikh: {new Date().toLocaleDateString('ms-MY')}</div>
             <div className="w-1/2 text-center">
                <div className="h-10"></div>
                <div className="border-t border-black w-64 mx-auto pt-1 font-bold">(Tandatangan Pemohon)</div>
                <div className="text-[8pt]">{data.info.nama.toUpperCase()}</div>
             </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* MUKA SURAT 6: PENGESAHAN (IKUT SCREENSHOT) */}
        <table className="w-full">
          <thead>
            <tr>
              <th colSpan={2} className="text-center py-2 uppercase font-bold tracking-widest text-[11pt]">PENGESAHAN</th>
            </tr>
          </thead>
          <tbody className="text-[10pt]">
            <tr>
              <td colSpan={2} className="p-4 leading-relaxed">
                Berdasarkan pengakuan yang dinyatakan oleh pegawai yang memohon, adalah disahkan bahawa perjalanan tersebut telah dilaksanakan atas urusan rasmi dan kelayakan tuntutan pegawai adalah tertakluk mematuhi peraturan kewangan yang berkuat kuasa.
              </td>
            </tr>
            <tr>
              <td className="w-1/2 p-4 align-top">
                Tarikh: .......................................................
              </td>
              <td className="w-1/2 p-4 text-center">
                <div className="h-12 flex items-end justify-center">
                  .......................................................
                </div>
                <div className="text-[9pt] font-medium">(Tandatangan)</div>
              </td>
            </tr>
            <tr>
              <td className="p-4"></td>
              <td className="p-4 text-center">
                <div className="h-12 flex items-end justify-center">
                  .......................................................
                </div>
                <div className="text-[9pt] font-medium">(Nama)</div>
              </td>
            </tr>
            <tr>
              <td className="p-4"></td>
              <td className="p-4 text-center">
                <div className="h-12 flex items-end justify-center">
                  .......................................................
                </div>
                <div className="text-[9pt] font-medium leading-tight">
                  (Jawatan)<br/>
                  b.p. Ketua Setiausaha/<br/>
                  Pegawai Pengawal
                </div>
              </td>
            </tr>
            
            {/* PENDAHULUAN DIRI (DALAM JADUAL YANG SAMA ATAU ASING) */}
            <tr>
              <th colSpan={2} className="text-center py-2 uppercase font-bold tracking-widest text-[11pt] border-t-2 border-black">
                PENDAHULUAN DIRI (JIKA ADA)
              </th>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-t-0">
          <tbody className="text-[10pt]">
            <tr>
              <td className="w-[70%] p-2">Pendahuluan Diri diberi</td>
              <td className="w-[10%] text-center border-l-0">RM</td>
              <td className="w-[20%] text-right p-2"></td>
            </tr>
            <tr>
              <td className="p-2">Tolak: Tuntutan sekarang</td>
              <td className="text-center border-l-0">RM</td>
              <td className="text-right p-2">{grandTotal.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td className="p-2">Baki dituntut/Baki dibayar balik</td>
              <td className="text-center border-l-0">RM</td>
              <td className="text-right p-2">{nettTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-10 flex justify-between px-4">
           <div className="text-center italic text-gray-400 text-[8pt]">Sistem e-Tuntutan Perjalanan WP1.4</div>
           <div className="text-center italic text-gray-400 text-[8pt]">Dicetak pada: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;
