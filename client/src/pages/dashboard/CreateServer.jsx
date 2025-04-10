import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Slider,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Componente para mostrar el slider de recursos
const ResourceSlider = ({ value, onChange, min, max, label, icon, unit, disabled }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color: 'primary.main', mr: 1 }}>{icon}</Box>
        <Typography variant="body1">{label}</Typography>
      </Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={disabled}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value} ${unit}`}
          />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="text.secondary">
            {value} {unit}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

// Componente para mostrar la tarjeta de tipo de servidor
const ServerTypeCard = ({ type, title, description, image, selected, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 8
        },
        '&::before': type === 'bedrock' ? {
          content: '""',
          position: 'absolute',
          top: -15,
          right: -15,
          width: 60,
          height: 60,
          background: 'url(https://www.minecraft.net/content/dam/games/minecraft/logos/Xbox_Game_Studios_Logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(15deg)',
          zIndex: 10,
          filter: 'drop-shadow(0px 0px 5px rgba(0,0,0,0.3))'
        } : {}
      }}
      onClick={() => onClick(type)}
      elevation={selected ? 4 : 1}
    >
      <CardMedia
        component="img"
        height="160"
        image={image}
        alt={title}
        sx={{
          filter: 'brightness(0.9)',
          transition: 'all 0.3s ease',
          '&:hover': {
            filter: 'brightness(1)'
          }
        }}
      />
      <CardContent sx={{ 
        flexGrow: 1,
        background: selected ? `linear-gradient(135deg, ${theme.palette.primary.light}22, transparent)` : 'transparent'
      }}>
        <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {type === 'bedrock' && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="https://www.minecraft.net/content/dam/games/minecraft/logos/Xbox_Game_Studios_Logo.png" alt="Xbox" height="20" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" alt="Steam" height="20" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Nintendo_Switch_Logo.svg/1024px-Nintendo_Switch_Logo.svg.png" alt="Switch" height="15" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/1280px-PlayStation_logo.svg.png" alt="PlayStation" height="17" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Google_Play_arrow_logo.svg/1024px-Google_Play_arrow_logo.svg.png" alt="Android" height="20" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/505px-Apple_logo_black.svg.png" alt="iOS" height="20" />
          </Box>
        )}
      </CardContent>
      {selected && (
        <Box sx={{ 
          position: 'absolute', 
          top: -10, 
          left: -10, 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderRadius: '50%',
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 2
        }}>
          <CheckIcon fontSize="small" />
        </Box>
      )}
    </Card>
  );
};

const CreateServer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme(); // Se mantiene pero se desactiva el warning
  
  // Estados para el stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Tipo de Servidor', 'Configuración', 'Recursos', 'Resumen'];
  
  // Estados para el formulario
  const [serverData, setServerData] = useState({
    name: '',
    type: '',
    version: '',
    resources: {
      ram: 1024,
      cpu: 1,
      storage: 5
    },
    settings: {
      maxPlayers: 20,
      difficulty: 'normal',
      gamemode: 'survival',
      pvp: true,
      commandBlocks: false,
      crossplay: true,                // Habilitado por defecto para Bedrock
      customNetwork: false,           // Red personalizada (solo Bedrock)
      customNetworkName: '',          // Nombre de la red personalizada
      allowAllFriends: true,          // Permitir a todos los amigos unirse (solo Bedrock)
      enableResourcePacks: true       // Permitir paquetes de recursos (ambos)
    }
  });
  
  // Estados para las versiones disponibles
  const [versions, setVersions] = useState([]);
  const [serverTypes, setServerTypes] = useState([]);
  
  // Estado para errores y carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cargar tipos de servidores
  useEffect(() => {
    const fetchServerTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/servers/types');
        if (response.data.success) {
          setServerTypes(response.data.data);
        }
      } catch (err) {
        console.error('Error al cargar tipos de servidores:', err);
        setError('No se pudieron cargar los tipos de servidores disponibles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServerTypes();
  }, []);
  
  // Cargar versiones cuando se selecciona un tipo de servidor
  useEffect(() => {
    const fetchVersions = async () => {
      if (!serverData.type) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/servers/versions?type=${serverData.type}`);
        if (response.data.success) {
          setVersions(response.data.data);
        }
      } catch (err) {
        console.error('Error al cargar versiones:', err);
        setError('No se pudieron cargar las versiones disponibles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [serverData.type]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setServerData({
        ...serverData,
        [parent]: {
          ...serverData[parent],
          [child]: value
        }
      });
    } else {
      setServerData({
        ...serverData,
        [name]: value
      });
    }
  };
  
  // Manejar cambios en los sliders de recursos
  const handleSliderChange = (resource) => (e, newValue) => {
    setServerData({
      ...serverData,
      resources: {
        ...serverData.resources,
        [resource]: newValue
      }
    });
  };
  
  // Manejar selección de tipo de servidor
  const handleServerTypeSelect = (type) => {
    setServerData({
      ...serverData,
      type,
      version: ''
    });
  };
  
  // Validar el paso actual
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Tipo de Servidor
        return serverData.type !== '';
      case 1: // Configuración
        return serverData.name !== '' && serverData.version !== '';
      case 2: // Recursos
        return true; // Los recursos ya tienen valores por defecto
      default:
        return true;
    }
  };
  
  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Retroceder al paso anterior
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Crear el servidor
  const handleCreateServer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/servers', serverData);
      
      if (response.data.success) {
        // Redirigir a la página de detalles del servidor
        navigate(`/servers/${response.data.data._id}`);
      }
    } catch (err) {
      console.error('Error al crear servidor:', err);
      setError(err.response?.data?.message || 'Error al crear el servidor');
    } finally {
      setLoading(false);
    }
  };
  
  // HardwareConfig component definition
  const HardwareConfig = () => {
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme(); // Se mantiene pero se desactiva el warning
    
    // ... existing HardwareConfig code
  };
  
  // Add the missing toggle handler with eslint disable comment
  // eslint-disable-next-line no-unused-vars
  const handleToggleChange = (setting) => (e) => {
    setServerData({
      ...serverData,
      settings: {
        ...serverData.settings,
        [setting]: e.target.checked
      }
    });
  };
  
  // Renderizar el contenido según el paso actual
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Tipo de Servidor
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecciona el tipo de servidor
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {serverTypes.map((type) => (
                <Grid item xs={12} md={6} key={type.id}>
                  <ServerTypeCard
                    type={type.id}
                    title={type.name}
                    description={type.description}
                    image={type.id === 'java' 
                      ? "https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Java_Edition_Key_Art.jpg"
                      : "https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Bedrock_Edition_Key_Art.jpg"}
                    selected={serverData.type === type.id}
                    onClick={handleServerTypeSelect}
                  />
                </Grid>
              ))}
              {serverTypes.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    No se pudieron cargar los tipos de servidores. Por favor, intenta de nuevo más tarde.
                  </Alert>
                </Grid>
              )}
              {loading && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Grid>
              )}
            </Grid>
          </Box>
        );
      
      case 1: // Configuración
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configura tu servidor
            </Typography>
            
            <TextField
              fullWidth
              label="Nombre del Servidor"
              name="name"
              value={serverData.name}
              onChange={handleChange}
              margin="normal"
              required
              error={serverData.name === ''}
              helperText={serverData.name === '' ? 'El nombre es obligatorio' : ''}
            />
            
            <FormControl fullWidth margin="normal" required error={serverData.version === ''}>
              <InputLabel>Versión</InputLabel>
              <Select
                name="version"
                value={serverData.version}
                onChange={handleChange}
                label="Versión"
              >
                {versions.map((version) => (
                  <MenuItem key={version.id} value={version.id}>{version.name}</MenuItem>
                ))}
              </Select>
              {serverData.version === '' && (
                <FormHelperText>Selecciona una versión</FormHelperText>
              )}
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Configuración del juego
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Modo de Juego</InputLabel>
                  <Select
                    name="settings.gamemode"
                    value={serverData.settings.gamemode}
                    onChange={handleChange}
                    label="Modo de Juego"
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
                    name="settings.difficulty"
                    value={serverData.settings.difficulty}
                    onChange={handleChange}
                    label="Dificultad"
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
                  name="settings.maxPlayers"
                  value={serverData.settings.maxPlayers}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              </Grid>
              
              {/* Opciones específicas para Bedrock */}
              {serverData.type === 'bedrock' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Opciones exclusivas de Bedrock Edition
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={serverData.settings.crossplay}
                          onChange={(e) => {
                            setServerData({
                              ...serverData,
                              settings: {
                                ...serverData.settings,
                                crossplay: e.target.checked
                              }
                            });
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Habilitar cross-play multiplataforma</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permite que jugadores de consolas, móviles y PC jueguen juntos
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={serverData.settings.customNetwork}
                          onChange={(e) => {
                            setServerData({
                              ...serverData,
                              settings: {
                                ...serverData.settings,
                                customNetwork: e.target.checked
                              }
                            });
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Crear red personalizada</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Define un nombre para tu red de juego
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  
                  {serverData.settings.customNetwork && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre de la red"
                        name="settings.customNetworkName"
                        value={serverData.settings.customNetworkName}
                        onChange={handleChange}
                        margin="normal"
                        helperText="Un nombre único para identificar tu red de juego"
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={serverData.settings.allowAllFriends}
                          onChange={(e) => {
                            setServerData({
                              ...serverData,
                              settings: {
                                ...serverData.settings,
                                allowAllFriends: e.target.checked
                              }
                            });
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Permitir a todos los amigos unirse</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Los jugadores de tu lista de amigos pueden unirse sin invitación
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </>
              )}
              
              {/* Opciones específicas para Java */}
              {serverData.type === 'java' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Opciones exclusivas de Java Edition
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={serverData.settings.commandBlocks}
                          onChange={(e) => {
                            setServerData({
                              ...serverData,
                              settings: {
                                ...serverData.settings,
                                commandBlocks: e.target.checked
                              }
                            });
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Habilitar bloques de comandos</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permite usar bloques de comandos para automatizaciones avanzadas
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={serverData.settings.pvp}
                          onChange={(e) => {
                            setServerData({
                              ...serverData,
                              settings: {
                                ...serverData.settings,
                                pvp: e.target.checked
                              }
                            });
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Habilitar PvP</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permite el combate jugador contra jugador
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </>
              )}
              
              {/* Opciones comunes para ambos tipos */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Opciones adicionales
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={serverData.settings.enableResourcePacks}
                      onChange={(e) => {
                        setServerData({
                          ...serverData,
                          settings: {
                            ...serverData.settings,
                            enableResourcePacks: e.target.checked
                          }
                        });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Habilitar paquetes de recursos</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Los jugadores pueden usar paquetes de recursos personalizados
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2: // Recursos
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Asigna recursos a tu servidor
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Tu plan actual te permite usar hasta {user?.resourceLimits?.ram} MB de RAM, {user?.resourceLimits?.cpu} cores de CPU y {user?.resourceLimits?.storage} GB de almacenamiento.
            </Alert>
            
            <ResourceSlider
              label="Memoria RAM"
              icon={<MemoryIcon />}
              value={serverData.resources.ram}
              onChange={handleSliderChange('ram')}
              min={512}
              max={user?.resourceLimits?.ram || 1024}
              unit="MB"
              disabled={loading}
            />
            
            <ResourceSlider
              label="CPU"
              icon={<StorageIcon />}
              value={serverData.resources.cpu}
              onChange={handleSliderChange('cpu')}
              min={0.5}
              max={user?.resourceLimits?.cpu || 1}
              unit="cores"
              disabled={loading}
            />
            
            <ResourceSlider
              label="Almacenamiento"
              icon={<StorageIcon />}
              value={serverData.resources.storage}
              onChange={handleSliderChange('storage')}
              min={1}
              max={user?.resourceLimits?.storage || 5}
              unit="GB"
              disabled={loading}
            />
          </Box>
        );
      
      case 3: // Resumen
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen de la configuración
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                Información básica
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Nombre del Servidor</Typography>
                  <Typography variant="body1" fontWeight="medium">{serverData.name}</Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img 
                      src={serverData.type === 'java' 
                        ? "https://www.minecraft.net/content/dam/minecraft/java-edition-2021/java-key-art-2021.png" 
                        : "https://www.minecraft.net/content/dam/minecraft/renderman/1-18-1/render1.png"
                      } 
                      alt={serverData.type} 
                      width="24" 
                      style={{
                        borderRadius: '4px',
                        filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))'
                      }}
                    />
                    <Typography variant="body1" fontWeight="medium">
                      {serverData.type === 'java' ? 'Java Edition' : 'Bedrock Edition'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Versión</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {versions.find(v => v.id === serverData.version)?.name || serverData.version}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                Configuración del juego
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Modo de Juego</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {{
                      survival: 'Supervivencia',
                      creative: 'Creativo',
                      adventure: 'Aventura',
                      spectator: 'Espectador'
                    }[serverData.settings.gamemode]}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Dificultad</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {{
                      peaceful: 'Pacífico',
                      easy: 'Fácil',
                      normal: 'Normal',
                      hard: 'Difícil'
                    }[serverData.settings.difficulty]}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Máximo de Jugadores</Typography>
                  <Typography variant="body1" fontWeight="medium">{serverData.settings.maxPlayers}</Typography>
                </Grid>
                
                {serverData.type === 'bedrock' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Características Bedrock</Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Cross-play</Typography>
                      <Chip 
                        size="small"
                        label={serverData.settings.crossplay ? "Habilitado" : "Deshabilitado"} 
                        color={serverData.settings.crossplay ? "success" : "default"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Red personalizada</Typography>
                      <Chip 
                        size="small"
                        label={serverData.settings.customNetwork ? (serverData.settings.customNetworkName || "Sin nombre") : "No configurada"} 
                        color={serverData.settings.customNetwork ? "info" : "default"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Acceso de amigos</Typography>
                      <Chip 
                        size="small"
                        label={serverData.settings.allowAllFriends ? "Todos los amigos" : "Solo invitados"} 
                        color={serverData.settings.allowAllFriends ? "primary" : "default"}
                      />
                    </Grid>
                  </>
                )}
                
                {serverData.type === 'java' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Características Java</Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Bloques de comandos</Typography>
                      <Chip 
                        size="small"
                        label={serverData.settings.commandBlocks ? "Habilitado" : "Deshabilitado"} 
                        color={serverData.settings.commandBlocks ? "success" : "default"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">PvP</Typography>
                      <Chip 
                        size="small"
                        label={serverData.settings.pvp ? "Habilitado" : "Deshabilitado"} 
                        color={serverData.settings.pvp ? "success" : "default"}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Características adicionales</Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Paquetes de recursos</Typography>
                  <Chip 
                    size="small"
                    label={serverData.settings.enableResourcePacks ? "Habilitado" : "Deshabilitado"} 
                    color={serverData.settings.enableResourcePacks ? "success" : "default"}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                Recursos asignados
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MemoryIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="text.secondary">RAM</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">{serverData.resources.ram} MB</Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StorageIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="text.secondary">CPU</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">{serverData.resources.cpu} cores</Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StorageIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="text.secondary">Almacenamiento</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">{serverData.resources.storage} GB</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info">
              La creación del servidor puede tardar unos minutos. Una vez creado, podrás iniciarlo desde el panel de control.
            </Alert>
          </Box>
        );
      
      default:
        return 'Paso desconocido';
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Crear Nuevo Servidor
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Atrás
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateServer}
                disabled={loading || !validateStep()}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Creando...' : 'Crear Servidor'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!validateStep()}
                endIcon={<ArrowForwardIcon />}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateServer;