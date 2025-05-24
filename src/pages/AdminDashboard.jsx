import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PdfViewerModal from '../components/PdfViewerModal';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getApiUrl } from '../utils/api';
import {
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaTrash,
  FaSearch,
  FaFilter,
  FaRegEye
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    pendingNotes: 0,
    approvedNotes: 0
  });
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user?.isAdmin) {
      console.log('User is not admin, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Fetching dashboard data...');
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Making API requests...');
      
      // Get the auth token using Firebase auth
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found. Please log in again.');
      }

      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      };

      // Use the admin-specific endpoints
      const [statsRes, notesRes, usersRes] = await Promise.all([
        fetch(getApiUrl('notes/admin/stats'), { headers }),
        fetch(getApiUrl('notes/admin'), { headers }),
        fetch(getApiUrl('notes/admin/users'), { headers })
      ]);

      console.log('API responses received:', {
        stats: statsRes.status,
        notes: notesRes.status,
        users: usersRes.status
      });

      // Handle each response individually
      const statsData = await statsRes.json();
      const notesData = await notesRes.json();
      const usersData = await usersRes.json();

      if (!statsRes.ok) {
        throw new Error(statsData.message || 'Failed to fetch stats');
      }
      if (!notesRes.ok) {
        throw new Error(notesData.message || 'Failed to fetch notes');
      }
      if (!usersRes.ok) {
        throw new Error(usersData.message || 'Failed to fetch users');
      }

      console.log('Data received:', {
        stats: statsData,
        notes: notesData,
        users: usersData
      });

      setStats(statsData.data);
      setNotes(notesData.data);
      setUsers(usersData.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'An error occurred while fetching dashboard data');
      // If authentication error, redirect to login
      if (err.message.includes('No authenticated user found')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNote = async (noteId) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch(getApiUrl(`notes/${noteId}/approve`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve note');
      }

      setNotes(notes.map(note =>
        note._id === noteId ? { ...note, status: 'approved' } : note
      ));
      setStats(prev => ({
        ...prev,
        pendingNotes: prev.pendingNotes - 1,
        approvedNotes: prev.approvedNotes + 1
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectNote = async (noteId) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch(getApiUrl(`notes/${noteId}/reject`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject note');
      }

      setNotes(notes.filter(note => note._id !== noteId));
      setStats(prev => ({
        ...prev,
        pendingNotes: prev.pendingNotes - 1
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        return;
      }

      // Find the note to be deleted first to get its status
      const noteToDelete = notes.find(note => note._id === noteId);
      if (!noteToDelete) {
        throw new Error('Note not found in the current list');
      }

      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch(getApiUrl(`notes/${noteId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete note and parse error' }));
        throw new Error(errorData.message || 'Failed to delete note');
      }

      // Update the notes list
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      
      // Update stats based on the note's status
      setStats(prev => {
        const newStats = { ...prev, totalNotes: prev.totalNotes - 1 };
        if (noteToDelete.status === 'pending') {
          newStats.pendingNotes = prev.pendingNotes - 1;
        } else if (noteToDelete.status === 'approved') {
          newStats.approvedNotes = prev.approvedNotes - 1;
        } else if (noteToDelete.status === 'rejected') {
          // If rejected notes are counted and displayed, adjust here.
          // For now, assuming they are not part of a specific 'rejectedNotes' count in stats.
        }
        return newStats;
      });

      // Show success message
      setSuccessMessage('Note deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message || 'An unexpected error occurred while deleting the note.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = await getAuth().currentUser.getIdToken();
      const response = await fetch(getApiUrl(`notes/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user: ' + error.message);
    }
  };

  const handlePreview = (fileUrl) => {
    setPdfUrlToPreview(fileUrl);
    setShowPdfModal(true);
  };

  const handleDownload = async (noteId) => {
    try {
      console.log('Starting download process...');
      
      // Get Firebase auth instance
      const auth = getAuth();
      console.log('Auth instance:', auth);
      
      // Get current user
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser);

      // Check if user is signed in
      if (!currentUser) {
        console.error('No user signed in');
        setError('Please sign in to download files');
        return;
      }

      // Verify currentUser is a valid Firebase user
      if (typeof currentUser.getIdToken !== 'function') {
        console.error('Invalid user object:', currentUser);
        setError('Authentication error: Invalid user session');
        return;
      }

      console.log('Getting ID token...');
      // Get the ID token
      const token = await currentUser.getIdToken();
      console.log('Token received:', token ? 'Yes' : 'No');

      if (!token) {
        console.error('Failed to get authentication token');
        setError('Authentication error: Failed to get token');
        return;
      }

      console.log('Making download request...');
      // Make the download request with the token
      const response = await fetch(getApiUrl(`notes/${noteId}/download`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Download response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Download request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || 'Failed to download file');
      }

      console.log('Getting file blob...');
      // Get the file blob
      const blob = await response.blob();
      console.log('Blob received:', blob.size, 'bytes');
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ''); // This will force download instead of navigation
      
      console.log('Triggering download...');
      // Append the link to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Download process completed successfully');
    } catch (err) {
      console.error('Download error:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
      setError(err.message || 'Failed to download file');
    }
  };

  const handleRestoreWallet = async (userId) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch(getApiUrl(`admin/users/${userId}/restore-wallet`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to restore wallet');
      }

      const data = await response.json();
      
      // Update the user's wallet balance in the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, wallet: data.data.wallet } : user
      ));

      // Show success message
      alert(`Wallet restored successfully for ${users.find(u => u._id === userId)?.name}`);
    } catch (err) {
      console.error('Error restoring wallet:', err);
      setError(err.message || 'Failed to restore wallet');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || note.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error Loading Dashboard
          </h2>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchDashboardData}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 rounded-md bg-green-100 border border-green-400 text-green-700"
          >
            <p>{successMessage}</p>
          </motion.div>
        )}
        
        <motion.h1
          className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          variants={itemVariants}
        >
          Admin Dashboard
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <FaUsers className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Users
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <FaFileAlt className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Notes
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalNotes}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <FaCheckCircle className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pending Notes
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingNotes}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <FaDownload className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Approved Notes
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.approvedNotes}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {showPdfModal && (
          <PdfViewerModal 
            fileUrl={pdfUrlToPreview} 
            onClose={() => setShowPdfModal(false)} 
          />
        )}

        <motion.div
          className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}
          variants={itemVariants}
        >
          <div className="flex space-x-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'notes'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notes Management
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Management
            </motion.button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {activeTab === 'notes' && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Notes</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>

          {activeTab === 'notes' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Author
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {filteredNotes.map((note) => (
                    <motion.tr
                      key={note._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={isDarkMode ? 'bg-gray-800' : 'bg-white'}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {note.title}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {note.uploadedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          note.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : note.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {note.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePreview(note.fileUrl)} 
                          className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} mr-3`}
                          title="Preview Note"
                        >
                          <FaRegEye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                          title="Delete Note"
                        >
                          <FaTrash className="w-5 h-5" />
                        </motion.button>
                        {note.status === 'pending' ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleApproveNote(note._id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              <FaCheckCircle className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRejectNote(note._id)}
                              className="text-red-600 hover:text-red-900 mr-4"
                            >
                              <FaTimesCircle className="w-5 h-5" />
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(note._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaDownload className="w-5 h-5" />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Joined
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Wallet Balance
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={isDarkMode ? 'bg-gray-800' : 'bg-white'}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {user.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        ₹{user.wallet || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRestoreWallet(user._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          title="Restore wallet to ₹100"
                        >
                          Restore Wallet
                        </motion.button>
                        {/* Hide delete button for admin user */}
                        {user.email !== 'hiteshboss@gmail.com' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="w-5 h-5" />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard; 