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
  },
};