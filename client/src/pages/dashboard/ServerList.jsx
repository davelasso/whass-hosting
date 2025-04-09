import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Componente para mostrar el estado del servidor
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
  
  return <Chip size="small" color={color} label={label} />;
};

// Componente para mostrar el uso de recursos
const ResourceInfo = ({ icon, label, value, unit }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <Box sx={{ color: 'text.secondary', mr: 0.5 }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {label}: {value} {unit}
      </Typography>
    </Box>
  );
};

const ServerList = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth(); // Deshabilitar advertencia para posible uso futuro
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme(); // Deshabilitar advertencia para posible uso futuro
  
  // Estados
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  // Estado para el menú de acciones
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  
  // Cargar servidores
  useEffect(() => {
    fetchServers();
  }, []);
  
  // Función para cargar servidores
  const fetchServers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/servers');
      
      if (response.data.success) {
        setServers(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar servidores:', err);
      setError('No se pudieron cargar los servidores. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir menú de acciones
  const handleMenuOpen = (event, server) => {
    setAnchorEl(event.currentTarget);
    setSelectedServer(server);
  };
  
  // Cerrar menú de acciones
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedServer(null);
  };
  
  // Manejar acción de servidor (iniciar/detener/reiniciar)
  const handleServerAction = async (serverId, action) => {
    try {
      handleMenuClose();
      setActionLoading(serverId);
      
      await axios.post(`/api/servers/${serverId}/${action}`);
      
      // Actualizar lista de servidores
      await fetchServers();
    } catch (err) {
      console.error(`Error al ${action} el servidor:`, err);
      setError(`No se pudo ${action} el servidor. ${err.response?.data?.message || ''}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Filtrar servidores por término de búsqueda
  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mis Servidores
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/servers/create"
        >
          Nuevo Servidor
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar servidores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Paper>
      
      {filteredServers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes servidores
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Crea tu primer servidor de Minecraft para comenzar
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/servers/create"
          >
            Crear Servidor
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredServers.map((server) => (
            <Grid item xs={12} md={6} lg={4} key={server._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component={RouterLink} to={`/servers/${server._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      {server.name}
                    </Typography>
                    <ServerStatusChip status={server.status} />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {server.type === 'java' ? 'Java Edition' : 'Bedrock Edition'} - {server.version}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                    <ResourceInfo 
                      icon={<MemoryIcon fontSize="small" />} 
                      label="RAM" 
                      value={server.resources.ram} 
                      unit="MB" 
                    />
                    <ResourceInfo 
                      icon={<StorageIcon fontSize="small" />} 
                      label="CPU" 
                      value={server.resources.cpu} 
                      unit="cores" 
                    />
                    <ResourceInfo 
                      icon={<StorageIcon fontSize="small" />} 
                      label="Almacenamiento" 
                      value={server.resources.storage} 
                      unit="GB" 
                    />
                  </Box>
                  
                  {server.status === 'running' && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Jugadores: {server.stats?.players?.current || 0} / {server.settings.maxPlayers}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/servers/${server._id}`}
                  >
                    Ver Detalles
                  </Button>
                  
                  <Box>
                    {actionLoading === server._id ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        {server.status === 'running' ? (
                          <IconButton 
                            color="error" 
                            onClick={() => handleServerAction(server._id, 'stop')}
                            size="small"
                          >
                            <StopIcon />
                          </IconButton>
                        ) : server.status === 'stopped' ? (
                          <IconButton 
                            color="success" 
                            onClick={() => handleServerAction(server._id, 'start')}
                            size="small"
                          >
                            <PlayIcon />
                          </IconButton>
                        ) : null}
                        
                        <IconButton 
                          onClick={(e) => handleMenuOpen(e, server)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={RouterLink} 
          to={selectedServer ? `/servers/${selectedServer._id}` : '#'}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        {selectedServer && selectedServer.status === 'running' && (
          <MenuItem onClick={() => handleServerAction(selectedServer._id, 'restart')}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reiniciar</ListItemText>
          </MenuItem>
        )}
        
        {selectedServer && selectedServer.status === 'running' && (
          <MenuItem onClick={() => handleServerAction(selectedServer._id, 'stop')}>
            <ListItemIcon>
              <StopIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Detener</ListItemText>
          </MenuItem>
        )}
        
        {selectedServer && selectedServer.status === 'stopped' && (
          <MenuItem onClick={() => handleServerAction(selectedServer._id, 'start')}>
            <ListItemIcon>
              <PlayIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Iniciar</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ServerList;