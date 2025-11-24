// js/firebase-config.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmeldQUgfJuEAN9y_CJBIdahDA2lzziRQ",
  authDomain: "cosprysma.firebaseapp.com",
  projectId: "cosprysma",
  storageBucket: "cosprysma.firebasestorage.app",
  messagingSenderId: "966492198670",
  appId: "1:966492198670:web:760c5ce88df731b7a9695f",
  measurementId: "G-TCHN5Z8R5N"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
