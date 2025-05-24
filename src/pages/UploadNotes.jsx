import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/api';
import { FaUpload, FaSpinner, FaPlus } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedButton, 
  AnimatedInput,
  AnimatedSelect,
  AnimatedHeading,
  AnimatedGradientText,
  AnimatedModal,
  AnimatedSection
} from '../components/AnimatedComponents';
import { fadeInUp, staggerContainer, modalAnimation } from '../utils/animations';
import { getCloudinaryUploadUrl, validateFile } from '../utils/fileUtils';

const UploadNotes = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [formData, setFormData] = useState({
    semester: '',
    branch: '',
    subject: '',
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.semester && formData.branch) {
        try {
          const response = await fetch(
            getApiUrl(`notes/subjects?semester=${formData.semester}&branch=${formData.branch}`)
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch subjects');
          }

          const { data } = await response.json();
          // Ensure we have unique subjects
          const uniqueSubjects = [...new Set(data)];
          setSubjects(uniqueSubjects);
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setMessage({ type: 'error', text: 'Failed to fetch subjects' });
        }
      }
    };

    fetchSubjects();
  }, [formData.semester, formData.branch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (validation.isValid) {
        setFormData(prev => ({
          ...prev,
          file: selectedFile
        }));
        setMessage({ type: '', text: '' });
      } else {
        setMessage({ type: 'error', text: validation.error });
        setFormData(prev => ({
          ...prev,
          file: null
        }));
      }
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      // Add to local state
      const updatedSubjects = [...new Set([...subjects, newSubject.trim()])];
      setSubjects(updatedSubjects);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        subject: newSubject.trim()
      }));
      
      setNewSubject('');
      setShowNewSubjectInput(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate all required fields
    if (!formData.title || !formData.description || !formData.semester || 
        !formData.branch || !formData.subject || !formData.file) {
      setMessage({ 
        type: 'error', 
        text: 'Please fill in all required fields and select a file' 
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Get the current user's ID token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to upload notes');
      }
      const idToken = await currentUser.getIdToken();

      // Create form data for Cloudinary
      const formDataCloudinary = new FormData();
      formDataCloudinary.append('file', formData.file);
      formDataCloudinary.append('upload_preset', 'notes_mate');

      // Get the appropriate upload URL based on file type
      const uploadUrl = getCloudinaryUploadUrl(
        formData.file,
        'df9jtqaly'
      );

      console.log('Uploading to Cloudinary...');
      const cloudinaryResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataCloudinary
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log('Cloudinary upload successful:', cloudinaryData);

      // Create note in your backend
      const response = await fetch(getApiUrl('notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          semester: formData.semester,
          branch: formData.branch,
          subject: formData.subject,
          fileUrl: cloudinaryData.secure_url,
          cloudinaryId: cloudinaryData.public_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create note');
      }

      console.log('Note created successfully');
      
      // Add the new subject to the list if it doesn't exist
      if (!subjects.includes(formData.subject)) {
        setSubjects(prev => [...prev, formData.subject]);
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        semester: '',
        branch: '',
        subject: '',
        file: null
      });

      // Redirect to notes page after 2 seconds
      setTimeout(() => {
        navigate('/notes');
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload note' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText className="text-4xl font-bold">
            Upload Notes
          </AnimatedGradientText>
          <p className="mt-2 text-gray-600">
            Share your knowledge with the community
          </p>
        </motion.div>

        <AnimatedCard className="p-6">
          <motion.form
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={handleUpload}
          >
            {message.text && (
              <motion.div
                className={`p-4 mb-4 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message.text}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Semester</option>
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Branch</option>
                  {['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'IPE', 'BT', 'AE', 'IEM'].map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <div className="mt-1 flex space-x-2">
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubjectInput(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add New
                </button>
              </div>
            </motion.div>

            {showNewSubjectInput && (
              <motion.div
                variants={fadeInUp}
                className="flex space-x-2"
              >
                <AnimatedInput
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter new subject name"
                  className="flex-1"
                />
                <AnimatedButton
                  type="button"
                  onClick={handleAddSubject}
                  className="btn-primary"
                >
                  Add
                </AnimatedButton>
              </motion.div>
            )}

            <motion.div variants={fadeInUp}>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <AnimatedInput
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full"
                placeholder="Enter a descriptive title"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Provide a brief description of the notes"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700">
                Select PDF File
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
                      htmlFor="file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF up to 10MB
                  </p>
                  {formData.file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected file: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <AnimatedButton
                type="submit"
                disabled={loading || !formData.file}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                  loading || !formData.file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Upload File
                  </>
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>
        </AnimatedCard>

        {success && (
          <AnimatedModal
            isOpen={success}
            onClose={() => setSuccess(false)}
            variants={modalAnimation}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your notes have been uploaded successfully. They will be reviewed by our team and made available to the community soon.
              </p>
              <div className="flex justify-end space-x-4">
                <AnimatedButton
                  onClick={() => setSuccess(false)}
                  className="btn-secondary"
                >
                  Close
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => navigate('/my-notes')}
                  className="btn-primary"
                >
                  View My Notes
                </AnimatedButton>
              </div>
            </div>
          </AnimatedModal>
        )}
      </div>
    </AnimatedPage>
  );
};

export default UploadNotes; 