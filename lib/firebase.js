import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCUwqF9Mkqqy98lVwl1GJEHg19-_1SvKFw",
    authDomain: "ringmold-app.firebaseapp.com",
    projectId: "ringmold-app",
    storageBucket: "ringmold-app.firebasestorage.app",
    messagingSenderId: "527720751398",
    appId: "1:527720751398:web:60e932e66640c5db5521e7",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export const ADMIN_EMAILS = ["mohammadmarghzari1@gmail.com"];
