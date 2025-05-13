import React, { useEffect, useRef, useState } from 'react';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import images from './utils';
import gsap from 'gsap';

const Forgotpassword = () => {
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // New state to track email sent status

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setSent(false); // Reset sent state on new form submission

    try {
      const response = await fetch('http://localhost:5000/api/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setSent(true); // Mark as sent if successful
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Password reset failed.');
      }
    } catch (error) {
      setErrorMessage('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Left Side: Illustration */}
        <div
          className="hidden md:block bg-cover bg-center rounded-xl"
          style={{
            backgroundImage: `url(${images.forgotPasswordPG})`,
            backgroundSize: 'cover',
            minHeight: '500px',
          }}
        ></div>

        {/* Right Side: Form */}
        <div className="bg-white shadow-2xl rounded-xl p-10">
          <div className="text-center mb-8">
            <FaKey className="mx-auto text-6xl text-green-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={loading || sent} // Disable the button if loading or email has been sent
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              {loading ? (
                <span className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-white mr-2"></span>
              ) : sent ? (
                <span className="text-green-200">✔</span> // Sent success icon
              ) : (
                <FaLock className="mr-2" />
              )}
              {loading
                ? 'Sending...'
                : sent
                ? 'Sent'
                : 'Reset Password'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="text-green-600 font-bold hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;
