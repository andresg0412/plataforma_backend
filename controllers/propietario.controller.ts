/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getPropietariosService } from '../services/propietarios/getPropietariosService';
import { createPropietarioService } from '../services/propietarios/createPropietarioService';
import { editPropietarioService } from '../services/propietarios/editPropietarioService';
import { 
  GetPropietariosQuerySchema, 
  CreatePropietarioSchema, 
  EditPropietarioSchema,
  EditPropietarioQuerySchema 
} from '../schemas/propietario.schema';

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

  createPropietario: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verificar autenticación
    const ctx = req.userContext;
      if (!ctx || !ctx.id) {
        return reply.status(401).send(
          errorResponse({ 
            message: 'No autenticado', 
            code: 401, 
            error: 'Unauthorized' 
          })
        );
      }

      // Validar datos del body
      const bodyValidation = CreatePropietarioSchema.safeParse(req.body);
      
      if (!bodyValidation.success) {
        console.error('Error al validar datos del propietario:', bodyValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'Datos de propietario inválidos', 
            code: 400, 
            error: bodyValidation.error 
          })
        );
      }

      const propietarioData = bodyValidation.data;

      console.log('Creando propietario:', { 
        email: propietarioData.email, 
        nombre: propietarioData.nombre,
        id_empresa: propietarioData.id_empresa 
      });
      
      // Llamar al servicio
      const { data, error } = await createPropietarioService(Number(ctx.id), propietarioData);
      
      if (error) {
        console.error('Error al crear propietario:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Propietario creado exitosamente:', data?.id);
      return reply.status(201).send(
        successResponse(data, 201)
      );
      
    } catch (err) {
      console.error('Error inesperado en createPropietario:', err);
      return reply.status(500).send(
        errorResponse({ 
          message: 'Error interno del servidor', 
          code: 500, 
          error: err 
        })
      );
    }
  },

  editPropietario: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verificar autenticación
      const ctx = req.userContext;
      if (!ctx || !ctx.id) {
        return reply.status(401).send(
          errorResponse({ 
            message: 'No autenticado', 
            code: 401, 
            error: 'Unauthorized' 
          })
        );
      }

      // Validar query parameters (id del propietario)
      const queryValidation = EditPropietarioQuerySchema.safeParse({
        id: parseInt((req.query as any)?.id)
      });
      
      if (!queryValidation.success) {
        console.error('Error al validar query params:', queryValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'ID de propietario inválido', 
            code: 400, 
            error: queryValidation.error 
          })
        );
      }

      // Validar datos del body
      const bodyValidation = EditPropietarioSchema.safeParse(req.body);
      
      if (!bodyValidation.success) {
        console.error('Error al validar datos del propietario:', bodyValidation.error);
        return reply.status(400).send(
          errorResponse({ 
            message: 'Datos de propietario inválidos', 
            code: 400, 
            error: bodyValidation.error 
          })
        );
      }

      const { id: propietarioId } = queryValidation.data;
      const propietarioData = bodyValidation.data;

      console.log('Editando propietario:', { 
        propietarioId,
        email: propietarioData.email, 
        nombre: propietarioData.nombre,
        id_empresa: propietarioData.id_empresa 
      });
      
      // Llamar al servicio
      const { data, error } = await editPropietarioService(
        Number(ctx.id), 
        propietarioId, 
        propietarioData
      );
      
      if (error) {
        console.error('Error al editar propietario:', error);
        return reply.status(error.status || 500).send(
          errorResponse({ 
            message: error.message, 
            code: error.status || 500, 
            error: error.details 
          })
        );
      }

      console.log('Propietario editado exitosamente:', data?.id);
      return reply.send(successResponse(data));
      
    } catch (err) {
      console.error('Error inesperado en editPropietario:', err);
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
