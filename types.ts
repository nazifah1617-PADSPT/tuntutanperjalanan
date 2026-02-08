
export interface OfficerInfo {
  nama: string;
  ic: string;
  jawatan: string;
  gred: string;
  akaunBank: string;
  namaBank: string;
  telefon: string;
  gaji: number;
  elaun: number;
  kenderaanJenis: 'Kereta' | 'Motosikal';
  kenderaanModel: string;
  noPendaftaran: string;
  alamatPejabat: string;
  alamatRumah: string;
}

export interface JourneyLeg {
  waktuBertolak: string;
  waktuSampai: string;
  tempohJam?: number;
  tempohMinit?: number;
  dari: string;
  ke: string;
  jarak: number;
  tol: number;
  tolMasuk?: string;
  tolKeluar?: string;
}

export interface JourneyGroup {
  id: string;
  tarikh: string;
  tujuan: string;
  pergi: JourneyLeg;
  balik: JourneyLeg;
  adaBalik: boolean;
}

export interface PublicTransport {
  teksi: number;
  bas: number;
  keretaApi: number;
  feri: number;
  lainLain: number;
}

export interface MealAllowance {
  sarapan: { bil: number; hari: number; kadar: number };
  makanTengahHari: { bil: number; hari: number; kadar: number };
  makanMalam: { bil: number; hari: number; kadar: number };
  harian: { bil: number; hari: number; kadar: number };
}

export interface HotelLodging {
  jenis: 'Hotel' | 'Lojing';
  bilangan: number;
  kadar: number;
  tarikh: string;
  alamat: string;
}

export interface MiscExpenses {
  telefon: number;
  pos: number;
  dobi: number;
  airportTax: number;
  lebihanBagasi: number;
  parking: number;
  tol: number;
}

export interface ClaimState {
  info: OfficerInfo;
  logs: JourneyGroup[];
  transport: PublicTransport;
  meals: MealAllowance;
  lodgings: HotelLodging[];
  misc: MiscExpenses;
  advance: number;
}
