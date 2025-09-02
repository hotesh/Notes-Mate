import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/api';
import PdfViewerModal from '../components/PdfViewerModal';
import { getAuth } from 'firebase/auth';
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
import { FaBook, FaDownload, FaEye, FaRegEye } from 'react-icons/fa';

const Notes = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');

  const branches = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH','CIVIL'];

  useEffect(() => {
    if (selectedSemester && selectedBranch) {
      // TODO: Fetch subjects for the selected semester and branch
      fetchSubjects();
    }
  }, [selectedSemester, selectedBranch]);

  useEffect(() => {
    if (selectedSubject) {
      // TODO: Fetch notes for the selected subject
      fetchNotes();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl(`notes/subjects?semester=${selectedSemester}&branch=${selectedBranch}`)
      );
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const { data } = await response.json();
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl(`notes?semester=${selectedSemester}&branch=${selectedBranch}&subject=${selectedSubject}`)
      );
      if (!response.ok) throw new Error('Failed to fetch notes');
      const { data } = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (noteId) => {
    try {
      const response = await fetch(getApiUrl(`notes/${noteId}/download`), {
        headers: {
          'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to download note');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = notes.find(note => note._id === noteId).title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePreview = (fileUrl) => {
    setPdfUrlToPreview(fileUrl);
    setShowPdfModal(true);
  };

  return (
    <AnimatedPage className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText className="text-4xl font-bold">
            Study Notes
          </AnimatedGradientText>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Access study materials for your courses
          </p>
        </motion.div>

        {showPdfModal && (
          <PdfViewerModal 
            fileUrl={pdfUrlToPreview} 
            onClose={() => setShowPdfModal(false)} 
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Semester Selection */}
          <AnimatedCard className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Semester</h3>
            <div className="space-y-2">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                <motion.button
                  key={sem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSemester(sem)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedSemester === sem
                      ? isDarkMode 
                        ? 'bg-primary-800 text-primary-100' 
                        : 'bg-primary-100 text-primary-700'
                      : isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                  }`}
                >
                  Semester {sem}
                </motion.button>
              ))}
            </div>
          </AnimatedCard>

          {/* Branch Selection */}
          {selectedSemester && (
            <AnimatedCard className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Branch</h3>
              <div className="space-y-2">
                {branches.map(branch => (
                  <motion.button
                    key={branch}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedBranch(branch)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedBranch === branch
                        ? isDarkMode 
                          ? 'bg-primary-800 text-primary-100' 
                          : 'bg-primary-100 text-primary-700'
                        : isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    {branch}
                  </motion.button>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Subject Selection */}
          {selectedBranch && (
            <AnimatedCard className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Subject</h3>
              {selectedSemester && selectedBranch ? (
                subjects.length > 0 ? (
                  <div className="space-y-2">
                    {subjects.map(subject => (
                      <motion.button
                        key={subject}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSubject(subject)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedSubject === subject
                            ? isDarkMode 
                              ? 'bg-primary-800 text-primary-100' 
                              : 'bg-primary-100 text-primary-700'
                            : isDarkMode 
                              ? 'text-gray-200 hover:bg-gray-700' 
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        {subject}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No subjects found for the selected semester and branch.</p>
                )
              ) : (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please select a semester and branch first.</p>
              )}
            </AnimatedCard>
          )}
        </div>

        {/* Notes List */}
        {selectedSubject && (
          <AnimatedCard className={`mt-8 p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Available Notes</h3>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                  <motion.div
                    key={note._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-4">
                      <h4 className="text-lg font-semibold mb-2">{note.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">{note.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-sm text-gray-500">
                            <FaDownload className="mr-1" />
                            {note.downloads}
                          </span>
                        </div>
                        <AnimatedButton
                          onClick={() => handleDownload(note._id)}
                          className="btn-primary"
                        >
                          Download
                        </AnimatedButton>
                        <AnimatedButton
                          onClick={() => handlePreview(note.fileUrl)} 
                          className="btn-secondary ml-2 p-2" // Added padding for icon button
                          title="Preview Note"
                        >
                          <FaRegEye />
                        </AnimatedButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No notes available for this subject</p>
            )}
          </AnimatedCard>
        )}

        {error && (
          <motion.div
            className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default Notes; 