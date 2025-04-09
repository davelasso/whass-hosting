import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme as useMuiTheme, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { theme: mode, toggleTheme } = useTheme();
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Planes', path: '/#plans' },
    { name: 'Demo', path: '/server-demo' },
    { name: 'Contacto', path: '/contact' },
  ];

  const authItems = isAuthenticated 
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Perfil', path: '/profile' },
        { name: 'Cerrar Sesión', action: handleLogout }
      ]
    : [
        { name: 'Iniciar Sesión', path: '/login' },
        { name: 'Registrarse', path: '/register' }
      ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        WhassMinecraft
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} component={Link} to={item.path}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <Divider />
        {authItems.map((item) => (
          <ListItem 
            key={item.name} 
            component={item.path ? Link : 'button'} 
            to={item.path} 
            onClick={item.action}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold' 
            }}
          >
            WhassMinecraft
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button 
                  key={item.name} 
                  component={Link} 
                  to={item.path}
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  {item.name}
                </Button>
              ))}
              
              {authItems.map((item) => (
                <Button 
                  key={item.name} 
                  component={item.path ? Link : 'button'} 
                  to={item.path}
                  onClick={item.action}
                  color="inherit"
                  variant={item.name === 'Registrarse' ? 'outlined' : 'text'}
                  sx={{ mx: 1 }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}
          
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            sx={{ ml: 1 }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 