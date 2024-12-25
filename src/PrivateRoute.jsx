import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId'); // Check if user ID exists in local storage

  return userId ? children : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default PrivateRoute;