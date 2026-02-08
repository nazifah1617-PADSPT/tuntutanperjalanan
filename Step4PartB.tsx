
import React from 'react';
import { HotelLodging } from '../types';

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
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Bahagian B: Tuntutan Bayaran Sewa Hotel (BSH) / Lojing</h2>
        <button 
          onClick={addRow}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tambah Tuntutan
        </button>
      </div>

      <div className="space-y-6">
        {lodgings.length === 0 ? (
           <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 italic">
              Tiada tuntutan hotel atau lojing ditambah.
           </div>
        ) : lodgings.map((l, idx) => (
          <div key={idx} className="bg-gray-50 border rounded-xl p-6 relative group hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
            <button 
              onClick={() => removeRow(idx)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Jenis</label>
                 <select 
                   value={l.jenis} onChange={(e) => updateRow(idx, 'jenis', e.target.value)}
                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                   <option value="Hotel">Hotel (BSH)</option>
                   <option value="Lojing">Lojing</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Bil. Malam / Hari</label>
                 <input 
                   type="number" value={l.bilangan} onChange={(e) => updateRow(idx, 'bilangan', parseInt(e.target.value) || 0)}
                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Kadar (RM)</label>
                 <input 
                   type="number" value={l.kadar} onChange={(e) => updateRow(idx, 'kadar', parseFloat(e.target.value) || 0)}
                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Tarikh</label>
                 <input 
                   type="date" value={l.tarikh} onChange={(e) => updateRow(idx, 'tarikh', e.target.value)}
                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>
               <div className="md:col-span-4 space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Alamat Hotel / Lojing</label>
                 <textarea 
                   value={l.alamat} onChange={(e) => updateRow(idx, 'alamat', e.target.value)}
                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none h-16"
                   placeholder="Masukkan nama hotel dan alamat penuh..."
                 />
               </div>
               <div className="md:col-span-4 flex justify-end items-center bg-white px-4 py-2 rounded-lg border">
                  <span className="text-xs font-bold text-gray-400 uppercase mr-4">Subjumlah</span>
                  <span className="text-lg font-bold text-gray-900">RM {(l.bilangan * l.kadar).toFixed(2)}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="bg-blue-900 text-white px-8 py-4 rounded-xl shadow-lg border-2 border-blue-800">
           <div className="text-[10px] uppercase font-bold text-blue-300 mb-1 tracking-widest">Jumlah Keseluruhan Bahagian B</div>
           <div className="text-3xl font-black">RM {total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Step4PartB;
