import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set session-only persistence (user will be logged out when browser is closed)
if (typeof window !== 'undefined') {
  // Force immediate application of session-only persistence
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      console.log('Session-only persistence set successfully');
      // Clear any existing tokens from localStorage to prevent auto-login
      localStorage.removeItem('firebase:authUser:' + firebaseConfig.apiKey + ':[DEFAULT]');
    })
    .catch((error) => {
      console.error('Error setting authentication persistence:', error);
    });

  // Add event listener to clear auth state on page unload/tab close
  window.addEventListener('beforeunload', () => {
    // This helps ensure the user is logged out when the tab is closed
    sessionStorage.clear();
  });
}

const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only in production and browser environment
let analytics = null;
if (import.meta.env.PROD && typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error('Error initializing Firebase Analytics:', error);
    }
  }).catch(error => {
    console.error('Error loading Firebase Analytics:', error);
  });
}

export { app, auth, googleProvider, analytics }; 