import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, Chip, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  PlayArrow, Stop, RestartAlt, Settings, 
  Delete, Add, Refresh, CloudDownload
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ServerList = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    version: '1.20.1',
    type: 'vanilla',
    ram: '2GB'
  });
  const theme = useTheme();
  const { user } = useAuth();

  // Función para cargar los servidores
  const fetchServers = async () => {
    try {
      // Simulación de carga de servidores
      const mockServers = [
        {
          id: 1,
          name: 'Mi Servidor Survival',
          version: '1.20.1',
          type: 'vanilla',
          status: 'online',
          players: 12,
          maxPlayers: 30,
          ram: '2GB',
          uptime: '99.9%'
        },
        {
          id: 2,
          name: 'Servidor Creativo',
          version: '1.20.1',
          type: 'spigot',
          status: 'offline',
          players: 0,
          maxPlayers: 20,
          ram: '4GB',
          uptime: '0%'
        }
      ];
      
      setServers(mockServers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading servers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []); // No necesitamos incluir fetchServers como dependencia

  // Función para manejar la creación de un nuevo servidor
  const handleCreateServer = () => {
    const server = {
      id: servers.length + 1,
      ...newServer,
      status: 'offline',
      players: 0,
      maxPlayers: 30,
      uptime: '0%'
    };
    
    setServers(prev => [...prev, server]);
    setOpenCreateDialog(false);
    setNewServer({
      name: '',
      version: '1.20.1',
      type: 'vanilla',
      ram: '2GB'
    });
  };

  // Función para manejar el cambio de estado del servidor
  const handleServerAction = (serverId, action) => {
    setServers(prev => prev.map(server => {
      if (server.id === serverId) {
        switch (action) {
          case 'start':
            return { ...server, status: 'online', uptime: '99.9%' };
          case 'stop':
            return { ...server, status: 'offline', players: 0, uptime: '0%' };
          case 'restart':
            return { ...server, status: 'online', uptime: '99.9%' };
          default:
            return server;
        }
      }
      return server;
    }));
  };

  // Función para manejar la eliminación de un servidor
  const handleDeleteServer = (serverId) => {
    setServers(prev => prev.filter(server => server.id !== serverId));
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'offline':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Servidores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Crear Servidor
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Versión</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Jugadores</TableCell>
                <TableCell>RAM</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>
                    <Link to={`/server/${server.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {server.name}
                    </Link>
                  </TableCell>
                  <TableCell>{server.version}</TableCell>
                  <TableCell>{server.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={server.status} 
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(server.status),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{server.players}/{server.maxPlayers}</TableCell>
                  <TableCell>{server.ram}</TableCell>
                  <TableCell>{server.uptime}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleServerAction(server.id, 'start')}
                      disabled={server.status === 'online'}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleServerAction(server.id, 'stop')}
                      disabled={server.status === 'offline'}
                    >
                      <Stop />
                    </IconButton>
                    <IconButton 
                      color="warning"
                      onClick={() => handleServerAction(server.id, 'restart')}
                      disabled={server.status === 'offline'}
                    >
                      <RestartAlt />
                    </IconButton>
                    <IconButton 
                      color="info"
                      component={Link}
                      to={`/server/${server.id}/settings`}
                    >
                      <Settings />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteServer(server.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Crear Nuevo Servidor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Servidor"
            type="text"
            fullWidth
            value={newServer.name}
            onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Versión</InputLabel>
            <Select
              value={newServer.version}
              label="Versión"
              onChange={(e) => setNewServer(prev => ({ ...prev, version: e.target.value }))}
            >
              <MenuItem value="1.20.1">1.20.1</MenuItem>
              <MenuItem value="1.19.4">1.19.4</MenuItem>
              <MenuItem value="1.18.2">1.18.2</MenuItem>
              <MenuItem value="1.16.5">1.16.5</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newServer.type}
              label="Tipo"
              onChange={(e) => setNewServer(prev => ({ ...prev, type: e.target.value }))}
            >
              <MenuItem value="vanilla">Vanilla</MenuItem>
              <MenuItem value="spigot">Spigot</MenuItem>
              <MenuItem value="paper">Paper</MenuItem>
              <MenuItem value="forge">Forge</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>RAM</InputLabel>
            <Select
              value={newServer.ram}
              label="RAM"
              onChange={(e) => setNewServer(prev => ({ ...prev, ram: e.target.value }))}
            >
              <MenuItem value="2GB">2GB</MenuItem>
              <MenuItem value="4GB">4GB</MenuItem>
              <MenuItem value="8GB">8GB</MenuItem>
              <MenuItem value="16GB">16GB</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateServer} variant="contained" color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServerList; 