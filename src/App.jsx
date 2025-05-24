import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyNotes from './pages/MyNotes';
import UploadNotes from './pages/UploadNotes';
// ViewNotes component removed - functionality consolidated
import Notes from './pages/Notes';
import PrivateRoute from './components/PrivateRoute';
import { useTheme } from './context/ThemeContext';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import QuestionPapers from './pages/QuestionPapers';
import MyPapers from './pages/MyPapers';
import UploadQuestionPaper from './pages/UploadQuestionPaper';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/notes" element={<Notes />} />
          <Route
            path="/upload-notes"
            element={
              <ProtectedRoute>
                <UploadNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-notes"
            element={
              <ProtectedRoute>
                <MyNotes />
              </ProtectedRoute>
            }
          />
          {/* ViewNotes route removed - functionality consolidated in other components */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-papers"
            element={<QuestionPapers />}
          />
          <Route
            path="/my-papers"
            element={
              <ProtectedRoute>
                <MyPapers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-question-paper"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UploadQuestionPaper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;