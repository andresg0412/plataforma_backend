import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { propietarioController } from '../controllers/propietario.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function propietariosRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /api/propietarios/getPropietarios
  //server.get('/getPropietarios', { preHandler: [authMiddleware] }, propietarioController.getPropietarios);
  server.get('/getPropietarios', propietarioController.getPropietarios);
}
