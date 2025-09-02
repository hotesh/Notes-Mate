import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/api';
import { getAuth } from 'firebase/auth';
import PdfViewerModal from '../components/PdfViewerModal';
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedButton, 
  AnimatedInput,
  AnimatedGradientText,
  AnimatedSection
} from '../components/AnimatedComponents';
import { fadeInUp, staggerContainer } from '../utils/animations';

const MyPapers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');

  useEffect(() => {
    fetchMyPapers();
  }, []);

  const fetchMyPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl('question-papers/my-papers'),
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
        throw new Error('Failed to fetch your papers');
      }

      const data = await response.json();
      console.log('My papers data:', data);
      setPapers(data.data || []);
      setWalletBalance(data.walletBalance || 0);
    } catch (err) {
      console.error('Error fetching my papers:', err);
      setError('Failed to load your papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownload = async (paper) => {
    try {
      const response = await fetch(
        getApiUrl(`question-papers/download/${paper._id}`),
        {
          headers: {
            'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`,
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to download question paper');
      }

      // Open PDF viewer
      setPdfUrlToPreview(data.fileUrl);
      setShowPdfModal(true);
    } catch (err) {
      console.error('Error downloading paper:', err);
      setError(err.message || 'Failed to download question paper');
    }
  };

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { isDarkMode } = useTheme();

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
            My Papers
          </AnimatedGradientText>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Access your purchased question papers
          </p>
        </motion.div>

        {/* Stats Section */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Papers Purchased</h3>
            <p className="text-4xl font-bold text-primary-600 mt-2">{papers.length}</p>
          </AnimatedCard>
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Wallet Balance</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">₹{walletBalance}</p>
          </AnimatedCard>
        </AnimatedSection>

        {/* Search */}
        <AnimatedCard className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <AnimatedInput
                type="text"
                placeholder="Search your papers..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </motion.div>
          </motion.div>
        </AnimatedCard>

        {/* Papers Grid */}
        {error && (
          <motion.div
            className={`p-4 rounded-lg text-sm ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-600'}`}
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
        ) : filteredPapers.length === 0 ? (
          <AnimatedCard className={`p-12 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <p className={`text-xl mb-4 ${isDarkMode ? 'text-white' : ''}`}>You haven't purchased any papers yet</p>
              <AnimatedButton
                onClick={() => navigate('/question-papers')}
                className="btn-primary"
              >
                Browse Question Papers
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
            {filteredPapers.map((paper, index) => (
              <motion.div
                key={paper._id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard className={`h-full ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-primary-800 text-primary-200' : 'bg-primary-100 text-primary-800'}`}>
                        {paper.branch}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(paper.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {paper.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {paper.description}
                    </p>
                    <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      <span>Semester {paper.semester}</span>
                      <span>Price: ₹{paper.price}</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <AnimatedButton 
                        className="btn-primary flex-1"
                        onClick={() => handleDownload(paper)}
                      >
                        View Paper
                      </AnimatedButton>
                      <AnimatedButton 
                        className="btn-secondary flex-1"
                        onClick={() => window.open(paper.fileUrl, '_blank')}
                      >
                        Download
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
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

export default MyPapers;
