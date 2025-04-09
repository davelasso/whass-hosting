import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Container
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Router as RouterIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const CompleteSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [additionalServices, setAdditionalServices] = useState({
    ddosProtection: false,
    customProxy: false
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bancolombia');
  const [paymentDetails, setPaymentDetails] = useState({
    email: '',
    referenceNumber: ''
  });
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Definición de pasos
  const steps = ['Revisar Plan', 'Añadir Servicios', 'Método de Pago', 'Confirmación'];
  
  // Cargar datos del plan al montar el componente
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        // Aquí simularemos obtener el plan del usuario
        // En una implementación real, esto vendría de la API
        setTimeout(() => {
          const mockPlan = {
            name: 'Plan Hierro',
            price: 6.00,
            cpu: '2 CPU vCore',
            ram: '4GB RAM DDR4',
            storage: '20GB SSD NVMe',
            processor: 'Ryzen 5 5600X',
            backups: '3 copias de seguridad',
            location: 'Miami, Florida'
          };
          
          setUserPlan(mockPlan);
          setTotalPrice(mockPlan.price);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Error al cargar los datos del plan. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };
    
    fetchUserPlan();
  }, [token]);
  
  // Actualizar precio total cuando cambian los servicios adicionales
  useEffect(() => {
    if (userPlan) {
      let newTotal = userPlan.price;
      
      if (additionalServices.ddosProtection) {
        newTotal += 5;
      }
      
      if (additionalServices.customProxy) {
        newTotal += 10;
      }
      
      setTotalPrice(newTotal);
    }
  }, [additionalServices, userPlan]);
  
  // Manejar cambios en los servicios adicionales
  const handleServiceChange = (event) => {
    setAdditionalServices({
      ...additionalServices,
      [event.target.name]: event.target.checked
    });
  };
  
  // Manejar cambios en el método de pago
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  // Manejar cambios en los detalles de pago
  const handlePaymentDetailsChange = (event) => {
    setPaymentDetails({
      ...paymentDetails,
      [event.target.name]: event.target.value
    });
  };
  
  // Avanzar al siguiente paso
  const handleNext = () => {
    // Validar el paso actual antes de avanzar
    if (activeStep === 2) {
      // Validar que se hayan completado los detalles del pago
      if (!paymentDetails.email || !paymentDetails.referenceNumber) {
        setError('Por favor, complete todos los campos de pago antes de continuar.');
        return;
      }
      
      // Simular procesamiento de pago
      setLoading(true);
      setTimeout(() => {
        setPaymentCompleted(true);
        setLoading(false);
        setActiveStep(activeStep + 1);
      }, 2000);
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Volver al paso anterior
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  // Finalizar el proceso y redirigir al panel de control
  const handleFinish = () => {
    navigate('/dashboard');
  };
  
  // Renderizar el contenido según el paso actual
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardHeader
              title={userPlan?.name || 'Plan Seleccionado'}
              subheader={`Precio Base: ${userPlan?.price.toFixed(2)} USD/mes`}
              titleTypographyProps={{ variant: 'h5' }}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.cpu} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.ram} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.storage} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.processor} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.backups} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={userPlan?.location} />
                </ListItem>
              </List>
              <Typography variant="body2" color="textSecondary" className="mt-3">
                Este es el plan que ha seleccionado. En los siguientes pasos podrá añadir servicios adicionales para mejorar su experiencia.
              </Typography>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card>
            <CardHeader
              title="Servicios Adicionales"
              subheader="Mejore su experiencia con estos servicios"
              titleTypographyProps={{ variant: 'h5' }}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={additionalServices.ddosProtection}
                      onChange={handleServiceChange}
                      name="ddosProtection"
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <span>Protección DDoS Avanzada</span>
                        <Typography variant="body2" color="primary">+$5.00/mes</Typography>
                      </Box>
                    }
                    secondary="Protección adicional contra ataques DDoS para garantizar la estabilidad de su servidor en todo momento."
                  />
                  <ShieldIcon color="action" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={additionalServices.customProxy}
                      onChange={handleServiceChange}
                      name="customProxy"
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <span>Proxy Personalizado</span>
                        <Typography variant="body2" color="primary">+$10.00/mes</Typography>
                      </Box>
                    }
                    secondary="Proxy dedicado para su servidor con configuración personalizada y mayor rendimiento."
                  />
                  <RouterIcon color="action" />
                </ListItem>
              </List>
            </CardContent>
            <Divider />
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">${totalPrice.toFixed(2)}/mes</Typography>
            </Box>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader
              title="Método de Pago"
              subheader="Seleccione su método de pago preferido"
              titleTypographyProps={{ variant: 'h5' }}
            />
            <Divider />
            <CardContent>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Opciones de Pago</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel 
                    value="bancolombia" 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <AccountBalanceIcon color="action" sx={{ mr: 1 }} />
                        <span>Bancolombia</span>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="nequi" 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <CreditCardIcon color="action" sx={{ mr: 1 }} />
                        <span>Nequi</span>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="bbva" 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <AccountBalanceIcon color="action" sx={{ mr: 1 }} />
                        <span>BBVA</span>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="paypal" 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                        <span>PayPal</span>
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
              
              {paymentMethod === 'bancolombia' && (
                <Box mt={3}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Realice su pago a la siguiente cuenta:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Bancolombia:</strong> 901-123456-78
                    </Typography>
                    <Typography variant="body2">
                      <strong>Titular:</strong> DDSBedrocl S.A.S.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo de cuenta:</strong> Ahorros
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto:</strong> ${totalPrice.toFixed(2)} USD
                    </Typography>
                  </Alert>
                </Box>
              )}
              
              {paymentMethod === 'nequi' && (
                <Box mt={3}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Realice su pago al siguiente número:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nequi:</strong> 323-456-7890
                    </Typography>
                    <Typography variant="body2">
                      <strong>Titular:</strong> DDSBedrocl S.A.S.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto:</strong> ${totalPrice.toFixed(2)} USD
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      <strong>Importante:</strong> En la descripción del pago, incluya su nombre de usuario y plan seleccionado.
                    </Typography>
                  </Alert>
                </Box>
              )}
              
              {paymentMethod === 'bbva' && (
                <Box mt={3}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Realice su pago a la siguiente cuenta:
                    </Typography>
                    <Typography variant="body2">
                      <strong>BBVA:</strong> 012-345678-9
                    </Typography>
                    <Typography variant="body2">
                      <strong>Titular:</strong> DDSBedrocl S.A.S.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo de cuenta:</strong> Corriente
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto:</strong> ${totalPrice.toFixed(2)} USD
                    </Typography>
                  </Alert>
                </Box>
              )}
              
              {paymentMethod === 'paypal' && (
                <Box mt={3}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Realice su pago a la siguiente cuenta de PayPal:
                    </Typography>
                    <Typography variant="body2">
                      <strong>PayPal:</strong> pagos@ddsbedrocl.com
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto:</strong> ${totalPrice.toFixed(2)} USD
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      <strong>Importante:</strong> Envíe como "amigo o familiar" para evitar cargos adicionales.
                    </Typography>
                  </Alert>
                </Box>
              )}
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Detalles del Pago
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Correo Electrónico"
                      name="email"
                      value={paymentDetails.email}
                      onChange={handlePaymentDetailsChange}
                      helperText="Correo desde el cual realizó el pago"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Número de Referencia"
                      name="referenceNumber"
                      value={paymentDetails.referenceNumber}
                      onChange={handlePaymentDetailsChange}
                      helperText="Número de referencia o comprobante del pago"
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader
              title="Confirmación"
              subheader="Resumen de su orden"
              titleTypographyProps={{ variant: 'h5' }}
            />
            <Divider />
            <CardContent>
              {paymentCompleted ? (
                <Box textAlign="center" py={3}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    ¡Pago Confirmado!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Su pago ha sido procesado correctamente. Su servidor está siendo configurado.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Recibirá un correo electrónico con los detalles de su servidor una vez esté listo.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleFinish}
                  >
                    Ir al Panel de Control
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Su pago está siendo procesado. Por favor espere.
                  </Alert>
                  <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
                </Box>
              )}
            </CardContent>
          </Card>
        );
      default:
        return 'Paso desconocido';
    }
  };
  
  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando información...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Completar Configuración
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0 || activeStep === steps.length - 1}
            onClick={handleBack}
          >
            Anterior
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteSetup; 