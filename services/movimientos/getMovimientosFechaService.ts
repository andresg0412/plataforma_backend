import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { Movimiento } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener movimientos por fecha y empresa
 */
export async function getMovimientosFechaService(
  empresaId: string,
  fecha: string
): Promise<ServiceResponse<Movimiento[]>> {
  try {
    // Verificar que la empresa existe
    const empresaExists = await MovimientosRepository.existsEmpresa(empresaId);
    if (!empresaExists) {
      return {
        data: null,
        error: {
          message: 'Empresa no encontrada',
          status: 404,
          details: 'La empresa especificada no existe'
        }
      };
    }

    // Obtener movimientos
    const movimientos = await MovimientosRepository.getMovimientosByFecha(fecha, empresaId);

    return {
      data: movimientos,
      error: null
    };

  } catch (error) {
    console.error('Error en getMovimientosFechaService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener movimientos',
        status: 500,
        details: error
      }
    };
  }
}