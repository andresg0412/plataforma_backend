/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getPropietariosService } from '../services/propietarios/getPropietariosService';
import { GetPropietariosQuerySchema } from '../schemas/propietario.schema';

export const propietarioController = {
  getPropietarios: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validar query parameters
      const queryValidation = GetPropietariosQuerySchema.safeParse(req.query);
      
      if (!queryValidation.success) {
        console.error('Error al validar query params:', queryValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'Parámetros de consulta inválidos', 
            code: 400, 
            error: queryValidation.error 
          })
        );
      }

      const { id_empresa } = queryValidation.data;

      console.log('Obteniendo propietarios con filtros:', { id_empresa });
      
      // Llamar al servicio
      const { data, error } = await getPropietariosService(id_empresa);
      
      if (error) {
        console.error('Error al obtener propietarios:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Propietarios obtenidos exitosamente:', data?.length || 0, 'registros');
      return reply.send(successResponse(data));
      
    } catch (err) {
      console.error('Error inesperado en getPropietarios:', err);
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
