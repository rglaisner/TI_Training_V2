import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirebaseWebConfig } from './firebaseWebConfig';

const firebaseConfig = getFirebaseWebConfig();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);