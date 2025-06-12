import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { supabase } from '../libs/supabaseClient';
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
    const { data: permisos, error: permisosError } = await supabase
      .from('roles_permissions')
      .select('permissions(key)')
      .eq('role_id', user.rol_id);
    if (permisosError) return reply.status(500).send({ message: 'Error obteniendo permisos' });
    const permisosList = (permisos || []).map((p: any) => p.permissions?.key).filter(Boolean);

    // Generar el JWT con los datos requeridos
    const token = reply.server.jwt.sign({
      id: user.id,
      nombre: user.nombre,
      role: user.roles?.name,
      permisos: permisosList,
      empresaId: user.empresa_id,
      propietarioId: user.propietarios?.id ?? null,
      inmuebles: user.inmuebles?.map((i: any) => i.id) ?? [],
    });
    return reply.send({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.roles?.name,
        permisos: permisosList,
        empresaId: user.empresa_id,
        propietarioId: user.propietarios?.id ?? null,
        inmuebles: user.inmuebles?.map((i: any) => i.id) ?? [],
      },
    });
  },
  resetPassword: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send({ message: 'Datos requeridos' });
    const { success, error } = await userService.resetPassword(email, password);
    if (error) return reply.status(error.status).send({ message: error.message });
    return reply.send({ success: true });
  },
};
