import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, googleProvider } from '../config/firebase';
import { getApiUrl } from '../utils/api';
import ownerImage from '../assets/owner.jpg';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyUser = async (firebaseUser) => {
    try {
      console.log('Verifying user with backend...');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch(getApiUrl('auth/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify user');
      }

      const { data } = await response.json();
      console.log('User verified successfully:', data);
      
      // Prioritize backend data for user-editable fields like name
      // but keep Firebase auth fields like uid, email verification status, etc.
      
      // If user is admin, use the owner image as profile photo
      const photoURL = data.isAdmin ? ownerImage : (data.photoURL || firebaseUser.photoURL);
      
      return {
        ...firebaseUser,
        ...data,
        // Keep Firebase auth fields that shouldn't be overridden
        displayName: data.name || firebaseUser.displayName, // Use backend name if available
        name: data.name || firebaseUser.displayName, // Ensure name is set from backend
        photoURL: photoURL, // Use owner image for admin, otherwise use the user's photo
        isAdmin: data.isAdmin
      };
    } catch (err) {
      console.error('Error verifying user:', err);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const verifiedUser = await verifyUser(firebaseUser);
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;
      const verifiedUser = await verifyUser(firebaseUser);
      setUser(verifiedUser);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message);
      throw err;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting admin login...');

      // First, get admin token from backend
      const response = await fetch(getApiUrl('auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const { data } = await response.json();
      console.log('Admin token received, signing in to Firebase...');

      // Sign in to Firebase with the custom token
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      const { user: firebaseUser } = userCredential;

      // Verify the user with backend
      const verifiedUser = await verifyUser(firebaseUser);
      console.log('Admin login successful:', verifiedUser);
      
      setUser(verifiedUser);
      return verifiedUser;
    } catch (err) {
      console.error('Admin sign-in error:', err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Clear any session storage data
      sessionStorage.clear();
      
      // Clear any localStorage data related to Firebase auth
      const firebaseKey = `firebase:authUser:${import.meta.env.VITE_FIREBASE_API_KEY}:[DEFAULT]`;
      localStorage.removeItem(firebaseKey);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Reset user state
      setUser(null);
      
      console.log('User logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = async (profileData) => {
    const { photoFile, ...otherUserData } = profileData;
    try {
      if (!user) throw new Error('No user logged in');
      
      const idToken = await auth.currentUser.getIdToken();
      let newPhotoURL = user.photoURL; // Keep existing photoURL by default

      if (photoFile && auth.currentUser) {
        const storage = getStorage();
        // Sanitize file name if necessary, or use a fixed name like 'profile.jpg'
        const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${photoFile.name}`);
        
        console.log('Uploading profile picture...');
        await uploadBytes(storageRef, photoFile);
        newPhotoURL = await getDownloadURL(storageRef);
        console.log('Profile picture uploaded, URL:', newPhotoURL);

        console.log('Updating Firebase Auth user profile with new photoURL...');
        await firebaseUpdateProfile(auth.currentUser, { photoURL: newPhotoURL });
        console.log('Firebase Auth user profile updated.');
      }

      // Prepare data for backend update (including new photoURL if changed)
      const backendUpdateData = {
        ...otherUserData,
        ...(newPhotoURL !== user.photoURL && { photoURL: newPhotoURL }) // Only send photoURL if it changed
      };

      console.log('Updating backend profile with data:', backendUpdateData);
      const response = await fetch(getApiUrl('auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(backendUpdateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      // Update local user state - ensure the photoURL from firebaseUser is also considered
      // The backend response (updatedUserData) should be the source of truth for db fields
      // The firebase auth user (auth.currentUser) is source of truth for photoURL if backend doesn't return it explicitly
      setUser(prevUser => ({
        ...prevUser, 
        ...data.data, 
        photoURL: auth.currentUser.photoURL || prevUser.photoURL // Prioritize live Firebase Auth photoURL
      }));
      return data.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 