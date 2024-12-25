import React, { useEffect, useRef, useState } from 'react';
import { FaEnvelope, FaLock, FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import images from './utils';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Login = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userId', data.user._id);
        navigate('/landingpage');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Login failed');
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
            backgroundImage: `url(${images.loginPic})`,
            backgroundSize: 'cover',
            minHeight: '600px'
          }}
        >
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-white shadow-2xl rounded-xl p-10">
          <div className="text-center mb-8">
            <FaUserCircle className="mx-auto text-6xl text-green-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Login to your K-Smart Farm Account</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} ref={formRef}>
            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <a 
                href="/forgotpassword" 
                className="text-sm text-green-600 hover:underline float-right mt-2"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaLock className="mr-2" /> Login
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="text-green-600 font-bold hover:underline"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;