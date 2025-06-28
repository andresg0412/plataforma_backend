import { FastifyRequest, FastifyReply } from 'fastify';
import { InmuebleService } from '../services/inmueble.service';

const inmuebleService = new InmuebleService();

export const inmuebleController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get authenticated user from JWT
      const user = req.user as any;
      const { id_empresa } = req.query as { id_empresa?: string };

      let data, error;

      // Role-based access control logic
      if (user.role === 'superadmin') {
        if (id_empresa) {
          // Superadmin with id_empresa - filter by empresa
          ({ data, error } = await inmuebleService.getInmueblesByEmpresa(parseInt(id_empresa)));
        } else {
          // Superadmin without id_empresa - get all inmuebles
          ({ data, error } = await inmuebleService.getAllInmuebles());
        }
      } else if (user.role === 'empresa' || user.role === 'administrador') {
        // For empresa and administrador roles, use the empresa from their profile
        const empresaId = id_empresa ? parseInt(id_empresa) : user.empresaId;
        if (!empresaId) {
          return reply.status(400).send({ message: 'ID de empresa requerido' });
        }
        ({ data, error } = await inmuebleService.getInmueblesByEmpresa(empresaId));
      } else if (user.role === 'propietario') {
        // For propietario role, filter by both empresa and propietario
        const empresaId = id_empresa ? parseInt(id_empresa) : user.empresaId;
        if (!empresaId) {
          return reply.status(400).send({ message: 'ID de empresa requerido' });
        }
        if (!user.propietarioId) {
          return reply.status(400).send({ message: 'Usuario no tiene propietario asociado' });
        }
        ({ data, error } = await inmuebleService.getInmueblesByEmpresaAndPropietario(empresaId, user.propietarioId));
      } else {
        return reply.status(403).send({ message: 'No autorizado para consultar inmuebles' });
      }

      if (error) {
        return reply.status(500).send({ message: error.message });
      }

      return reply.send(data);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  },
};