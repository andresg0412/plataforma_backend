
/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { InmuebleDeleteSchema } from '../schemas/inmueble.schema';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { deleteInmuebleService } from '../services/inmuebles/deleteInmuebleService';

export const inmuebleController = {
  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ 
        message: 'No autenticado', 
        code: 401, 
        error: 'Unauthorized' 
      }));
    }

    // Validar parámetros
    const { id } = req.params as { id: string };
    const parseResult = InmuebleDeleteSchema.safeParse({ id_inmueble: id });
    
    if (!parseResult.success) {
      return reply.status(400).send(errorResponse({ 
        message: 'ID de inmueble inválido', 
        code: 400, 
        error: parseResult.error 
      }));
    }

    const inmuebleId = parseResult.data.id_inmueble;

    // Llamar al servicio
    const result = await deleteInmuebleService(ctx.id, inmuebleId);
    
    if (result.error) {
      return reply.status(result.error.status || 403).send(errorResponse({ 
        message: result.error.message, 
        code: result.error.status || 403, 

        error: result.error 
      }));
    }

    return reply.send(successResponse({ 
      success: true, 
      message: 'Inmueble eliminado correctamente' 
    }));
    const responseData = 'data' in result ? result.data : result;
    return reply.status(201).send(successResponse(responseData, 201));
  }
  update: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id_inmueble } = req.params as { id_inmueble: string };
    
    // Validar entrada
    try {
      InmuebleUpdateSchema.parse(req.body);
    } catch (validationError: any) {
      const errorMessages = validationError.errors?.map((e: any) => e.message).join(', ') || 'Datos inválidos';
      return reply.status(400).send(errorResponse({ 
        message: `Errores de validación: ${errorMessages}`, 
        code: 400 
      }));
    }

    // Obtener contexto del usuario del token JWT
    const userContext = {
      role: (req as any).user?.role || '',
      empresaId: (req as any).user?.empresaId,
      propietarioId: (req as any).user?.propietarioId,
    };

    // Validar que el usuario tenga los datos necesarios
    if (!userContext.role) {
      return reply.status(401).send(errorResponse({ 
        message: 'Usuario no autenticado o token inválido', 
        code: 401 
      }));
    }

    try {
      const result = await inmuebleService.update(id_inmueble, req.body as any, userContext);
      
      if (result.error) {
        return reply.status(result.error.status || 500).send(errorResponse({ 
          message: result.error.message, 
          code: result.error.status || 500, 
          error: result.error 
        }));
      }

      return reply.send(successResponse({ success: true, message: 'Inmueble actualizado exitosamente' }));
    } catch (error: any) {
      return reply.status(500).send(errorResponse({ 
        message: 'Error interno del servidor', 
        code: 500, 
        error: error.message 
      }));
    }
  },

  getById: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id_inmueble } = req.params as { id_inmueble: string };

    // Obtener contexto del usuario del token JWT
    const userContext = {
      role: (req as any).user?.role || '',
      empresaId: (req as any).user?.empresaId,
      propietarioId: (req as any).user?.propietarioId,
    };

    if (!userContext.role) {
      return reply.status(401).send(errorResponse({ 
        message: 'Usuario no autenticado o token inválido', 
        code: 401 
      }));
    }

    try {
      const { data, error } = await inmuebleService.getById(id_inmueble);
      
      if (error || !data) {
        return reply.status(404).send(errorResponse({ 
          message: 'Inmueble no encontrado', 
          code: 404, 
          error 
        }));
      }

      // Verificar permisos para ver el inmueble
      const permissionCheck = inmuebleService.checkViewPermission(data, userContext);
      if (!permissionCheck.allowed) {
        return reply.status(403).send(errorResponse({ 
          message: permissionCheck.reason || 'No tiene permisos para ver este inmueble', 
          code: 403 
        }));
      }

      return reply.send(successResponse(data));
    } catch (error: any) {
      return reply.status(500).send(errorResponse({ 
        message: 'Error interno del servidor', 
        code: 500, 
        error: error.message 
      }));
    }
  },

  list: async (req: FastifyRequest, reply: FastifyReply) => {
    // Obtener contexto del usuario del token JWT
    const userContext = {
      role: (req as any).user?.role || '',
      empresaId: (req as any).user?.empresaId,
      propietarioId: (req as any).user?.propietarioId,
    };

    if (!userContext.role) {
      return reply.status(401).send(errorResponse({ 
        message: 'Usuario no autenticado o token inválido', 
        code: 401 
      }));
    }

    try {
      const { data, error } = await inmuebleService.list(userContext);
      
      if (error) {
        return reply.status(500).send(errorResponse({ 
          message: 'Error obteniendo inmuebles', 
          code: 500, 
          error 
        }));
      }

      return reply.send(successResponse(data || []));
    } catch (error: any) {
      return reply.status(500).send(errorResponse({ 
        message: 'Error interno del servidor', 
        code: 500, 
        error: error.message 
      }));
    }
  },
};