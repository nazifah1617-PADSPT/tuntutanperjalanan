
import React from 'react';
import { JourneyLog } from './types';

interface Props {
  logs: JourneyLog[];
  onChange: (logs: JourneyLog[]) => void;
}

const Step2JourneyLog: React.FC<Props> = ({ logs, onChange }) => {
  const addRow = () => {
    const newLog: JourneyLog = {
      id: Math.random().toString(36).substr(2, 9),
      tarikh: logs.length > 0 ? logs[logs.length - 1].tarikh : '',
      waktuBertolak: '',
      waktuSampai: '',
      butiran: '',
      jarak: 0,
      tol: 0
    };
    onChange([...logs, newLog]);
  };

  const updateRow = (id: string, field: keyof JourneyLog, value: any) => {
    onChange(logs.map(log => log.id === id ? { ...log, [field]: value } : log));
  };

  const removeRow = (id: string) => {
    onChange(logs.filter(log => log.id !== id));
  };

  const totalJarak = logs.reduce((sum, l) => sum + l.jarak, 0);
  const totalTol = logs.reduce((sum, l) => sum + l.tol, 0);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">2. Kenyataan Tuntutan</h2>
          <p className="text-xs text-gray-500 mt-1">Sila masukkan butiran perjalanan mengikut turutan tarikh.</p>
        </div>
        <button 
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tambah Perjalanan
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tarikh</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-40">Waktu (Bertolak-Sampai)</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tujuan / Tempat (Perkara)</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">Tol (RM)</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">Jarak (KM)</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center text-gray-400 italic bg-gray-50/30">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <span>Tiada rekod perjalanan. Sila klik butang "Tambah Perjalanan".</span>
                  </div>
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2">
                  <input 
                    type="date" value={log.tarikh} 
                    onChange={(e) => updateRow(log.id, 'tarikh', e.target.value)}
                    className="w-full border-none focus:ring-0 text-sm p-1.5 bg-transparent font-medium"
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <input 
                      type="time" value={log.waktuBertolak} 
                      onChange={(e) => updateRow(log.id, 'waktuBertolak', e.target.value)}
                      className="w-1/2 border rounded p-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="time" value={log.waktuSampai} 
                      onChange={(e) => updateRow(log.id, 'waktuSampai', e.target.value)}
                      className="w-1/2 border rounded p-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </td>
                <td className="px-2 py-2">
                  <textarea 
                    value={log.butiran} 
                    onChange={(e) => updateRow(log.id, 'butiran', e.target.value)}
                    className="w-full border-none focus:ring-0 text-sm p-1.5 bg-transparent resize-none h-10"
                    placeholder="Contoh: Dari Pejabat ke Masjid Abdullah Ibnu Mas'ud..."
                  />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="number" step="0.01" value={log.tol} 
                    onChange={(e) => updateRow(log.id, 'tol', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-1.5 text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="number" step="0.1" value={log.jarak} 
                    onChange={(e) => updateRow(log.id, 'jarak', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-1.5 text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none font-mono font-bold"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button 
                    onClick={() => removeRow(log.id)}
                    className="text-gray-300 hover:text-red-600 p-1.5 transition-colors"
                    title="Padam baris"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold text-gray-800">
            <tr>
              <td colSpan={3} className="px-4 py-4 text-right text-xs uppercase tracking-wider">Jumlah Keseluruhan</td>
              <td className="px-4 py-4 text-right text-sm font-mono text-blue-700">RM {totalTol.toFixed(2)}</td>
              <td className="px-4 py-4 text-right text-sm font-mono text-green-700">{totalJarak.toFixed(1)} KM</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 flex gap-4 text-[10px] text-gray-400 font-medium uppercase italic">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Kiraan tol akan dimasukkan ke Bahagian C secara automatik.</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Jarak digunakan untuk kiraan mileage Bahagian A.</span>
      </div>
    </div>
  );
};

export default Step2JourneyLog;
