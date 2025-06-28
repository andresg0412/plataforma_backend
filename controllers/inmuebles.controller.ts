/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getInmueblesService } from '../services/inmuebles/getInmueblesService';

interface InmueblesQueryParams {
  id_empresa?: string;
}

export const inmueblesController = {
  list: async (req: FastifyRequest<{ Querystring: InmueblesQueryParams }>, reply: FastifyReply) => {
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
      // Obtener el parámetro id_empresa del query string si existe
      const idEmpresa = req.query.id_empresa ? parseInt(req.query.id_empresa, 10) : undefined;

      // Validar que id_empresa sea un número válido si se proporciona
      if (req.query.id_empresa && (isNaN(idEmpresa!) || idEmpresa! <= 0)) {
        return reply.status(400).send(
          errorResponse({ 
            message: 'El parámetro id_empresa debe ser un número válido', 
            code: 400, 
            error: 'Bad Request' 
          })
        );
      }

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