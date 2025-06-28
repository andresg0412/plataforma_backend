import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inmuebleController } from '../controllers/inmueble.controller';

// Mock the service
vi.mock('../services/inmuebles/createInmuebleService', () => {
  return {
    CreateInmuebleService: vi.fn().mockImplementation(() => ({
      execute: vi.fn().mockResolvedValue({
        data: {
          id_inmueble: 1,
          direccion: 'Calle 123',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          tipo_inmueble: 'casa',
          area_total: 100,
          area_construida: 80,
          estado: 'disponible'
        }
      })
    }))
  };
});

// Mock FastifyReply
const reply = () => {
  let res = {
    statusCode: 200,
    payload: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(data: any) {
      this.payload = data;
      return this;
    },
  };
  return res;
};

describe('inmuebleController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an inmueble with valid data', async () => {
    const req: any = { 
      userContext: {
        id: 1,
        id_roles: 1,
        role: 'superadmin',
        empresaId: 1
      },
      body: { 
        direccion: 'Calle 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        tipo_inmueble: 'casa',
        area_total: 100,
        area_construida: 80,
        id_empresa: 1,
        estado: 'disponible'
      }
    };
    
    const res = reply();
    await inmuebleController.create(req, res as any);
    
    expect(res.statusCode).toBe(201);
    expect(res.payload.isError).toBe(false);
    expect(res.payload.data.direccion).toBe('Calle 123');
  });

  it('should return 401 when not authenticated', async () => {
    const req: any = { 
      userContext: null,
      body: { 
        direccion: 'Calle 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        tipo_inmueble: 'casa',
        area_total: 100,
        area_construida: 80,
        id_empresa: 1,
        estado: 'disponible'
      }
    };
    
    const res = reply();
    await inmuebleController.create(req, res as any);
    
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('No autenticado');
  });

  it('should return 400 when required fields are missing', async () => {
    const req: any = { 
      userContext: {
        id: 1,
        id_roles: 1,
        role: 'superadmin',
        empresaId: 1
      },
      body: { 
        // Missing required fields
        direccion: '',
        ciudad: 'Bogotá'
      }
    };
    
    const res = reply();
    await inmuebleController.create(req, res as any);
    
    expect(res.statusCode).toBe(400);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Datos inválidos');
  });
});