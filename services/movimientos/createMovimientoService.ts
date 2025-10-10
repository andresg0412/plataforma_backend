import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { CreateMovimientoData, Movimiento, isConceptoValido } from '../../interfaces/movimiento.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para crear un nuevo movimiento
 */
export async function createMovimientoService(
  data: CreateMovimientoData
): Promise<ServiceResponse<Movimiento>> {
  try {
    // Validar concepto según tipo
    if (!isConceptoValido(data.tipo, data.concepto)) {
      return {
        data: null,
        error: {
          message: 'Concepto inválido',
          status: 400,
          details: `El concepto '${data.concepto}' no es válido para el tipo '${data.tipo}'`
        }
      };
    }

    // Verificar que la empresa existe
    const empresaExists = await MovimientosRepository.existsEmpresa(data.id_empresa);
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

    // Verificar que el inmueble existe y pertenece a la empresa
    const inmuebleExists = await MovimientosRepository.existsInmuebleInEmpresa(
      data.id_inmueble, 
      data.id_empresa
    );
    if (!inmuebleExists) {
      return {
        data: null,
        error: {
          message: 'Inmueble no encontrado',
          status: 404,
          details: 'El inmueble especificado no existe o no pertenece a la empresa'
        }
      };
    }

    // Si se especifica reserva, verificar que existe y pertenece a la empresa
    if (data.id_reserva) {
      const reservaExists = await MovimientosRepository.existsReservaInEmpresa(
        data.id_reserva, 
        data.id_empresa
      );
      if (!reservaExists) {
        return {
          data: null,
          error: {
            message: 'Reserva no encontrada',
            status: 404,
            details: 'La reserva especificada no existe o no pertenece a la empresa'
          }
        };
      }
    }

    // Crear el movimiento
    const movimiento = await MovimientosRepository.createMovimiento(data);

    return {
      data: movimiento,
      error: null
    };

  } catch (error) {
    console.error('Error en createMovimientoService:', error);
    return {
      data: null,
      error: {
        message: 'Error al crear movimiento',
        status: 500,
        details: error
      }
    };
  }
}