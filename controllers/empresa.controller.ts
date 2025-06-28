/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getEmpresas } from '../services/empresas/getEmpresasService';


export const empresaController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    // enviar peticion al repositorio de empresas
    //responder con la lista de empresas
    const { data, error } = await getEmpresas();
    if (error) {
      return reply.status(403).send(errorResponse({ message: error.message, code: 403, error: 'Forbidden' }));
    }
    return reply.send(successResponse(data));
  },
};
