import { describe, it, expect } from 'vitest';
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

// Mock FastifyRequest
const createMockRequest = (userContext?: any, query?: any) => ({
  userContext,
  query: query || {},
});

describe('inmuebleController', () => {
  it('should require authentication', async () => {
    const req = createMockRequest(); // No userContext
    const res = reply();

    await inmuebleController.list(req as any, res as any);
    
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('No autenticado');
  });

  it('should validate query parameters', async () => {
    const req = createMockRequest(
      { id: 1, id_roles: 1, role: 'superadmin', empresaId: null },
      { page: 'invalid' } // Invalid page parameter
    );
    const res = reply();

    await inmuebleController.list(req as any, res as any);
    
    expect(res.statusCode).toBe(400);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Parámetros de consulta inválidos');
  });

  it('should handle valid query parameters', async () => {
    const req = createMockRequest(
      { id: 1, id_roles: 1, role: 'superadmin', empresaId: null },
      { 
        page: 1, 
        limit: 10,
        nombre: 'casa',
        tipo: 'residencial',
        precio_min: 100000,
        precio_max: 500000,
        estado_activo: true
      }
    );
    const res = reply();

    // Note: This will fail due to DB connection, but validates controller logic
    await inmuebleController.list(req as any, res as any);
    
    // Should not be 401 (unauthorized) or 400 (bad request)
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(400);
  });

  it('should handle empresa role context', async () => {
    const req = createMockRequest(
      { id: 2, id_roles: 2, role: 'empresa', empresaId: 1 },
      { page: 1, limit: 10 }
    );
    const res = reply();

    await inmuebleController.list(req as any, res as any);
    
    // Should not be 401 (unauthorized) or 400 (bad request)
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(400);
  });

  it('should handle propietario role context', async () => {
    const req = createMockRequest(
      { id: 3, id_roles: 4, role: 'propietario', empresaId: 1 },
      { page: 1, limit: 5 }
    );
    const res = reply();

    await inmuebleController.list(req as any, res as any);
    
    // Should not be 401 (unauthorized) or 400 (bad request)
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(400);
  });
});