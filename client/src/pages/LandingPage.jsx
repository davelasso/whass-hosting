import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  useTheme as useMuiTheme,
  useMediaQuery,
  Paper,
  Modal
} from '@mui/material';
import {
  Check as CheckIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  SupportAgent as SupportIcon,
  Backup as BackupIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

// Componente para las tarjetas de planes
const PlanCard = ({ title, price, features, recommended, buttonText }) => {
  const theme = useMuiTheme();
  
  return (
    <Card 
      elevation={recommended ? 8 : 2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        overflow: 'visible',
        border: recommended ? `2px solid ${theme.palette.primary.main}` : 'none',
      }}
    >
      {recommended && (
        <Box
          sx={{
            position: 'absolute',
            top: -15,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              py: 0.5,
              px: 2,
              borderRadius: 1,
              display: 'inline-block',
            }}
          >
            Recomendado
          </Typography>
        </Box>
      )}
      
      <CardContent sx={{ flexGrow: 1, pt: recommended ? 4 : 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {title}
        </Typography>
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h3" component="p" color="primary">
            {price}
          </Typography>
          {price !== 'Gratis' && (
            <Typography variant="subtitle2" color="text.secondary">
              por mes
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant={recommended ? "contained" : "outlined"} 
          component={RouterLink} 
          to="/register"
          size="large"
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

// Componente para las características
const FeatureItem = ({ icon, title, description }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box sx={{ p: 1, mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

const LandingPage = () => {
  const { theme: themeMode, toggleTheme } = useTheme();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  
  const handlePlanSelect = (plan) => {
    navigate('/checkout', { state: { plan } });
  };
  
  // Datos de los planes
  const plans = [
    {
      title: 'Plan Sandstone',
      price: '$1.50/mes',
      features: [
        '1 CPU vCore',
        '1GB de RAM',
        '10GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Sandstone'
    },
    {
      title: 'Plan Stone',
      price: '$3.00/mes',
      features: [
        '1 CPU vCore',
        '2GB de RAM',
        '10GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Stone'
    },
    {
      title: 'Plan Lapislázuli',
      price: '$4.50/mes',
      features: [
        '2 CPU vCore',
        '3GB de RAM',
        '20GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Lapislázuli'
    },
    {
      title: 'Plan Hierro',
      price: '$6.00/mes',
      features: [
        '2 CPU vCore',
        '4GB de RAM',
        '20GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: true,
      buttonText: 'Elegir Hierro'
    }
  ];

  // Datos de todos los planes para el modal
  const allPlans = [
    ...plans,
    {
      title: 'Plan Dinamita',
      price: '$7.50/mes',
      features: [
        '2 CPU vCore',
        '5GB de RAM',
        '20GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Dinamita'
    },
    {
      title: 'Plan Faro',
      price: '$9.00/mes',
      features: [
        '2.5 CPU vCore',
        '6GB de RAM',
        '30GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Faro'
    },
    {
      title: 'Plan Cuarzo',
      price: '$10.50/mes',
      features: [
        '2.5 CPU vCore',
        '7GB de RAM',
        '30GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Cuarzo'
    },
    {
      title: 'Plan Redstone',
      price: '$12.00/mes',
      features: [
        '2.5 CPU vCore',
        '8GB de RAM',
        '30GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Redstone'
    },
    {
      title: 'Plan Cobre',
      price: '$15.00/mes',
      features: [
        '3 CPU vCore',
        '10GB de RAM',
        '40GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Cobre'
    },
    {
      title: 'Plan Esmeralda',
      price: '$18.00/mes',
      features: [
        '3 CPU vCore',
        '12GB de RAM',
        '40GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Esmeralda'
    },
    {
      title: 'Plan Lava',
      price: '$21.00/mes',
      features: [
        '3 CPU vCore',
        '14GB de RAM',
        '40GB SSD NVMe',
        'Ryzen 5 5600X',
        '3 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Lava'
    },
    {
      title: 'Plan Obsidiana',
      price: '$24.00/mes',
      features: [
        '3 CPU vCore',
        '16GB de RAM',
        '50GB SSD NVMe',
        'Ryzen 5 5600X',
        '5 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Obsidiana'
    },
    {
      title: 'Plan TNT',
      price: '$30.00/mes',
      features: [
        '3 CPU vCore',
        '20GB de RAM',
        '50GB SSD NVMe',
        'Ryzen 5 5600X',
        '5 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir TNT'
    },
    {
      title: 'Plan Diamante',
      price: '$36.00/mes',
      features: [
        '3 CPU vCore',
        '24GB de RAM',
        '50GB SSD NVMe',
        'Ryzen 5 5600X',
        '5 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Diamante'
    },
    {
      title: 'Plan Comando',
      price: '$42.00/mes',
      features: [
        '3 CPU vCore',
        '28GB de RAM',
        '50GB SSD NVMe',
        'Ryzen 5 5600X',
        '5 Backups',
        'Miami, Florida'
      ],
      recommended: false,
      buttonText: 'Elegir Comando'
    }
  ];
  
  // Datos de las características
  const features = [
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Alto Rendimiento',
      description: 'Servidores optimizados para ofrecer la mejor experiencia de juego con mínima latencia.'
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Seguridad Avanzada',
      description: 'Protección contra DDoS y sistemas de seguridad para mantener tu servidor protegido.'
    },
    {
      icon: <StorageIcon fontSize="large" />,
      title: 'Múltiples Versiones',
      description: 'Soporte para Minecraft Java Edition y Bedrock Edition con todas las versiones disponibles.'
    },
    {
      icon: <BackupIcon fontSize="large" />,
      title: 'Backups Automáticos',
      description: 'Sistema de copias de seguridad automáticas para proteger tus mundos y configuraciones.'
    },
    {
      icon: <CodeIcon fontSize="large" />,
      title: 'Plugins y Mods',
      description: 'Instalación sencilla de plugins y mods para personalizar tu experiencia de juego.'
    },
    {
      icon: <SupportIcon fontSize="large" />,
      title: 'Soporte 24/7',
      description: 'Equipo de soporte disponible 24/7 para ayudarte con cualquier problema que puedas tener.'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Barra de navegación */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            ddsbedrocl
          </Typography>
          
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          <Button color="inherit" component={RouterLink} to="/login" sx={{ mr: 1 }}>
            Iniciar Sesión
          </Button>
          
          <Button variant="contained" component={RouterLink} to="/register">
            Registrarse
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            color="primary"
            gutterBottom
            fontWeight="bold"
          >
            Hosting de Minecraft
            <br />
            Simple y Potente
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Crea y gestiona servidores de Minecraft Java y Bedrock Edition con facilidad.
            Nuestra plataforma te ofrece control total, alto rendimiento y una experiencia sin complicaciones.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ px: 4, py: 1.5, mr: 2, mb: isMobile ? 2 : 0 }}
            >
              Comenzar Gratis
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/login"
              sx={{ px: 4, py: 1.5 }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Características */}
      <Box sx={{ py: 8, bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Características
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Todo lo que necesitas para gestionar tus servidores de Minecraft
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureItem
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Planes */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Planes de Hosting
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Elige el plan que mejor se adapte a tus necesidades
          </Typography>
          
          <Grid container spacing={4} alignItems="stretch">
            {plans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <PlanCard
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  recommended={plan.recommended}
                  buttonText={plan.buttonText}
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={handleOpenModal}
              sx={{ px: 3, py: 1 }}
            >
              Ver todos los planes
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Modal con todos los planes */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="todos-los-planes-modal"
        aria-describedby="modal-con-todos-los-planes-disponibles"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1200,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 4,
            outline: 'none',
          }}
        >
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Todos los planes de hosting
          </Typography>
          
          <Grid container spacing={3}>
            {allPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <PlanCard
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  recommended={plan.recommended}
                  buttonText={plan.buttonText}
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Características comunes en todos los planes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>• SSD NVMe para alto rendimiento</ListItem>
                  <ListItem>• Capacidad de jugadores personalizable</ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>• Opciones de backup de 3 a 5 copias según plan</ListItem>
                  <ListItem>• Servidor de baja latencia ubicado en Miami</ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleCloseModal}
              color="primary"
              size="large"
            >
              Cerrar
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* CTA */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Crea tu servidor de Minecraft en menos de 5 minutos
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handlePlanSelect({
              id: 'sandstone',
              name: 'Plan Sandstone',
              price: 1.50,
              cpu: '1 CPU vCore',
              ram: '1GB',
              storage: '10GB SSD',
              processor: 'Ryzen 5 5600X',
              backups: '3 backups',
              location: 'Miami, Florida'
            })}
          >
            Seleccionar Plan
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                ddsbedrocl
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plataforma de hosting para servidores de Minecraft Java y Bedrock Edition.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom>
                Enlaces
              </Typography>
              <List dense>
                {['Inicio', 'Características', 'Planes', 'Soporte', 'Blog'].map((item) => (
                  <ListItem key={item} disableGutters>
                    <Button color="inherit" sx={{ pl: 0 }}>
                      {item}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom>
                Legal
              </Typography>
              <List dense>
                {['Términos de Servicio', 'Política de Privacidad', 'Reembolsos', 'DMCA'].map((item) => (
                  <ListItem key={item} disableGutters>
                    <Button color="inherit" sx={{ pl: 0 }}>
                      {item}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} ddsbedrocl. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;