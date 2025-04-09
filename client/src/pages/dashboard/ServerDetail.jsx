import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Backup as BackupIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
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
const ResourceUsage = ({ label, used, total, unit, icon }) => {
  const percentage = Math.round((used / total) * 100);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1, color: 'primary.main' }}>{icon}</Box>
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

// Componente para mostrar la información del servidor
const ServerInfo = ({ server }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
        <Typography variant="body1">
          {server.type === 'java' ? 'Java Edition' : 'Bedrock Edition'}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Versión</Typography>
        <Typography variant="body1">{server.version}</Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
        <ServerStatusChip status={server.status} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
        <Typography variant="body1">
          {server.network.ip || 'No disponible'}
          {server.network.port && `:${server.network.port}`}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Dominio</Typography>
        <Typography variant="body1">
          {server.network.domain || 'No configurado'}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle2" color="text.secondary">Jugadores</Typography>
        <Typography variant="body1">
          {server.status === 'running' 
            ? `${server.stats?.players?.current || 0} / ${server.settings.maxPlayers}` 
            : 'Servidor detenido'}
        </Typography>
      </Grid>
    </Grid>
  );
};

// Componente para mostrar las estadísticas del servidor
const ServerStats = ({ server, loading }) => {
  if (server.status !== 'running') {
    return (
      <Alert severity="info">
        El servidor está detenido. Inicia el servidor para ver las estadísticas en tiempo real.
      </Alert>
    );
  }
  
  if (loading) {
    return <CircularProgress />;
  }
  
  return (
    <Box>
      <ResourceUsage
        label="CPU"
        used={server.stats?.cpuUsage || 0}
        total={server.resources.cpu * 100} // Convertir cores a porcentaje
        unit="%"
        icon={<SpeedIcon />}
      />
      
      <ResourceUsage
        label="Memoria RAM"
        used={server.stats?.ramUsage || 0}
        total={server.resources.ram}
        unit="MB"
        icon={<MemoryIcon />}
      />
      
      <ResourceUsage
        label="Almacenamiento"
        used={server.stats?.storageUsage || 0}
        total={server.resources.storage * 1024} // Convertir GB a MB
        unit="MB"
        icon={<StorageIcon />}
      />
      
      <ResourceUsage
        label="Jugadores"
        used={server.stats?.players?.current || 0}
        total={server.settings.maxPlayers}
        unit="jugadores"
        icon={<PeopleIcon />}
      />
    </Box>
  );
};

// Componente para mostrar la configuración del servidor
const ServerSettings = ({ server, onSave, loading }) => {
  const [settings, setSettings] = useState(server.settings);
  const [edited, setEdited] = useState(false);
  
  // Actualizar settings cuando cambia el servidor
  useEffect(() => {
    setSettings(server.settings);
    setEdited(false);
  }, [server]);
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
    
    setEdited(true);
  };
  
  const handleSave = () => {
    onSave(settings);
  };
  
  const handleCancel = () => {
    setSettings(server.settings);
    setEdited(false);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Modo de Juego</InputLabel>
            <Select
              name="gamemode"
              value={settings.gamemode}
              onChange={handleChange}
              label="Modo de Juego"
              disabled={loading}
            >
              <MenuItem value="survival">Supervivencia</MenuItem>
              <MenuItem value="creative">Creativo</MenuItem>
              <MenuItem value="adventure">Aventura</MenuItem>
              <MenuItem value="spectator">Espectador</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Dificultad</InputLabel>
            <Select
              name="difficulty"
              value={settings.difficulty}
              onChange={handleChange}
              label="Dificultad"
              disabled={loading}
            >
              <MenuItem value="peaceful">Pacífico</MenuItem>
              <MenuItem value="easy">Fácil</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="hard">Difícil</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Máximo de Jugadores"
            name="maxPlayers"
            value={settings.maxPlayers}
            onChange={handleChange}
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 100 } }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="pvp"
                checked={settings.pvp}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="PvP Habilitado"
            sx={{ mt: 2 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="commandBlocks"
                checked={settings.commandBlocks}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Bloques de Comandos"
            sx={{ mt: 2 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="autoRestart"
                checked={settings.autoRestart}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Reinicio Automático"
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      
      {edited && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            Guardar Cambios
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Componente para mostrar la consola del servidor
const ServerConsole = ({ server, loading }) => {
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState('');
  
  // Simular carga de logs
  useEffect(() => {
    if (server.status === 'running') {
      // En una implementación real, esto se conectaría a un websocket o haría polling
      setLogs([
        '[INFO] Starting Minecraft server version 1.19.2',
        '[INFO] Loading properties',
        '[INFO] Default game type: SURVIVAL',
        '[INFO] Preparing level "world"',
        '[INFO] Preparing start region for dimension minecraft:overworld',
        '[INFO] Done! For help, type "help"'
      ]);
    } else {
      setLogs([]);
    }
  }, [server.status]);
  
  const handleSendCommand = () => {
    if (!command.trim()) return;
    
    // En una implementación real, esto enviaría el comando al servidor
    setLogs([...logs, `> ${command}`]);
    setCommand('');
  };
  
  if (server.status !== 'running') {
    return (
      <Alert severity="info">
        El servidor está detenido. Inicia el servidor para acceder a la consola.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          height: 300,
          overflowY: 'auto',
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          mb: 2
        }}
      >
        {logs.map((log, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            {log}
          </Box>
        ))}
      </Paper>
      
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          placeholder="Escribe un comando..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
        />
        <Button
          variant="contained"
          onClick={handleSendCommand}
          disabled={loading || !command.trim()}
          sx={{ ml: 1 }}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

// Componente para mostrar los plugins del servidor
const ServerPlugins = ({ server, loading }) => {
  const [plugins, setPlugins] = useState(server.plugins || []);
  
  if (plugins.length === 0) {
    return (
      <Alert severity="info">
        No hay plugins instalados. Puedes instalar plugins desde la tienda de plugins.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Plugins Instalados
      </Typography>
      
      <Paper variant="outlined">
        {plugins.map((plugin, index) => (
          <React.Fragment key={plugin.name}>
            {index > 0 && <Divider />}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2">{plugin.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Versión: {plugin.version}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={plugin.enabled}
                      disabled={loading || server.status === 'running'}
                    />
                  }
                  label={plugin.enabled ? 'Habilitado' : 'Deshabilitado'}
                />
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CodeIcon />}
          disabled={loading}
        >
          Explorar Plugins
        </Button>
      </Box>
    </Box>
  );
};

// Componente para mostrar las copias de seguridad del servidor
const ServerBackups = ({ server, loading }) => {
  const [backups, setBackups] = useState([]);
  
  // Simular carga de backups
  useEffect(() => {
    // En una implementación real, esto cargaría los backups desde la API
    setBackups([
      { id: 1, date: '2023-05-15 14:30', size: '256 MB', automatic: true },
      { id: 2, date: '2023-05-14 14:30', size: '255 MB', automatic: true },
      { id: 3, date: '2023-05-13 10:15', size: '254 MB', automatic: false }
    ]);
  }, []);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Copias de Seguridad
        </Typography>
        <Button
          variant="contained"
          startIcon={<BackupIcon />}
          disabled={loading || server.status === 'running'}
        >
          Crear Backup
        </Button>
      </Box>
      
      {backups.length === 0 ? (
        <Alert severity="info">
          No hay copias de seguridad disponibles.
        </Alert>
      ) : (
        <Paper variant="outlined">
          {backups.map((backup, index) => (
            <React.Fragment key={backup.id}>
              {index > 0 && <Divider />}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2">{backup.date}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tamaño: {backup.size} | {backup.automatic ? 'Automático' : 'Manual'}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      disabled={loading}
                    >
                      Restaurar
                    </Button>
                    <IconButton
                      size="small"
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </React.Fragment>
          ))}
        </Paper>
      )}
    </Box>
  );
};

const ServerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Estados
  const [server, setServer] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdateInterval, setStatusUpdateInterval] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [loadingPlugins, setLoadingPlugins] = useState(false);
  
  // Cargar datos del servidor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchServerDetails();
        
        // Iniciar la actualización del estado del servidor
        const statusInterval = setInterval(() => {
          if (server?._id) {
            fetchServerStatus();
          }
        }, 10000);
        
        setStatusUpdateInterval(statusInterval);
      } catch (err) {
        console.error('Error al cargar datos del servidor:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
      }
    };
  }, [id, fetchServerDetails, server?._id]);
  
  // Función para cargar detalles del servidor
  const fetchServerDetails = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const response = await axios.get(`/api/servers/${id}`);
      
      if (response.data.success) {
        setServer(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar detalles del servidor:', err);
      setError('No se pudieron cargar los detalles del servidor. Por favor, intenta de nuevo más tarde.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  // Manejar acción de servidor (iniciar/detener/reiniciar)
  const handleServerAction = async (action) => {
    try {
      setActionLoading(true);
      setError(null);
      
      await axios.post(`/api/servers/${id}/${action}`);
      
      // Actualizar detalles del servidor
      await fetchServerDetails(false);
    } catch (err) {
      console.error(`Error al ${action} el servidor:`, err);
      setError(`No se pudo ${action} el servidor. ${err.response?.data?.message || ''}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Manejar cambio de configuración
  const handleSettingsUpdate = async (newSettings) => {
    try {
      setActionLoading(true);
      setError(null);
      
      await axios.put(`/api/servers/${id}`, {
        settings: newSettings
      });
      
      // Actualizar detalles del servidor
      await fetchServerDetails(false);
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      setError('No se pudo actualizar la configuración del servidor.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Manejar eliminación de servidor
  const handleDeleteServer = async () => {
    try {
      setActionLoading(true);
      setError(null);
      
      await axios.delete(`/api/servers/${id}`);
      
      // Redirigir a la lista de servidores
      navigate('/servers');
    } catch (err) {
      console.error('Error al eliminar servidor:', err);
      setError('No se pudo eliminar el servidor.');
      setActionLoading(false);
    }
  };
  
  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Función para cargar plugins
  const loadPlugins = async () => {
    try {
      setLoadingPlugins(true);
      const res = await axios.get(`/api/servers/${id}/plugins`);
      
      if (res.data.success) {
        setPlugins(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar plugins:', err);
    } finally {
      setLoadingPlugins(false);
    }
  };
  
  const fetchServerStatus = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada real a la API
      // Por ahora simulamos una respuesta
      const mockStatus = {
        status: 'online',
        players: 12,
        maxPlayers: 30,
        uptime: '99.9%',
        tps: 20.0
      };
      setServerStatus(mockStatus);
    } catch (error) {
      console.error('Error fetching server status:', error);
      setError('Error al obtener el estado del servidor');
    } finally {
      setLoading(false);
    }
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
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {server.name}
        </Typography>
        
        <Box>
          {actionLoading ? (
            <CircularProgress size={24} sx={{ mr: 2 }} />
          ) : (
            <>
              {server.status === 'running' ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={() => handleServerAction('stop')}
                  sx={{ mr: 1 }}
                >
                  Detener
                </Button>
              ) : server.status === 'stopped' ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayIcon />}
                  onClick={() => handleServerAction('start')}
                  sx={{ mr: 1 }}
                >
                  Iniciar
                </Button>
              ) : null}
              
              {server.status === 'running' && (
                <Button
                  variant="outlined"
                  startIcon={<RestartIcon />}
                  onClick={() => handleServerAction('restart')}
                  sx={{ mr: 1 }}
                >
                  Reiniciar
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate(`/servers/${id}/admin`)}
                sx={{ mr: 1 }}
              >
                Panel de Administración
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Eliminar
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Información general */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <ServerInfo server={server} />
      </Paper>
      
      {/* Pestañas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SpeedIcon />} label="Estadísticas" />
          <Tab icon={<SettingsIcon />} label="Configuración" />
          <Tab icon={<TerminalIcon />} label="Consola" />
          <Tab icon={<CodeIcon />} label="Plugins" />
          <Tab icon={<BackupIcon />} label="Backups" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <ServerStats server={server} loading={loading} />
          )}
          
          {tabValue === 1 && (
            <ServerSettings 
              server={server} 
              onSave={handleSettingsUpdate} 
              loading={actionLoading} 
            />
          )}
          
          {tabValue === 2 && (
            <ServerConsole server={server} loading={actionLoading} />
          )}
          
          {tabValue === 3 && (
            <ServerPlugins server={server} loading={loadingPlugins} />
          )}
          
          {tabValue === 4 && (
            <ServerBackups server={server} loading={actionLoading} />
          )}
        </Box>
      </Paper>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eliminar Servidor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el servidor "{server.name}"? Esta acción no se puede deshacer y perderás todos los datos asociados con este servidor.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteServer} 
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerDetail;