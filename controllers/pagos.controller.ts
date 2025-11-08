import { FastifyRequest, FastifyReply } from 'fastify';
import { PagosRepository } from '../repositories/pagos.repository';
import { PagoMovimientoService } from '../services/pagoMovimiento.service';
import { 
  CreatePagoRequest, 
  UpdatePagoRequest, 
  PagosQueryRequest
} from '../schemas/pago.schema';
import { 
  Pago, 
  PagoConMovimiento, 
  DeletePagoResult,
  ResumenPagosReserva
} from '../interfaces/pago.interface';
import { responseHelper } from '../libs/responseHelper';

export class PagosController {

  /**
   * Obtiene todos los pagos de una reserva específica
   */
  static async getPagosByReserva(
    request: FastifyRequest<{ Params: { id_reserva: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const id_reserva = parseInt(request.params.id_reserva);
      
      if (isNaN(id_reserva) || id_reserva <= 0) {
        return responseHelper.error(reply, 'ID de reserva inválido', 400);
      }
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      // Verificar que la reserva pertenece a la empresa del usuario
      const reservaExists = await PagosRepository.existsReservaInEmpresa(id_reserva, id_empresa);
      if (!reservaExists) {
        return responseHelper.error(reply, 'Reserva no encontrada o no pertenece a su empresa', 404);
      }

      const pagos = await PagosRepository.getPagosByReserva(id_reserva);
      
      // Obtener también el resumen financiero
      const resumen = await PagosRepository.getResumenPagosReserva(id_reserva);

      return responseHelper.success(reply, {
        pagos,
        resumen,
        total_pagos: pagos.length
      }, `${pagos.length} pagos encontrados para la reserva`);

    } catch (error) {
      console.error('Error al obtener pagos de reserva:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene pagos con filtros y paginación
   */
  static async getPagosWithFilters(
    request: FastifyRequest<{ Querystring: Record<string, string> }>, 
    reply: FastifyReply
  ) {
    try {
      // Convertir y validar parámetros de query
      const queryParams: PagosQueryRequest = {
        id_reserva: request.query.id_reserva ? parseInt(request.query.id_reserva) : undefined,
        fecha_desde: request.query.fecha_desde,
        fecha_hasta: request.query.fecha_hasta,
        metodo_pago: request.query.metodo_pago as any,
        id_empresa: request.query.id_empresa ? parseInt(request.query.id_empresa) : undefined,
        page: request.query.page ? parseInt(request.query.page) : 1,
        limit: request.query.limit ? parseInt(request.query.limit) : 50
      };
      
      // TODO: Obtener id_empresa del usuario autenticado
      if (!queryParams.id_empresa) {
        queryParams.id_empresa = 1; // Por ahora hardcodeado
      }

      const { pagos, total } = await PagosRepository.getPagosWithFilters(queryParams);
      
      const totalPages = Math.ceil(total / (queryParams.limit || 50));
      const currentPage = queryParams.page || 1;

      return responseHelper.success(reply, {
        pagos,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: total,
          items_per_page: queryParams.limit || 50
        }
      }, `${pagos.length} pagos encontrados`);

    } catch (error) {
      console.error('Error al obtener pagos con filtros:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene un pago específico por ID
   */
  static async getPagoById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, id_empresa);
      if (!pagoExists) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      const pago = await PagosRepository.getPagoById(id);
      
      return responseHelper.success(reply, { pago }, 'Pago encontrado exitosamente');

    } catch (error) {
      console.error('Error al obtener pago por ID:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea un nuevo pago y su movimiento asociado
   */
  static async createPago(
    request: FastifyRequest<{ Body: CreatePagoRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const pagoData = request.body;
      
      // TODO: Obtener id_empresa e id_usuario del usuario autenticado
      if (!pagoData.id_empresa) {
        pagoData.id_empresa = 1; // Por ahora hardcodeado
      }
      
      // Crear el pago
      const pagoCreado = await PagosRepository.createPago(pagoData);
      
      // Intentar crear el movimiento asociado
      let movimientoCreado = false;
      let movimientoId: string | undefined;
      
      try {
        // Obtener el ID del inmueble de la reserva
        const idInmueble = await PagoMovimientoService.obtenerInmuebleDeReserva(pagoData.id_reserva);
        
        if (idInmueble) {
          const movimientoIdResult = await PagoMovimientoService.crearMovimientoDesdePago(pagoCreado, idInmueble);
          if (movimientoIdResult) {
            movimientoId = movimientoIdResult;
            movimientoCreado = true;
          }
        }
      } catch (movimientoError) {
        console.error('Error al crear movimiento asociado:', movimientoError);
        // No fallar la creación del pago si falla el movimiento
      }

      // Obtener resumen actualizado
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoData.id_reserva);

      const resultado: PagoConMovimiento = {
        pago: pagoCreado,
        movimiento_id: movimientoId,
        movimiento_creado: movimientoCreado
      };

      return responseHelper.success(reply, {
        ...resultado,
        resumen_actualizado: resumenActualizado
      }, 'Pago registrado exitosamente', 201);

    } catch (error) {
      console.error('Error al crear pago:', error);
      
      if (error instanceof Error) {
        return responseHelper.error(reply, error.message, 400);
      }
      
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualiza un pago existente
   */
  static async updatePago(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePagoRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }
      
      const updateData = request.body;
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, id_empresa);
      if (!pagoExists) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      const pagoActualizado = await PagosRepository.updatePago(id, updateData);
      
      // Obtener resumen actualizado de la reserva
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoActualizado.id_reserva);

      return responseHelper.success(reply, {
        pago: pagoActualizado,
        resumen_actualizado: resumenActualizado
      }, 'Pago actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar pago:', error);
      
      if (error instanceof Error) {
        return responseHelper.error(reply, error.message, 400);
      }
      
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Elimina un pago y su movimiento asociado
   */
  static async deletePago(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, id_empresa);
      if (!pagoExists) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      // Obtener el pago antes de eliminarlo
      const pagoAEliminar = await PagosRepository.getPagoById(id);
      if (!pagoAEliminar) {
        return responseHelper.error(reply, 'Pago no encontrado', 404);
      }

      // Intentar eliminar movimiento asociado si existe
      let movimientoEliminado = false;
      let movimientoId: string | undefined;
      
      try {
        // TODO: Buscar y eliminar movimiento asociado
        // Por ahora solo eliminamos el pago
      } catch (movimientoError) {
        console.error('Error al eliminar movimiento asociado:', movimientoError);
        // No fallar la eliminación del pago si falla la eliminación del movimiento
      }

      // Eliminar el pago
      await PagosRepository.deletePago(id);

      // Obtener resumen actualizado
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoAEliminar.id_reserva);

      const resultado: DeletePagoResult = {
        pago_eliminado: {
          id: pagoAEliminar.id,
          monto: pagoAEliminar.monto,
          codigo_reserva: pagoAEliminar.codigo_reserva
        },
        movimiento_eliminado: movimientoEliminado ? {
          id: movimientoId!,
          tipo: 'ingreso'
        } : undefined,
        resumen_actualizado: {
          total_pagado: resumenActualizado?.total_pagado || 0,
          total_pendiente: resumenActualizado?.total_pendiente || 0
        }
      };

      return responseHelper.success(reply, resultado, 'Pago eliminado exitosamente');

    } catch (error) {
      console.error('Error al eliminar pago:', error);
      
      if (error instanceof Error) {
        return responseHelper.error(reply, error.message, 400);
      }
      
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene el resumen financiero de una reserva
   */
  static async getResumenReserva(
    request: FastifyRequest<{ Params: { id_reserva: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const id_reserva = parseInt(request.params.id_reserva);
      
      if (isNaN(id_reserva) || id_reserva <= 0) {
        return responseHelper.error(reply, 'ID de reserva inválido', 400);
      }
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      // Verificar que la reserva pertenece a la empresa del usuario
      const reservaExists = await PagosRepository.existsReservaInEmpresa(id_reserva, id_empresa);
      if (!reservaExists) {
        return responseHelper.error(reply, 'Reserva no encontrada o no pertenece a su empresa', 404);
      }

      const resumen = await PagosRepository.getResumenPagosReserva(id_reserva);
      
      if (!resumen) {
        return responseHelper.error(reply, 'No se pudo obtener el resumen de la reserva', 404);
      }

      return responseHelper.success(reply, { resumen }, 'Resumen financiero obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener resumen de reserva:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene pagos de una empresa por fecha específica
   */
  static async getPagosByFecha(
    request: FastifyRequest<{ Querystring: { fecha: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { fecha } = request.query;
      
      // TODO: Obtener id_empresa del usuario autenticado
      const id_empresa = 1; // Por ahora hardcodeado
      
      const pagos = await PagosRepository.getPagosByEmpresaFecha(id_empresa, fecha);
      
      // Calcular total del día
      const totalDia = pagos.reduce((sum, pago) => sum + pago.monto, 0);

      return responseHelper.success(reply, {
        pagos,
        fecha,
        total_pagos: pagos.length,
        total_monto: totalDia
      }, `${pagos.length} pagos encontrados para la fecha ${fecha}`);

    } catch (error) {
      console.error('Error al obtener pagos por fecha:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene estadísticas de pagos por método de pago
   */
  static async getEstadisticasMetodosPago(
    request: FastifyRequest<{ Querystring: Record<string, string> }>, 
    reply: FastifyReply
  ) {
    try {
      // Convertir parámetros de query
      const fecha_inicio = request.query.fecha_inicio;
      const fecha_fin = request.query.fecha_fin;
      const id_empresa = request.query.id_empresa ? parseInt(request.query.id_empresa) : undefined;
      
      // TODO: Obtener id_empresa del usuario autenticado si no se proporciona
      const empresaId = id_empresa || 1; // Por ahora hardcodeado
      
      const estadisticas = await PagosRepository.getEstadisticasMetodosPago(
        empresaId, 
        fecha_inicio, 
        fecha_fin
      );

      // Calcular totales generales
      const totales = estadisticas.reduce((acc, stat) => ({
        total_pagos: acc.total_pagos + stat.cantidad_pagos,
        total_monto: acc.total_monto + stat.total_monto
      }), { total_pagos: 0, total_monto: 0 });

      return responseHelper.success(reply, {
        estadisticas,
        totales,
        periodo: {
          fecha_inicio: fecha_inicio || 'Desde el inicio',
          fecha_fin: fecha_fin || 'Hasta la fecha'
        }
      }, 'Estadísticas obtenidas exitosamente');

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }
}