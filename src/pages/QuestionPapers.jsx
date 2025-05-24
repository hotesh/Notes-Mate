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

const QuestionPapers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [walletBalance, setWalletBalance] = useState(100);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');
  const [filters, setFilters] = useState({
    semester: '',
    branch: ''
  });

  useEffect(() => {
    fetchPapers();
  }, [filters]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl(`question-papers?${new URLSearchParams(filters)}`),
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
        throw new Error('Failed to fetch question papers');
      }

      const data = await response.json();
      console.log('Question papers data:', data);
      setPapers(data.data || []);
      setWalletBalance(data.walletBalance || 0);
    } catch (err) {
      console.error('Error fetching question papers:', err);
      setError('Failed to load question papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePurchase = async (paper) => {
    setSelectedPaper(paper);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    try {
      if (!selectedPaper) return;
      
      const response = await fetch(
        getApiUrl(`question-papers/purchase/${selectedPaper._id}`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to purchase question paper');
      }

      // Update wallet balance
      setWalletBalance(data.walletBalance);
      
      // Update paper status in the UI
      setPapers(prevPapers => 
        prevPapers.map(p => 
          p._id === selectedPaper._id ? { ...p, purchased: true } : p
        )
      );

      setShowPurchaseModal(false);
    } catch (err) {
      console.error('Error purchasing paper:', err);
      setError(err.message || 'Failed to purchase question paper');
    }
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

  const stats = {
    total: papers.length,
    walletBalance: walletBalance,
    purchased: papers.filter(paper => paper.purchased).length,
    branches: [...new Set(papers.map(paper => paper.branch))].length,
    semesters: [...new Set(papers.map(paper => paper.semester))].length
  };

  const branches = [
    'Computer Science',
    'Information Science',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil'
  ];

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
            Question Papers
          </AnimatedGradientText>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Access previous year question papers for your subjects
          </p>
        </motion.div>

        {/* Stats Section */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Papers</h3>
            <p className="text-4xl font-bold text-primary-600 mt-2">{stats.total}</p>
          </AnimatedCard>
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Wallet Balance</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">₹{stats.walletBalance}</p>
          </AnimatedCard>
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Papers Purchased</h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats.purchased}</p>
          </AnimatedCard>
          <AnimatedCard className={`p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Branches</h3>
            <p className="text-4xl font-bold text-primary-600 mt-2">{stats.branches}</p>
          </AnimatedCard>
        </AnimatedSection>

        {/* Search and Filters */}
        <AnimatedCard className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <AnimatedInput
                type="text"
                placeholder="Search question papers..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <AnimatedSelect
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </AnimatedSelect>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <AnimatedSelect
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </AnimatedSelect>
            </motion.div>

            {currentUser && (
              <motion.div variants={fadeInUp} className="md:col-span-2">
                <AnimatedButton
                  onClick={() => navigate('/upload')}
                  className="w-full btn-primary"
                >
                  Upload Question Paper
                </AnimatedButton>
              </motion.div>
            )}
          </motion.div>
        </AnimatedCard>

        {/* Papers Grid */}
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
        ) : filteredPapers.length === 0 ? (
          <AnimatedCard className={`p-12 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <p className={`text-xl mb-4 ${isDarkMode ? 'text-white' : ''}`}>No question papers found</p>
              {currentUser && (
                <AnimatedButton
                  onClick={() => navigate('/upload')}
                  className="btn-primary"
                >
                  Upload Question Paper
                </AnimatedButton>
              )}
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
                        {paper.uploadedAt ? new Date(paper.uploadedAt).toLocaleDateString() : 'Recently uploaded'}
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
                      <span>{paper.purchaseCount || 0} purchases</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      {paper.purchased ? (
                        <AnimatedButton 
                          className="btn-primary w-full"
                          onClick={() => handleDownload(paper)}
                        >
                          Download Paper
                        </AnimatedButton>
                      ) : (
                        <AnimatedButton 
                          className="btn-secondary w-full"
                          onClick={() => handlePurchase(paper)}
                          disabled={walletBalance < paper.price}
                        >
                          Buy for ₹{paper.price}
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
            <p className="mb-4">You are about to purchase <strong>{selectedPaper.title}</strong> for <strong>₹{selectedPaper.price}</strong>.</p>
            <p className="mb-6">Your wallet balance: <strong>₹{walletBalance}</strong></p>
            
            {walletBalance < selectedPaper.price ? (
              <p className="text-red-600 mb-4">Insufficient wallet balance. Please contact admin to restore your wallet.</p>
            ) : null}
            
            <div className="flex justify-end space-x-3">
              <button 
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setShowPurchaseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmPurchase}
                disabled={walletBalance < selectedPaper.price}
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

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

export default QuestionPapers;