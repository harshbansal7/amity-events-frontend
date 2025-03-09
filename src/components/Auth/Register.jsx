import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/api";
import EmailVerification from "./EmailVerification";
import Toast from "../UI/Toast";
import useRotatingMessage from "../../hooks/useRotatingMessage";
import branchesData from "../../data/branches.json";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [domains] = useState(Object.keys(branchesData));
  const [userData, setUserData] = useState({
    name: "",
    amity_email: "",
    enrollment_number: "",
    password: "",
    confirm_password: "",
    domain: "",
    branch: "",
    year: "",
    phone_number: "",
  });

  const rotatingMessage = useRotatingMessage("register");

  const handleEmailVerification = (verifiedEmail) => {
    setUserData((prev) => ({ ...prev, amity_email: verifiedEmail }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (userData.password !== userData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(userData);
      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-gray-400/60 text-sm italic mt-2">
            {rotatingMessage}
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        {step === 1 ? (
          <EmailVerification onVerificationComplete={handleEmailVerification} />
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
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
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="enrollment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Number
                </label>
                <input
                  id="enrollment"
                  type="text"
                  required
                  value={userData.enrollment_number}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      enrollment_number: e.target.value,
                    })
                  }
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your enrollment number"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="domain"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Domain
                  </label>
                  <select
                    id="domain"
                    required
                    value={userData.domain}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        domain: e.target.value,
                        branch: "", // Reset branch when domain changes
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 
                           bg-white rounded-lg shadow-sm focus:outline-none 
                           focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select your domain</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Branch
                  </label>
                  <select
                    id="branch"
                    required
                    value={userData.branch}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        branch: e.target.value,
                      })
                    }
                    disabled={!userData.domain}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 
                           bg-white rounded-lg shadow-sm focus:outline-none 
                           focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select your branch</option>
                    {userData.domain &&
                      branchesData[userData.domain].map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      password: e.target.value,
                    })
                  }
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  required
                  value={userData.confirm_password}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <select
                  id="year"
                  required
                  value={userData.year}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      year: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         bg-white rounded-lg shadow-sm focus:outline-none 
                         focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select your year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
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
                  value={userData.phone_number}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      phone_number: e.target.value,
                    })
                  }
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                           placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your phone number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
