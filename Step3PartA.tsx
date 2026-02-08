
import React, { useMemo } from 'react';
import { JourneyLog, PublicTransport, MealAllowance, ClaimState } from '../types';
import { KADAR_KERETA, KADAR_MOTOSIKAL } from '../constants';

interface Props {
  logs: JourneyLog[];
  vehicleType: 'Kereta' | 'Motosikal';
  transport: PublicTransport;
  meals: MealAllowance;
  onTransportChange: (val: Partial<PublicTransport>) => void;
  onMealsChange: (val: Partial<MealAllowance>) => void;
}

const Step3PartA: React.FC<Props> = ({ logs, vehicleType, transport, meals, onTransportChange, onMealsChange }) => {
  const totalKm = logs.reduce((sum, l) => sum + l.jarak, 0);
  const kadar = vehicleType === 'Kereta' ? KADAR_KERETA : KADAR_MOTOSIKAL;

  const mileageCalc = useMemo(() => {
    let km1 = Math.min(totalKm, 500);
    let km2 = Math.max(0, totalKm - 500);
    let amt1 = km1 * kadar.pertama;
    let amt2 = km2 * kadar.seterusnya;
    return { km1, km2, amt1, amt2, total: amt1 + amt2 };
  }, [totalKm, kadar]);

  const handleTransport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onTransportChange({ [name]: parseFloat(value) || 0 });
  };

  const handleMeal = (part: keyof MealAllowance, field: 'bil' | 'hari', value: string) => {
    onMealsChange({ 
      [part]: { ...meals[part], [field]: parseInt(value) || 0 }
    });
  };

  const transportTotal = transport.teksi + transport.bas + transport.keretaApi + transport.feri + transport.lainLain;
  
  const mealTotal = 
    (meals.sarapan.bil * meals.sarapan.hari * meals.sarapan.kadar) +
    (meals.makanTengahHari.bil * meals.makanTengahHari.hari * meals.makanTengahHari.kadar) +
    (meals.makanMalam.bil * meals.makanMalam.hari * meals.makanMalam.kadar) +
    (meals.harian.bil * meals.harian.hari * meals.harian.kadar);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Mileage */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wide">Bahagian A: Elaun Perjalanan Kenderaan</h2>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-blue-800">Jenis Kenderaan terpilih:</span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{vehicleType}</span>
        </div>
        <div className="overflow-hidden border rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kiraan Kilometer</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Jarak (KM)</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Kadar Sekilometer</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">500 km pertama</td>
                <td className="px-4 py-3 text-center text-sm font-medium">{mileageCalc.km1}</td>
                <td className="px-4 py-3 text-center text-sm">RM {kadar.pertama.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold">RM {mileageCalc.amt1.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">501 km dan seterusnya</td>
                <td className="px-4 py-3 text-center text-sm font-medium">{mileageCalc.km2}</td>
                <td className="px-4 py-3 text-center text-sm">RM {kadar.seterusnya.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold">RM {mileageCalc.amt2.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={3} className="px-4 py-3 text-sm font-bold text-blue-900 text-right uppercase">Jumlah Mileage</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">RM {mileageCalc.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Public Transport */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wide">Tuntutan Tambang Pengangkutan Awam</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(transport).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">RM</span>
                <input 
                  type="number" name={key} value={(transport as any)[key]} onChange={handleTransport}
                  className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none text-right"
                />
              </div>
            </div>
          ))}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <div className="bg-gray-100 px-6 py-2 rounded-lg border border-gray-200">
                <span className="text-sm font-bold text-gray-600 mr-4 uppercase">Jumlah Tambang</span>
                <span className="text-lg font-black text-gray-900">RM {transportTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meals */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wide">Tuntutan Elaun Makan / Harian</h2>
        <div className="overflow-x-auto border rounded-xl">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jenis Makan</th>
                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Bil. Dituntut</th>
                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Bil. Hari</th>
                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Kadar (RM)</th>
                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Jumlah (RM)</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {(['sarapan', 'makanTengahHari', 'makanMalam', 'harian'] as const).map(m => (
                 <tr key={m}>
                   <td className="px-4 py-3 text-sm capitalize">{m.replace(/([A-Z])/g, ' $1')}</td>
                   <td className="px-4 py-2 text-center">
                     <input 
                        type="number" value={meals[m].bil} onChange={(e) => handleMeal(m, 'bil', e.target.value)}
                        className="w-16 border rounded p-1 text-center"
                     />
                   </td>
                   <td className="px-4 py-2 text-center">
                     <input 
                        type="number" value={meals[m].hari} onChange={(e) => handleMeal(m, 'hari', e.target.value)}
                        className="w-16 border rounded p-1 text-center"
                     />
                   </td>
                   <td className="px-4 py-3 text-center text-sm">RM {meals[m].kadar.toFixed(2)}</td>
                   <td className="px-4 py-3 text-right text-sm font-bold">
                      RM {(meals[m].bil * meals[m].hari * meals[m].kadar).toFixed(2)}
                   </td>
                 </tr>
               ))}
               <tr className="bg-green-50">
                 <td colSpan={4} className="px-4 py-3 text-sm font-bold text-green-900 text-right uppercase">Jumlah Elaun Makan/Harian</td>
                 <td className="px-4 py-3 text-right text-sm font-black text-green-900">RM {mealTotal.toFixed(2)}</td>
               </tr>
             </tbody>
           </table>
        </div>
      </section>
    </div>
  );
};

export default Step3PartA;
