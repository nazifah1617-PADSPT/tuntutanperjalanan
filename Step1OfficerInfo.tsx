import React from 'react';
import { OfficerInfo } from './types';

interface Props {
  info: OfficerInfo;
  onChange: (info: Partial<OfficerInfo>) => void;
}

const Step1OfficerInfo: React.FC<Props> = ({ info, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    onChange({ [name]: val });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wider">Maklumat Pegawai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nama (Huruf Besar)</label>
            <input 
              name="nama" value={info.nama} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold" 
              placeholder="CONTOH: AHMAD HAFIZAN BIN ABD HALIM"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">No. Kad Pengenalan</label>
            <input 
              name="ic" value={info.ic} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
              placeholder="830316-07-5029"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Jawatan</label>
            <input 
              name="jawatan" value={info.jawatan} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="PEMBANTU HAL EHWAL ISLAM"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Gred</label>
            <input 
              name="gred" value={info.gred} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="S19"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">No. Akaun Bank</label>
            <input 
              name="akaunBank" value={info.akaunBank} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nama / Alamat Bank</label>
            <input 
              name="namaBank" value={info.namaBank} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="MAYBANK ISLAMIC"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">No. Telefon (Pejabat/Bimbit)</label>
            <input 
              name="telefon" value={info.telefon} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Gaji Hakiki (RM)</label>
              <input 
                type="number" name="gaji" value={info.gaji} onChange={handleChange}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Elaun-elaun (RM)</label>
              <input 
                type="number" name="elaun" value={info.elaun} onChange={handleChange}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wider">Maklumat Kenderaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Jenis Kenderaan</label>
            <select 
              name="kenderaanJenis" value={info.kenderaanJenis} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Kereta">Kereta</option>
              <option value="Motosikal">Motosikal</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Jenis / Model</label>
            <input 
              name="kenderaanModel" value={info.kenderaanModel} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="PRODUA/AXIA"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">No. Pendaftaran</label>
            <input 
              name="noPendaftaran" value={info.noPendaftaran} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold" 
              placeholder="PNP4264"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase tracking-wider">Alamat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Alamat Pejabat</label>
            <textarea 
              name="alamatPejabat" value={info.alamatPejabat} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-32" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Alamat Rumah Pegawai</label>
            <textarea 
              name="alamatRumah" value={info.alamatRumah} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-32" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1OfficerInfo;