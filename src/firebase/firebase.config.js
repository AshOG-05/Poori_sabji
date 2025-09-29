// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAO05Y8-lGmccWLlmpYdlt1oVpW-I99jbU",
  authDomain: "flyby-4cd3f.firebaseapp.com",
  projectId: "flyby-4cd3f",
  storageBucket: "flyby-4cd3f.firebasestorage.app",
  messagingSenderId: "1034566651085",
  appId: "1:1034566651085:web:0af110d00912d16e4f2d84",
  measurementId: "G-CJR8F385WD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default firebaseConfig;