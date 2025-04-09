import React, { useState, useEffect } from 'react';
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
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RestartIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Backup as BackupIcon,
  Code as CodeIcon,
  Edit as EditIcon,
  Update as UpdateIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

// Componente para mostrar el estado del servidor con un indicador visual
const ServerStatusIndicator = ({ status }) => {
  let color = 'default';
  let label = status;
  let icon = <InfoIcon />;
  
  switch (status) {
    case 'running':
      color = 'success';
      label = 'En ejecución';
      icon = <CheckCircleIcon />;
      break;
    case 'stopped':
      color = 'error';
      label = 'Detenido';
      icon = <StopIcon />;
      break;
    case 'creating':
      color = 'info';
      label = 'Creando';
      icon = <CloudUploadIcon />;
      break;
    case 'error':
      color = 'error';
      label = 'Error';
      icon = <ErrorIcon />;
      break;
    case 'suspended':
      color = 'warning';
      label = 'Suspendido';
      icon = <WarningIcon />;
      break;
    case 'restarting':
      color = 'info';
      label = 'Reiniciando';
      icon = <RestartIcon />;
      break;
    case 'updating':
      color = 'info';
      label = 'Actualizando';
      icon = <UpdateIcon />;
      break;
    default:
      break;
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ color: `${color}.main`, mr: 1 }}>{icon}</Box>
      <Chip size="small" color={color} label={label} />
    </Box>
  );
};

// Componente para mostrar el uso de recursos con gráficos mejorados
const ResourceMonitor = ({ label, used, total, unit, icon }) => {
  const percentage = Math.round((used / total) * 100);
  const theme = useTheme();
  
  // Determinar el color basado en el porcentaje de uso
  let color = theme.palette.success.main;
  if (percentage > 90) {
    color = theme.palette.error.main;
  } else if (percentage > 70) {
    color = theme.palette.warning.main;
  }
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1, color: 'primary.main' }}>{icon}</Box>
        <Typography variant="body2">{label}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {used} / {total} {unit} ({percentage}%)
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }} 
      />
    </Box>
  );
};

// Componente para la consola de comandos mejorada
const CommandConsole = ({ server, onSendCommand, loading }) => {
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState('');
  const consoleRef = React.useRef(null);
  
  // Simular carga de logs (en una implementación real, esto se conectaría a un websocket)
  useEffect(() => {
    if (server.status === 'running') {
      setLogs([
        { type: 'info', message: '[INFO] Starting Minecraft server version 1.19.2' },
        { type: 'info', message: '[INFO] Loading properties' },
        { type: 'info', message: '[INFO] Default game type: SURVIVAL' },
        { type: 'info', message: '[INFO] Preparing level "world"' },
        { type: 'info', message: '[INFO] Preparing start region for dimension minecraft:overworld' },
        { type: 'success', message: '[INFO] Done! For help, type "help"' }
      ]);
    } else {
      setLogs([]);
    }
  }, [server.status]);
  
  // Auto-scroll al último mensaje
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  
  const handleSendCommand = () => {
    if (!command.trim()) return;
    
    // Añadir el comando a los logs
    setLogs([...logs, { type: 'command', message: `> ${command}` }]);
    
    // Llamar a la función para enviar el comando al servidor
    if (onSendCommand) {
      onSendCommand(command);
    }
    
    setCommand('');
  };
  
  // Función para determinar el color del mensaje según su tipo
  const getMessageColor = (type) => {
    switch (type) {
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      case 'success':
        return 'success.main';
      case 'command':
        return 'primary.main';
      default:
        return 'text.primary';
    }
  };
  
  if (server.status !== 'running') {
    return (
      <Alert severity="info" icon={<TerminalIcon />}>
        El servidor está detenido. Inicia el servidor para acceder a la consola de comandos.
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
        ref={consoleRef}
      >
        {logs.map((log, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 0.5, 
              color: theme => getMessageColor(log.type)
            }}
          >
            {log.message}
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
          InputProps={{
            startAdornment: <TerminalIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendCommand}
          disabled={loading || !command.trim()}
          sx={{ ml: 1 }}
          endIcon={<SendIcon />}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

// Componente principal del panel de administración
const ServerAdminPanel = ({ server, onServerAction, loading }) => {
  const theme = useTheme();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Manejar acciones del servidor
  const handleAction = async (action) => {
    try {
      setActionLoading(true);
      setError(null);
      
      if (onServerAction) {
        await onServerAction(action);
      }
    } catch (err) {
      console.error(`Error al ejecutar la acción ${action}:`, err);
      setError(`No se pudo ejecutar la acción ${action}. ${err.response?.data?.message || 'Inténtalo de nuevo más tarde.'}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Manejar envío de comandos
  const handleSendCommand = async (command) => {
    try {
      setActionLoading(true);
      setError(null);
      
      // Aquí iría la lógica para enviar el comando al servidor
      console.log(`Enviando comando: ${command}`);
      
      // Simular respuesta (en una implementación real, esto vendría del servidor)
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error('Error al enviar comando:', err);
      setError(`No se pudo enviar el comando. ${err.response?.data?.message || 'Inténtalo de nuevo más tarde.'}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  if (!server) {
    return (
      <Alert severity="error">
        No se pudo cargar la información del servidor.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Panel de Administración del Servidor
      </Typography>
      
      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Panel de estado y acciones rápidas */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Estado del Servidor" 
              subheader={<ServerStatusIndicator status={server.status} />}
            />
            <Divider />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Acciones Rápidas
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {server.status === 'running' ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={() => handleAction('stop')}
                    disabled={actionLoading || loading}
                    size="small"
                  >
                    Detener
                  </Button>
                ) : server.status === 'stopped' ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={() => handleAction('start')}
                    disabled={actionLoading || loading}
                    size="small"
                  >
                    Iniciar
                  </Button>
                ) : null}
                
                <Button
                  variant="outlined"
                  startIcon={<RestartIcon />}
                  onClick={() => handleAction('restart')}
                  disabled={actionLoading || loading || server.status !== 'running'}
                  size="small"
                >
                  Reiniciar
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<UpdateIcon />}
                  onClick={() => handleAction('update')}
                  disabled={actionLoading || loading || server.status === 'running'}
                  size="small"
                >
                  Actualizar
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleAction('edit')}
                  disabled={actionLoading || loading}
                  size="small"
                >
                  Editar
                </Button>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Información del Servidor
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tipo" 
                    secondary={server.type === 'java' ? 'Java Edition' : 'Bedrock Edition'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Versión" 
                    secondary={server.version} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Jugadores" 
                    secondary={
                      server.status === 'running' 
                        ? `${server.stats?.players?.current || 0} / ${server.settings.maxPlayers}` 
                        : 'Servidor detenido'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Modo de Juego" 
                    secondary={server.settings.gamemode.charAt(0).toUpperCase() + server.settings.gamemode.slice(1)} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Panel de monitoreo de recursos */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader title="Monitoreo de Recursos" />
            <Divider />
            <CardContent>
              {server.status === 'running' ? (
                <>
                  <ResourceMonitor
                    label="CPU"
                    used={server.stats?.cpuUsage || 0}
                    total={server.resources.cpu * 100} // Convertir cores a porcentaje
                    unit="%"
                    icon={<SpeedIcon />}
                  />
                  
                  <ResourceMonitor
                    label="Memoria RAM"
                    used={server.stats?.ramUsage || 0}
                    total={server.resources.ram}
                    unit="MB"
                    icon={<MemoryIcon />}
                  />
                  
                  <ResourceMonitor
                    label="Almacenamiento"
                    used={server.stats?.storageUsage || 0}
                    total={server.resources.storage * 1024} // Convertir GB a MB
                    unit="MB"
                    icon={<StorageIcon />}
                  />
                  
                  <ResourceMonitor
                    label="Jugadores"
                    used={server.stats?.players?.current || 0}
                    total={server.settings.maxPlayers}
                    unit="jugadores"
                    icon={<PeopleIcon />}
                  />
                </>
              ) : (
                <Alert severity="info">
                  El servidor está detenido. Inicia el servidor para ver las estadísticas en tiempo real.
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Consola de comandos */}
          <Card variant="outlined">
            <CardHeader 
              title="Consola de Comandos" 
              action={
                <Tooltip title="La consola te permite ejecutar comandos directamente en el servidor">
                  <InfoIcon color="action" />
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <CommandConsole 
                server={server} 
                onSendCommand={handleSendCommand} 
                loading={actionLoading || loading} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerAdminPanel;