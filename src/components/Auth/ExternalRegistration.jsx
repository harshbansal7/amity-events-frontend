import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyEventCode, registerExternal } from "../../services/api";
import Toast from "../UI/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  UserPlus,
  CheckCircle,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  User,
  LogIn,
} from "lucide-react";

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
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";

    if (!formData.phone_number)
      errors.phone_number = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone_number))
      errors.phone_number = "Enter a valid 10-digit number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

    if (!validateForm()) return;

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { when: "afterChildren", staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center justify-center w-full max-w-xs">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                step === 1
                  ? "bg-indigo-600 text-white scale-110 shadow-md"
                  : step > 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > 1 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">1</span>
              )}
            </div>
            <span className="text-xs mt-1 text-gray-500">Event Code</span>
          </div>

          {/* Progress bar 1-2 */}
          <div className="flex-1 mx-2">
            <div
              className={`h-1 w-full transition-colors duration-500 ${step > 1 ? "bg-green-500" : "bg-gray-200"}`}
            ></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                step === 2
                  ? "bg-indigo-600 text-white scale-110 shadow-md"
                  : step > 2
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > 2 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">2</span>
              )}
            </div>
            <span className="text-xs mt-1 text-gray-500">Details</span>
          </div>

          {/* Progress bar 2-3 */}
          <div className="flex-1 mx-2">
            <div
              className={`h-1 w-full transition-colors duration-500 ${step > 2 ? "bg-green-500" : "bg-gray-200"}`}
            ></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                step === 3
                  ? "bg-green-500 text-white scale-110 shadow-md"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step === 3 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">3</span>
              )}
            </div>
            <span className="text-xs mt-1 text-gray-500">Complete</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEventCodeForm = () => (
    <motion.form
      onSubmit={handleEventCodeSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <Ticket className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Enter Event Code</h3>
        <p className="text-gray-500 text-sm">
          Please enter the 6-character code provided by the event organizer
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label
          htmlFor="event_code"
          className="block text-sm font-medium text-gray-700"
        >
          Event Code
        </label>
        <div className="mt-1 relative">
          <input
            id="event_code"
            type="text"
            required
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
            className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-widest text-lg font-mono transition-all duration-200"
            placeholder="XXXXXX"
            pattern="[A-Z0-9]{6}"
            maxLength={6}
          />
        </div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={loading || eventCode.length !== 6}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-200"
      >
        {loading ? (
          <>
            <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Verifying...
          </>
        ) : (
          "Verify Event Code"
        )}
      </motion.button>
    </motion.form>
  );

  const renderRegistrationForm = () => (
    <motion.form
      onSubmit={handleRegistrationSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <UserPlus className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Your Information</h3>
        <p className="text-gray-500 text-sm">
          Enter your details to register for the event
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6"
      >
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            Registering for: <span className="font-semibold">{eventName}</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <div className="mt-1 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`pl-10 block w-full px-3 py-2 border ${
                formErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              } rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="Enter your full name"
            />
          </div>
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="mt-1 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`pl-10 block w-full px-3 py-2 border ${
                formErrors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <div className="mt-1 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone_number: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              className={`pl-10 block w-full px-3 py-2 border ${
                formErrors.phone_number
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </div>
          {formErrors.phone_number && (
            <p className="mt-1 text-sm text-red-600">
              {formErrors.phone_number}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-200"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Registering...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </motion.div>
    </motion.form>
  );

  const renderSuccessView = () => (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          Registration Complete!
        </h3>
        <p className="text-gray-500 text-sm">
          You have successfully registered for {eventName}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-green-900 mb-4">
          Save Your Login Credentials
        </h3>
        <div className="space-y-3">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200 font-mono">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Enrollment Number:</span>
              <span className="font-semibold">
                {credentials?.enrollment_number}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Password:</span>
              <span className="font-semibold">{credentials?.password}</span>
            </div>
          </div>
          <p className="text-sm text-green-700">
            You can use these credentials to login and access the event details.
          </p>
        </div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={() => navigate("/login")}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Go to Login
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            External Registration
          </h2>
          <p className="text-center text-gray-500 mt-1">
            Access events with your registration code
          </p>
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

        {renderStepIndicator()}

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && renderEventCodeForm()}
          {step === 2 && renderRegistrationForm()}
          {step === 3 && credentials && renderSuccessView()}
        </AnimatePresence>

        {step < 3 && (
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalRegistration;
