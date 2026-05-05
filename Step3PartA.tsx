import React, { useMemo } from 'react';
import { JourneyGroup, PublicTransport, MealAllowance, MileageRates } from './types';

interface Props {
  logs: JourneyGroup[];
  vehicleType: 'Kereta' | 'Motosikal';
  transport: PublicTransport;
  meals: MealAllowance;
  mileageRates: MileageRates;
  onTransportChange: (val: Partial<PublicTransport>) => void;
  onMealsChange: (val: Partial<MealAllowance>) => void;
  onMileageRatesChange: (val: Partial<MileageRates>) => void;
}

const Step3PartA: React.FC<Props> = ({ logs, vehicleType, transport, meals, mileageRates, onTransportChange, onMealsChange, onMileageRatesChange }) => {
  // Kira total KM dari semua kad (Pergi + Balik)
  const totalKm = logs.reduce((sum, j) => {
    const kmPergi = j.pergi.jarak || 0;
    const kmBalik = j.adaBalik ? (j.balik.jarak || 0) : 0;
    return sum + kmPergi + kmBalik;
  }, 0);

  const kadarPertama = vehicleType === 'Kereta' ? mileageRates.keretaPertama : mileageRates.motosikalPertama;
  const kadarSeterusnya = vehicleType === 'Kereta' ? mileageRates.keretaSeterusnya : mileageRates.motosikalSeterusnya;

  const mileageCalc = useMemo(() => {
    let km1 = Math.min(totalKm, 500);
    let km2 = Math.max(0, totalKm - 500);
    let amt1 = km1 * kadarPertama;
    let amt2 = km2 * kadarSeterusnya;
    return { km1, km2, amt1, amt2, total: amt1 + amt2 };
  }, [totalKm, kadarPertama, kadarSeterusnya]);

  const handleRateChange = (field: 'Pertama' | 'Seterusnya', value: string) => {
    const key = vehicleType === 'Kereta' ? `kereta${field}` : `motosikal${field}`;
    onMileageRatesChange({ [key]: parseFloat(value) || 0 });
  };

  const handleTransport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onTransportChange({ [name]: parseFloat(value) || 0 });
  };

  const handleMeal = (part: keyof MealAllowance, field: 'bil' | 'hari', value: string) => {
    onMealsChange({ 
      [part]: { ...meals[part], [field]: parseInt(value) || 0 }
    });
  };

  const mealTotal = 
    (meals.sarapan.bil * meals.sarapan.hari * meals.sarapan.kadar) +
    (meals.makanTengahHari.bil * meals.makanTengahHari.hari * meals.makanTengahHari.kadar) +
    (meals.makanMalam.bil * meals.makanMalam.hari * meals.makanMalam.kadar) +
    (meals.harian.bil * meals.harian.hari * meals.harian.kadar);

  return (
    <div className="space-y-10 animate-fadeIn">
      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase">Bahagian A: Elaun Perjalanan Kenderaan</h2>
        <div className="overflow-hidden border rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kiraan Kilometer</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Jarak (KM)</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Kadar (RM / km)</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">500 km pertama</td>
                <td className="px-4 py-3 text-center text-sm">{mileageCalc.km1.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <input type="number" step="0.01" value={kadarPertama} onChange={(e) => handleRateChange('Pertama', e.target.value)} className="w-20 border rounded p-1 text-center" />
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold">RM {mileageCalc.amt1.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">501 km seterusnya</td>
                <td className="px-4 py-3 text-center text-sm">{mileageCalc.km2.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <input type="number" step="0.01" value={kadarSeterusnya} onChange={(e) => handleRateChange('Seterusnya', e.target.value)} className="w-20 border rounded p-1 text-center" />
                </td>
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

      <section>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase">Tuntutan Elaun Makan / Harian</h2>
        <div className="overflow-x-auto border rounded-xl">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jenis Makan</th>
                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Bil. Dituntut</th>
                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Bil. Hari</th>
                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Jumlah (RM)</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {(['sarapan', 'makanTengahHari', 'makanMalam', 'harian'] as const).map(m => (
                 <tr key={m}>
                   <td className="px-4 py-3 text-sm capitalize">{m}</td>
                   <td className="px-4 py-2 text-center">
                     <input type="number" value={meals[m].bil} onChange={(e) => handleMeal(m, 'bil', e.target.value)} className="w-16 border rounded p-1 text-center" />
                   </td>
                   <td className="px-4 py-2 text-center">
                     <input type="number" value={meals[m].hari} onChange={(e) => handleMeal(m, 'hari', e.target.value)} className="w-16 border rounded p-1 text-center" />
                   </td>
                   <td className="px-4 py-3 text-right text-sm font-bold">RM {(meals[m].bil * meals[m].hari * meals[m].kadar).toFixed(2)}</td>
                 </tr>
               ))}
               <tr className="bg-green-50">
                 <td colSpan={3} className="px-4 py-3 text-sm font-bold text-green-900 text-right uppercase">Jumlah Makan</td>
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