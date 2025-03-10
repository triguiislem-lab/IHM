// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnETSQ3fXwRq-IUctWahjGQ-1IBzRFPdQ",
  authDomain: "e-learning-af671.firebaseapp.com",
  projectId: "e-learning-af671",
  storageBucket: "e-learning-af671.firebasestorage.app",
  messagingSenderId: "205248540127",
  appId: "1:205248540127:web:3d5822f46605daaae4a86a",
  measurementId: "G-REKV2YK41N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db =getFirestore(app);
const analytics = getAnalytics(app);