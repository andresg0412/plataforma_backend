import { FiltrosIngresos, Ingreso } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener ingresos filtrados por fecha e inmueble
 * Combina movimientos tipo "ingreso" con pagos de reservas
 */
export async function getIngresosService(filtros: FiltrosIngresos): Promise<ServiceResponse<Ingreso[]>> {
  try {
    console.log('🔄 Ejecutando getIngresosService con filtros:', filtros);

    // TODO: Implementar consulta real a la base de datos
    // Por ahora devolvemos datos mock para que el frontend funcione
    
    const ingresosMock: Ingreso[] = [
      {
        id: 1,
        fecha: filtros.fecha,
        hora: '09:30',
        concepto: 'reserva',
        descripcion: 'Pago de reserva - Apartamento Centro',
        monto: 300000,
        id_inmueble: 1,
        nombre_inmueble: 'Apartamento Centro Histórico',
        id_reserva: 1,
        codigo_reserva: 'RSV-2024-001',
        metodo_pago: 'transferencia',
        tipo_registro: 'pago',
        fecha_creacion: `${filtros.fecha}T09:30:00Z`,
        comprobante: null
      },
      {
        id: 2,
        fecha: filtros.fecha,
        hora: '14:15',
        concepto: 'deposito_garantia',
        descripcion: 'Depósito de garantía - Casa Zona Norte',
        monto: 150000,
        id_inmueble: 2,
        nombre_inmueble: 'Casa Zona Norte',
        id_reserva: 2,
        codigo_reserva: 'RSV-2024-002',
        metodo_pago: 'efectivo',
        tipo_registro: 'movimiento',
        fecha_creacion: `${filtros.fecha}T14:15:00Z`,
        comprobante: 'COMP-001'
      },
      {
        id: 3,
        fecha: filtros.fecha,
        hora: '16:45',
        concepto: 'limpieza',
        descripcion: 'Pago adicional por limpieza profunda',
        monto: 80000,
        id_inmueble: 3,
        nombre_inmueble: 'Loft Zona Rosa',
        id_reserva: null,
        codigo_reserva: null,
        metodo_pago: 'tarjeta',
        tipo_registro: 'movimiento',
        fecha_creacion: `${filtros.fecha}T16:45:00Z`,
        comprobante: null
      }
    ];

    // Filtrar por inmueble si se especifica
    let ingresosFiltrados = ingresosMock;
    if (filtros.id_inmueble) {
      ingresosFiltrados = ingresosMock.filter(ingreso => ingreso.id_inmueble === filtros.id_inmueble);
    }

    console.log(`✅ ${ingresosFiltrados.length} ingresos encontrados`);

    return { data: ingresosFiltrados, error: null };

  } catch (error) {
    console.error('❌ Error en getIngresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener ingresos',
        status: 500,
        details: error
      }
    };
  }
}