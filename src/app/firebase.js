import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp_o9UWJ-YMB11FU81lsysMqWZbdgo3Fc",
  authDomain: "barber-shop-21d6a.firebaseapp.com",
  projectId: "barber-shop-21d6a",
  storageBucket: "barber-shop-21d6a.firebasestorage.app",
  messagingSenderId: "503840517830",
  appId: "1:503840517830:web:7aa3f4a2f6da5e67a771c7"
};

 export const  app = initializeApp(firebaseConfig);
 export const db = getFirestore(app);
 export const auth = getAuth(app);