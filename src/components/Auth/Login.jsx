import React, { useState } from 'react';
import { login } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [credentials, setCredentials] = useState({
    enrollment_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(credentials);
      localStorage.setItem('token', response.token);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <LockClosedIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
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
              Sign in
            </button>
          </div>

          <div className="text-center">
            <a 
              href="/register" 
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Don't have an account? Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 