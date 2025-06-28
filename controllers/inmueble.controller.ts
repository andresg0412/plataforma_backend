/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getInmuebles } from '../services/inmuebles/getInmueblesService';
import { InmuebleFiltersSchema } from '../schemas/inmueble.schema';

export const inmuebleController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ 
        message: 'No autenticado', 
        code: 401, 
        error: 'Unauthorized' 
      }));
    }

    // Validar query parameters
    const filtersValidation = InmuebleFiltersSchema.safeParse(req.query);
    if (!filtersValidation.success) {
      return reply.status(400).send(errorResponse({ 
        message: 'Parámetros de consulta inválidos', 
        code: 400, 
        error: filtersValidation.error 
      }));
    }

    try {
      const { data, error } = await getInmuebles(ctx.id, filtersValidation.data);
      
      if (error) {
        return reply.status(403).send(errorResponse({ 
          message: error.message, 
          code: 403, 
          error: 'Forbidden' 
        }));
      }
      
      return reply.send(successResponse(data));
    } catch (err) {
      console.error('Error en inmuebleController.list:', err);
      return reply.status(500).send(errorResponse({ 
        message: 'Error al obtener inmuebles', 
        code: 500, 
        error: err 
      }));
    }
  }
};