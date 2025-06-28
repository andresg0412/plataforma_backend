import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmuebleController } from '../controllers/inmueble.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmuebleRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // Eliminar inmueble (eliminación lógica)
  server.delete('/:id', { preHandler: [authMiddleware] }, inmuebleController.delete);
}