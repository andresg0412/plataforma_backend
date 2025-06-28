import { describe, it, expect, vi } from 'vitest';
import { inmuebleController } from '../controllers/inmueble.controller';

// Mock FastifyReply
const mockReply = () => {
  let statusCode = 200;
  let payload: any;
  return {
    status: (code: number) => { statusCode = code; return mockReply(); },
    send: (data: any) => { payload = data; return { statusCode, payload }; },
  };
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
    
    // Mock the service response
    vi.mock('../services/inmueble.service', () => ({
      InmuebleService: vi.fn().mockImplementation(() => ({
        getAllInmuebles: vi.fn().mockResolvedValue({
          data: [{ id: 1, direccion: 'Test Address' }],
          error: null
        })
      }))
    }));

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
});