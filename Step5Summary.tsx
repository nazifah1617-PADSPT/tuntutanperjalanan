
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
  const totalKm = data.logs.reduce((sum, l) => sum + l.jarak, 0);
  const totalTolLogs = data.logs.reduce((sum, l) => sum + l.tol, 0);
  
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
  
  // Total Misc = Input Manual + Tol dari Logs
  const miscManualTotal = (Object.entries(data.misc)
    .filter(([key]) => key !== 'tol')
    .map(([_, v]) => v) as number[])
    .reduce((sum, val) => sum + val, 0);
  
  const miscTotal = miscManualTotal + totalTolLogs + data.misc.tol;
  
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - data.advance;

  // Formatting Month
  const bulanTuntutan = data.logs[0]?.tarikh 
    ? new Date(data.logs[0].tarikh).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }).toUpperCase() 
    : 'JANUARI 2026';

  return (
    <div className="space-y-12">
      {/* UI PREVIEW */}
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
                    placeholder={key === 'tol' ? 'Tol tambahan...' : ''}
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
                <span className="text-[10px] text-blue-500">(Termasuk Tol Log: RM {totalTolLogs.toFixed(2)})</span>
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
               <div className="flex justify-between items-center pt-4 border-t border-blue-800">
                 <span className="text-green-400 text-sm font-black uppercase tracking-widest">Baki Bersih Dituntut</span>
                 <span className="text-4xl font-black text-green-400">RM {nettTotal.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center py-6">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            CETAK LAMPIRAN C (WP1.4)
          </button>
        </div>
      </div>

      {/* PRINT VERSION (MATCHES PDF) */}
      <div className="print-only">
        <div className="text-right font-bold underline mb-4">LAMPIRAN C</div>
        <div className="text-center font-bold text-lg leading-tight mb-8">
          KENYATAAN TUNTUTAN ELAUN PERJALANAN DALAM NEGERI WP1.4<br/>
          BAGI BULAN {bulanTuntutan}
        </div>

        <table className="mb-6">
          <thead><tr><th colSpan={4} className="bg-gray-50 text-center py-1 uppercase">MAKLUMAT PEGAWAI</th></tr></thead>
          <tbody className="border-none">
            <tr className="border-none"><td className="w-1/3">Nama (Huruf Besar)</td><td colSpan={3}>: <strong>{data.info.nama.toUpperCase() || '____________________'}</strong></td></tr>
            <tr className="border-none"><td>No. Kad Pengenalan</td><td colSpan={3}>: {data.info.ic || '____________________'}</td></tr>
            <tr className="border-none"><td>Jawatan</td><td colSpan={3}>: {data.info.jawatan || '____________________'}</td></tr>
            <tr className="border-none"><td>Gred</td><td colSpan={3}>: {data.info.gred || '____________________'}</td></tr>
            <tr className="border-none"><td>No. Akaun Bank</td><td colSpan={3}>: {data.info.akaunBank || '____________________'}</td></tr>
            <tr className="border-none"><td>Nama / Alamat Bank</td><td colSpan={3}>: {data.info.namaBank || '____________________'}</td></tr>
            <tr className="border-none"><td>No. Telefon (Pejabat/Bimbit)</td><td colSpan={3}>: {data.info.telefon || '____________________'}</td></tr>
            <tr className="border-none">
              <td rowSpan={3}>Pendapatan (RM)</td>
              <td>Gaji</td><td>: RM {data.info.gaji.toFixed(2)}</td>
            </tr>
            <tr className="border-none"><td>Elaun-elaun</td><td>: RM {data.info.elaun.toFixed(2)}</td></tr>
            <tr className="border-none"><td>Jumlah</td><td>: RM {(data.info.gaji + data.info.elaun).toFixed(2)}</td></tr>
            <tr className="border-none">
              <td rowSpan={3}>Kenderaan</td>
              <td className="font-bold text-center">Kereta</td><td colSpan={2} className="font-bold text-center">Motosikal</td>
            </tr>
            <tr className="border-none">
              <td>Jenis / Model : {isKereta ? data.info.kenderaanModel : ''}</td>
              <td colSpan={2}>Jenis / Model : {!isKereta ? data.info.kenderaanModel : ''}</td>
            </tr>
            <tr className="border-none">
              <td>No. Pendaftarar : {isKereta ? data.info.noPendaftaran : ''}</td>
              <td colSpan={2}>No. Pendaftarar : {!isKereta ? data.info.noPendaftaran : ''}</td>
            </tr>
            <tr className="border-none"><td>Alamat Pejabat</td><td colSpan={3}>: {data.info.alamatPejabat || '____________________'}</td></tr>
            <tr className="border-none"><td>Alamat Rumah Pegawai</td><td colSpan={3}>: {data.info.alamatRumah || '____________________'}</td></tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        <table className="text-[9pt]">
          <thead><tr><th colSpan={5} className="bg-gray-50 text-center py-1 uppercase">KENYATAAN TUNTUTAN</th></tr></thead>
          <thead>
            <tr className="bg-gray-50">
              <th className="w-20">Tarikh</th>
              <th className="w-32">Waktu Bertolak/Sampai</th>
              <th>Tujuan / Tempat</th>
              <th className="w-24">Tol (RM)</th>
              <th className="w-24">Jarak (KM)</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log, i) => (
              <tr key={i}>
                <td className="text-center">{log.tarikh}</td>
                <td className="text-center">{log.waktuBertolak} - {log.waktuSampai}</td>
                <td className="text-sm whitespace-pre-wrap">{log.butiran}</td>
                <td className="text-right">{log.tol > 0 ? log.tol.toFixed(2) : ''}</td>
                <td className="text-right">{log.jarak.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td colSpan={3} className="text-right uppercase py-2">Jumlah Keseluruhan:</td>
              <td className="text-right py-2">RM {totalTolLogs.toFixed(2)}</td>
              <td className="text-right py-2">{totalKm.toFixed(2)} km</td>
            </tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        <table className="mb-4">
          <thead><tr><th colSpan={5} className="bg-gray-50 text-center py-1 uppercase">BAHAGIAN A: ELAUN PERJALANAN KENDERAAN</th></tr></thead>
          <thead className="bg-gray-50 text-[9pt]">
            <tr><th>Jenis Kenderaan</th><th>Kiraan Kilometer</th><th>Jarak (km)</th><th>Kadar Sekilometer</th><th>Jumlah (RM)</th></tr>
          </thead>
          <tbody className="text-[9pt]">
            <tr>
              <td rowSpan={2} className="text-center font-bold">{data.info.kenderaanJenis}</td>
              <td>500 km pertama</td><td className="text-center">{km1.toFixed(2)}</td><td className="text-center">RM {kadar.pertama.toFixed(2)}</td><td className="text-right">RM {amt1.toFixed(2)}</td>
            </tr>
            <tr>
              <td>501 km dan seterusnya</td><td className="text-center">{km2.toFixed(2)}</td><td className="text-center">RM {kadar.seterusnya.toFixed(2)}</td><td className="text-right">RM {amt2.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={4} className="text-right">Jumlah</td><td className="text-right">RM {mileageTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <table className="mb-4 text-[9pt]">
          <thead><tr><th colSpan={2} className="bg-gray-50 text-center py-1 uppercase">TUNTUTAN TAMBANG PENGANGKUTAN AWAM</th></tr></thead>
          <tbody>
            {Object.entries(data.transport).map(([k, v]) => (
              <tr key={k}><td>{k.toUpperCase()} [Resit: ___________]</td><td className="text-right w-32">RM {v.toFixed(2)}</td></tr>
            ))}
            <tr className="font-bold"><td className="text-right uppercase">Jumlah</td><td className="text-right">RM {transportTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table className="mb-4 text-[9pt]">
          <thead><tr><th colSpan={2} className="bg-gray-50 text-center py-1 uppercase">BAHAGIAN B: HOTEL / LOJING</th></tr></thead>
          <tbody>
            {data.lodgings.map((l, i) => (
              <tr key={i}>
                <td>BAYARAN SEWA HOTEL (BSH) / LOJING - {l.bilangan} Hari @ {l.kadar.toFixed(2)}<br/>Alamat: {l.alamat}</td>
                <td className="text-right w-32">RM {(l.bilangan * l.kadar).toFixed(2)}</td>
              </tr>
            ))}
            {data.lodgings.length === 0 && <tr><td>Tiada tuntutan Bahagian B</td><td className="text-right">RM 0.00</td></tr>}
            <tr className="font-bold"><td className="text-right uppercase">Jumlah (Bahagian B)</td><td className="text-right">RM {partBTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table className="mb-4 text-[9pt]">
          <thead><tr><th colSpan={2} className="bg-gray-50 text-center py-1 uppercase">BAHAGIAN C: BELANJA PELBAGAI</th></tr></thead>
          <tbody>
            <tr>
              <td>TOL (Kiraan Automatik dari Jadual Perjalanan)</td>
              <td className="text-right w-32">RM {totalTolLogs.toFixed(2)}</td>
            </tr>
            {Object.entries(data.misc).map(([k, v]) => (
              k !== 'tol' && v > 0 && (
                <tr key={k}><td className="capitalize">{k.replace(/([A-Z])/g, ' $1')} [Resit: ___________]</td><td className="text-right w-32">RM {v.toFixed(2)}</td></tr>
              )
            ))}
            {data.misc.tol > 0 && (
              <tr><td>TOL (Tambahan Manual)</td><td className="text-right w-32">RM {data.misc.tol.toFixed(2)}</td></tr>
            )}
            <tr className="font-bold"><td className="text-right uppercase">Jumlah (Bahagian C)</td><td className="text-right">RM {miscTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <div className="border-2 border-black p-2 font-bold flex justify-between items-center text-lg mb-8">
           <span className="uppercase">JUMLAH KESELURUHAN TUNTUTAN (A+B+C)</span>
           <span>RM {grandTotal.toFixed(2)}</span>
        </div>

        <div className="border border-black p-4 mb-8">
          <div className="font-bold underline mb-2 uppercase">PENGAKUAN</div>
          <p className="text-[8pt] leading-tight">
            Saya mengaku bahawa:<br/>
            (a) perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;<br/>
            (b) tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa;<br/>
            (c) perbelanjaan yang tidak disokong dengan resit berjumlah sebanyak RM {(grandTotal).toFixed(2)} telah sebenarnya dilakukan dan dibayar oleh saya;<br/>
            (d) perbelanjaan yang disokong dengan resit bukan atas nama saya berjumlah sebanyak RM 0.00 telah sebenarnya dilakukan dan dibayar bagi pihak saya atas urusan rasmi dan tuntutan adalah berdasarkan kelayakan saya;<br/>
            (e) semua butiran yang dinyatakan di atas adalah tepat dan benar dan saya bertanggungjawab terhadap semua maklumat yang dinyatakan; dan<br/>
            (f) sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah seksyen 18, Akta Suruhanjaya Pencegahan Rasuah Malaysia 2009 [Akta 694].
          </p>
          <div className="signature-box mt-12">
            <div>Tarikh: {new Date().toLocaleDateString('ms-MY')}</div>
            <div className="text-center">
               <div className="border-b border-black w-48 mx-auto h-12"></div>
               <div className="text-[8pt] font-bold uppercase mt-1">(Tandatangan Pemohon)</div>
               <div className="text-[8pt] mt-1">{data.info.nama.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="border border-black p-4">
          <div className="font-bold underline mb-2 uppercase">PENGESAHAN</div>
          <p className="text-[8pt]">Berdasarkan pengakuan oleh pegawai yang memohon, disahkan bahawa perjalanan tersebut telah dilaksanakan atas urusan rasmi dan kelayakan tuntutan pegawai mematuhi peraturan kewangan yang berkuat kuasa.</p>
          <div className="signature-box mt-12">
            <div>Tarikh: ..............................</div>
            <div className="text-center">
               <div className="border-b border-black w-48 mx-auto h-12"></div>
               <div className="text-[8pt] font-bold uppercase mt-1">(Tandatangan)</div>
               <div className="text-[8pt] mt-1">NAMA: ...........................................</div>
               <div className="text-[8pt] mt-1">JAWATAN: ....................................</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border border-black p-2 text-[8pt]">
          <div className="font-bold underline uppercase">PENDAHULUAN DIRI (JIKA ADA)</div>
          <div className="flex justify-between mt-2"><span>Pendahuluan Diri diberi</span><span>RM {data.advance.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tolak: Tuntutan sekarang</span><span>RM {grandTotal.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold border-t border-black mt-1"><span>Baki dituntut/Baki dibayar balik</span><span>RM {nettTotal.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;
