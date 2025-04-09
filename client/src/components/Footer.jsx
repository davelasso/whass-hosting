import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Grid, Typography, TextField, Divider, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import CommentIcon from '@mui/icons-material/Comment';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', color: 'text.primary', py: 5, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" component="h2" fontFamily="'Minecraft', sans-serif" color="primary" gutterBottom>
              DDSBedrocl
            </Typography>
            <Typography variant="body1" paragraph>
              La mejor solución para hosting de servidores de Minecraft Java y Bedrock.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                component="a"
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </Button>
              <Button 
                component="a"
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </Button>
              <Button 
                component="a"
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </Button>
              <Button 
                component="a"
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <CommentIcon />
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Enlaces
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Inicio
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/#planes" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Planes
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Iniciar Sesión
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Registrarse
                </RouterLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Soporte
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/help" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Centro de Ayuda
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/tutorials" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Tutoriales
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/status" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Estado de Servidores
                </RouterLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <RouterLink to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Contacto
                </RouterLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Boletín Informativo
            </Typography>
            <Typography variant="body2" paragraph>
              Suscríbete para recibir las últimas novedades y ofertas exclusivas.
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField 
                variant="outlined"
                placeholder="Tu email" 
                size="small"
                fullWidth
                sx={{ mr: 1 }}
              />
              <Button variant="contained" color="primary">
                Suscribir
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body2">
              &copy; 2025 DDSBedrocl. Todos los derechos reservados.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' }, mt: { xs: 2, md: 0 } }}>
            <RouterLink to="/terms" style={{ textDecoration: 'none', color: 'inherit', marginRight: '16px' }}>
              Términos de Servicio
            </RouterLink>
            <RouterLink to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
              Política de Privacidad
            </RouterLink>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 