import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmueblesController } from '../controllers/inmuebles.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmueblesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /inmuebles - Obtener lista de inmuebles según permisos del usuario (requiere autenticación)
  server.get('/', { preHandler: [authMiddleware] }, inmueblesController.list);
}