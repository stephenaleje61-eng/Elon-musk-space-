import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

export const ADMIN_EMAIL = 'sirrodstephen@gmail.com';

// Current reactive user state
let currentUserProfile: UserProfile | null = null;
const listeners = new Set<(user: UserProfile | null) => void>();

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  listeners.add(callback);
  callback(currentUserProfile);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(profile: UserProfile | null) {
  currentUserProfile = profile;
  listeners.forEach((cb) => cb(profile));
}

// Background initialization: Auto sign-in anonymously so chat & favorites work seamlessly without blocking UI
export async function initializeBackgroundAuth(): Promise<UserProfile> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const profile = await syncUserProfile(user);
        notifyListeners(profile);
        unsubscribe();
        resolve(profile);
      } else {
        try {
          // Silent background anonymous sign-in
          const cred = await signInAnonymously(auth);
          const profile = await syncUserProfile(cred.user);
          notifyListeners(profile);
          unsubscribe();
          resolve(profile);
        } catch (error) {
          console.warn('Silent anonymous sign-in note:', error);
          const storedGuestId = typeof localStorage !== 'undefined' ? localStorage.getItem('elon_musk_space_guest_uid') : null;
          const guestUid = storedGuestId || ('guest-' + Math.random().toString(36).substring(2, 9));
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('elon_musk_space_guest_uid', guestUid);
          }
          const fallbackProfile: UserProfile = {
            uid: guestUid,
            displayName: 'Space Guest #' + guestUid.slice(-4).toUpperCase(),
            isAnonymous: true,
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          notifyListeners(fallbackProfile);
          unsubscribe();
          resolve(fallbackProfile);
        }
      }
    });
  });
}

// Sync Firebase User with Firestore user document
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  let role: 'admin' | 'user' = isAdminUser ? 'admin' : 'user';

  // Check admin record in firestore if not email matched
  if (!isAdminUser) {
    try {
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      if (adminSnap.exists()) {
        role = 'admin';
      }
    } catch {
      // ignore check error
    }
  }

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || (user.isAnonymous ? `Space Explorer #${user.uid.slice(-4).toUpperCase()}` : user.email?.split('@')[0] || 'User'),
    email: user.email || undefined,
    isAnonymous: user.isAnonymous,
    role,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    photoURL: user.photoURL || undefined,
  };

  // Persist user profile to Firestore non-blocking
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email || null,
      isAnonymous: profile.isAnonymous,
      role: profile.role,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // If admin by email, also ensure doc in /admins/{uid} exists so rules pass
    if (isAdminUser) {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        role: 'superadmin',
        grantedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('User profile sync note:', err);
  }

  return profile;
}

// Optional Google Sign In to preserve identity across devices
export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const profile = await syncUserProfile(result.user);
  notifyListeners(profile);
  return profile;
}

// Update visitor display name
export async function updateVisitorName(newName: string): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: newName });
    if (currentUserProfile) {
      currentUserProfile = { ...currentUserProfile, displayName: newName };
      notifyListeners(currentUserProfile);
    }
  }
}

// Sign out (will fall back to anonymous in background)
export async function logOut(): Promise<void> {
  await signOut(auth);
  // Auto recreate anonymous session for uninterrupted browsing
  const cred = await signInAnonymously(auth);
  const profile = await syncUserProfile(cred.user);
  notifyListeners(profile);
}

export function getCurrentUser(): UserProfile | null {
  return currentUserProfile;
}
