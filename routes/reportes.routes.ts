import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { movimientosController } from '../controllers/movimientos.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function reportesRoutes(server: FastifyInstance, opts: FastifyPluginOptions) {
  // GET /reportes/por-plataforma?fecha_inicio={fecha_inicio}&fecha_fin={fecha_fin}&empresa_id={empresa_id} - Reporte por plataforma
  server.get('/por-plataforma', { preHandler: [authMiddleware] }, movimientosController.reportePorPlataforma);
}