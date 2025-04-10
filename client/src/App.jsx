import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import ServerList from './pages/ServerList';
import ServerDetail from './pages/dashboard/ServerDetail';
import CreateServer from './pages/dashboard/CreateServer';
import ServerAdminPanel from './pages/dashboard/ServerAdminPanel';
import Checkout from './pages/Checkout';
import ServerDemo from './pages/ServerDemo';
import PrivateRoute from './components/PrivateRoute';
import theme from './theme';

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/demo" element={<ServerDemo />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/servers" element={<PrivateRoute><ServerList /></PrivateRoute>} />
              <Route path="/servers/:id" element={<PrivateRoute><ServerDetail /></PrivateRoute>} />
              <Route path="/servers/create" element={<PrivateRoute><CreateServer /></PrivateRoute>} />
              <Route path="/servers/:id/admin" element={<PrivateRoute><ServerAdminPanel /></PrivateRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;