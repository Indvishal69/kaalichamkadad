import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDGnetaDNj2oPw8-3ManlHvTW0d5Pasdgs",
  authDomain: "kaalichamkadad.firebaseapp.com",
  databaseURL: "https://kaalichamkadad-default-rtdb.firebaseio.com",
  projectId: "kaalichamkadad",
  storageBucket: "kaalichamkadad.firebasestorage.app",
  messagingSenderId: "137464426051",
  appId: "1:137464426051:web:fdbd0cb83ca0102fe36ef6",
  measurementId: "G-463FX622K3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
