import React, { useState, useEffect, useRef } from 'react';
import images from './utils';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userId', data.user._id);
        navigate('/landingpage');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Signup failed');
      }
    } catch (error) {
      setErrorMessage('Network error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Left Side: Farm Illustration */}
        <div 
          className="hidden md:block bg-cover bg-center rounded-xl" 
          style={{ 
            backgroundImage: `url(${images.signupPic})`,
            backgroundSize: 'cover',
            minHeight: '600px'
          }}
        >
        </div>

        {/* Right Side: Signup Form */}
        <div className="bg-white shadow-2xl rounded-xl p-10">
          <div className="text-center mb-8">
            <img src={images.logo} alt="K-Smart Farm Logo" className="mx-auto mb-4 h-20" />
            <h2 className="text-3xl font-bold text-gray-800">Join K-Smart Farm</h2>
            <p className="text-gray-500 mt-2">Create your account now</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} ref={formRef}>
            {/* Name Input */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                <FaUser className="inline mr-2" /> Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                <FaEnvelope className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                <FaLock className="inline mr-2" /> Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                <FaLock className="inline mr-2" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              Sign Up
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-green-600 font-bold hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;