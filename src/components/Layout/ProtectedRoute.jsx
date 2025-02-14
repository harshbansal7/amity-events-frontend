import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { isTokenValid } from '../../services/api';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isTokenValid()) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
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