import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with custom databaseId from firebaseConfig
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Test server connectivity on boot as mandated by Firebase integration guidelines
export async function testConnection(): Promise<boolean> {
  try {
    // Attempt reading from Firestore server
    await getDocFromServer(doc(db, 'products', 'probe-connection'));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, checking network connection.');
      return false;
    }
    // Permission-denied or document-not-found means server responded successfully
    return true;
  }
}
