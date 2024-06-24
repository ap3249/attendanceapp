// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD56WXML-kOwNs8u1MYJbfAtP9nh5q9bCc",
  authDomain: "intranet-427105.firebaseapp.com",
  projectId: "intranet-427105",
  storageBucket: "intranet-427105.appspot.com",
  messagingSenderId: "736894984089",
  appId: "1:736894984089:web:f08b9ac90c372b5f0e7d08",
  measurementId: "G-X99X2XLX7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
