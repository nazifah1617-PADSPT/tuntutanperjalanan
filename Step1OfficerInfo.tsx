
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

  const inputClass = "w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder-slate-300 text-slate-700 font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";
  const sectionTitleClass = "text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 after:content-[''] after:h-px after:bg-slate-100 after:flex-1";

  return (
    <div className="animate-fadeIn space-y-16">
      <section>
        <h3 className={sectionTitleClass}>Maklumat Perkhidmatan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Nama Penuh (Seperti Dalam Kad Pengenalan)</label>
            <input name="nama" value={info.nama} onChange={handleChange} className={`${inputClass} uppercase font-bold`} placeholder="NAMA PENUH ANDA" />
          </div>
          <div>
            <label className={labelClass}>No. Kad Pengenalan</label>
            <input name="ic" value={info.ic} onChange={handleChange} className={inputClass} placeholder="000000-00-0000" />
          </div>
          <div>
            <label className={labelClass}>Gred Jawatan</label>
            <input name="gred" value={info.gred} onChange={handleChange} className={inputClass} placeholder="CONTOH: DG41 / N19" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Jawatan Hakiki</label>
            <input name="jawatan" value={info.jawatan} onChange={handleChange} className={inputClass} placeholder="CONTOH: PEGAWAI PERKHIDMATAN PENDIDIKAN" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className={labelClass}>Gaji Pokok (RM)</label>
              <input type="number" name="gaji" value={info.gaji} onChange={handleChange} className={`${inputClass} text-right font-bold`} />
            </div>
            <div>
              <label className={labelClass}>Elaun Tetap (RM)</label>
              <input type="number" name="elaun" value={info.elaun} onChange={handleChange} className={`${inputClass} text-right font-bold`} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Perbankan & Perhubungan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelClass}>Nama Bank</label>
            <input name="namaBank" value={info.namaBank} onChange={handleChange} className={inputClass} placeholder="CONTOH: MAYBANK" />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>No. Akaun Bank</label>
            <input name="akaunBank" value={info.akaunBank} onChange={handleChange} className={inputClass} placeholder="123456789012" />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>No. Telefon Bimbit</label>
            <input name="telefon" value={info.telefon} onChange={handleChange} className={inputClass} placeholder="01X-XXXXXXX" />
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Butiran Kenderaan Rasmi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Jenis Kenderaan</label>
            <select name="kenderaanJenis" value={info.kenderaanJenis} onChange={handleChange} className={`${inputClass} bg-slate-50/50`}>
              <option value="Kereta">Kereta</option>
              <option value="Motosikal">Motosikal</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Model / Jenama</label>
            <input name="kenderaanModel" value={info.kenderaanModel} onChange={handleChange} className={inputClass} placeholder="MODEL KENDERAAN" />
          </div>
          <div>
            <label className={labelClass}>No. Pendaftaran</label>
            <input name="noPendaftaran" value={info.noPendaftaran} onChange={handleChange} className={`${inputClass} uppercase font-bold`} placeholder="ABC 1234" />
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Alamat Rasmi & Kediaman</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Alamat Pejabat</label>
            <textarea name="alamatPejabat" value={info.alamatPejabat} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="ALAMAT TEMPAT BERTUGAS" />
          </div>
          <div>
            <label className={labelClass}>Alamat Rumah</label>
            <textarea name="alamatRumah" value={info.alamatRumah} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="ALAMAT TEMPAT TINGGAL" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Step1OfficerInfo;
