import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as apiLogin } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../UI/Toast";
import useRotatingMessage from "../../hooks/useRotatingMessage";
import {
  Calendar,
  ArrowRight,
  ChevronRight,
  User,
  Lock,
  ExternalLink,
  Home,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
  const rotatingMessage = useRotatingMessage("login");

  const [credentials, setCredentials] = useState({
    enrollment_number: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // For parallax effect from new design
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/events";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  // Check for expired session param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired")) {
      setMessage("Your session has expired. Please login again.");
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Check for state message (e.g. from registration)
  useEffect(() => {
    const stateMessage = location.state?.message;
    if (stateMessage) {
      setMessage(stateMessage);
      window.history.replaceState(
        { ...window.history.state, state: {} },
        "",
        location.pathname,
      );
    }
  }, [location.pathname, location.state?.message]);

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculate parallax transforms
  const calculateTransform = (factor) => {
    const x = (mousePosition.x - 0.5) * factor;
    const y = (mousePosition.y - 0.5) * factor;
    return `translate(${x}px, ${y}px)`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiLogin(credentials);
      authLogin(); // Update auth context
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f7ff] overflow-hidden relative">
      {/* Animated background elements */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-70 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(60, 40, 220, 0.15) 0%, transparent 50%), 
                          radial-gradient(circle at 80% 70%, rgba(60, 40, 220, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Floating orbs */}
      <div
        className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-gradient-to-br from-[#3C28DC]/20 to-[#6354e2]/10 blur-3xl"
        style={{ transform: calculateTransform(-20) }}
      ></div>
      <div
        className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-tr from-[#3C28DC]/10 to-[#8a7df2]/5 blur-3xl"
        style={{ transform: calculateTransform(-15) }}
      ></div>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.015]"></div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col min-h-screen">
        {/* Main content */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center py-4 md:py-6">
          {/* Left side - 3D illustration and branding - hidden on mobile */}
          <div className="w-full lg:w-1/2 hidden lg:flex flex-col items-center lg:items-start pt-0 -mt-8">
            <div
              className="relative w-full max-w-md aspect-square mb-1"
              style={{ transform: calculateTransform(30) }}
            >
              {/* 3D illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56 md:w-64 md:h-64">
                  {/* Calendar base */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3C28DC] to-[#5240E3] rounded-2xl shadow-xl transform rotate-12 translate-y-4"></div>

                  <div className="absolute inset-0 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
                    <div className="bg-[#3C28DC] text-white rounded-lg p-2 mb-2 w-full text-center font-bold text-xs">
                      {new Date()
                        .toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center mb-1">
                      <div className="text-gray-500">S</div>
                      <div className="text-gray-500">M</div>
                      <div className="text-gray-500">T</div>
                      <div className="text-gray-500">W</div>
                      <div className="text-gray-500">T</div>
                      <div className="text-gray-500">F</div>
                      <div className="text-gray-500">S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                      {Array.from(
                        {
                          length: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            0,
                          ).getDate(),
                        },
                        (_, i) => (
                          <div
                            key={i}
                            className={`aspect-square flex items-center justify-center rounded-full ${
                              i === new Date().getDate() - 1
                                ? "bg-[#3C28DC] text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {i + 1}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-8 -right-8 bg-gradient-to-br from-[#f0ebff] to-white p-3 rounded-xl shadow-lg transform -rotate-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#3C28DC]"></div>
                      <span className="text-xs font-medium">
                        Tech Symposium
                      </span>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 -left-6 bg-gradient-to-br from-[#f0ebff] to-white p-3 rounded-xl shadow-lg transform rotate-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#5240E3]"></div>
                      <span className="text-xs font-medium">Cultural Fest</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 text-center lg:text-left leading-tight">
              <span className="text-[#3C28DC]">aup.events!</span>
            </h1>

            <p className="text-base text-gray-600 mb-4 text-center lg:text-left max-w-lg">
              Participate, host, and manage events seamlessly within the Amity
              University Punjab community
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open("https://aup.events", "_blank")}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700"
              >
                <Home className="h-4 w-4 text-[#3C28DC]" />
                <span>Explore Site</span>
                <ChevronRight className="h-4 w-4 text-[#3C28DC] transform group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#f0ebff] text-[#3C28DC] text-sm">
                <span className="mr-2">❤️</span>
                {rotatingMessage}
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full md:w-2/3 lg:w-1/2 max-w-md">
            {/* Mobile only logo */}
            <div className="flex items-center justify-center mb-6 lg:hidden">
              <div className="flex items-center gap-2">
                <div className="bg-[#3C28DC] p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-800">
                  aup.events
                </span>
              </div>
            </div>

            {error && (
              <Toast
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            )}
            {message && (
              <Toast
                message={message}
                type="success"
                onClose={() => setMessage("")}
              />
            )}

            <div className="relative">
              {/* Glassmorphism card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#3C28DC] rounded-full opacity-10 blur-xl"></div>

                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f0ebff] rounded-2xl mb-3">
                    <svg
                      className="h-7 w-7 text-[#3C28DC]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L20 7V17L12 21L4 17V7L12 3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 12L12 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 12L20 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 12L4 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-600">
                    Sign in to access your account
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <label
                      htmlFor="enrollment"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Enrollment Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#3C28DC] transition-colors" />
                      </div>
                      <input
                        id="enrollment"
                        type="text"
                        placeholder="Enter your enrollment number"
                        className="pl-10 bg-white/50 border border-gray-200 focus:ring-[#3C28DC] focus:border-[#3C28DC] rounded-xl w-full py-2 px-4"
                        value={credentials.enrollment_number}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            enrollment_number: e.target.value,
                          })
                        }
                        required
                      />
                      <div className="absolute inset-0 rounded-xl border border-gray-200 pointer-events-none group-focus-within:border-[#3C28DC] group-focus-within:ring-1 group-focus-within:ring-[#3C28DC]/30 transition-all"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm text-[#3C28DC] hover:text-[#5240E3] font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#3C28DC] transition-colors" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 bg-white/50 border border-gray-200 focus:ring-[#3C28DC] focus:border-[#3C28DC] rounded-xl w-full py-2 px-4"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <div className="absolute inset-0 rounded-xl border border-gray-200 pointer-events-none group-focus-within:border-[#3C28DC] group-focus-within:ring-1 group-focus-within:ring-[#3C28DC]/30 transition-all"></div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3C28DC] hover:bg-[#3522c7] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3C28DC]/20 hover:shadow-[#3C28DC]/30"
                  >
                    <span>{loading ? "Signing in..." : "Sign in"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="relative mt-6 pt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/80 px-4 text-sm text-gray-500">
                      or
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => navigate("/register")}
                    className="flex items-center justify-center w-full py-2.5 border-2 border-[#3C28DC]/80 text-[#3C28DC] font-medium rounded-xl hover:bg-[#f5f3ff] transition-colors"
                  >
                    Create an account
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate("/external-register")}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-[#3C28DC]"
                  >
                    Register as External Participant
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -left-4 w-full h-full bg-gradient-to-br from-[#3C28DC]/10 to-[#5240E3]/5 rounded-3xl transform rotate-2"></div>
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-gradient-to-tr from-[#3C28DC]/5 to-[#5240E3]/10 rounded-3xl transform -rotate-2"></div>
            </div>

            {/* Mobile explore site button and tagline */}
            <div className="lg:hidden text-center mt-8 space-y-4">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#f0ebff] text-[#3C28DC] text-xs">
                <span className="mr-1">✨</span>
                {rotatingMessage}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="group flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700 mx-auto"
                >
                  <Home className="h-4 w-4 text-[#3C28DC]" />
                  <span>Explore Site</span>
                  <ChevronRight className="h-4 w-4 text-[#3C28DC] transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
