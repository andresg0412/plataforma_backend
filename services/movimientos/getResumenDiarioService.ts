import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { ResumenDiario } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener resumen diario por fecha y empresa
 */
export async function getResumenDiarioService(
  empresaId: string,
  fecha: string
): Promise<ServiceResponse<ResumenDiario>> {
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

    // Obtener resumen
    const resumen = await MovimientosRepository.getResumenDiario(fecha, empresaId);

    return {
      data: resumen,
      error: null
    };

  } catch (error) {
    console.error('Error en getResumenDiarioService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener resumen diario',
        status: 500,
        details: error
      }
    };
  }
}