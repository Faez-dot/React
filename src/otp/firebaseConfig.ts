import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Paste your values from Firebase Console > Project settings > General > Your apps > Web app.
export const firebaseConfig = {
  apiKey: 'AIzaSyDzT_RD44g2GjHMmgTr96J2itRHZBbdAGg',
  authDomain: 'smd-quiz-04.firebaseapp.com',
  projectId: 'smd-quiz-04',
  storageBucket: 'smd-quiz-04.firebasestorage.app',
  messagingSenderId: '1015178439923',
  appId: '1:1015178439923:web:fc3b0f6412f5009d3f1b86',
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some((v) =>
  v.startsWith('YOUR_') || v.includes('YOUR_'),
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
