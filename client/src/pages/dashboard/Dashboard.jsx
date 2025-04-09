import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Componente para mostrar el uso de recursos
const ResourceUsage = ({ label, used, total, unit, icon }) => {
  const percentage = Math.round((used / total) * 100);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1 }}>{icon}</Box>
        <Typography variant="body2">{label}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {used} / {total} {unit}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={percentage} />
    </Box>
  );
};

// Componente para mostrar el estado de un servidor
const ServerStatusChip = ({ status }) => {
  let color = 'default';
  let label = status;
  
  switch (status) {
    case 'running':
      color = 'success';
      label = 'En ejecución';
      break;
    case 'stopped':
      color = 'error';
      label = 'Detenido';
      break;
    case 'creating':
      color = 'info';
      label = 'Creando';
      break;
    case 'error':
      color = 'error';
      label = 'Error';
      break;
    case 'suspended':
      color = 'warning';
      label = 'Suspendido';
      break;
    default:
      break;
  }
  
  return <Chip size="small" color={color} label={label} />
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalServers: 0,
    activeServers: 0,
    totalPlayers: 0
  });

  // Cargar servidores y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener lista de servidores
        const response = await axios.get('/api/servers');
        
        if (response.data.success) {
          const serverData = response.data.data;
          setServers(serverData);
          
          // Calcular estadísticas
          const activeServers = serverData.filter(server => server.status === 'running').length;
          const totalPlayers = serverData.reduce((sum, server) => sum + (server.stats?.players?.current || 0), 0);
          
          setStats({
            totalServers: serverData.length,
            activeServers,
            totalPlayers
          });
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Manejar acción de servidor (iniciar/detener)
  const handleServerAction = async (serverId, action) => {
    try {
      await axios.post(`/api/servers/${serverId}/${action}`);
      
      // Actualizar lista de servidores
      const response = await axios.get('/api/servers');
      if (response.data.success) {
        setServers(response.data.data);
      }
    } catch (err) {
      console.error(`Error al ${action === 'start' ? 'iniciar' : 'detener'} el servidor:`, err);
      setError(`No se pudo ${action === 'start' ? 'iniciar' : 'detener'} el servidor. ${err.response?.data?.message || ''}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Encabezado */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Bienvenido, {user?.username}. Aquí puedes gestionar tus servidores de Minecraft.
      </Typography>
      
      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Servidores</Typography>
              <Typography variant="h3">{stats.totalServers}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.activeServers} activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Jugadores</Typography>
              <Typography variant="h3">{stats.totalPlayers}</Typography>
              <Typography variant="body2" color="text.secondary">
                conectados actualmente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Actual</Typography>
              <Typography variant="h3" sx={{ textTransform: 'capitalize' }}>{user?.plan || 'Free'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.plan === 'free' ? 'Actualiza para más recursos' : 'Plan activo'}
              </Typography>
            </CardContent>
            {user?.plan === 'free' && (
              <CardActions>
                <Button size="small" onClick={() => navigate('/billing')}>Actualizar Plan</Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Uso de recursos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Uso de Recursos</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <ResourceUsage 
              label="RAM" 
              used={servers.reduce((sum, server) => sum + (server.stats?.ramUsage || 0), 0)} 
              total={user?.resourceLimits?.ram || 1024} 
              unit="MB" 
              icon={<MemoryIcon color="primary" />} 
            />
            
            <ResourceUsage 
              label="CPU" 
              used={servers.reduce((sum, server) => sum + (server.resources?.cpu || 0), 0)} 
              total={user?.resourceLimits?.cpu || 1} 
              unit="cores" 
              icon={<SpeedIcon color="primary" />} 
            />
            
            <ResourceUsage 
              label="Almacenamiento" 
              used={servers.reduce((sum, server) => sum + (server.stats?.diskUsage || 0) / 1024, 0)} 
              total={user?.resourceLimits?.storage || 5} 
              unit="GB" 
              icon={<StorageIcon color="primary" />} 
            />
            
            <ResourceUsage 
              label="Servidores" 
              used={servers.length} 
              total={user?.resourceLimits?.servers || 1} 
              unit="" 
              icon={<StorageIcon color="primary" />} 
            />
          </Paper>
        </Grid>
        
        {/* Lista de servidores recientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Mis Servidores</Typography>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/servers/create')}
              >
                Nuevo
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {servers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No tienes servidores creados
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/servers/create')}
                  sx={{ mt: 2 }}
                >
                  Crear mi primer servidor
                </Button>
              </Box>
            ) : (
              <List>
                {servers.slice(0, 5).map((server) => (
                  <ListItem 
                    key={server._id}
                    secondaryAction={
                      <Box>
                        {server.status === 'running' ? (
                          <Button 
                            size="small" 
                            startIcon={<StopIcon />}
                            onClick={() => handleServerAction(server._id, 'stop')}
                          >
                            Detener
                          </Button>
                        ) : server.status === 'stopped' ? (
                          <Button 
                            size="small" 
                            color="success" 
                            startIcon={<PlayIcon />}
                            onClick={() => handleServerAction(server._id, 'start')}
                          >
                            Iniciar
                          </Button>
                        ) : server.status === 'error' ? (
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<WarningIcon />}
                            onClick={() => navigate(`/support`)}
                          >
                            Error
                          </Button>
                        ) : (
                          <Button 
                            size="small" 
                            startIcon={<RefreshIcon />}
                            disabled
                          >
                            {server.status}
                          </Button>
                        )}
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <StorageIcon color={server.status === 'running' ? 'success' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ mr: 1, cursor: 'pointer' }}
                            onClick={() => navigate(`/servers/${server._id}`)}
                          >
                            {server.name}
                          </Typography>
                          <ServerStatusChip status={server.status} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {server.type === 'java' ? 'Java Edition' : 'Bedrock Edition'} • {server.version} • 
                          {server.stats?.players?.current || 0} jugadores
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {servers.length > 5 && (
                  <ListItem>
                    <Button 
                      fullWidth 
                      onClick={() => navigate('/servers')}
                      sx={{ textAlign: 'center' }}
                    >
                      Ver todos los servidores ({servers.length})
                    </Button>
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;