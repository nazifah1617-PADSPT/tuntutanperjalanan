
import React from 'react';
import { ClaimState, MiscExpenses } from '../types';
import { KADAR_KERETA, KADAR_MOTOSIKAL } from '../constants';

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
  const kadar = data.info.kenderaanJenis === 'Kereta' ? KADAR_KERETA : KADAR_MOTOSIKAL;
  const km1 = Math.min(totalKm, 500);
  const km2 = Math.max(0, totalKm - 500);
  const mileageTotal = (km1 * kadar.pertama) + (km2 * kadar.seterusnya);
  
  const transportTotal = data.transport.teksi + data.transport.bas + data.transport.keretaApi + data.transport.feri + data.transport.lainLain;
  
  const mealTotal = 
    (data.meals.sarapan.bil * data.meals.sarapan.hari * data.meals.sarapan.kadar) +
    (data.meals.makanTengahHari.bil * data.meals.makanTengahHari.hari * data.meals.makanTengahHari.kadar) +
    (data.meals.makanMalam.bil * data.meals.makanMalam.hari * data.meals.makanMalam.kadar) +
    (data.meals.harian.bil * data.meals.harian.hari * data.meals.harian.kadar);

  const partATotal = mileageTotal + transportTotal + mealTotal;
  const partBTotal = data.lodgings.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0);
  
  // Fix: Explicitly cast values of misc expenses to number[] to ensure reduce and toFixed work correctly
  const miscTotal = (Object.values(data.misc) as number[]).reduce((sum, val) => sum + val, 0);
  const grandTotal = partATotal + partBTotal + miscTotal;
  const nettTotal = grandTotal - data.advance;

  return (
    <div className="animate-fadeIn space-y-10">
      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase">Bahagian C: Belanja Pelbagai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(data.misc).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">RM</span>
                <input 
                  type="number" name={key} value={(data.misc as any)[key]} onChange={handleMisc}
                  className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-4 mb-6 uppercase tracking-widest text-blue-400">Ringkasan Keseluruhan</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 uppercase text-xs font-bold">Jumlah Bahagian A (Kenderaan/Tambang/Makan)</span>
            <span className="text-lg font-mono">RM {partATotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 uppercase text-xs font-bold">Jumlah Bahagian B (Hotel/Lojing)</span>
            <span className="text-lg font-mono">RM {partBTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 uppercase text-xs font-bold">Jumlah Bahagian C (Pelbagai)</span>
            <span className="text-lg font-mono">RM {miscTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 mb-8">
            <span className="text-blue-200 uppercase text-sm font-black">Jumlah Kasar Tuntutan (A+B+C)</span>
            <span className="text-3xl font-black text-blue-400">RM {grandTotal.toFixed(2)}</span>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl space-y-4 mt-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-orange-400 uppercase text-xs font-bold mb-1">Pendahuluan Diri (Jika Ada)</span>
                  <p className="text-xs text-gray-500">Masukkan jumlah wang pendahuluan yang telah diambil.</p>
                </div>
                <div className="relative w-40">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">RM</span>
                  <input 
                    type="number" value={data.advance} onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-orange-500 outline-none text-right text-orange-400 font-bold"
                  />
                </div>
             </div>
             <div className="h-[1px] bg-gray-700 w-full" />
             <div className="flex justify-between items-center">
                <span className="text-green-400 uppercase text-sm font-black">Baki Dituntut / Dibayar Balik</span>
                <span className={`text-4xl font-black ${nettTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  RM {Math.abs(nettTotal).toFixed(2)}
                  <span className="text-xs ml-2 font-normal">{nettTotal >= 0 ? '(TUNTUT)' : '(BALIK)'}</span>
                </span>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-orange-900 mb-6 uppercase flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pengakuan Pemohon
        </h2>
        <div className="space-y-4 text-sm text-orange-800 leading-relaxed">
          <p>Saya mengaku bahawa:</p>
          <ul className="list-disc ml-5 space-y-2 font-medium">
            <li>Perjalanan pada tarikh-tarikh tersebut adalah benar dan telah dibuat atas urusan rasmi;</li>
            <li>Tuntutan ini dibuat mengikut kadar dan syarat seperti yang dinyatakan di bawah peraturan bertugas rasmi yang berkuat kuasa;</li>
            <li>Perbelanjaan yang tidak disokong dengan resit berjumlah sebanyak <strong>RM {(grandTotal).toFixed(2)}</strong> telah sebenarnya dilakukan dan dibayar oleh saya;</li>
            <li>Sekiranya saya mengemukakan tuntutan palsu, saya boleh dikenakan tindakan di bawah Seksyen 18, Akta Suruhanjaya Pencegahan Rasuah Malaysia 2009.</li>
          </ul>
          
          <div className="mt-8 pt-6 border-t border-orange-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-orange-400">Tarikh Tuntutan</label>
              <input type="text" readOnly value={new Date().toLocaleDateString('ms-MY')} className="bg-transparent border-b border-orange-300 w-full p-2 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-orange-400">Pengesahan Digital</label>
              <div className="border-b-2 border-dashed border-orange-300 h-12 flex items-center italic text-gray-500">
                {data.info.nama || 'Sila isi nama di langkah pertama'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-10">
        <button 
          onClick={() => window.print()}
          className="bg-gray-800 hover:bg-black text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          CETAK BORANG WP1.4
        </button>
        <p className="mt-4 text-xs text-gray-400 font-medium italic">Sila lampirkan resit-resit sokongan bersama borang yang telah dicetak.</p>
      </div>
    </div>
  );
};

export default Step5Summary;
