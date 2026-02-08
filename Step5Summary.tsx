
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
  const mileageTotal = (km1 * kadar.pertama) + (km2 * kadar.seterusnya);
  
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
      <section className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-4 mb-6 uppercase">Ringkasan Keseluruhan</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400 text-xs">Jumlah Bahagian A</span>
            <span>RM {partATotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400 text-xs">Jumlah Bahagian B</span>
            <span>RM {partBTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400 text-xs">Jumlah Bahagian C</span>
            <span>RM {miscTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-4">
            <span className="text-blue-400 font-black">JUMLAH KASAR</span>
            <span className="text-2xl font-black">RM {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-orange-900 mb-6 uppercase">Pengakuan Pemohon</h2>
        <p className="text-sm text-orange-800 leading-relaxed">
          Saya mengaku bahawa perjalanan tersebut adalah benar dan dibuat atas urusan rasmi.
        </p>
      </section>

      <div className="text-center py-10">
        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl">
          CETAK BORANG WP1.4
        </button>
      </div>
    </div>
  );
};

export default Step5Summary;
