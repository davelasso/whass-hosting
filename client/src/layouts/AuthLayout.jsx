import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
  IconButton,
  useTheme
} from '@mui/material';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';

const AuthLayout = () => {
  const theme = useTheme();
  const { theme: themeMode, toggleTheme } = useThemeContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link component={RouterLink} to="/" underline="none" color="inherit">
          <Typography variant="h5" component="h1" fontWeight="bold">
            ddsbedrocl
          </Typography>
        </Link>
        <IconButton color="inherit" onClick={toggleTheme}>
          {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {/* Main Content */}
      <Container component="main" maxWidth="sm" sx={{ py: 8, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ddsbedrocl - Plataforma de Hosting para Servidores de Minecraft
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;