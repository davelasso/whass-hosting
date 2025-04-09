import React from 'react';
import { render, screen } from '@testing-library/react';
import Team from '../Team';

describe('Team Component', () => {
  it('renders team section title', () => {
    render(<Team />);
    expect(screen.getByText('Nuestro Equipo')).toBeInTheDocument();
  });

  it('renders all team members', () => {
    render(<Team />);
    expect(screen.getByText('Alex Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText('Laura Torres')).toBeInTheDocument();
  });

  it('renders team member roles', () => {
    render(<Team />);
    expect(screen.getByText('Desarrollador Principal')).toBeInTheDocument();
    expect(screen.getByText('Especialista en Soporte')).toBeInTheDocument();
    expect(screen.getByText('Administrador de Sistemas')).toBeInTheDocument();
    expect(screen.getByText('Diseñadora UI/UX')).toBeInTheDocument();
  });

  it('renders team member descriptions', () => {
    render(<Team />);
    expect(screen.getByText(/Especialista en desarrollo de servidores Minecraft/)).toBeInTheDocument();
    expect(screen.getByText(/Experta en resolución de problemas/)).toBeInTheDocument();
    expect(screen.getByText(/Responsable de la infraestructura/)).toBeInTheDocument();
    expect(screen.getByText(/Creadora de interfaces intuitivas/)).toBeInTheDocument();
  });
}); 