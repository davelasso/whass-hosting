import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const steps = ['Selección del Plan', 'Revisión', 'Pago', 'Confirmación'];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [serverCreated, setServerCreated] = useState(false);

  useEffect(() => {
    // Obtener el plan seleccionado de la ubicación
    if (location.state?.plan) {
      setSelectedPlan(location.state.plan);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Aquí iría la integración con el sistema de pago
      // Por ahora simulamos un pago exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear el servidor después del pago exitoso
      const response = await axios.post('/api/servers', {
        name: `${user.username}'s Server`,
        plan: selectedPlan.id,
        type: 'java',
        version: '1.20.1'
      });

      if (response.data.success) {
        setServerCreated(true);
        setActiveStep(3);
      }
    } catch (err) {
      setError('Error al procesar el pago. Por favor, intenta de nuevo.');
      console.error('Error en el proceso de pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (!selectedPlan) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No se ha seleccionado ningún plan. Por favor, selecciona un plan primero.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Resumen del Plan
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Plan Seleccionado"
                  secondary={selectedPlan.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Precio Mensual"
                  secondary={`$${selectedPlan.price}/mes`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Recursos"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        • CPU: {selectedPlan.cpu}
                        <br />
                        • RAM: {selectedPlan.ram}
                        <br />
                        • Almacenamiento: {selectedPlan.storage}
                        <br />
                        • Procesador: {selectedPlan.processor}
                        <br />
                        • Backups: {selectedPlan.backups}
                        <br />
                        • Ubicación: {selectedPlan.location}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Revisar Pedido
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Plan"
                  secondary={selectedPlan.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Precio Total"
                  secondary={`$${selectedPlan.price}/mes`}
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
              >
                Proceder al Pago
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Procesar Pago
            </Typography>
            <Typography variant="body1" paragraph>
              Monto a pagar: ${selectedPlan.price}/mes
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(1)}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={handleProceedToPayment}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Pagar Ahora'}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              ¡Pago Completado!
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Tu servidor ha sido creado exitosamente.
            </Alert>
            <Typography variant="body1" paragraph>
              Tu servidor está siendo configurado y estará listo en unos minutos.
              Puedes acceder a él desde tu panel de control.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleGoToDashboard}
              >
                Ir al Panel de Control
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout; 