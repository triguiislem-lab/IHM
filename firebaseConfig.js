// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnETSQ3fXwRq-IUctWahjGQ-1IBzRFPdQ",
  authDomain: "e-learning-af671.firebaseapp.com",
  databaseURL: "https://e-learning-af671-default-rtdb.firebaseio.com",
  projectId: "e-learning-af671",
  storageBucket: "e-learning-af671.firebasestorage.app",
  messagingSenderId: "205248540127",
  appId: "1:205248540127:web:3d5822f46605daaae4a86a",
  measurementId: "G-REKV2YK41N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { database };