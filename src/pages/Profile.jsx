import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedButton, 
  AnimatedInput,
  AnimatedHeading,
  AnimatedGradientText,
  AnimatedSection
} from '../components/AnimatedComponents';
import { fadeInUp, staggerContainer } from '../utils/animations';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    notesUploaded: 0,
    downloads: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    semester: '',
    branch: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        semester: user.semester || '',
        branch: user.branch || '',
        email: user.email || ''
      });
      // User object from AuthContext should include stats from the backend
      setStats({
        notesUploaded: user.stats && user.stats.uploads !== undefined ? user.stats.uploads : 0,
        downloads: user.stats && user.stats.downloads !== undefined ? user.stats.downloads : 0
      });
    }
    // If user object updates (e.g. after profile update), and no new local preview is set, clear local preview
    // This ensures that if a picture was uploaded, the display reverts to user.photoURL rather than old local preview
    if (user && !selectedFile) {
        setImagePreview(null);
    }
  }, [user, selectedFile]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(null); // Clear preview if no file is selected or selection is cancelled
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create form data for API request
      const profileData = {
        ...formData,
        photoFile: selectedFile
      };
      
      const updatedUser = await updateUserProfile(profileData);
      setSuccess('Profile updated successfully!');
      setSelectedFile(null);
      // The user object in AuthContext will update, which should refresh user.photoURL
      // No need to manually set imagePreview here if it relies on user.photoURL
      if (!selectedFile) setImagePreview(null); // Only clear if we weren't relying on user.photoURL change

      console.log('Profile updated:', updatedUser);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      console.log('User logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  const { isDarkMode } = useTheme();

  return (
    <AnimatedPage className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText className="text-4xl font-bold">
            Profile Settings
          </AnimatedGradientText>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Stats */}
          <AnimatedCard className={`md:col-span-1 p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <motion.div
              className="text-center mb-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 
                  flex items-center justify-center text-4xl font-bold text-primary-600">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formData.name}</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formData.email}</p>
            </motion.div>

            {/* Stats section removed as requested */}

            <motion.div
              className="mt-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <AnimatedButton
                onClick={handleLogout}
                className={`w-full ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
              >
                Sign Out
              </AnimatedButton>
            </motion.div>
          </AnimatedCard>

          {/* Profile Form */}
          <AnimatedCard className={`md:col-span-2 p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <motion.form
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              onSubmit={handleSubmit}
            >
              {error && (
                <motion.div
                  className={`p-4 rounded-lg text-sm ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-600'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  className={`p-4 rounded-lg text-sm ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-600'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}

              <motion.div variants={fadeInUp}>
                <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <AnimatedInput
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label htmlFor="semester" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Semester
                </label>
                <select
                  name="semester"
                  id="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label htmlFor="branch" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Branch
                </label>
                <select
                  name="branch"
                  id="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                >
                  <option value="">Select Branch</option>
                  {[
                    'Computer Science',
                    'Information Science',
                    'Electronics',
                    'Electrical',
                    'Mechanical',
                    'Civil'
                  ].map(branch => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <AnimatedInput
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                  disabled
                />
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email cannot be changed</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-4">
                <AnimatedButton
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </AnimatedButton>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="pt-4 mt-4">
                <AnimatedButton
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Sign Out
                </AnimatedButton>
              </motion.div>
            </motion.form>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Profile; 