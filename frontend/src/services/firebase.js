// Firebase Web SDK Configuration for Peace & Love, Adroabaa
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Web app's Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBW_apssSG2YmbVB2DhP5whHPIeoxR106k",
  authDomain: "chatapp-30e9d.firebaseapp.com",
  projectId: "chatapp-30e9d",
  storageBucket: "chatapp-30e9d.firebasestorage.app",
  messagingSenderId: "628673757768",
  appId: "1:628673757768:web:26d0fac286bfe1eae74e7d",
  measurementId: "G-K0T8QCH7D7"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics (graceful on environments where analytics might be unsupported)
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {
  // Ignore analytics support errors
});

/**
 * Trigger Google Sign-In popup and retrieve user profile info
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Parse first name and last name from displayName
    let firstName = '';
    let lastName = '';
    if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      firstName: firstName || 'Member',
      lastName: lastName || '',
      photoUrl: user.photoURL || '',
      idToken: await user.getIdToken()
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed before completing.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in your Firebase console. Please add localhost / your domain to Firebase Auth Authorized Domains.');
    } else {
      throw new Error(error.message || 'Google sign in failed.');
    }
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebase() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }
}

