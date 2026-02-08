
import React from 'react';
import { OfficerInfo } from '../types';

interface Props {
  info: OfficerInfo;
  onChange: (info: Partial<OfficerInfo>) => void;
}

const Step1OfficerInfo: React.FC<Props> = ({ info, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Maklumat Peribadi & Jawatan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Nama (Huruf Besar)</label>
            <input 
              name="nama" value={info.nama} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
              placeholder="CONTOH: AHMAD BIN ALI"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">No. Kad Pengenalan</label>
            <input 
              name="ic" value={info.ic} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="000000-00-0000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Jawatan</label>
            <input 
              name="jawatan" value={info.jawatan} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Gred</label>
            <input 
              name="gred" value={info.gred} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Contoh: DG41, N19"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Gaji (RM)</label>
            <input 
              type="number" name="gaji" value={info.gaji} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Elaun-elaun (RM)</label>
            <input 
              type="number" name="elaun" value={info.elaun} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Maklumat Perbankan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">No. Akaun Bank</label>
            <input 
              name="akaunBank" value={info.akaunBank} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Nama / Alamat Bank</label>
            <input 
              name="namaBank" value={info.namaBank} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">No. Telefon (Pejabat/Bimbit)</label>
            <input 
              name="telefon" value={info.telefon} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Maklumat Kenderaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Jenis Kenderaan</label>
            <select 
              name="kenderaanJenis" value={info.kenderaanJenis} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Kereta">Kereta</option>
              <option value="Motosikal">Motosikal</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Jenis / Model</label>
            <input 
              name="kenderaanModel" value={info.kenderaanModel} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Contoh: Proton X50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">No. Pendaftaran</label>
            <input 
              name="noPendaftaran" value={info.noPendaftaran} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
              placeholder="ABC 1234"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Alamat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Alamat Pejabat</label>
            <textarea 
              name="alamatPejabat" value={info.alamatPejabat} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Alamat Rumah Pegawai</label>
            <textarea 
              name="alamatRumah" value={info.alamatRumah} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1OfficerInfo;
