import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyEventCode, registerExternal } from "../../services/api";
import Toast from "../UI/Toast";

const ExternalRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventCode, setEventCode] = useState("");
  const [eventName, setEventName] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    event_code: "",
  });

  const handleEventCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await verifyEventCode({ event_code: eventCode });
      setEventName(response.event_name);
      setFormData((prev) => ({ ...prev, event_code: eventCode }));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify event code");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await registerExternal(formData);
      setCredentials(response.credentials);
      setSuccess("Registration successful! Please save your credentials.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div>
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 mb-2">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              External Participant Registration
            </h2>
            <p className="text-gray-500">
              Join events with your external registration code
            </p>
          </div>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}
        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess("")}
          />
        )}

        {step === 1 && (
          <form onSubmit={handleEventCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="event_code"
                className="block text-sm font-medium text-gray-700"
              >
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
                pattern="[A-Z0-9]{6}"
                maxLength={6}
              />
            </div>
            {/* <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start space-x-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Make sure to check your spam/junk folder for the verification code.</span>
            </div> */}
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
              {loading ? "Verifying..." : "Verify Event Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-blue-800">Registering for: {eventName}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
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
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {step === 3 && credentials && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-green-900 mb-4">
                Registration Successful!
              </h3>
              <div className="space-y-3">
                <p className="text-green-800">
                  Please save your login credentials:
                </p>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-green-200 font-mono">
                  <p className="font-mono">
                    Enrollment Number: {credentials.enrollment_number}
                  </p>
                  <p className="font-mono">Password: {credentials.password}</p>
                </div>
                <p className="text-sm text-green-700">
                  You can use these credentials to login and view event details.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 
                    transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalRegistration;
