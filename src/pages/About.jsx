import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ownerImage from '../assets/owner.jpg';
import ownerImage2 from '../assets/owner2.jpg';

const About = () => {
  const { isDarkMode } = useTheme();

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

  const teamMembers = [
    {
      name: "Hitesh Gowda",
      role: "Backend Developer",
      description: "Specializes in building robust server-side applications and ensuring seamless data flow.",
      image: ownerImage
    },
    {
      name: "Naveen MP",
      role: "Front-end Developer",
      description: "Crafts beautiful and intuitive user interfaces, bringing designs to life with clean code.",
      image: ownerImage2
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero Section */}
        <motion.section
          variants={itemVariants}
          className="text-center mb-20"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NoteMate
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            NoteMate is a platform designed to help students share and access study materials, 
            making education more accessible and collaborative.
          </p>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          variants={itemVariants}
          className="mb-20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center max-w-4xl mx-auto">
            NoteMate is your go-to platform for sharing, accessing, and exploring study materials with ease. Built by students, for students — NoteMate aims to democratize access to quality academic resources.

            Our platform empowers learners to contribute and benefit from a shared knowledge pool, making education more inclusive, efficient, and collaborative.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.li
                variants={itemVariants}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Share Knowledge</h3>
                  <p className="text-gray-600 dark:text-gray-300">Upload and share your study materials with fellow students</p>
                </div>
              </motion.li>
              <motion.li
                variants={itemVariants}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy Access</h3>
                  <p className="text-gray-600 dark:text-gray-300">Find and download study materials quickly and efficiently</p>
                </div>
              </motion.li>
              <motion.li
                variants={itemVariants}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Build Community</h3>
                  <p className="text-gray-600 dark:text-gray-300">Connect with other students and collaborate on learning</p>
                </div>
              </motion.li>
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          variants={itemVariants}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <div className="p-8 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 rounded-full mx-auto mb-6 object-cover border-4 border-blue-100 dark:border-blue-900"
                  />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-lg mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-10 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">hiteshgowda1234@gmail.com</p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Location</h3>
                <p className="text-gray-600 dark:text-gray-300">Yelahanka, Bangalore, India</p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default About; 