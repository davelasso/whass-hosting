import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Configurar el token en los headers para todas las solicitudes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Obtener información del usuario
        const res = await axios.get('/api/auth/me');
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar token en headers para futuras solicitudes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/register', userData);
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar token en headers para futuras solicitudes
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar token de localStorage
    localStorage.removeItem('token');
    
    // Eliminar token de headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Resetear estado
    setUser(null);
    setIsAuthenticated(false);
  };

  // Función para actualizar perfil de usuario
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const res = await axios.put('/api/users/profile', userData);
      
      if (res.data.success) {
        setUser(res.data.data);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
      return false;
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const res = await axios.put('/api/users/password', { currentPassword, newPassword });
      
      if (res.data.success) {
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
      return false;
    }
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/forgot-password', { email });
      
      if (res.data.success) {
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al solicitar restablecimiento de contraseña');
      return false;
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password });
      
      if (res.data.success) {
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
      return false;
    }
  };

  // Función para verificar el correo electrónico
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const res = await axios.get(`/api/auth/verify-email/${token}`);
      
      if (res.data.success) {
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el correo electrónico');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      setLoading,
      error,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
      verifyEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;