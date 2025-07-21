// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBT1BxYq6sI23vEbqPXonMiRf5cM4CkLbo",
  authDomain: "tea-factory-project-902e0.firebaseapp.com",
  projectId: "tea-factory-project-902e0",
  storageBucket: "tea-factory-project-902e0.firebasestorage.app",
  messagingSenderId: "501903422222",
  appId: "1:501903422222:web:158f2501246fbe9c279d5f",
  measurementId: "G-JVLYXWZDNJ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export
export const auth = getAuth(app);
export default app;
