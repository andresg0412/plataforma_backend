import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the service before importing the controller
vi.mock('../services/inmueble.service', () => ({
  InmuebleService: vi.fn().mockImplementation(() => ({
    getAllInmuebles: vi.fn().mockResolvedValue({
      data: [{ id: 1, direccion: 'Test Address' }],
      error: null
    }),
    getInmueblesByEmpresa: vi.fn().mockResolvedValue({
      data: [{ id: 1, direccion: 'Test Address', empresa_id: 1 }],
      error: null
    }),
    getInmueblesByEmpresaAndPropietario: vi.fn().mockResolvedValue({
      data: [{ id: 1, direccion: 'Test Address', empresa_id: 1, propietario_id: 1 }],
      error: null
    })
  }))
}));

import { inmuebleController } from '../controllers/inmueble.controller';

// Mock FastifyReply
const mockReply = () => {
  let statusCode = 200;
  let payload: any;
  const replyObj = {
    status: (code: number) => { statusCode = code; return replyObj; },
    send: (data: any) => { payload = data; return { statusCode, payload }; },
  };
  return replyObj;
};

// Mock authenticated user
const mockUser = {
  id: 1,
  nombre: 'Test User',
  role: 'superadmin',
  empresaId: 1,
  propietarioId: null,
};

describe('inmuebleController', () => {
  it('should handle superadmin request to list all inmuebles', async () => {
    const req: any = { 
      user: mockUser,
      query: {}
    };

    const res = await inmuebleController.list(req, mockReply() as any);
    expect(res.statusCode).toBe(200);
  });

  it('should require empresa ID for non-superadmin roles', async () => {
    const req: any = { 
      user: { ...mockUser, role: 'empresa', empresaId: null },
      query: {}
    };
    
    const res = await inmuebleController.list(req, mockReply() as any);
    expect(res.statusCode).toBe(400);
    expect(res.payload.message).toBe('ID de empresa requerido');
  });

  it('should filter by empresa for empresa role with empresaId', async () => {
    const req: any = { 
      user: { ...mockUser, role: 'empresa', empresaId: 1 },
      query: { id_empresa: '2' }
    };
    
    const res = await inmuebleController.list(req, mockReply() as any);
    expect(res.statusCode).toBe(200);
  });
});