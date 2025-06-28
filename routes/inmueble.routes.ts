import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { inmuebleController } from '../controllers/inmueble.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function inmuebleRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  server.get('/', { preHandler: [authMiddleware] }, inmuebleController.list);
}