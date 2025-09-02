import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl } from "../utils/api";
import { getAuth } from 'firebase/auth';
import PdfViewerModal from '../components/PdfViewerModal';
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedButton, 
  AnimatedInput,
  AnimatedSelect,
  AnimatedGradientText,
  AnimatedSection
} from '../components/AnimatedComponents';
import { fadeInUp, staggerContainer } from '../utils/animations';

const MyNotes = () => {
  const { user: currentUser } = useAuth();
  const { isDarkMode } = useTheme(); 
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');
  useEffect(() => {
    fetchNotes();
  }, []); // Fetch notes once on component mount

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      // Add cache-busting query parameter and no-cache headers
      const response = await fetch(
        `${getApiUrl(`notes?_=${Date.now()}`)}`, 
        {
          headers: {
            'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to fetch notes. Status: ${response.status}. Message: ${errorData.message || 'Server error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Current User:', currentUser);
      
      // Filter notes to only show those uploaded by the current user
      if (data && data.data) {
        // The API returns { success: true, data: [...notes] }
        console.log('Notes from API:', data.data);
        
        // Check each note's uploadedBy field
        data.data.forEach(note => {
          console.log('Note:', note.title, 'UploadedBy:', note.uploadedBy);
        });
        
        // Try different ways to match the user ID
        const userNotes = data.data.filter(note => {
          // Check if the note has an uploadedBy field
          if (!note.uploadedBy) return false;
          
          // Try matching by email (more reliable than ID)
          const isUserNote = note.uploadedBy.email === currentUser.email;
          console.log(
            `Note: ${note.title}, ` +
            `UploadedBy: ${note.uploadedBy.email}, ` +
            `Current User: ${currentUser.email}, ` +
            `Match: ${isUserNote}`
          );
          return isUserNote;
        });
        
        console.log('Filtered Notes:', userNotes);
        setNotes(userNotes);
      } else if (Array.isArray(data)) {
        // Handle case where API might return array directly
        console.log('Notes from API (array):', data);
        
        const userNotes = data.filter(note => {
          if (!note.uploadedBy) return false;
          return note.uploadedBy.email === currentUser.email;
        });
        
        console.log('Filtered Notes:', userNotes);
        setNotes(userNotes);
      } else {
        // Unexpected data format
        console.error('Unexpected data format:', data);
        setNotes([]);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(err.message || 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const filteredNotes = notes; // No filtering, directly use 'notes' state

  // User stats based on the actual notes count and their downloads
  const userStats = {
    // Use the actual count of notes we've fetched
    totalUploads: notes.length || 0,
    // Sum up all downloads from the notes
    totalDownloadsReceived: notes.reduce((total, note) => total + (note.downloads || 0), 0)
  };

  return (
    <AnimatedPage className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText className="text-4xl font-bold">
            My Notes
          </AnimatedGradientText>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage and track your uploaded resources
          </p>
        </motion.div>

        {/* User Stats Section */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Notes Uploaded</h3>
            <p className="text-4xl font-bold text-primary-600 mt-2">{userStats.totalUploads}</p>
          </AnimatedCard>
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Downloads Received</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{userStats.totalDownloadsReceived}</p>
          </AnimatedCard>
        </AnimatedSection>


        {/* Notes Grid */}
        {error && (
          <motion.div
            className="bg-red-50 text-red-600 p-4 rounded-lg text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"
            />
          </div>
        ) : notes.length === 0 ? (
          <AnimatedCard className={`p-12 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <p className={`text-xl mb-4 ${isDarkMode ? 'text-white' : ''}`}>No notes found</p>
              <AnimatedButton
                onClick={() => navigate('/upload-notes')}
                className="btn-primary"
              >
                Upload Your First Note
              </AnimatedButton>
            </motion.div>
          </AnimatedCard>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {console.log('Rendering notes:', notes)}
            {notes.map((note, index) => {
              console.log('Rendering note:', note);
              return (
              <motion.div
                key={note._id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard className={`h-full ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-primary-800 text-primary-200' : 'bg-primary-100 text-primary-800'}`}>
                        {note.subject || 'Note'}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(note.createdAt || note.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{note.title}</h4>
                    <p className={`text-sm mb-1 ${note.status === 'approved' ? isDarkMode ? 'text-green-400' : 'text-green-600' : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      Status: <span className="font-medium">{note.status || 'pending'}</span>
                    </p>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Downloads: <span className="font-medium">{note.downloads || 0}</span></p>
                    <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      <span>Semester {note.semester || 'N/A'}</span>
                      <span>Branch: {note.branch || 'N/A'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <AnimatedButton
                        onClick={() => {
                          setPdfUrlToPreview(note.fileUrl);
                          setShowPdfModal(true);
                        }}
                        className="btn-primary w-full"
                      >
                        View PDF
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <PdfViewerModal 
          fileUrl={pdfUrlToPreview} 
          onClose={() => setShowPdfModal(false)} 
        />
      )}
    </AnimatedPage>
  );
};

export default MyNotes; 