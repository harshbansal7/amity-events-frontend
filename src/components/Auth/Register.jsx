import React, { useState } from 'react';
import { register } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from '@heroicons/react/24/solid';

const Register = () => {
  const [userData, setUserData] = useState({
    enrollment_number: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userData.agreeToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, ...registrationData } = userData;
      await register(registrationData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <UserPlusIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to start participating in events
          </p>
        </div>

        {/* Form */}
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
                value={userData.enrollment_number}
                onChange={(e) => setUserData({
                  ...userData,
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
                value={userData.password}
                onChange={(e) => setUserData({
                  ...userData,
                  password: e.target.value
                })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Choose a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={userData.confirmPassword}
                onChange={(e) => setUserData({
                  ...userData,
                  confirmPassword: e.target.value
                })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={userData.agreeToTerms}
                onChange={(e) => setUserData({
                  ...userData,
                  agreeToTerms: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                         text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                         transition-colors duration-200"
            >
              Create Account
            </button>
          </div>

          <div className="text-center">
            <a 
              href="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Already have an account? Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 