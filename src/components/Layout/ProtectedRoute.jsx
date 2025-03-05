import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // We keep the current location including the event ID in the pathname
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
