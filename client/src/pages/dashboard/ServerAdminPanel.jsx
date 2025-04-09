import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import ServerAdminPanel from '../../components/ServerAdminPanel';

const ServerAdminPanelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Estados
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [statusUpdateInterval, setStatusUpdateInterval] = useState(null);
  
  // Cargar datos del servidor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchServerDetails();
        
        // Iniciar la actualización del estado del servidor cada 10 segundos
        const statusInterval = setInterval(() => {
          if (server?._id) {
            fetchServerStatus();
          }
        }, 10000);
        
        setStatusUpdateInterval(statusInterval);
      } catch (err) {
        console.error('Error al cargar datos del servidor:', err);
        setError('No se pudieron cargar los detalles del servidor. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Limpiar intervalo al desmontar
    return () => {
      if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
      }
    };
  }, [id]);
  
  // Función para cargar detalles del servidor
  const fetchServerDetails = async () => {
    try {
      setError(null);
      
      const response = await axios.get(`/api/servers/${id}`);
      
      if (response.data.success) {
        setServer(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar detalles del servidor:', err);
      setError('No se pudieron cargar los detalles del servidor. Por favor, intenta de nuevo más tarde.');
      throw err;
    }
  };
  
  // Función para actualizar el estado del servidor
  const fetchServerStatus = async () => {
    try {
      const response = await axios.get(`/api/servers/${id}/status`);
      
      if (response.data.success) {
        setServer(prevServer => ({
          ...prevServer,
          status: response.data.data.status,
          stats: response.data.data.stats
        }));
      }
    } catch (err) {
      console.error('Error al actualizar estado del servidor:', err);
    }
  };
  
  // Manejar acción de servidor (iniciar/detener/reiniciar/etc)
  const handleServerAction = async (action) => {
    try {
      setError(null);
      
      await axios.post(`/api/servers/${id}/${action}`);
      
      // Actualizar detalles del servidor
      await fetchServerDetails();
      
      return true;
    } catch (err) {
      console.error(`Error al ${action} el servidor:`, err);
      setError(`No se pudo ${action} el servidor. ${err.response?.data?.message || ''}`);
      throw err;
    }
  };
  
  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading && !server) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!server) {
    return (
      <Alert severity="error">
        No se pudo encontrar el servidor. Por favor, verifica que la URL sea correcta.
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Breadcrumbs para navegación */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink 
          component={Link} 
          to="/dashboard"
          underline="hover" 
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </MuiLink>
        <MuiLink 
          component={Link} 
          to="/dashboard/servers"
          underline="hover" 
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <StorageIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Servidores
        </MuiLink>
        <MuiLink 
          component={Link} 
          to={`/dashboard/servers/${id}`}
          underline="hover" 
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {server.name}
        </MuiLink>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Panel de Administración
        </Typography>
      </Breadcrumbs>
      
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {server.name} - Panel de Administración
        </Typography>
      </Box>
      
      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Pestañas de navegación */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Panel Principal" />
          <Tab icon={<TerminalIcon />} label="Consola" />
          <Tab icon={<SettingsIcon />} label="Configuración" />
          <Tab icon={<BackupIcon />} label="Backups" />
          <Tab icon={<CodeIcon />} label="Plugins/Mods" />
          <Tab icon={<SecurityIcon />} label="Seguridad" />
        </Tabs>
      </Paper>
      
      {/* Contenido de las pestañas */}
      <Box>
        {tabValue === 0 && (
          <ServerAdminPanel 
            server={server} 
            onServerAction={handleServerAction} 
            loading={loading} 
          />
        )}
        
        {tabValue === 1 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Consola del Servidor
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta sección te permite acceder a la consola completa del servidor para ejecutar comandos avanzados.
              </Alert>
              {/* Aquí se integraría un componente de consola más avanzado */}
            </CardContent>
          </Card>
        )}
        
        {tabValue === 2 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración Avanzada
              </Typography>
              <Alert severity="info">
                Esta sección te permite configurar todos los aspectos del servidor, incluyendo propiedades avanzadas.
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {tabValue === 3 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sistema de Backups
              </Typography>
              <Alert severity="info">
                Gestiona las copias de seguridad de tu servidor, programa backups automáticos y restaura versiones anteriores.
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {tabValue === 4 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gestión de Plugins y Mods
              </Typography>
              <Alert severity="info">
                Instala, configura y gestiona plugins y mods para personalizar tu servidor.
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {tabValue === 5 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seguridad y Permisos
              </Typography>
              <Alert severity="info">
                Configura la seguridad de tu servidor, gestiona permisos de usuarios y protege contra amenazas.
              </Alert>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ServerAdminPanelPage;