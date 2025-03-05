import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as apiLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Toast from '../UI/Toast';
import useRotatingMessage from '../../hooks/useRotatingMessage';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
  const rotatingMessage = useRotatingMessage('login');
  const [credentials, setCredentials] = useState({
    enrollment_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation states
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isInputFocused, setIsInputFocused] = useState(null);
  const [loginAppear, setLoginAppear] = useState(false);

  // Refs
  const formRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    // Page load animation sequence
    const timer = setTimeout(() => setLoginAppear(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track mouse movement for interactive background effect
    const handleMouseMove = (e) => {
      if (backgroundRef.current) {
        const rect = backgroundRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / backgroundRef.current.clientWidth) * 100;
        const y = ((e.clientY - rect.top) / backgroundRef.current.clientHeight) * 100;
        setCursorPosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/events';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setMessage('Your session has expired. Please login again.');
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  useEffect(() => {
    const stateMessage = location.state?.message;
    if (stateMessage) {
      setMessage(stateMessage);
      window.history.replaceState(
        { ...window.history.state, state: {} },
        '',
        location.pathname
      );
    }
  }, [location.pathname, location.state?.message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiLogin(credentials);
      authLogin(); // Update auth context
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic background positioning based on mouse movement
  const calculateBackgroundPosition = () => {
    return {
      backgroundPosition: `${Math.min(100, Math.max(0, 50 + (cursorPosition.x - 50) * 0.05))}% ${Math.min(100, Math.max(0, 50 + (cursorPosition.y - 50) * 0.05))}%`
    };
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50"
      ref={backgroundRef}
    >
      {/* Background layers */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20"
        style={{
          background: "radial-gradient(circle at var(--x) var(--y), rgba(60, 40, 220, 0.15), transparent 80%)",
          "--x": `${cursorPosition.x}%`,
          "--y": `${cursorPosition.y}%`
        }}
      ></div>
      
      {/* Geometric shapes in background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"></div>
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-indigo-300/5 blur-3xl"></div>

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line 
            x1="0" y1="20" x2="100" y2="20" 
            stroke="rgba(60, 40, 220, 0.4)" strokeWidth="0.05" 
            strokeDasharray="1,5" strokeLinecap="round"
          >
            <animate attributeName="y1" values="20;22;20" dur="10s" repeatCount="indefinite" />
            <animate attributeName="y2" values="20;18;20" dur="10s" repeatCount="indefinite" />
          </line>
          <line 
            x1="0" y1="40" x2="100" y2="40" 
            stroke="rgba(60, 40, 220, 0.2)" strokeWidth="0.05" 
            strokeDasharray="1,3" strokeLinecap="round"
          >
            <animate attributeName="y1" values="40;42;40" dur="15s" repeatCount="indefinite" />
            <animate attributeName="y2" values="40;38;40" dur="15s" repeatCount="indefinite" />
          </line>
          <line 
            x1="0" y1="60" x2="100" y2="60" 
            stroke="rgba(60, 40, 220, 0.3)" strokeWidth="0.05" 
            strokeDasharray="1,8" strokeLinecap="round"
          >
            <animate attributeName="y1" values="60;62;60" dur="12s" repeatCount="indefinite" />
            <animate attributeName="y2" values="60;58;60" dur="12s" repeatCount="indefinite" />
          </line>
          <line 
            x1="0" y1="80" x2="100" y2="80" 
            stroke="rgba(60, 40, 220, 0.15)" strokeWidth="0.05" 
            strokeDasharray="1,4" strokeLinecap="round"
          >
            <animate attributeName="y1" values="80;82;80" dur="14s" repeatCount="indefinite" />
            <animate attributeName="y2" values="80;78;80" dur="14s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>

      {/* Main content container with grid */}
      <div 
        className={`max-w-7xl w-full grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 z-10 transition-all duration-1000 transform ${
          loginAppear ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Left panel - Branding */}
        <div className="col-span-1 lg:col-span-3 flex flex-col justify-center space-y-8 px-4 lg:px-12">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter bg-gradient-to-r from-indigo-900 via-[#3C28DC] to-indigo-700 inline-block text-transparent bg-clip-text">
                AUP Events
              </h1>
              <div className="h-px w-20 bg-gradient-to-r from-indigo-400 to-[#3C28DC]"></div>
            </div>
            
            <p className="text-lg sm:text-xl text-slate-700 max-w-xl leading-relaxed">
              Your hub for campus activities and life-enriching experiences. Connect, participate, and make memories.
            </p>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-xl">
              <div className="p-4 rounded-xl bg-white shadow-sm border border-indigo-100">
                <p className="text-[#3C28DC] text-3xl font-medium tracking-tight">100+</p>
                <p className="text-slate-500 text-sm mt-1">Events Hosted</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white shadow-sm border border-indigo-100">
                <p className="text-indigo-500 text-3xl font-medium tracking-tight">5k+</p>
                <p className="text-slate-500 text-sm mt-1">Attendees</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white shadow-sm border border-indigo-100">
                <p className="text-indigo-600 text-3xl font-medium tracking-tight">20+</p>
                <p className="text-slate-500 text-sm mt-1">Departments</p>
              </div>
            </div>
          </div>

          {/* Featured content */}
          <div className="hidden lg:block mt-8">
            <p className="text-slate-600 text-sm font-medium mb-3">Trending Events</p>
            <div className="flex items-center space-x-4">
              {/* Animated dots showing event activity */}
              <div className="flex items-center">
                <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-slate-500 text-sm">Live Now</span>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <p className="text-slate-600 text-sm italic opacity-90">"{rotatingMessage}"</p>
            </div>
          </div>
        </div>
        
        {/* Right panel - Login Form */}
        <div className="col-span-1 lg:col-span-2 flex flex-col justify-center">
          <div 
            ref={formRef} 
            className={`w-full max-w-md mx-auto transition-all duration-700 transform ${loginAppear ? 'translate-y-0' : 'translate-y-5'}`}
          >
            {/* Form container with subtle glow effect */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/30 via-[#3C28DC]/20 to-indigo-400/30 rounded-2xl opacity-50 blur-sm group-hover:opacity-75 transition duration-1000"></div>
              
              <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="px-8 pt-8 pb-2">
                  <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                  <p className="mt-2 text-slate-500 text-sm">Sign in with your credentials</p>
                </div>
                
                {/* Alert messages */}
                {error && <Toast message={error} type="error" onClose={() => setError('')} />}
                {message && <Toast message={message} type="success" onClose={() => setMessage('')} />}
                
                <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
                  {/* Enrollment field with focus animation */}
                  <div>
                    <div className="relative">
                      <label
                        htmlFor="enrollment"
                        className={`absolute left-3 ${
                          isInputFocused === 'enrollment' || credentials.enrollment_number 
                            ? '-top-2.5 text-xs' 
                            : 'top-3.5 text-sm'
                        } px-1 bg-white text-slate-500 transition-all duration-200`}
                      >
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
                        onFocus={() => setIsInputFocused('enrollment')}
                        onBlur={() => setIsInputFocused(null)}
                        className={`block w-full px-4 py-4 rounded-xl
                                bg-white border text-slate-700 placeholder-slate-400
                                focus:outline-none focus:ring-1 transition-all duration-200
                                ${isInputFocused === 'enrollment' 
                                  ? 'border-[#3C28DC] ring-[#3C28DC]/30' 
                                  : 'border-slate-200'}`}
                      />
                    </div>
                  </div>
                  
                  {/* Password field with focus animation */}
                  <div>
                    <div className="relative">
                      <label
                        htmlFor="password"
                        className={`absolute left-3 ${
                          isInputFocused === 'password' || credentials.password 
                            ? '-top-2.5 text-xs' 
                            : 'top-3.5 text-sm'
                        } px-1 bg-white text-slate-500 transition-all duration-200`}
                      >
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
                        onFocus={() => setIsInputFocused('password')}
                        onBlur={() => setIsInputFocused(null)}
                        className={`block w-full px-4 py-4 rounded-xl
                                bg-white border text-slate-700 placeholder-slate-400
                                focus:outline-none focus:ring-1 transition-all duration-200
                                ${isInputFocused === 'password' 
                                  ? 'border-[#3C28DC] ring-[#3C28DC]/30' 
                                  : 'border-slate-200'}`}
                      />
                    </div>
                  </div>
                  
                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <a
                      href="/forgot-password"
                      className="text-sm text-slate-500 hover:text-[#3C28DC] transition-colors duration-200"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  
                  {/* Submit button with hover effect */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl 
                              relative overflow-hidden group/button
                              text-white font-medium shadow-md
                              bg-[#3C28DC] hover:bg-indigo-600
                              disabled:opacity-70 transition-all duration-300"
                    >
                      {/* Button shine effect */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                     -translate-x-full group-hover/button:animate-shimmer"></span>
                                     
                      {/* Button text */}
                      <span className="relative flex items-center justify-center">
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Signing in...</span>
                          </>
                        ) : (
                          'Sign in'
                        )}
                      </span>
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs text-slate-400">or</span>
                    </div>
                  </div>
                  
                  {/* Alternative options */}
                  <div className="space-y-3">
                    <a
                      href="/register"
                      className="block w-full text-center py-3 px-4 rounded-xl
                              border border-slate-200 text-slate-700 bg-white
                              hover:bg-slate-50 hover:text-[#3C28DC] hover:border-[#3C28DC]/30
                              transition-all duration-200 text-sm font-medium"
                    >
                      Create an account
                    </a>
                    
                    <button
                      onClick={() => navigate('/external-register')}
                      className="w-full text-center py-3 px-4
                              text-sm text-slate-500 hover:text-[#3C28DC] 
                              transition-colors duration-200"
                    >
                      Register as external participant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;