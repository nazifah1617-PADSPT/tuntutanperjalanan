
import { ClaimState } from './types';
import { db, doc, setDoc, getDocs, collection, deleteDoc, isFirebaseConfigured, query, where } from './firebase';

const STORAGE_KEY = 'etuntutan_drafts';

export interface DraftEntry {
  id: string;
  uid: string; // Tambah UID untuk keselamatan
  name: string;
  lastUpdated: string;
  data: ClaimState;
}

export const persistence = {
  // Simpan draf ke LocalStorage & Firebase mengikut UID
  saveDraft: async (id: string, uid: string, name: string, data: ClaimState) => {
    const lastUpdated = new Date().toISOString();
    const newDraft: DraftEntry = { id, uid, name, lastUpdated, data };
    
    // 1. Simpan secara Lokal
    const existing = persistence.getAllDrafts();
    const updated = { ...existing, [id]: newDraft };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Simpan ke Firebase (Hanya jika login dan config ada)
    if (isFirebaseConfigured() && db && uid) {
      try {
        await setDoc(doc(db, "tuntutan_drafts", id), newDraft);
        return true;
      } catch (error) {
        console.error("Cloud Sync Error:", error);
        return false;
      }
    }
    
    return true;
  },

  // Ambil draf khusus untuk user yang sedang login
  fetchDraftsForUser: async (uid: string): Promise<Record<string, DraftEntry>> => {
    if (!isFirebaseConfigured() || !db || !uid) {
      return persistence.getAllDrafts();
    }

    try {
      const q = query(collection(db, "tuntutan_drafts"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const cloudDrafts: Record<string, DraftEntry> = {};
      
      querySnapshot.forEach((doc) => {
        cloudDrafts[doc.id] = doc.data() as DraftEntry;
      });
      
      // Update local storage dengan data terbaru dari cloud
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudDrafts));
      return cloudDrafts;
    } catch (error) {
      console.warn("Cloud access denied. Using local storage.");
      return persistence.getAllDrafts();
    }
  },

  getAllDrafts: (): Record<string, DraftEntry> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  deleteDraft: async (id: string, uid: string) => {
    const drafts = persistence.getAllDrafts();
    delete drafts[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));

    if (isFirebaseConfigured() && db && uid) {
      try {
        await deleteDoc(doc(db, "tuntutan_drafts", id));
      } catch (e) {
        console.error("Failed to delete from cloud", e);
      }
    }
  }
};
