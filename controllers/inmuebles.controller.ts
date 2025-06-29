/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getInmueblesService } from '../services/inmuebles/getInmueblesService';
import { InmueblesQuerySchema } from '../schemas/inmueble.schema';

export const inmueblesController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    
    // Verificar que el usuario esté autenticado
    if (!ctx || !ctx.id) {
      return reply.status(401).send(
        errorResponse({ 
          message: 'No autenticado', 
          code: 401, 
          error: 'Unauthorized' 
        })
      );
    }

    try {
      // Validar query parameters usando Zod schema
      const queryValidation = InmueblesQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return reply.status(400).send(
          errorResponse({ 
            message: 'Parámetros de consulta inválidos', 
            code: 400, 
            error: queryValidation.error.errors 
          })
        );
      }

      const { id_empresa } = queryValidation.data;
      const idEmpresa = id_empresa ?? undefined;

      // Llamar al servicio para obtener los inmuebles
      const { data, error } = await getInmueblesService(ctx, idEmpresa);
      
      if (error) {
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details || 'Internal Server Error' 
          })
        );
      }

      return reply.send(successResponse(data));
    } catch (err) {
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },
};