import { FastifyRequest, FastifyReply } from 'fastify';
import { GetReservasService } from '../services/reservas/getReservasService';
import { CreateReservaService } from '../services/reservas/createReservaService';
import { editReservaService } from '../services/reservas/editReservaService';
import { GetReservasQuery, CreateReservaRequest, EditReservaRequest } from '../interfaces/reserva.interface';
import { successResponse, errorResponse } from '../libs/responseHelper';

export class ReservasController {
  
  /**
   * Controlador para obtener reservas
   * GET /reservas
   */
  async getReservas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const getReservasService = new GetReservasService();
      const filters = request.query as GetReservasQuery;
      
      // Ejecutar el servicio
      const reservas = await getReservasService.execute(filters);
      
      // Respuesta exitosa
      const response = {
        isError: false,
        data: reservas,
        message: 'Reservas obtenidas exitosamente'
      };
      
      reply.code(200).send(response);
    } catch (error) {
      console.error('Error en ReservasController.getReservas:', error);
      
      const response = errorResponse({
        message: 'Error interno del servidor',
        code: 500
      });
      
      reply.code(500).send(response);
    }
  }

  /**
   * Controlador para crear una nueva reserva
   * POST /reservas
   */
  async createReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createReservaService = new CreateReservaService();
      const requestData = request.body as CreateReservaRequest;
      
      // Ejecutar el servicio
      const nuevaReserva = await createReservaService.execute(requestData);
      
      // Respuesta exitosa
      const response = {
        isError: false,
        data: nuevaReserva,
        message: 'Reserva creada exitosamente'
      };
      
      reply.code(201).send(response);
    } catch (error) {
      console.error('Error en ReservasController.createReserva:', error);
      
      // Determinar el código de error apropiado
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error instanceof Error) {
        // Errores de validación devuelven 400
        if (error.message.includes('fecha') || 
            error.message.includes('email') ||
            error.message.includes('precio') ||
            error.message.includes('huéspedes') ||
            error.message.includes('principal') ||
            error.message.includes('documento') ||
            error.message.includes('nacimiento')) {
          statusCode = 400;
          message = error.message;
        }
      }
      
      const response = errorResponse({
        message,
        code: statusCode
      });
      
      reply.code(statusCode).send(response);
    }
  }

  /**
   * Controlador para editar una reserva
   * PUT/PATCH /reservas/:id
   */
  async editReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = Number((request.params as any).id);
      const data = request.body as EditReservaRequest;
      if (!id || isNaN(id)) {
        return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
      }
      const updated = await editReservaService(id, data);
      return reply.code(200).send(successResponse({ data: updated, message: 'Reserva actualizada exitosamente' }));
    } catch (error: any) {
      console.error('Error en ReservasController.editReserva:', error);
      return reply.code(400).send(errorResponse({ message: error.message || 'Error al editar reserva', code: 400 }));
    }
  }

  /**
   * Controlador para anular una reserva
   * DELETE /reservas/:id
   */
  async deleteReserva(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = Number((request.params as any).id);
      if (!id || isNaN(id)) {
        return reply.code(400).send(errorResponse({ message: 'ID de reserva inválido', code: 400 }));
      }
      // Servicio de anulación lógica
      const { deleteReservaService } = await import('../services/reservas/deleteReservaService');
      const result = await deleteReservaService(id);
      return reply.code(200).send(successResponse({ data: result, message: 'Reserva anulada exitosamente' }));
    } catch (error: any) {
      console.error('Error en ReservasController.deleteReserva:', error);
      return reply.code(400).send(errorResponse({ message: error.message || 'Error al anular reserva', code: 400 }));
    }
  }
}

// Exportar una instancia del controlador
export const reservasController = new ReservasController();
