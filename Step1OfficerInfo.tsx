
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

  const GroupHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] whitespace-nowrap">{title}</h3>
      <div className="h-px bg-slate-200 w-full"></div>
    </div>
  );

  const InputLabel = ({ label }: { label: string }) => (
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
  );

  const inputStyles = "w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-lg p-3 outline-none transition-all text-sm font-medium text-slate-700 placeholder-slate-300";

  return (
    <div className="animate-fadeIn space-y-16">
      <section>
        <GroupHeader title="Profil Perkhidmatan" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <InputLabel label="Nama Penuh (Seperti Dalam Kad Pengenalan)" />
            <input name="nama" value={info.nama} onChange={handleChange} className={`${inputStyles} uppercase font-bold`} placeholder="NAMA PENUH" />
          </div>
          <div>
            <InputLabel label="No. Kad Pengenalan" />
            <input name="ic" value={info.ic} onChange={handleChange} className={inputStyles} placeholder="000000-00-0000" />
          </div>
          <div>
            <InputLabel label="Gred Jawatan" />
            <input name="gred" value={info.gred} onChange={handleChange} className={inputStyles} placeholder="CONTOH: DG41 / N19" />
          </div>
          <div>
            <InputLabel label="Jawatan Rasmi" />
            <input name="jawatan" value={info.jawatan} onChange={handleChange} className={inputStyles} placeholder="JAWATAN SEMASA" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <InputLabel label="Gaji Pokok (RM)" />
                <input type="number" name="gaji" value={info.gaji} onChange={handleChange} className={`${inputStyles} text-right`} />
             </div>
             <div>
                <InputLabel label="Elaun Tetap (RM)" />
                <input type="number" name="elaun" value={info.elaun} onChange={handleChange} className={`${inputStyles} text-right`} />
             </div>
          </div>
        </div>
      </section>

      <section>
        <GroupHeader title="Maklumat Pembayaran & Perhubungan" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <InputLabel label="Nama Bank & Cawangan" />
            <input name="namaBank" value={info.namaBank} onChange={handleChange} className={inputStyles} placeholder="CONTOH: MAYBANK BERHAD" />
          </div>
          <div>
            <InputLabel label="Nombor Akaun Bank" />
            <input name="akaunBank" value={info.akaunBank} onChange={handleChange} className={inputStyles} placeholder="NOMBOR AKAUN" />
          </div>
          <div>
            <InputLabel label="No. Telefon Bimbit" />
            <input name="telefon" value={info.telefon} onChange={handleChange} className={inputStyles} placeholder="01X-XXXXXXX" />
          </div>
        </div>
      </section>

      <section>
        <GroupHeader title="Butiran Kenderaan" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <InputLabel label="Jenis Kenderaan" />
            <select name="kenderaanJenis" value={info.kenderaanJenis} onChange={handleChange} className={`${inputStyles} bg-slate-50/50`}>
              <option value="Kereta">Kereta</option>
              <option value="Motosikal">Motosikal</option>
            </select>
          </div>
          <div>
            <InputLabel label="Model / Jenama" />
            <input name="kenderaanModel" value={info.kenderaanModel} onChange={handleChange} className={inputStyles} placeholder="MODEL KENDERAAN" />
          </div>
          <div>
            <InputLabel label="No. Pendaftaran" />
            <input name="noPendaftaran" value={info.noPendaftaran} onChange={handleChange} className={`${inputStyles} uppercase font-bold`} placeholder="PLAT NO" />
          </div>
        </div>
      </section>

      <section>
        <GroupHeader title="Maklumat Alamat" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <InputLabel label="Alamat Pejabat Rasmi" />
            <textarea name="alamatPejabat" value={info.alamatPejabat} onChange={handleChange} className={`${inputStyles} h-28 resize-none`} placeholder="ALAMAT TEMPAT BERTUGAS" />
          </div>
          <div>
            <InputLabel label="Alamat Kediaman" />
            <textarea name="alamatRumah" value={info.alamatRumah} onChange={handleChange} className={`${inputStyles} h-28 resize-none`} placeholder="ALAMAT RUMAH" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Step1OfficerInfo;
