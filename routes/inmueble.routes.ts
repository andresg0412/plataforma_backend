import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmuebleController } from '../controllers/inmueble.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmuebleRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /inmuebles - listar inmuebles según permisos del usuario
  server.get('/', { preHandler: [authMiddleware] }, inmuebleController.list);
  
  // GET /inmuebles/:id_inmueble - obtener inmueble específico
  server.get('/:id_inmueble', { preHandler: [authMiddleware] }, inmuebleController.getById);
  
  // PUT /inmuebles/:id_inmueble - actualizar inmueble
  server.put('/:id_inmueble', { preHandler: [authMiddleware] }, inmuebleController.update);
  // Crear inmueble - requiere autenticación
  server.post('/', { preHandler: [authMiddleware] }, inmuebleController.create);
}