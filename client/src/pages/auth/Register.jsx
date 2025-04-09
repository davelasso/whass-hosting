import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  useTheme,
  Paper,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { register, error: authError, loading, setLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free',
    acceptTerms: false
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    
    // Validar términos y condiciones
    if (!formData.acceptTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar los datos para enviar al backend
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        plan: formData.plan
      };
      
      const result = await register(userData);
      
      if (result) {
        setSuccess(true);
      } else if (authError) {
        setErrorMessage(authError);
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setErrorMessage('Error en el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Si el registro fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              ¡Registro exitoso!
            </Typography>
            <Typography variant="body1" paragraph>
              Te hemos enviado un correo electrónico para verificar tu cuenta. 
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Ir al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CardHeader 
            title="Crear cuenta" 
            titleTypographyProps={{ align: 'center', variant: 'h4' }}
            sx={{ pt: 4, pb: 2 }}
          />
          
          {errorMessage && (
            <Box sx={{ px: 3 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Box>
          )}
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
                  label="Nombre de usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
                  helperText="El nombre que usarás para iniciar sesión"
            />
              </Grid>
              
              <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
                  label="Correo electrónico"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
                  error={Boolean(errorMessage)}
                  helperText={errorMessage || "Usa gmail.com o hotmail.com (gamil.com solo para administradores)"}
            />
              </Grid>
              
              <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
                  label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
                  helperText="Mínimo 8 caracteres"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                      edge="end"
                    >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                    )
              }}
            />
              </Grid>
              
              <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
                  label="Confirmar contraseña"
              name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
                  helperText="Repite tu contraseña"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Elige tu Plan
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{
                        height: '100%',
                        borderColor: formData.plan === 'free' ? theme.palette.primary.main : 'inherit',
                        backgroundColor: formData.plan === 'free' ? `${theme.palette.primary.main}10` : 'inherit',
                        cursor: 'pointer'
                      }} onClick={() => setFormData({...formData, plan: 'free'})}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Plan Sandstone
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom>
                            $1.50/mes
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            • 1 CPU vCore
                          </Typography>
                          <Typography variant="body2">
                            • 1GB RAM
                          </Typography>
                          <Typography variant="body2">
                            • 10GB SSD NVMe
                          </Typography>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={formData.plan === 'free'}
                                onChange={handleChange}
                                name="plan"
                                value="free"
                              />
                            }
                            label="Seleccionar"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{
                        height: '100%',
                        borderColor: formData.plan === 'basic' ? theme.palette.primary.main : 'inherit',
                        backgroundColor: formData.plan === 'basic' ? `${theme.palette.primary.main}10` : 'inherit',
                        cursor: 'pointer'
                      }} onClick={() => setFormData({...formData, plan: 'basic'})}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Plan Stone
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom>
                            $3.00/mes
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            • 1 CPU vCore
                          </Typography>
                          <Typography variant="body2">
                            • 2GB RAM
                          </Typography>
                          <Typography variant="body2">
                            • 10GB SSD NVMe
                          </Typography>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={formData.plan === 'basic'}
                                onChange={handleChange}
                                name="plan"
                                value="basic"
                              />
                            }
                            label="Seleccionar"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{
                        height: '100%',
                        borderColor: formData.plan === 'standard' ? theme.palette.primary.main : 'inherit',
                        backgroundColor: formData.plan === 'standard' ? `${theme.palette.primary.main}10` : 'inherit',
                        cursor: 'pointer'
                      }} onClick={() => setFormData({...formData, plan: 'standard'})}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Plan Lapislázuli
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom>
                            $4.50/mes
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            • 2 CPU vCore
                          </Typography>
                          <Typography variant="body2">
                            • 3GB RAM
                          </Typography>
                          <Typography variant="body2">
                            • 20GB SSD NVMe
                          </Typography>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={formData.plan === 'standard'}
                                onChange={handleChange}
                                name="plan"
                                value="standard"
                              />
                            }
                            label="Seleccionar"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined" sx={{
                        height: '100%',
                        borderColor: formData.plan === 'premium' ? theme.palette.primary.main : 'inherit',
                        backgroundColor: formData.plan === 'premium' ? `${theme.palette.primary.main}10` : 'inherit',
                        cursor: 'pointer',
                        position: 'relative'
                      }} onClick={() => setFormData({...formData, plan: 'premium'})}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -10,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{
                              backgroundColor: theme.palette.secondary.main,
                              color: theme.palette.secondary.contrastText,
                              py: 0.5,
                              px: 2,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            POPULAR
                          </Typography>
                        </Box>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Plan Hierro
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom>
                            $6.00/mes
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            • 2 CPU vCore
                          </Typography>
                          <Typography variant="body2">
                            • 4GB RAM
                          </Typography>
                          <Typography variant="body2">
                            • 20GB SSD NVMe
                          </Typography>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={formData.plan === 'premium'}
                                onChange={handleChange}
                                name="plan"
                                value="premium"
                              />
                            }
                            label="Seleccionar"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Acepto los{' '}
                        <RouterLink to="/terms" target="_blank">
                          Términos y Condiciones
                        </RouterLink>{' '}
                        y la{' '}
                        <RouterLink to="/privacy" target="_blank">
                          Política de Privacidad
                        </RouterLink>
                      </Typography>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Registrarse'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;