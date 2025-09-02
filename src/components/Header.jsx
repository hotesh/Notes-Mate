import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [semesterDropdown, setSemesterDropdown] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xl font-bold text-gray-800">Notes Mate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            
            {/* Semester Dropdown */}
            <div className="relative">
              <button 
                className="text-gray-600 hover:text-blue-600 flex items-center"
                onClick={() => setSemesterDropdown(!semesterDropdown)}
              >
                Semester
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {semesterDropdown && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  {semesters.map(semester => (
                    <Link
                      key={semester}
                      to={`/semester/${semester}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      onClick={() => setSemesterDropdown(false)}
                    >
                      Semester {semester}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link to="/question-papers" className="text-gray-600 hover:text-blue-600">Question Papers</Link>
            <Link to="/upload" className="text-gray-600 hover:text-blue-600">Upload Notes</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link>
            
            {currentUser ? (
              <button onClick={handleLogout} className="btn btn-primary">Logout</button>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 text-gray-600 hover:text-blue-600">Home</Link>
            <button 
              className="w-full text-left py-2 text-gray-600 hover:text-blue-600 flex justify-between items-center"
              onClick={() => setSemesterDropdown(!semesterDropdown)}
            >
              Semester
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${semesterDropdown ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {semesterDropdown && (
              <div className="pl-4 space-y-2">
                {semesters.map(semester => (
                  <Link
                    key={semester}
                    to={`/semester/${semester}`}
                    className="block py-1 text-gray-600 hover:text-blue-600"
                    onClick={() => {
                      setSemesterDropdown(false);
                      setIsOpen(false);
                    }}
                  >
                    Semester {semester}
                  </Link>
                ))}
              </div>
            )}
            
            <Link to="/question-papers" className="block py-2 text-gray-600 hover:text-blue-600">Question Papers</Link>
            <Link to="/upload" className="block py-2 text-gray-600 hover:text-blue-600">Upload Notes</Link>
            <Link to="/about" className="block py-2 text-gray-600 hover:text-blue-600">About Us</Link>
            
            {currentUser ? (
              <button onClick={handleLogout} className="w-full text-left py-2 text-gray-600 hover:text-blue-600">Logout</button>
            ) : (
              <Link to="/login" className="block py-2 text-gray-600 hover:text-blue-600">Login</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;