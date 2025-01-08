// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRTIBFMnKEFYtAgydUr9uJCxKVhzPVU4g",
  authDomain: "appmusic-e9102.firebaseapp.com",
  projectId: "appmusic-e9102",
  storageBucket: "appmusic-e9102.firebasestorage.app",
  messagingSenderId: "901590456512",
  appId: "1:901590456512:web:112563d8d21c872c36b525"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
