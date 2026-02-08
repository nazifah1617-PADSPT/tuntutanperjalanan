
import React, { useState, useMemo } from 'react';
import { ClaimState, JourneyLog, HotelLodging } from './types';
import { KADAR_KERETA, KADAR_MOTOSIKAL, KADAR_MAKAN } from './constants';
import Step1OfficerInfo from './components/Step1OfficerInfo';
import Step2JourneyLog from './components/Step2JourneyLog';
import Step3PartA from './components/Step3PartA';
import Step4PartB from './components/Step4PartB';
import Step5Summary from './components/Step5Summary';

const initialClaim: ClaimState = {
  info: {
    nama: '', ic: '', jawatan: '', gred: '', akaunBank: '', namaBank: '', telefon: '',
    gaji: 0, elaun: 0, kenderaanJenis: 'Kereta', kenderaanModel: '', noPendaftaran: '',
    alamatPejabat: '', alamatRumah: ''
  },
  logs: [],
  transport: { teksi: 0, bas: 0, keretaApi: 0, feri: 0, lainLain: 0 },
  meals: {
    sarapan: { bil: 0, hari: 0, kadar: KADAR_MAKAN.SARAPAN },
    makanTengahHari: { bil: 0, hari: 0, kadar: KADAR_MAKAN.MAKAN_TENGAH_HARI },
    makanMalam: { bil: 0, hari: 0, kadar: KADAR_MAKAN.MAKAN_MALAM },
    harian: { bil: 0, hari: 0, kadar: KADAR_MAKAN.HARIAN },
  },
  lodgings: [],
  misc: { telefon: 0, pos: 0, dobi: 0, airportTax: 0, lebihanBagasi: 0, parking: 0, tol: 0 },
  advance: 0
};

const STEPS = [
  'Maklumat Pegawai',
  'Kenyataan Tuntutan',
  'Bahagian A (Kenderaan/Makan)',
  'Bahagian B (Hotel/Lojing)',
  'Rumusan & Pengakuan'
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ClaimState>(initialClaim);

  const updateInfo = (info: Partial<ClaimState['info']>) => {
    setFormData(prev => ({ ...prev, info: { ...prev.info, ...info } }));
  };

  const updateLogs = (logs: JourneyLog[]) => {
    setFormData(prev => ({ ...prev, logs }));
  };

  const updateTransport = (transport: Partial<ClaimState['transport']>) => {
    setFormData(prev => ({ ...prev, transport: { ...prev.transport, ...transport } }));
  };

  const updateMeals = (meals: Partial<ClaimState['meals']>) => {
    setFormData(prev => ({ ...prev, meals: { ...prev.meals, ...meals } }));
  };

  const updateLodgings = (lodgings: HotelLodging[]) => {
    setFormData(prev => ({ ...prev, lodgings }));
  };

  const updateMisc = (misc: Partial<ClaimState['misc']>) => {
    setFormData(prev => ({ ...prev, misc: { ...prev.misc, ...misc } }));
  };

  const updateAdvance = (val: number) => {
    setFormData(prev => ({ ...prev, advance: val }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-blue-900 text-white p-6 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">e-Tuntutan Perjalanan WP1.4</h1>
            <p className="text-blue-200 text-sm">Lampiran C - Borang Tuntutan Elaun Perjalanan Dalam Negeri</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <span className="bg-blue-700 px-3 py-1 rounded-full text-xs font-mono">WP1.4 PEKELILING PERBENDAHARAAN</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* Steper */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center overflow-x-auto py-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                currentStep === idx ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' : 
                currentStep > idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`ml-2 text-xs hidden md:block font-medium ${currentStep === idx ? 'text-blue-700' : 'text-gray-400'}`}>
                {step}
              </span>
              {idx < STEPS.length - 1 && <div className="ml-4 h-[2px] w-4 bg-gray-200 hidden md:block" />}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-24 transition-all duration-300">
          {currentStep === 0 && <Step1OfficerInfo info={formData.info} onChange={updateInfo} />}
          {currentStep === 1 && <Step2JourneyLog logs={formData.logs} onChange={updateLogs} />}
          {currentStep === 2 && (
            <Step3PartA 
              logs={formData.logs} 
              vehicleType={formData.info.kenderaanJenis}
              transport={formData.transport}
              meals={formData.meals}
              onTransportChange={updateTransport}
              onMealsChange={updateMeals}
            />
          )}
          {currentStep === 3 && <Step4PartB lodgings={formData.lodgings} onChange={updateLodgings} />}
          {currentStep === 4 && (
            <Step5Summary 
              data={formData} 
              onMiscChange={updateMisc} 
              onAdvanceChange={updateAdvance}
            />
          )}
        </div>
      </main>

      {/* Persistent Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              currentStep === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kembali
          </button>
          
          <div className="hidden md:flex flex-col items-center">
             <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Progress</div>
             <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                />
             </div>
          </div>

          <button 
            onClick={nextStep}
            disabled={currentStep === STEPS.length - 1}
            className={`px-8 py-2 rounded-lg font-semibold transition-all ${
              currentStep === STEPS.length - 1 ? 'bg-green-100 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {currentStep === STEPS.length - 1 ? 'Selesai' : 'Seterusnya'}
          </button>
        </div>
      </footer>
    </div>
  );
}
