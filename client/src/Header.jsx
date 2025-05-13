import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import images from './utils';
const { logo } = images;

const Header = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const lastActivityTime = parseInt(localStorage.getItem('lastActivity') || Date.now());
      const inactiveTime = Date.now() - lastActivityTime;
      
      // If inactive for more than 1 hour (3600000 milliseconds)
      if (inactiveTime > 3600000) {
        handleLogout();
      }
    }, 60000);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(inactivityCheck);
    };
  }, []);

  // Fetch user data including profile picture
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/currentuser", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setProfilePicture(userData.profilePicture || null);
          setIsAuthenticated(true);
        } else {
          const errorData = await response.json();
          if (response.status === 440 || errorData.error === 'Session expired') {
            handleLogout();
          }
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('userSettings');
    setIsAuthenticated(false);
    setProfilePicture(null);
    navigate('/login');
  };

  return (
    <header className="bg-green-600 text-white p-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/landingpage" className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 mr-2 rounded-full" />
          <h1 className="text-xl sm:text-2xl font-bold">K Smart Farm</h1>
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <a href="#home" className="hover:underline">Home</a>
            </li>
            <li>
              <a href="#services" className="hover:underline">Services</a>
            </li>
            <li>
              <a href="#about" className="hover:underline">About</a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">Contact</a>
            </li>
            <li>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="hover:underline text-white">Logout</button>
              ) : (
                <Link to="/login" className="hover:underline text-white">Login</Link>
              )}
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/settings">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="h-10 w-10 rounded-full border-2 border-white hover:border-gray-200 transition-colors"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white hover:border-gray-200 transition-colors">
                      <span className="text-green-600 font-bold">?</span>
                    </div>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;