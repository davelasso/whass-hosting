import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Chip,
  Tabs, Tab, Table, TextField, IconButton,
  TableContainer, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Button, Stepper, Step, StepLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Memory, Storage, Dns, BackupOutlined, 
  Extension, Code, Settings, CheckCircle, Speed, 
  People, RestartAlt, StopCircleOutlined, Send, Terminal
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const ServerDemo = () => {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [command, setCommand] = useState('');
  const [consoleLog, setConsoleLog] = useState([]);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const consoleEndRef = useRef(null);
  const theme = useTheme();

  // Definir fetchServerDetails antes de useEffect
  const fetchServerDetails = async () => {
    try {
      const response = await fetch('/mcserver-config.json');
      const data = await response.json();
      setServerData(data);
      
      // Inicializar logs de consola simulados
      setConsoleLog([
        { timestamp: '2023-04-09 08:00:15', level: 'INFO', message: 'Starting Minecraft server on 0.0.0.0:25565' },
        { timestamp: '2023-04-09 08:00:16', level: 'INFO', message: 'Loading properties...' },
        { timestamp: '2023-04-09 08:00:17', level: 'INFO', message: 'Default game type: SURVIVAL' },
        { timestamp: '2023-04-09 08:00:18', level: 'INFO', message: 'Preparing level "world"' },
        { timestamp: '2023-04-09 08:00:20', level: 'INFO', message: 'Preparing start region for dimension minecraft:overworld' },
        { timestamp: '2023-04-09 08:00:22', level: 'INFO', message: 'Preparing spawn area: 73%' },
        { timestamp: '2023-04-09 08:00:24', level: 'INFO', message: 'Done! For help, type "help"' }
      ]);

      // Inicializar jugadores conectados simulados
      setConnectedPlayers([
        { username: 'Notch123', joinTime: '2023-04-09 08:05:32', ipAddress: '192.168.1.45', status: 'online' },
        { username: 'MinerSteve', joinTime: '2023-04-09 08:12:47', ipAddress: '192.168.1.63', status: 'online' },
        { username: 'DiamondDigger', joinTime: '2023-04-09 08:20:11', ipAddress: '192.168.1.87', status: 'online' },
        { username: 'CreeperSlayer', joinTime: '2023-04-09 08:35:54', ipAddress: '192.168.1.92', status: 'online' },
        { username: 'RedstoneWizard', joinTime: '2023-04-09 09:15:30', ipAddress: '192.168.1.29', status: 'online' }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading server configuration:', error);
      setLoading(false);
    }
  };

  // Función para simular actividad del servidor (logs y jugadores)
  const simulateServerActivity = () => {
    const currentTime = new Date();
    const formattedTime = currentTime.toISOString().replace('T', ' ').slice(0, 19);
    const activities = [
      { type: 'playerJoin', username: 'EnderDragon42', ip: '192.168.1.110' },
      { type: 'playerLeave', username: 'MinerSteve' },
      { type: 'serverInfo', message: 'Saved the world' },
      { type: 'warning', message: 'Can\'t keep up! Is the server overloaded?' },
      { type: 'command', message: '/give @a minecraft:diamond 5' }
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    switch (randomActivity.type) {
      case 'playerJoin':
        setConsoleLog(prev => [...prev, { 
          timestamp: formattedTime, 
          level: 'INFO', 
          message: `${randomActivity.username} joined the game [${randomActivity.ip}]` 
        }]);
        setConnectedPlayers(prev => [...prev, { 
          username: randomActivity.username, 
          joinTime: formattedTime, 
          ipAddress: randomActivity.ip, 
          status: 'online' 
        }]);
        break;
      case 'playerLeave':
        setConsoleLog(prev => [...prev, { 
          timestamp: formattedTime, 
          level: 'INFO', 
          message: `${randomActivity.username} left the game` 
        }]);
        setConnectedPlayers(prev => prev.filter(player => player.username !== randomActivity.username));
        break;
      case 'serverInfo':
        setConsoleLog(prev => [...prev, { 
          timestamp: formattedTime, 
          level: 'INFO', 
          message: randomActivity.message 
        }]);
        break;
      case 'warning':
        setConsoleLog(prev => [...prev, { 
          timestamp: formattedTime, 
          level: 'WARN', 
          message: randomActivity.message 
        }]);
        break;
      case 'command':
        setConsoleLog(prev => [...prev, { 
          timestamp: formattedTime, 
          level: 'INFO', 
          message: `> ${randomActivity.message}` 
        }]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Cargar datos desde el archivo de configuración
    fetchServerDetails();

    // Simular actividad del servidor cada 10 segundos
    const statusUpdateInterval = 10000;
    const interval = setInterval(() => {
      simulateServerActivity();
    }, statusUpdateInterval);

    return () => clearInterval(interval);
  }, []); // No necesitamos incluir fetchServerDetails ni simulateServerActivity como dependencias

  // Auto-scroll a la parte inferior de la consola
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLog]);

  // Función para manejar el cambio de pestañas
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Función para manejar el envío de comandos
  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    const currentTime = new Date();
    const formattedTime = currentTime.toISOString().replace('T', ' ').slice(0, 19);

    // Agregar el comando al log
    setConsoleLog(prev => [...prev, { 
      timestamp: formattedTime, 
      level: 'INPUT', 
      message: `> ${command}` 
    }]);

    // Simular respuesta del servidor
    setTimeout(() => {
      let response = '';
      
      if (command.startsWith('/help')) {
        response = 'Available commands: help, list, time, weather, gamemode, give, tp, ban, kick';
      } else if (command.startsWith('/list')) {
        response = `There are ${connectedPlayers.length} of a max 30 players online: ${connectedPlayers.map(p => p.username).join(', ')}`;
      } else if (command.startsWith('/time')) {
        response = 'Time is 12:00';
      } else if (command.startsWith('/weather')) {
        response = 'Weather is clear';
      } else if (command.startsWith('/gamemode')) {
        response = 'Your game mode has been updated to Survival Mode';
      } else if (command.startsWith('/give')) {
        response = 'Gave 5 Diamond to @a';
      } else if (command.startsWith('/tp')) {
        response = 'Teleported Steve to Notch123';
      } else if (command.startsWith('/ban')) {
        response = 'Banned player CreeperSlayer for: Griefing';
      } else if (command.startsWith('/kick')) {
        response = 'Kicked player MinerSteve for: Spamming chat';
      } else {
        response = `Unknown command. Type "help" for help.`;
      }

      setConsoleLog(prev => [...prev, { 
        timestamp: formattedTime, 
        level: 'INFO', 
        message: response 
      }]);
    }, 500);

    setCommand('');
  };

  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    height: '100%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'}`,
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
    }
  }));

  const ConsoleContainer = styled(Box)(({ theme }) => ({
    height: 400,
    overflowY: 'auto',
    backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#252525',
    color: '#f0f0f0',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }));

  // Función para obtener el color del log según el nivel
  const getLogColor = (level) => {
    switch (level) {
      case 'INFO':
        return theme.palette.text.primary;
      case 'WARN':
        return theme.palette.warning.main;
      case 'ERROR':
        return theme.palette.error.main;
      case 'INPUT':
        return theme.palette.primary.main;
      default:
        return theme.palette.text.primary;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            backgroundImage: 'linear-gradient(45deg, #5663F7, #7785FF)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Panel de Control - Demostración
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explora las características y configuración de un servidor de Minecraft alojado en nuestra plataforma
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Panel de Control Principal */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <Typography variant="h5" fontWeight="bold" mr={2}>
                  {serverData.serverInfo.name}
                </Typography>
                <Chip 
                  label={serverData.serverInfo.status === 'online' ? 'En línea' : 'Offline'} 
                  color={serverData.serverInfo.status === 'online' ? 'success' : 'error'} 
                  size="small"
                />
              </Box>
              <Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<RestartAlt />}
                  sx={{ mr: 1 }}
                >
                  Reiniciar
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<StopCircleOutlined />}
                >
                  Detener
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Columna izquierda - Información del Servidor */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Información del Servidor
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText 
                      primary="Versión" 
                      secondary={serverData.serverInfo.version}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText 
                      primary="IP & Puerto" 
                      secondary={`${serverData.serverInfo.ip}:${serverData.serverInfo.port}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText 
                      primary="Jugadores" 
                      secondary={`${serverData.serverInfo.online}/${serverData.serverInfo.maxPlayers}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText 
                      primary="Tiempo de actividad" 
                      secondary={serverData.serverInfo.uptime}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              {/* Columna central - Recursos */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recursos
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Memory color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="CPU" 
                      secondary={serverData.resources.cpu}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Storage color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="RAM" 
                      secondary={serverData.resources.ram}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Dns color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Almacenamiento" 
                      secondary={serverData.resources.storage}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Speed color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Procesador" 
                      secondary={serverData.resources.processor}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              {/* Columna derecha - Acciones rápidas */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Acciones rápidas
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<BackupOutlined />}
                  >
                    Crear backup
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Extension />}
                  >
                    Gestionar plugins
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Settings />}
                  >
                    Configuración
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<People />}
                  >
                    Gestionar jugadores
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Tabs de detalles */}
        <Grid item xs={12}>
          <StyledPaper>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Consola" icon={<Terminal />} iconPosition="start" />
              <Tab label="Jugadores" icon={<People />} iconPosition="start" />
              <Tab label="Plugins" icon={<Extension />} iconPosition="start" />
              <Tab label="Propiedades" icon={<Settings />} iconPosition="start" />
              <Tab label="Instalación" icon={<Code />} iconPosition="start" />
            </Tabs>

            {/* Tab de Consola */}
            {activeTab === 0 && (
              <>
                <ConsoleContainer>
                  {consoleLog.map((log, index) => (
                    <Box key={index} sx={{ mb: 0.5 }}>
                      <Typography
                        component="span"
                        sx={{ color: '#a0a0a0', mr: 1, fontSize: '0.85rem' }}
                      >
                        [{log.timestamp}]
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ color: getLogColor(log.level), mr: 1, fontSize: '0.85rem' }}
                      >
                        [{log.level}]
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ fontSize: '0.85rem' }}
                      >
                        {log.message}
                      </Typography>
                    </Box>
                  ))}
                  <div ref={consoleEndRef} />
                </ConsoleContainer>
                <Box component="form" onSubmit={handleCommandSubmit} sx={{ display: 'flex' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe un comando (ej: /help, /list, /give)"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Typography component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                          &gt;
                        </Typography>
                      ),
                    }}
                    sx={{ mr: 1 }}
                  />
                  <IconButton type="submit" color="primary">
                    <Send />
                  </IconButton>
                </Box>
              </>
            )}

            {/* Tab de Jugadores */}
            {activeTab === 1 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Nombre de Usuario</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Hora de Conexión</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Dirección IP</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Estado</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Acciones</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {connectedPlayers.map((player, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{player.username}</TableCell>
                        <TableCell>{player.joinTime}</TableCell>
                        <TableCell>{player.ipAddress}</TableCell>
                        <TableCell>
                          <Chip 
                            label="En línea" 
                            color="success" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" color="primary">
                              OP
                            </Button>
                            <Button size="small" variant="outlined" color="error">
                              Expulsar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tab de Plugins */}
            {activeTab === 2 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Plugin</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Versión</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Descripción</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serverData.plugins.map((plugin, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{plugin.name}</TableCell>
                        <TableCell>v{plugin.version}</TableCell>
                        <TableCell>{plugin.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tab de Propiedades */}
            {activeTab === 3 && (
              <Grid container spacing={2}>
                {Object.entries(serverData.properties).map(([key, value], index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box p={2} bgcolor={theme.palette.background.default} borderRadius={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="body1">
                        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Tab de Instalación */}
            {activeTab === 4 && (
              <Stepper orientation="vertical">
                {serverData.installationSteps.map((step, index) => (
                  <Step key={index} active={true}>
                    <StepLabel>{step}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
          </StyledPaper>
        </Grid>

        {/* Beneficios del Servicio */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h5" fontWeight="bold" mb={3}>Beneficios incluidos</Typography>
            <Grid container spacing={3}>
              {serverData.benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <CheckCircle color="success" sx={{ mr: 2 }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* CTA */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              mt: 4, 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 2, 
              backgroundImage: 'linear-gradient(45deg, #5663F7, #7785FF)',
              color: 'white' 
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              ¿Listo para crear tu propio servidor?
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: '700px', mx: 'auto', mb: 3 }}>
              Inicia ahora mismo y en menos de 5 minutos tu servidor Minecraft estará listo para jugar con tus amigos.
            </Typography>
            <Button 
              component={Link} 
              to="/register" 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ 
                fontWeight: 'bold', 
                px: 4, 
                py: 1.5,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Registrarse Ahora
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ServerDemo; 