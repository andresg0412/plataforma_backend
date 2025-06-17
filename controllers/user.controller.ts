/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user.interface';
import { UserSchema } from '../schemas/user.schema';
import { checkUserPermission } from '../middlewares/checkUserPermission';
import { successResponse, errorResponse } from '../libs/responseHelper';

const userService = new UserService();

export const userController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    // Solo superadmin, empresa y administrador pueden ver usuarios
    //const ctx = req.userContext;
    //if (!ctx || ctx.role === 'propietario') {
    //  return reply.status(403).send(errorResponse({ message: 'No tiene permisos para ver usuarios', code: 403, error: 'Forbidden' }));
    //}
    const { data, error } = await userService.list();
    console.log('Datos de usuarios:', data);
    // Si no es superadmin, filtrar por empresa y excluir al usuario autenticado
    //if (ctx.role !== 'superadmin') {
    //  const dataFiltrada = data?.filter((u: any) => u.id_empresa === ctx.empresaId && u.id_usuario !== ctx.id);
    //  return reply.send(successResponse(dataFiltrada));
    //}
    // Si es superadmin, también excluye al usuario autenticado
    //const dataFiltrada = data?.filter((u: any) => u.id_usuario !== ctx.id);
    //return reply.send(successResponse(dataFiltrada));
    return reply.send(successResponse(data));
  },
  create: async (req: FastifyRequest, reply: FastifyReply) => {
    //FEATURE: CREAR USUARIO, EXTRAER USERNAME DEL EMAIL ANTES DEL @
    const parse = UserSchema.safeParse(req.body);
    if (!parse.success) return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error }));
    // Validar permisos antes de crear
    //const permiso = checkUserPermission(req, 'crear', {
    //  id_roles: parse.data.id_roles,
    //  id_empresa: parse.data.id_empresa ?? null,
    //});
    //if (!permiso.allowed) {
    //  return reply.status(403).send({ message: permiso.reason || 'No tiene permisos para crear este usuario' });
    //}
    // Refuerzo de seguridad: el backend controla id_roles e id_empresa según el rol autenticado
    let newUser = { ...parse.data };
    //const ctx = req.userContext!;
    //if (ctx.role === 'empresa') {
      // Solo puede crear administradores (3) o propietarios (4) y siempre en su empresa
    //  newUser.id_empresa = ctx.empresaId;
    //  if (![3, 4].includes(newUser.id_roles)) {
    //    return reply.status(400).send({ message: 'Solo puede crear administradores o propietarios' });
    //  }
    //}
    //if (ctx.role === 'administrador') {
      // Solo puede crear propietarios (4) y siempre en su empresa
    //  newUser.id_empresa = ctx.empresaId;
    //  if (newUser.id_roles !== 4) {
    //    return reply.status(400).send({ message: 'Solo puede crear propietarios' });
    //  }
    //}
    // El superadmin puede asignar cualquier empresa y rol
    // El propietario no puede crear usuarios (ya validado antes)
    const { data, error } = await userService.create(newUser);
    if (error) return reply.status(500).send(errorResponse({ message: error.message, code: 500, error }));
    return reply.status(201).send(successResponse(data, 201));
  },
  getById: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { data, error } = await userService.getById(id);
    if (error) return reply.status(404).send(errorResponse({ message: error.message, code: 404, error }));
    // Validar permiso para ver usuario específico
    const permiso = checkUserPermission(req, 'ver', {
      id_roles: data?.id_roles,
      id_empresa: data?.id_empresa ?? null,
    });
    if (!permiso.allowed) {
      return reply.status(403).send(errorResponse({ message: permiso.reason || 'No tiene permisos para ver este usuario', code: 403, error: 'Forbidden' }));
    }
    return reply.send(successResponse(data));
  },
  login: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send(errorResponse({ message: 'Email y password requeridos', code: 400 }));
    const { user, error } = await userService.login(email, password);
    if (error) return reply.status(error.status || 401).send(errorResponse({ message: error.message, code: error.status || 401, error }));
    try {
      const permisosQuery = `SELECT p.key FROM roles_permissions rp JOIN permissions p ON rp.id_permission = p.id_permission WHERE rp.id_rol = $1`;
      const { rows: permisosRows } = await pool.query(permisosQuery, [user.id_roles]);
      const permisosList = permisosRows.map((p: any) => p.key);
      const token = reply.server.jwt.sign({
        id: user.id_usuario,
        nombre: user.nombre,
        id_roles: user.id_roles,
        role: user.rol_name,
        permisos: permisosList,
        empresaId: user.id_empresa,
        propietarioId: user.id_propietario ?? null,
        inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
      });
      return reply.send(successResponse({
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          id_roles: user.id_roles,
          email: user.email,
          role: user.rol_name,
          permisos: permisosList,
          empresaId: user.id_empresa,
          propietarioId: user.id_propietario ?? null,
          inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
        },
      }));
    } catch (permisosError) {
      return reply.status(500).send(errorResponse({ message: 'Error obteniendo permisos', code: 500, error: permisosError }));
    }
  },
  resetPassword: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send(errorResponse({ message: 'Datos requeridos', code: 400 }));
    const { success, error } = await userService.resetPassword(email, password);
    if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status || 500, error }));
    return reply.send(successResponse({ success: true }));
  },
  update: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { data: userTarget, error: errorTarget } = await userService.getById(id);
    if (errorTarget || !userTarget) return reply.status(404).send(errorResponse({ message: 'Usuario no encontrado', code: 404, error: errorTarget }));
    // Validar permisos antes de actualizar
    //const permiso = checkUserPermission(req, 'editar', {
    //  id_roles: userTarget?.id_roles,
    //  id_empresa: userTarget?.id_empresa ?? null,
    //});
    //if (!permiso.allowed) {
    //  return reply.status(403).send(errorResponse({ message: permiso.reason || 'No tiene permisos para editar este usuario', code: 403, error: 'Forbidden' }));
    //}
    // Actualizar usuario
    const result = await userService.update(id, req.body as Partial<Omit<User, 'id_usuario' | 'email' | 'username'>>);
    if (result.error) {
      return reply.status(result.error.status || 500).send(errorResponse({ message: result.error.message, code: result.error.status || 500, error: result.error }));
    }
    return reply.send(successResponse({ success: true, message: 'Usuario actualizado correctamente' }));
  },
  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const result = await userService.delete(id);
    if (result.error) {
      return reply.status(result.error.status || 500).send(errorResponse({ message: result.error.message, code: result.error.status || 500, error: result.error }));
    }
    return reply.send(successResponse({ success: true, message: 'Usuario eliminado correctamente' }));
  },
};
