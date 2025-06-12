import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function userRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  server.get('/', { preHandler: [authMiddleware] }, userController.list);
  server.post('/', userController.create); // Registro público
  server.get('/:id', { preHandler: [authMiddleware] }, userController.getById);
  server.post('/login', userController.login); // Nuevo endpoint de login
  server.post('/reset-password', userController.resetPassword); // Endpoint de recuperación de contraseña
}
