import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/api';
import Toast from '../UI/Toast';
import useRotatingMessage from '../../hooks/useRotatingMessage';
import { isTokenValid } from '../../utils/tokenUtils';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rotatingMessage = useRotatingMessage('login');
  const [credentials, setCredentials] = useState({
    enrollment_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExternalOption, setShowExternalOption] = useState(false);

  useEffect(() => {
    // Check token validity on component mount
    if (isTokenValid()) {
      const from = location.state?.from?.pathname || '/events';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  // Show success message if redirected from registration
  useEffect(() => {
    // Show message if redirected from expired token
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setMessage('Your session has expired. Please login again.');
    }

    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(credentials);
      // Token is automatically saved by the api service
      navigate('/events'); // or wherever your main app page is
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-6">
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl">
        <p className="text-center text-gray-400/60 text-sm italic mb-2">
          {rotatingMessage}
        </p>
        <div className="text-center space-y-2">
          <img
            src="/assets/amity-logo.png"
            alt="Amity Events"
            className="h-16 sm:h-10 mx-auto mb-2 drop-shadow-xl"
          />
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Sign in to your account
          </h2>
          <p className="text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        {error && <Toast message={error} type="error" onClose={() => setError('')} />}
        {message && <Toast message={message} type="success" onClose={() => setMessage('')} />}

        <form className="mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="enrollment" className="block text-sm font-medium text-gray-700">
                Enrollment Number
              </label>
              <input
                id="enrollment"
                type="text"
                required
                value={credentials.enrollment_number}
                onChange={(e) => setCredentials({
                  ...credentials,
                  enrollment_number: e.target.value
                })}
                className="mt-1 block w-full px-4 py-3 bg-white/50 border border-gray-300 
                        rounded-xl shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500 transition-all duration-200"
                placeholder="Enter your enrollment number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
                className="mt-1 block w-full px-4 py-3 bg-white/50 border border-gray-300 
                        rounded-xl shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500 transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                      text-sm font-semibold rounded-xl text-white 
                      bg-gradient-to-r from-indigo-600 to-blue-600 
                      hover:from-indigo-700 hover:to-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-indigo-500 transition-all duration-200
                      disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-gray-500">or</span>
              </div>
            </div>
            <div className="text-sm text-center">
              <a
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Forgot your password?
              </a>
            </div>
            
            <div className="text-sm">
              <a
                href="/register"
                className="w-full flex items-center justify-center px-4 py-3 
                        border border-indigo-600 text-indigo-600 
                        rounded-xl hover:bg-indigo-50 
                        transition-all duration-200 font-medium"
              >
                Don't have an account? Sign up
              </a>
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate('/external-register')}
                className="text-sm text-gray-600 hover:text-indigo-600 
                        transition-colors duration-200 underline"
              >
                Register as External Participant →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 