
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyATqp61S5VMbxZl4annjk0-eASzTlAtLNo",
  authDomain: "tuntutan-perjalanan-eea66.firebaseapp.com",
  projectId: "tuntutan-perjalanan-eea66",
  storageBucket: "tuntutan-perjalanan-eea66.firebasestorage.app",
  messagingSenderId: "213969028738",
  appId: "1:213969028738:web:2559f542c2d48af0a5969b",
  measurementId: "G-2CR63V07BW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const isFirebaseConfigured = () => !!firebaseConfig.apiKey;

export { 
  db, auth, doc, setDoc, getDocs, collection, deleteDoc, query, where,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
};
