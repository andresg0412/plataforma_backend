import { describe, it, expect, vi } from 'vitest';
import { inmuebleController } from '../controllers/inmueble.controller';

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
  it('should return 401 for unauthenticated update request', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },
      body: { 
        direccion: 'Calle 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        tipo_inmueble: 'Apartamento',
        area: 80,
        estado: 'Disponible'
      },
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.update(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });

  it('should return 400 for invalid data', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },
      body: { 
        area: -5, // Área negativa (inválida)
      },
      user: {
        role: 'superadmin',
        empresaId: 1,
        propietarioId: null
      }
    };
    const res = reply();
    await inmuebleController.update(req, res as any);
    expect(res.statusCode).toBe(400);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toContain('Errores de validación');
  });

  it('should return 401 for unauthenticated getById request', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.getById(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });

  it('should return 401 for unauthenticated list request', async () => {
    const req: any = { 
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.list(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });
});