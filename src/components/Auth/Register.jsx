import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/api";
import EmailVerification from "./EmailVerification";
import Toast from "../UI/Toast";
import useRotatingMessage from "../../hooks/useRotatingMessage";
import branchesData from "../../data/branches.json";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Phone,
  Lock,
} from "lucide-react";

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
  const [formErrors, setFormErrors] = useState({});
  const rotatingMessage = useRotatingMessage("register");

  // Total number of steps (email verification + 3 form steps)
  const totalSteps = 4;

  const handleEmailVerification = (verifiedEmail) => {
    setUserData((prev) => ({ ...prev, amity_email: verifiedEmail }));
    setStep(2);
  };

  const validateStep = (currentStep) => {
    const errors = {};

    if (currentStep === 2) {
      if (!userData.name.trim()) errors.name = "Name is required";
      if (!userData.enrollment_number.trim())
        errors.enrollment_number = "Enrollment number is required";
    } else if (currentStep === 3) {
      if (!userData.domain) errors.domain = "Domain is required";
      if (!userData.branch) errors.branch = "Branch is required";
      if (!userData.year) errors.year = "Year is required";
    } else if (currentStep === 4) {
      if (!userData.password) errors.password = "Password is required";
      if (userData.password !== userData.confirm_password)
        errors.confirm_password = "Passwords don't match";
      if (!userData.phone_number)
        errors.phone_number = "Phone number is required";
      else if (!/^\d{10}$/.test(userData.phone_number))
        errors.phone_number = "Enter a valid 10-digit number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setError("");
    setLoading(true);

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

  // Animation variants for framer motion
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  // Form step content
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <EmailVerification onVerificationComplete={handleEmailVerification} />
        );

      case 2:
        return (
          <motion.div
            key="personal-info"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Personal Information
              </h3>
              <p className="text-gray-500 text-sm">
                Let's start with your basic details
              </p>
            </div>

            <div className="space-y-4">
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
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
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
                  value={userData.enrollment_number}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      enrollment_number: e.target.value,
                    })
                  }
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.enrollment_number
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                  placeholder="Enter your enrollment number"
                />
                {formErrors.enrollment_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.enrollment_number}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="academic-info"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Academic Details
              </h3>
              <p className="text-gray-500 text-sm">
                Tell us about your academic background
              </p>
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
                  value={userData.domain}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      domain: e.target.value,
                      branch: "",
                    })
                  }
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.domain
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                >
                  <option value="">Select your domain</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {formErrors.domain && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.domain}
                  </p>
                )}
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
                  value={userData.branch}
                  onChange={(e) =>
                    setUserData({ ...userData, branch: e.target.value })
                  }
                  disabled={!userData.domain}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.branch
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 
                  ${!userData.domain && "opacity-60 cursor-not-allowed"}`}
                >
                  <option value="">Select your branch</option>
                  {userData.domain &&
                    branchesData[userData.domain].map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                </select>
                {formErrors.branch && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.branch}
                  </p>
                )}
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
                  value={userData.year}
                  onChange={(e) =>
                    setUserData({ ...userData, year: e.target.value })
                  }
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.year
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                >
                  <option value="">Select your year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
                {formErrors.year && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="final-info"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
                <div className="flex items-center">
                  <Lock className="h-6 w-6 text-indigo-600" />
                  <Phone className="h-5 w-5 text-indigo-600 -ml-2" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Security & Contact
              </h3>
              <p className="text-gray-500 text-sm">
                Set your password and contact details
              </p>
            </div>

            <div className="space-y-4">
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
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                  placeholder="Create a password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
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
                  value={userData.confirm_password}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      confirm_password: e.target.value,
                    })
                  }
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.confirm_password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                  placeholder="Confirm your password"
                />
                {formErrors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.confirm_password}
                  </p>
                )}
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
                  value={userData.phone_number}
                  onChange={(e) =>
                    setUserData({ ...userData, phone_number: e.target.value })
                  }
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.phone_number
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
                  placeholder="Enter your phone number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
                {formErrors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.phone_number}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex justify-center items-center w-full max-w-xs">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      idx + 1 === step
                        ? "bg-indigo-600 text-white scale-110 shadow-md"
                        : idx + 1 < step
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx + 1 < step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{idx + 1}</span>
                    )}
                  </div>
                </div>

                {idx < totalSteps - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={`h-1 w-full ${
                        idx + 1 < step ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="text-center text-gray-400/60 text-sm italic mt-2">
            {rotatingMessage}
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        {step > 1 && step <= totalSteps && renderStepIndicators()}

        <AnimatePresence mode="wait">{renderFormStep()}</AnimatePresence>

        {step > 1 && step <= totalSteps && (
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Complete Registration"}
              </button>
            )}
          </div>
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
