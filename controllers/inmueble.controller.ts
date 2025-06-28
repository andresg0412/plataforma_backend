import { FastifyRequest, FastifyReply } from 'fastify';
import { InmuebleSchema } from '../schemas/inmueble.schema';
import { CreateInmuebleService } from '../services/inmuebles/createInmuebleService';
import { successResponse, errorResponse } from '../libs/responseHelper';

const createInmuebleService = new CreateInmuebleService();

export const inmuebleController = {
  create: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
    }

    const parse = InmuebleSchema.safeParse(req.body);
    if (!parse.success) {
      console.error('Error al validar datos de inmueble:', parse.error);
      return reply.status(400).send(errorResponse({ 
        message: 'Datos inválidos', 
        code: 400, 
        error: parse.error.errors 
      }));
    }

    const result = await createInmuebleService.execute(Number(ctx.id), parse.data);
    
    if (result.error) {
      console.error('Error al crear inmueble:', result.error);
      return reply.status(result.error.status || 400).send(errorResponse({ 
        message: result.error.message, 
        code: result.error.status || 400, 
        error: result.error 
      }));
    }

    const responseData = 'data' in result ? result.data : result;
    return reply.status(201).send(successResponse(responseData, 201));
  }
};