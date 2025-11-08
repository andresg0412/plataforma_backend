import { MovimientosRepository } from '../repositories/movimientos.repository';
import { PagosRepository } from '../repositories/pagos.repository';
import { CreateMovimientoData } from '../interfaces/movimiento.interface';
import { Pago } from '../interfaces/pago.interface';

/**
 * Servicio para manejar la integración entre pagos y movimientos
 * Siguiendo el principio de responsabilidad única
 */
export class PagoMovimientoService {

  /**
   * Crea un movimiento de ingreso a partir de un pago
   */
  static async crearMovimientoDesdePago(pago: Pago, idInmueble: string): Promise<string | null> {
    try {
      // Obtener información adicional de la reserva si es necesario
      const resumenReserva = await PagosRepository.getResumenPagosReserva(pago.id_reserva);
      
      if (!resumenReserva) {
        throw new Error('No se pudo obtener información de la reserva');
      }

      const movimientoData: CreateMovimientoData = {
        fecha: pago.fecha_pago,
        tipo: 'ingreso',
        concepto: PagoMovimientoService.mapearConceptoPagoAMovimiento(pago.concepto),
        descripcion: PagoMovimientoService.generarDescripcionMovimiento(pago, resumenReserva.codigo_reserva),
        monto: pago.monto,
        id_inmueble: idInmueble,
        id_reserva: pago.id_reserva.toString(),
        metodo_pago: pago.metodo_pago,
        comprobante: pago.comprobante || null,
        id_empresa: pago.id_empresa.toString(),
        plataforma_origen: null // TODO: Obtener de la reserva si está disponible
      };

      const movimiento = await MovimientosRepository.createMovimiento(movimientoData);
      return movimiento.id || null;

    } catch (error) {
      console.error('Error al crear movimiento desde pago:', error);
      return null;
    }
  }

  /**
   * Elimina un movimiento asociado a un pago
   */
  static async eliminarMovimientoAsociado(pagoId: number): Promise<boolean> {
    try {
      // TODO: Implementar búsqueda de movimiento por ID de pago
      // Por ahora, necesitamos agregar un campo id_pago a la tabla movimientos
      // o implementar una tabla de relación
      
      console.log(`TODO: Eliminar movimiento asociado al pago ${pagoId}`);
      return true;

    } catch (error) {
      console.error('Error al eliminar movimiento asociado:', error);
      return false;
    }
  }

  /**
   * Actualiza un movimiento cuando se actualiza el pago asociado
   */
  static async actualizarMovimientoAsociado(pago: Pago, movimientoId: string): Promise<boolean> {
    try {
      const resumenReserva = await PagosRepository.getResumenPagosReserva(pago.id_reserva);
      
      if (!resumenReserva) {
        throw new Error('No se pudo obtener información de la reserva');
      }

      const updateData = {
        fecha: pago.fecha_pago,
        concepto: PagoMovimientoService.mapearConceptoPagoAMovimiento(pago.concepto),
        descripcion: PagoMovimientoService.generarDescripcionMovimiento(pago, resumenReserva.codigo_reserva),
        monto: pago.monto,
        metodo_pago: pago.metodo_pago,
        comprobante: pago.comprobante || null
      };

      await MovimientosRepository.updateMovimiento(movimientoId, updateData);
      return true;

    } catch (error) {
      console.error('Error al actualizar movimiento asociado:', error);
      return false;
    }
  }

  /**
   * Obtiene el ID del inmueble asociado a una reserva
   */
  static async obtenerInmuebleDeReserva(idReserva: number): Promise<string | null> {
    try {
      // TODO: Implementar consulta para obtener id_inmueble de la reserva
      // Por ahora retornamos un valor por defecto
      return '1';
      
    } catch (error) {
      console.error('Error al obtener inmueble de reserva:', error);
      return null;
    }
  }

  /**
   * Verifica la integridad entre pagos y movimientos
   */
  static async verificarIntegridadPagos(idReserva: number): Promise<{
    pagos_sin_movimiento: number[];
    movimientos_sin_pago: string[];
    discrepancias: any[];
  }> {
    try {
      // TODO: Implementar verificación de integridad
      // Comparar pagos vs movimientos para detectar inconsistencias
      
      return {
        pagos_sin_movimiento: [],
        movimientos_sin_pago: [],
        discrepancias: []
      };

    } catch (error) {
      console.error('Error al verificar integridad:', error);
      throw error;
    }
  }

  /**
   * Mapea el concepto de un pago al concepto de movimiento equivalente
   */
  private static mapearConceptoPagoAMovimiento(conceptoPago: string): string {
    const mapeoConceptos: Record<string, string> = {
      'abono_inicial': 'reserva',
      'saldo_final': 'reserva',
      'deposito_garantia': 'deposito_garantia',
      'servicios_adicionales': 'servicios_adicionales',
      'limpieza_extra': 'limpieza',
      'gastos_adicionales': 'servicios_adicionales',
      'penalidad': 'multa',
      'otro': 'otro'
    };

    return mapeoConceptos[conceptoPago] || 'reserva';
  }

  /**
   * Genera una descripción descriptiva para el movimiento
   */
  private static generarDescripcionMovimiento(pago: Pago, codigoReserva: string): string {
    let descripcion = `Pago de reserva ${codigoReserva}`;
    
    if (pago.concepto && pago.concepto !== 'otro') {
      descripcion += ` - ${pago.concepto.replace('_', ' ')}`;
    }

    if (pago.descripcion && pago.descripcion.trim()) {
      descripcion += ` - ${pago.descripcion.trim()}`;
    }

    if (pago.comprobante && pago.comprobante.trim()) {
      descripcion += ` (Comprobante: ${pago.comprobante.trim()})`;
    }

    return descripcion;
  }

  /**
   * Sincroniza todos los pagos de una reserva con sus movimientos
   */
  static async sincronizarPagosReserva(idReserva: number): Promise<{
    pagos_procesados: number;
    movimientos_creados: number;
    errores: string[];
  }> {
    try {
      const pagos = await PagosRepository.getPagosByReserva(idReserva);
      const idInmueble = await this.obtenerInmuebleDeReserva(idReserva);
      
      if (!idInmueble) {
        throw new Error('No se pudo obtener el inmueble de la reserva');
      }

      let movimientosCreados = 0;
      const errores: string[] = [];

      for (const pago of pagos) {
        try {
          const movimientoId = await this.crearMovimientoDesdePago(pago, idInmueble);
          if (movimientoId) {
            movimientosCreados++;
          } else {
            errores.push(`No se pudo crear movimiento para pago ${pago.id}`);
          }
        } catch (error) {
          errores.push(`Error procesando pago ${pago.id}: ${error}`);
        }
      }

      return {
        pagos_procesados: pagos.length,
        movimientos_creados: movimientosCreados,
        errores
      };

    } catch (error) {
      console.error('Error al sincronizar pagos de reserva:', error);
      throw error;
    }
  }

  /**
   * Calcula el resumen de ingresos por pagos para una fecha específica
   */
  static async calcularIngresosPorFecha(empresaId: number, fecha: string): Promise<{
    total_ingresos_pagos: number;
    cantidad_pagos: number;
    metodos_pago: Record<string, { cantidad: number; total: number }>;
  }> {
    try {
      const pagos = await PagosRepository.getPagosByEmpresaFecha(empresaId, fecha);
      
      const totalIngresos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
      const cantidadPagos = pagos.length;

      // Agrupar por método de pago
      const metodosPago: Record<string, { cantidad: number; total: number }> = {};
      
      pagos.forEach(pago => {
        if (!metodosPago[pago.metodo_pago]) {
          metodosPago[pago.metodo_pago] = { cantidad: 0, total: 0 };
        }
        metodosPago[pago.metodo_pago].cantidad++;
        metodosPago[pago.metodo_pago].total += pago.monto;
      });

      return {
        total_ingresos_pagos: totalIngresos,
        cantidad_pagos: cantidadPagos,
        metodos_pago: metodosPago
      };

    } catch (error) {
      console.error('Error al calcular ingresos por fecha:', error);
      throw error;
    }
  }
}