import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import pool from '../libs/db';
import { UserService } from '../services/user.service';

// Nuevo esquema de usuario según la base de datos
const UserSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1),
  email: z.string().email(),
  password_hash: z.string().min(6),
  rol_id: z.number(),
  empresa_id: z.number().nullable().optional(),
});

const userService = new UserService();

export const userController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const { data, error } = await userService.list();
    if (error) return reply.status(500).send({ message: error.message });
    return reply.send(data);
  },
  create: async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = UserSchema.safeParse(req.body);
    if (!parse.success) return reply.status(400).send(parse.error);
    const { data, error } = await userService.create(parse.data);
    if (error) return reply.status(500).send({ message: error.message });
    return reply.status(201).send(data);
  },
  getById: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { data, error } = await userService.getById(id);
    if (error) return reply.status(404).send({ message: error.message });
    return reply.send(data);
  },
  login: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send({ message: 'Email y password requeridos' });
    const { user, error } = await userService.login(email, password);
    if (error) return reply.status(error.status).send({ message: error.message });

    // Obtener permisos del usuario según su rol
    // 1. Buscar los permisos asociados al rol del usuario
    try {
      const permisosQuery = `SELECT p.key FROM roles_permissions rp JOIN permissions p ON rp.id_permission = p.id_permission WHERE rp.id_rol = $1`;
      const { rows: permisosRows } = await pool.query(permisosQuery, [user.id_roles]);
      const permisosList = permisosRows.map((p: any) => p.key);
      // Generar el JWT con los datos requeridos
      const token = reply.server.jwt.sign({
        id: user.id_usuario,
        nombre: user.nombre,
        role: user.rol_name,
        permisos: permisosList,
        empresaId: user.id_empresa,
        propietarioId: user.id_propietario ?? null,
        inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
      });
      return reply.send({
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          email: user.email,
          role: user.rol_name,
          permisos: permisosList,
          empresaId: user.id_empresa,
          propietarioId: user.id_propietario ?? null,
          inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
        },
      });
    } catch (permisosError) {
      return reply.status(500).send({ message: 'Error obteniendo permisos', error: permisosError });
    }
  },
  resetPassword: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send({ message: 'Datos requeridos' });
    const { success, error } = await userService.resetPassword(email, password);
    if (error) return reply.status(error.status).send({ message: error.message });
    return reply.send({ success: true });
  },
};
