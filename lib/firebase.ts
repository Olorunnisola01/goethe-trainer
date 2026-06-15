import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAcpBMj_tVLET64p4HGeUnblenaXhUL5wM',
  authDomain:        'personal-german-trainer.firebaseapp.com',
  projectId:         'personal-german-trainer',
  storageBucket:     'personal-german-trainer.firebasestorage.app',
  messagingSenderId: '659817012852',
  appId:             '1:659817012852:web:a81bd79564635224f9bb21',
  measurementId:     'G-1DWYYL97SQ',
};

// Prevent duplicate app initialization in Next.js dev (hot reload)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
// ignoreUndefinedProperties: notes have optional fields (texture, category) that
// may be absent — this keeps setDoc from throwing on undefined values.
export const db: Firestore = initializeFirestore(app, { ignoreUndefinedProperties: true });
export default app;
