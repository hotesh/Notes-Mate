import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import { getApiUrl } from '../utils/api';
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

const UploadQuestionPaper = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    branch: '',
    price: '',
    file: null
  });

  const branches = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.semester || !formData.branch || !formData.price || !formData.file) {
      setError('All fields are required');
      return;
    }

    // Validate price
    if (isNaN(formData.price) || Number(formData.price) < 0) {
      setError('Price must be a valid number greater than or equal to 0');
      return;
    }

    // Validate file type
    if (formData.file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('semester', formData.semester);
      data.append('branch', formData.branch);
      data.append('price', formData.price);
      data.append('file', formData.file);

      const response = await fetch(
        getApiUrl('question-papers/upload'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`
          },
          body: data
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload question paper');
      }

      setSuccess('Question paper uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        semester: '',
        branch: '',
        price: '',
        file: null
      });
      
      // Reset file input
      document.getElementById('file-upload').value = '';
      
      // Navigate to question papers page after a delay
      setTimeout(() => {
        navigate('/question-papers');
      }, 2000);
    } catch (err) {
      console.error('Error uploading question paper:', err);
      setError(err.message || 'Failed to upload question paper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText className="text-4xl font-bold">
            Upload Question Paper
          </AnimatedGradientText>
          <p className="mt-2 text-gray-600">
            Share question papers with other students
          </p>
        </motion.div>

        <AnimatedCard className="p-6">
          <form onSubmit={handleSubmit}>
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {error && (
                <motion.div
                  className="bg-red-50 text-red-600 p-4 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="bg-green-50 text-green-600 p-4 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}

              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <AnimatedInput
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures Final Exam 2023"
                  className="w-full"
                  required
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <AnimatedSelect
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full"
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </AnimatedSelect>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <AnimatedSelect
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </AnimatedSelect>
                </motion.div>
              </div>

              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <AnimatedInput
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="w-full"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 0 for free papers
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file"
                          type="file"
                          className="sr-only"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
                {formData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected file: {formData.file.name}
                  </p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-end">
                <AnimatedButton
                  type="button"
                  onClick={() => navigate('/question-papers')}
                  className="btn-secondary mr-4"
                  disabled={loading}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Uploading...
                    </div>
                  ) : (
                    'Upload Question Paper'
                  )}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </form>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
};

export default UploadQuestionPaper;
