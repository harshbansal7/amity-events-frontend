import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isTokenValid } from '../../services/api';
import Navbar from './Navbar';
import Footer from './Footer';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      // Clean navigation - only pass necessary location info
      navigate('/login', {
        replace: true,
        state: {
          from: {
            pathname: location.pathname,
            search: location.search
          }
        }
      });
    }
  }, [location, navigate]);

  if (!isTokenValid()) {
    return null; // Return null instead of Navigate to prevent flash
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] mt-16">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default ProtectedRoute;

