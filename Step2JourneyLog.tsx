
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
      tarikh: '',
      waktuBertolak: '',
      waktuSampai: '',
      butiran: '',
      jarak: 0
    };
    onChange([...logs, newLog]);
  };

  const updateRow = (id: string, field: keyof JourneyLog, value: any) => {
    onChange(logs.map(log => log.id === id ? { ...log, [field]: value } : log));
  };

  const removeRow = (id: string) => {
    onChange(logs.filter(log => log.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Log Perjalanan & Butiran Tuntutan</h2>
        <button 
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          Tambah Baris
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Tarikh</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Bertolak</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Sampai</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Butiran</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Jarak (KM)</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">
                  Tiada log perjalanan.
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td className="px-2 py-2">
                  <input type="date" value={log.tarikh} onChange={(e) => updateRow(log.id, 'tarikh', e.target.value)} className="w-full border-none focus:ring-0 text-sm p-1" />
                </td>
                <td className="px-2 py-2">
                  <input type="time" value={log.waktuBertolak} onChange={(e) => updateRow(log.id, 'waktuBertolak', e.target.value)} className="w-full border-none focus:ring-0 text-sm p-1" />
                </td>
                <td className="px-2 py-2">
                  <input type="time" value={log.waktuSampai} onChange={(e) => updateRow(log.id, 'waktuSampai', e.target.value)} className="w-full border-none focus:ring-0 text-sm p-1" />
                </td>
                <td className="px-2 py-2">
                  <input type="text" value={log.butiran} onChange={(e) => updateRow(log.id, 'butiran', e.target.value)} className="w-full border-none focus:ring-0 text-sm p-1" placeholder="Destinasi..." />
                </td>
                <td className="px-2 py-2 w-24">
                  <input type="number" value={log.jarak} onChange={(e) => updateRow(log.id, 'jarak', parseFloat(e.target.value) || 0)} className="w-full border-none focus:ring-0 text-sm p-1 text-right" />
                </td>
                <td className="px-2 py-2 text-center">
                  <button onClick={() => removeRow(log.id)} className="text-red-400 hover:text-red-600 p-1">Padam</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-bold text-blue-900 text-right uppercase">Jumlah Jarak</td>
              <td className="px-2 py-3 text-sm font-bold text-blue-900 text-right">
                {logs.reduce((sum, l) => sum + l.jarak, 0).toFixed(2)} KM
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Step2JourneyLog;
