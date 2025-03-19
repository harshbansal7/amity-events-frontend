import { useState, useEffect } from "react";
import { verifyEmail, verifyOTP } from "../../services/api";
import Toast from "../UI/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  Check,
  RefreshCw,
} from "lucide-react";

const EmailVerification = ({ onVerificationComplete }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Control OTP resend timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [timer, resendDisabled]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyEmail({ email });
      setShowOtpInput(true);
      setTimer(120); // 2 minutes countdown
      setResendDisabled(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;

    setLoading(true);
    setError("");

    try {
      await verifyEmail({ email });
      setTimer(120); // Reset timer
      setResendDisabled(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyOTP({ email, otp });
      onVerificationComplete(email);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
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
      transition: { when: "afterChildren" },
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

  const renderEmailForm = () => (
    <motion.form
      onSubmit={handleEmailSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="text-center mb-6">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2"
        >
          <Mail className="h-6 w-6 text-indigo-600" />
        </motion.div>
        <motion.h3
          variants={itemVariants}
          className="text-xl font-bold text-gray-800"
        >
          Verify Your Email
        </motion.h3>
        <motion.p variants={itemVariants} className="text-gray-500 text-sm">
          Enter your Amity email to receive an OTP
        </motion.p>
      </div>

      <motion.div variants={itemVariants}>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Amity Email
        </label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="yourname@s.amity.edu"
            pattern=".+@(s|pb|ch)\.amity\.edu"
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 backdrop-blur-sm"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            You must use your official Amity email to register on this platform.
          </p>
        </div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-200"
      >
        {loading ? (
          <>
            <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Sending...
          </>
        ) : (
          <>
            Send OTP
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderOtpForm = () => (
    <motion.form
      onSubmit={handleOtpSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="text-center mb-6">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2"
        >
          <Lock className="h-6 w-6 text-indigo-600" />
        </motion.div>
        <motion.h3
          variants={itemVariants}
          className="text-xl font-bold text-gray-800"
        >
          Enter OTP
        </motion.h3>
        <motion.p variants={itemVariants} className="text-gray-500 text-sm">
          We've sent a code to <span className="font-medium">{email}</span>
        </motion.p>
      </div>

      <motion.div variants={itemVariants}>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          One-Time Password
        </label>
        <div className="mt-1">
          <input
            id="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-widest text-lg font-mono transition-all duration-200"
            placeholder="• • • • • •"
            pattern="\d{6}"
            maxLength={6}
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 backdrop-blur-sm"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Can't find the OTP? Check your spam/junk folder or resend the code.
          </p>
        </div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-200"
      >
        {loading ? (
          <>
            <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Verifying...
          </>
        ) : (
          <>
            Verify OTP
            <Check className="ml-2 h-4 w-4" />
          </>
        )}
      </motion.button>

      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center text-sm"
      >
        <button
          type="button"
          onClick={() => setShowOtpInput(false)}
          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
        >
          Change Email
        </button>

        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resendDisabled}
          className={`font-medium transition-colors duration-200 ${
            resendDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:text-indigo-800"
          }`}
        >
          {resendDisabled ? `Resend in ${formatTime(timer)}` : "Resend OTP"}
        </button>
      </motion.div>
    </motion.form>
  );

  return (
    <div className="space-y-6">
      {error && (
        <Toast message={error} type="error" onClose={() => setError("")} />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {!showOtpInput ? renderEmailForm() : renderOtpForm()}
      </AnimatePresence>
    </div>
  );
};

export default EmailVerification;
