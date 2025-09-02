import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaUserShield } from 'react-icons/fa';

const Login = () => {
  const { signInWithGoogle, signInWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await signInWithEmail(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Note Mate
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your notes
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 
              dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 
              dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
              disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                  shadow-sm focus:border-primary-500 focus:ring-primary-500 
                  dark:bg-gray-700 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                  shadow-sm focus:border-primary-500 focus:ring-primary-500 
                  dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaUserShield className="w-5 h-5 mr-2" />
              {loading ? 'Signing in...' : 'Admin Login'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;