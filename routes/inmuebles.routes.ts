import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmueblesController } from '../controllers/inmuebles.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmueblesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // Aplicar middleware de autenticación a todas las rutas de inmuebles
  server.addHook('preHandler', authMiddleware);
  
  // GET /inmuebles - Obtener lista de inmuebles según permisos del usuario
  server.get('/', inmueblesController.list);
}