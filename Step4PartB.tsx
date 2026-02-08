
import React from 'react';
import { HotelLodging } from './types';

interface Props {
  lodgings: HotelLodging[];
  onChange: (lodgings: HotelLodging[]) => void;
}

const Step4PartB: React.FC<Props> = ({ lodgings, onChange }) => {
  const addRow = () => {
    const newLodging: HotelLodging = {
      jenis: 'Hotel',
      bilangan: 0,
      kadar: 0,
      tarikh: '',
      alamat: ''
    };
    onChange([...lodgings, newLodging]);
  };

  const updateRow = (idx: number, field: keyof HotelLodging, value: any) => {
    const newRows = [...lodgings];
    newRows[idx] = { ...newRows[idx], [field]: value };
    onChange(newRows);
  };

  const removeRow = (idx: number) => {
    onChange(lodgings.filter((_, i) => i !== idx));
  };

  const total = lodgings.reduce((sum, l) => sum + (l.bilangan * l.kadar), 0);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase">Bahagian B: Hotel / Lojing</h2>
        <button onClick={addRow} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Tambah Tuntutan</button>
      </div>

      <div className="space-y-6">
        {lodgings.length === 0 ? (
           <div className="p-10 text-center border-2 border-dashed rounded-2xl text-gray-400">Tiada tuntutan ditambah.</div>
        ) : lodgings.map((l, idx) => (
          <div key={idx} className="bg-gray-50 border rounded-xl p-6 relative">
            <button onClick={() => removeRow(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">Padam</button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Jenis</label>
                 <select value={l.jenis} onChange={(e) => updateRow(idx, 'jenis', e.target.value)} className="w-full border rounded-lg p-2 mt-1">
                   <option value="Hotel">Hotel</option>
                   <option value="Lojing">Lojing</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Bil. Malam</label>
                 <input type="number" value={l.bilangan} onChange={(e) => updateRow(idx, 'bilangan', parseInt(e.target.value) || 0)} className="w-full border rounded-lg p-2 mt-1" />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Kadar (RM)</label>
                 <input type="number" value={l.kadar} onChange={(e) => updateRow(idx, 'kadar', parseFloat(e.target.value) || 0)} className="w-full border rounded-lg p-2 mt-1" />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Tarikh</label>
                 <input type="date" value={l.tarikh} onChange={(e) => updateRow(idx, 'tarikh', e.target.value)} className="w-full border rounded-lg p-2 mt-1" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="bg-blue-900 text-white px-8 py-4 rounded-xl">
           <div className="text-[10px] uppercase font-bold text-blue-300">Jumlah Bahagian B</div>
           <div className="text-3xl font-black">RM {total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Step4PartB;
