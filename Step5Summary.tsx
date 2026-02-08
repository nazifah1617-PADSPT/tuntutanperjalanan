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

  // Calculations based on JourneyGroup structure
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
      <div className="no-print space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b pb-2 mb-6">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Bahagian C: Belanja Pelbagai</h2>
            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Tol Automatik: RM {totalTolLogs.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {Object.entries(data.misc).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">RM</span>
                  <input 
                    type="number" name={key} value={value} onChange={handleMisc}
                    className="w-full border rounded-lg p-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right font-semibold"
                    disabled={key === 'tol' && totalTolLogs > 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-900 text-white rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-bold border-b border-blue-800 pb-4 mb-6 uppercase tracking-widest text-blue-300">Ringkasan Tuntutan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-blue-800/50">
              <span className="text-blue-300 uppercase text-xs font-bold">Jumlah Bahagian A</span>
              <span className="text-lg font-mono">RM {partATotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-800/50">
              <span className="text-blue-300 uppercase text-xs font-bold">Jumlah Bahagian B</span>
              <span className="text-lg font-mono">RM {partBTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-800/50">
              <div className="flex flex-col">
                <span className="text-blue-300 uppercase text-xs font-bold">Jumlah Bahagian C</span>
                <span className="text-[10px] text-blue-500">(Termasuk Tol: RM {totalTolLogs.toFixed(2)})</span>
              </div>
              <span className="text-lg font-mono">RM {miscTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-white uppercase text-sm font-black">Jumlah Kasar (A+B+C)</span>
              <span className="text-4xl font-black text-blue-400">RM {grandTotal.toFixed(2)}</span>
            </div>
            <div className="bg-blue-950/50 p-6 rounded-xl mt-8 border border-blue-800">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Tolak: Pendahuluan Diri</span>
                 <input 
                    type="number" value={data.advance} onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-b border-orange-500/50 text-right font-bold w-32 outline-none text-orange-400 text-xl"
                 />
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-blue-800 text-green-400">
                 <span className="text-sm font-black uppercase tracking-widest">Baki Bersih Dituntut</span>
                 <span className="text-4xl font-black">RM {nettTotal.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center py-6">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            CETAK LAMPIRAN C (WP1.4)
          </button>
        </div>
      </div>

      <div className="print-only">
        <div className="text-right font-bold underline mb-4">LAMPIRAN C</div>
        <div className="text-center font-bold text-lg leading-tight mb-8 uppercase">
          KENYATAAN TUNTUTAN ELAUN PERJALANAN DALAM NEGERI WP1.4<br/>
          BAGI BULAN {bulanTuntutan}
        </div>

        <table className="mb-6">
          <thead><tr><th colSpan={4} className="bg-gray-50 text-center py-1 uppercase font-bold">MAKLUMAT PEGAWAI</th></tr></thead>
          <tbody className="border-none">
            <tr className="border-none"><td className="w-1/3">Nama (Huruf Besar)</td><td colSpan={3}>: <strong>{data.info.nama.toUpperCase() || '____________________'}</strong></td></tr>
            <tr className="border-none"><td>No. Kad Pengenalan</td><td colSpan={3}>: {data.info.ic || '____________________'}</td></tr>
            <tr className="border-none"><td>Jawatan</td><td colSpan={3}>: {data.info.jawatan || '____________________'}</td></tr>
            <tr className="border-none"><td>Gred</td><td colSpan={3}>: {data.info.gred || '____________________'}</td></tr>
            <tr className="border-none"><td>No. Akaun Bank</td><td colSpan={3}>: {data.info.akaunBank || '____________________'}</td></tr>
            <tr className="border-none"><td>Nama / Alamat Bank</td><td colSpan={3}>: {data.info.namaBank || '____________________'}</td></tr>
            <tr className="border-none"><td>No. Telefon</td><td colSpan={3}>: {data.info.telefon || '____________________'}</td></tr>
            <tr className="border-none">
              <td>Pendapatan (RM)</td>
              <td colSpan={3}>: Gaji: RM {data.info.gaji.toFixed(2)} | Elaun: RM {data.info.elaun.toFixed(2)} | Jumlah: RM {(data.info.gaji + data.info.elaun).toFixed(2)}</td>
            </tr>
            <tr className="border-none">
              <td>Kenderaan</td>
              <td colSpan={3}>: {data.info.kenderaanJenis} ({data.info.kenderaanModel}) - No. Plat: {data.info.noPendaftaran}</td>
            </tr>
            <tr className="border-none"><td>Alamat Pejabat</td><td colSpan={3}>: {data.info.alamatPejabat}</td></tr>
            <tr className="border-none"><td>Alamat Rumah</td><td colSpan={3}>: {data.info.alamatRumah}</td></tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        <table className="text-[9pt]">
          <thead><tr><th colSpan={5} className="bg-gray-50 text-center py-1 uppercase font-bold">KENYATAAN TUNTUTAN</th></tr></thead>
          <thead>
            <tr className="bg-gray-50">
              <th className="w-20">Tarikh</th>
              <th className="w-32">Waktu Bertolak/Sampai</th>
              <th>Tujuan / Tempat (Perkara)</th>
              <th className="w-24">Tol (RM)</th>
              <th className="w-24">Jarak (KM)</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((j, i) => (
              <React.Fragment key={i}>
                {/* Baris Pergi */}
                <tr>
                  <td className="text-center">{j.tarikh}</td>
                  <td className="text-center">{j.pergi.waktuBertolak} - {j.pergi.waktuSampai}</td>
                  <td className="text-sm">
                    <strong>TUJUAN: {j.tujuan.toUpperCase()}</strong><br/>
                    DARI {j.pergi.dari.toUpperCase()} KE {j.pergi.ke.toUpperCase()}
                  </td>
                  <td className="text-right">{j.pergi.tol > 0 ? j.pergi.tol.toFixed(2) : ''}</td>
                  <td className="text-right">{j.pergi.jarak.toFixed(2)}</td>
                </tr>
                {/* Baris Balik */}
                {j.adaBalik && (
                  <tr>
                    <td className="text-center">{j.tarikh}</td>
                    <td className="text-center">{j.balik.waktuBertolak} - {j.balik.waktuSampai}</td>
                    <td className="text-sm italic">
                      DARI {j.balik.dari.toUpperCase()} KE {j.balik.ke.toUpperCase()} (BALIK)
                    </td>
                    <td className="text-right">{j.balik.tol > 0 ? j.balik.tol.toFixed(2) : ''}</td>
                    <td className="text-right">{j.balik.jarak.toFixed(2)}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            <tr className="font-bold">
              <td colSpan={3} className="text-right uppercase py-2">Jumlah Keseluruhan:</td>
              <td className="text-right py-2">RM {totalTolLogs.toFixed(2)}</td>
              <td className="text-right py-2">{totalKm.toFixed(2)} km</td>
            </tr>
          </tbody>
        </table>

        <div className="page-break"></div>
        {/* Bahagian Summary A, B, C & Pengakuan (Sama seperti sebelumnya namun dengan total yang dikira dari kad) */}
        <table className="mb-4 text-[9pt]">
          <thead><tr><th colSpan={5} className="bg-gray-50 text-center py-1 uppercase font-bold">BAHAGIAN A: ELAUN PERJALANAN KENDERAAN</th></tr></thead>
          <tbody>
            <tr>
              <td>500 km pertama</td><td className="text-center">{km1.toFixed(2)} km</td><td className="text-center">RM {kadar.pertama.toFixed(2)}</td><td className="text-right">RM {amt1.toFixed(2)}</td>
            </tr>
            <tr>
              <td>501 km dan seterusnya</td><td className="text-center">{km2.toFixed(2)} km</td><td className="text-center">RM {kadar.seterusnya.toFixed(2)}</td><td className="text-right">RM {amt2.toFixed(2)}</td>
            </tr>
            <tr className="font-bold"><td colSpan={3} className="text-right">JUMLAH (BAHAGIAN A)</td><td className="text-right">RM {mileageTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <div className="border border-black p-4 mt-8">
          <div className="font-bold underline mb-2 uppercase">PENGAKUAN</div>
          <p className="text-[8pt] leading-tight">
            Saya mengaku bahawa tuntutan ini adalah benar mengikut peraturan bertugas rasmi yang berkuat kuasa. 
            Jumlah tuntutan bersih adalah <strong>RM {nettTotal.toFixed(2)}</strong>.
          </p>
          <div className="flex justify-between mt-12">
            <div className="text-center border-t border-black w-48 pt-1 text-[8pt]">Tandatangan Pemohon</div>
            <div className="text-center border-t border-black w-48 pt-1 text-[8pt]">Tandatangan Ketua Jabatan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;