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
  CardMedia
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
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
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 4
        }
      }}
      onClick={() => onClick(type)}
      elevation={selected ? 4 : 1}
    >
      <CardMedia
        component="img"
        height="140"
        image={image}
        alt={title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
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
      commandBlocks: false
    }
  });
  
  // Estados para las versiones disponibles
  const [versions, setVersions] = useState({
    java: [],
    bedrock: []
  });
  
  // Estado para errores y carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cargar versiones disponibles
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get('/api/servers/versions');
        if (response.data.success) {
          setVersions(response.data.data);
        }
      } catch (err) {
        console.error('Error al cargar versiones:', err);
        setError('No se pudieron cargar las versiones disponibles');
      }
    };
    
    fetchVersions();
  }, []);
  
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
              <Grid item xs={12} md={6}>
                <ServerTypeCard
                  type="java"
                  title="Java Edition"
                  description="Versión clásica de Minecraft para PC. Soporta mods, plugins y paquetes de recursos avanzados."
                  image="https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Java_Edition_Key_Art.jpg"
                  selected={serverData.type === 'java'}
                  onClick={handleServerTypeSelect}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ServerTypeCard
                  type="bedrock"
                  title="Bedrock Edition"
                  description="Versión multiplataforma compatible con dispositivos móviles, consolas y Windows 10."
                  image="https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Bedrock_Edition_Key_Art.jpg"
                  selected={serverData.type === 'bedrock'}
                  onClick={handleServerTypeSelect}
                />
              </Grid>
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
                {serverData.type && versions[serverData.type]?.map((version) => (
                  <MenuItem key={version} value={version}>{version}</MenuItem>
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
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Nombre del Servidor</Typography>
                  <Typography variant="body1">{serverData.name}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                  <Typography variant="body1">{serverData.type === 'java' ? 'Java Edition' : 'Bedrock Edition'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Versión</Typography>
                  <Typography variant="body1">{serverData.version}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Modo de Juego</Typography>
                  <Typography variant="body1">
                    {{
                      survival: 'Supervivencia',
                      creative: 'Creativo',
                      adventure: 'Aventura',
                      spectator: 'Espectador'
                    }[serverData.settings.gamemode]}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Dificultad</Typography>
                  <Typography variant="body1">
                    {{
                      peaceful: 'Pacífico',
                      easy: 'Fácil',
                      normal: 'Normal',
                      hard: 'Difícil'
                    }[serverData.settings.difficulty]}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Máximo de Jugadores</Typography>
                  <Typography variant="body1">{serverData.settings.maxPlayers}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">RAM</Typography>
                  <Typography variant="body1">{serverData.resources.ram} MB</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">CPU</Typography>
                  <Typography variant="body1">{serverData.resources.cpu} cores</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Almacenamiento</Typography>
                  <Typography variant="body1">{serverData.resources.storage} GB</Typography>
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