import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, error, loading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setVerificationStatus('error');
      }
    };

    verifyUserEmail();
  }, [token, verifyEmail, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {loading && verificationStatus === 'verifying' ? (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Verificando tu email...
            </Typography>
          </>
        ) : verificationStatus === 'success' ? (
          <Alert severity="success" sx={{ width: '100%' }}>
            <Typography variant="h6">
              ¡Email verificado exitosamente!
            </Typography>
            <Typography>
              Serás redirigido al inicio de sesión en unos segundos...
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ width: '100%' }}>
            <Typography variant="h6">
              Error al verificar el email
            </Typography>
            <Typography>
              {error || 'El enlace de verificación es inválido o ha expirado.'}
            </Typography>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail; 