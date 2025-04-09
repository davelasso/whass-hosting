import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, IconButton } from '@mui/material';
import { GitHub, LinkedIn, Twitter } from '@mui/icons-material';

const teamMembers = [
  {
    name: 'Alex Minecraft',
    role: 'Fundador & CEO',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex',
    description: 'Apasionado por Minecraft desde 2011. Experto en optimización de servidores y desarrollo de plugins.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    name: 'Sarah Craft',
    role: 'Directora de Operaciones',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah',
    description: 'Especialista en gestión de infraestructura y experiencia del usuario. Ama crear experiencias únicas.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    name: 'Mike Builder',
    role: 'Lead Developer',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Mike',
    description: 'Desarrollador full-stack con experiencia en Java y Node.js. Creador de plugins personalizados.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    name: 'Laura Server',
    role: 'Soporte Técnico',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Laura',
    description: 'Experta en resolución de problemas y atención al cliente. Siempre lista para ayudar.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  }
];

const Team = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Nuestro Equipo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Conoce al equipo detrás de tu servidor Minecraft favorito 🧱⚒️
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={member.image}
                alt={member.name}
                sx={{
                  objectFit: 'cover',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  {member.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  align="center"
                  gutterBottom
                >
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  {member.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <IconButton
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <GitHub />
                  </IconButton>
                  <IconButton
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <Twitter />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Team; 