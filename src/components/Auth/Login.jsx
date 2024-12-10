import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/api';
import Toast from '../UI/Toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    enrollment_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExternalOption, setShowExternalOption] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && <Toast message={error} type="error" onClose={() => setError('')} />}
        {message && <Toast message={message} type="success" onClose={() => setMessage('')} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                         placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                         placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                       text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                       disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Don't have an account? Sign up
              </a>
            </div>
            <div className="text-sm">
              <button
                onClick={() => navigate('/external-register')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                External Participant Registration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 