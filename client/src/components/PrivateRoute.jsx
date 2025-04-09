import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a la página de login si el usuario no está autenticado
 */
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Mientras se verifica la autenticación, no renderizar nada
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Si hay usuario autenticado, renderizar el componente hijo
  return children;
};

export default PrivateRoute;