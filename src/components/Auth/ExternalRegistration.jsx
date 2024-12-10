import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEventCode, registerExternal } from '../../services/api';
import Toast from '../UI/Toast';

const ExternalRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    event_code: ''
  });

  const handleEventCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await verifyEventCode({ event_code: eventCode });
      setEventName(response.event_name);
      setFormData(prev => ({ ...prev, event_code: eventCode }));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify event code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerExternal(formData);
      setCredentials(response.credentials);
      setSuccess('Registration successful! Please save your credentials.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            External Participant Registration
          </h2>
        </div>

        {error && <Toast message={error} type="error" onClose={() => setError('')} />}
        {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}

        {step === 1 && (
          <form onSubmit={handleEventCodeSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="event_code" className="block text-sm font-medium text-gray-700">
                Event Code
              </label>
              <input
                id="event_code"
                type="text"
                required
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event code"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Event Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegistrationSubmit} className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">Registering for: {eventName}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {step === 3 && credentials && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-4">Registration Successful!</h3>
              <div className="space-y-3">
                <p className="text-green-800">Please save your login credentials:</p>
                <div className="bg-white p-4 rounded border border-green-200">
                  <p className="font-mono">
                    Enrollment Number: {credentials.enrollment_number}
                  </p>
                  <p className="font-mono">
                    Password: {credentials.password}
                  </p>
                </div>
                <p className="text-sm text-green-700">
                  You can use these credentials to login and view event details.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalRegistration; 