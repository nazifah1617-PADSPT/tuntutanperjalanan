
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

  const totalKm = data.logs.reduce((sum, l) => sum + l.jarak, 0);
  const kadar = data.info.kenderaanJenis === 'Kereta' ? KADAR_KERETA : KADAR_MOTOSIKAL;
  const km1 = Math.min(totalKm, 500);
  const km2 = Math.max(0, totalKm - 500);
  
  // Define mileageCalc to resolve errors in the print section
  const amt1 = km1 * kadar.pertama;
  const amt2 = km2 * kadar.seterusnya;
  const mileageTotal = amt1 + amt2;
  const mileageCalc = { km1, km2, amt1, amt2, total: mileageTotal };

  const transportTotal = data.transport.teksi + data.transport.bas + data.transport.keretaApi + data.transport.feri + data.transport.lainLain;
  
  const mealTotal = 
    (data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar) +
    (data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar) +
    (data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar) +
    (data.meals.harian.bil * data.meals.harian.hari * data.meals.harian.kadar);

  const partATotal = mileageTotal + transportTotal + mealTotal;
  const partBTotal = data.lodgings.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0);
  const miscTotal = (Object.values(data.misc) as number[]).reduce((sum, val) => sum + val, 0);
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - data.advance;

  return (
    <div className="animate-fadeIn space-y-10">
      {/* UI Elements (Hidden on print) */}
      <div className="no-print space-y-10">
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase">Bahagian C: Belanja Pelbagai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {Object.keys(data.misc).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-xs">RM</span>
                  <input 
                    type="number" name={key} value={(data.misc as any)[key]} onChange={handleMisc}
                    className="w-full border rounded-lg p-2 pl-9 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-right"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center bg-blue-50 p-4 rounded-lg">
             <span className="text-xs font-bold text-blue-800 uppercase">Jumlah Bahagian C</span>
             <span className="text-lg font-bold text-blue-900">RM {miscTotal.toFixed(2)}</span>
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold border-b border-gray-700 pb-4 mb-6 uppercase tracking-widest text-blue-400">Ringkasan Keseluruhan</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs uppercase">Jumlah Bahagian A (Kenderaan/Tambang/Makan)</span>
              <span>RM {partATotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs uppercase">Jumlah Bahagian B (Hotel/Lojing)</span>
              <span>RM {partBTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs uppercase">Jumlah Bahagian C (Pelbagai)</span>
              <span>RM {miscTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-blue-200 font-black text-sm uppercase">Jumlah Kasar Tuntutan</span>
              <span className="text-3xl font-black text-blue-400">RM {grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-xl mt-6">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-orange-400 text-xs font-bold uppercase">Pendahuluan Diri</span>
                 <input 
                    type="number" value={data.advance} onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-b border-gray-700 text-right font-bold w-24 outline-none"
                 />
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-green-400 text-sm font-black uppercase">Baki Dituntut</span>
                 <span className="text-2xl font-black text-green-400">RM {nettTotal.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </section>

        <div className="text-center py-6">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-full font-black text-xl shadow-xl transition-all hover:scale-105 flex items-center gap-4 mx-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            CETAK WP1.4 (LAMPIRAN C)
          </button>
          <p className="text-xs text-gray-400 mt-4 italic font-medium">Format cetakan akan mengikut Lampiran C (WP1.4) rasmi kerajaan.</p>
        </div>
      </div>

      {/* Formal Print Layout (Hidden on UI, Visible on Print) */}
      <div className="print-only">
        <div className="text-right font-bold underline mb-2">LAMPIRAN C</div>
        <div className="text-center font-bold text-lg mb-8 uppercase">
          BORANG TUNTUTAN ELAUN PERJALANAN DALAM NEGERI<br/>
          BAGI BULAN: {data.logs[0]?.tarikh ? new Date(data.logs[0].tarikh).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }).toUpperCase() : '........'}
        </div>

        <div className="font-bold mb-4">1. MAKLUMAT PEGAWAI</div>
        <table className="mb-8 text-sm">
          <tbody className="no-border">
            <tr><td className="w-1/3">Nama (Huruf Besar)</td><td>: <strong>{data.info.nama.toUpperCase()}</strong></td></tr>
            <tr><td>No. Kad Pengenalan</td><td>: {data.info.ic}</td></tr>
            <tr><td>Jawatan / Gred</td><td>: {data.info.jawatan} / {data.info.gred}</td></tr>
            <tr><td>Gaji Hakiki / Elaun-elaun</td><td>: RM {data.info.gaji.toFixed(2)} / RM {data.info.elaun.toFixed(2)}</td></tr>
            <tr><td>No. Akaun / Nama Bank</td><td>: {data.info.akaunBank} ({data.info.namaBank})</td></tr>
            <tr><td>No. Kenderaan / Model</td><td>: {data.info.noPendaftaran} ({data.info.kenderaanModel})</td></tr>
            <tr><td>Alamat Pejabat</td><td>: {data.info.alamatPejabat}</td></tr>
            <tr><td>Alamat Rumah</td><td>: {data.info.alamatRumah}</td></tr>
          </tbody>
        </table>

        <div className="font-bold mb-4">2. KENYATAAN TUNTUTAN</div>
        <table className="mb-6 text-[9pt]">
          <thead>
            <tr className="bg-gray-100">
              <th>Tarikh</th>
              <th>Waktu</th>
              <th>Butiran (Tujuan / Destinasi)</th>
              <th>Jarak (KM)</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log, i) => (
              <tr key={i}>
                <td className="text-center">{log.tarikh}</td>
                <td className="text-center">{log.waktuBertolak} - {log.waktuSampai}</td>
                <td>{log.butiran}</td>
                <td className="text-right">{log.jarak.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td colSpan={3} className="text-right uppercase">Jumlah Jarak</td>
              <td className="text-right">{totalKm.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="font-bold mb-2">3. TUNTUTAN (BAHAGIAN A, B & C)</div>
        
        <div className="ml-4 mb-6">
          <div className="font-bold italic">BAHAGIAN A: Kenderaan / Tambang / Makan</div>
          <table className="mb-4 text-sm">
            <tbody>
              <tr>
                <td>Mileage: {km1.toFixed(2)} KM x {kadar.pertama.toFixed(2)}</td>
                <td className="w-32 text-right">RM {mileageCalc.amt1.toFixed(2)}</td>
              </tr>
              {km2 > 0 && (
                <tr>
                  <td>Mileage: {km2.toFixed(2)} KM x {kadar.seterusnya.toFixed(2)}</td>
                  <td className="text-right">RM {mileageCalc.amt2.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td>Tambang Pengangkutan Awam (Bas/Teksi/Kereta Api/Feri)</td>
                <td className="text-right">RM {transportTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Elaun Makan / Harian</td>
                <td className="text-right">RM {mealTotal.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td className="text-right uppercase">Jumlah Bahagian A</td>
                <td className="text-right">RM {partATotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="font-bold italic">BAHAGIAN B: Hotel / Lojing</div>
          <table className="mb-4 text-sm">
            <tbody>
              {data.lodgings.map((l, i) => (
                <tr key={i}>
                  <td>Bayaran Sewa Hotel (BSH) / Lojing - {l.bilangan} Hari/Malam @ {l.kadar.toFixed(2)}</td>
                  <td className="w-32 text-right">RM {(l.bilangan * l.kadar).toFixed(2)}</td>
                </tr>
              ))}
              {data.lodgings.length === 0 && <tr><td>Tiada Tuntutan Hotel / Lojing</td><td className="text-right">RM 0.00</td></tr>}
              <tr className="font-bold">
                <td className="text-right uppercase">Jumlah Bahagian B</td>
                <td className="text-right">RM {partBTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="font-bold italic">BAHAGIAN C: Belanja Pelbagai</div>
          <table className="mb-4 text-sm">
            <tbody>
              {Object.entries(data.misc).map(([k, v]) => (
                <tr key={k}>
                  <td className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="w-32 text-right">RM {v.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="text-right uppercase">Jumlah Bahagian C</td>
                <td className="text-right">RM {miscTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-black pt-4 mb-8">
           <div className="flex justify-between items-center text-lg font-bold">
              <span>JUMLAH BESAR TUNTUTAN (A + B + C)</span>
              <span>RM {grandTotal.toFixed(2)}</span>
           </div>
           {data.advance > 0 && (
             <div className="flex justify-between items-center text-sm">
                <span>TOLAK: Pendahuluan Diri</span>
                <span>RM {data.advance.toFixed(2)}</span>
             </div>
           )}
           <div className="flex justify-between items-center text-lg font-black mt-2">
              <span>JUMLAH BERSIH DITUNTUT</span>
              <span>RM {nettTotal.toFixed(2)}</span>
           </div>
        </div>

        <div className="page-break"></div>
        <div className="font-bold mb-4 mt-8">4. PENGAKUAN</div>
        <p className="text-sm mb-12 leading-relaxed">
          Saya mengaku bahawa perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi. 
          Tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa. 
          Saya juga mengaku perbelanjaan ini sebenarnya telah dibayar oleh saya sendiri.
        </p>

        <div className="grid grid-cols-2 gap-20 mb-16">
          <div className="text-center">
            <div className="mb-12">...................................................</div>
            <div className="font-bold uppercase text-sm">(Tandatangan Pemohon)</div>
            <div className="text-sm mt-2">Tarikh: {new Date().toLocaleDateString('ms-MY')}</div>
          </div>
          <div className="text-center">
             <div className="mb-12">...................................................</div>
             <div className="font-bold uppercase text-sm">Nama: {data.info.nama.toUpperCase()}</div>
          </div>
        </div>

        <div className="font-bold mb-4">5. PENGESAHAN KETUA JABATAN</div>
        <p className="text-sm mb-12">
          Adalah disahkan bahawa perjalanan tersebut telah dilakukan atas urusan rasmi dan tuntutan adalah teratur.
        </p>

        <div className="grid grid-cols-2 gap-20">
          <div className="text-center">
            <div className="mb-12">...................................................</div>
            <div className="font-bold uppercase text-sm">(Tandatangan)</div>
            <div className="text-sm mt-2">Tarikh: ..............................</div>
          </div>
          <div className="text-center">
             <div className="mb-12">...................................................</div>
             <div className="font-bold uppercase text-sm">(Cop Rasmi Jabatan)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;
