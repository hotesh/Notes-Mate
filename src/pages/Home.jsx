import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/api';
import { 
  AnimatedPage, 
  AnimatedCard, 
  AnimatedButton, 
  AnimatedGradientText,
  AnimatedSection,
  AnimatedHeading
} from '../components/AnimatedComponents';
import { fadeInUp, staggerContainer } from '../utils/animations';

const Home = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalDownloads: 0,
    totalUsers: 0,
    totalQuestionPapers: 0
  });

  useEffect(() => {
    // Fetch stats from your API
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('notes/stats'));
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const { data } = await response.json();
        setStats({
          totalNotes: data.totalNotes || 0,
          totalDownloads: data.totalDownloads || 0,
          totalUsers: data.totalUsers || 0,
          totalQuestionPapers: data.totalQuestionPapers || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values if fetch fails
        setStats({
          totalNotes: 0,
          totalDownloads: 0,
          totalUsers: 0,
          totalQuestionPapers: 0
        });
      }
    };

    fetchStats();
  }, []);

  const gradientAnimation = {
    initial: { backgroundPosition: '0% 50%' },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const statVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    }
  };

  const features = [
    {
      icon: "📚",
      title: "Study Notes",
      description: "Access comprehensive study materials for all subjects"
    },
    {
      icon: "📝",
      title: "Question Papers",
      description: "Previous year question papers with solutions"
    },
    {
      icon: "👥",
      title: "Community",
      description: "Share and collaborate with fellow students"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="relative py-20 overflow-hidden"
      >
        <motion.div
          variants={gradientAnimation}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20"
          style={{
            backgroundSize: '200% 200%'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NoteMate
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Your one-stop platform for sharing and accessing study materials, notes, and question papers.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Login
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/notes')}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Browse Notes
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={itemVariants}
        className="py-16 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div
              variants={statVariants}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.totalNotes}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Total Notes</p>
            </motion.div>
            <motion.div
              variants={statVariants}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.totalDownloads}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Total Downloads</p>
            </motion.div>
            <motion.div
              variants={statVariants}
              className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {stats.totalUsers}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Active Users</p>
            </motion.div>
            <motion.div
              variants={statVariants}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.totalQuestionPapers}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Question Papers</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={itemVariants}
        className="py-16 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Why Choose NoteMate?
          </motion.h2>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;