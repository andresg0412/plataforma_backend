import { FiltrosEgresos, Egreso } from '../../interfaces/egreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener egresos filtrados por fecha e inmueble
 * Solo movimientos tipo "egreso"
 */
export async function getEgresosService(filtros: FiltrosEgresos): Promise<ServiceResponse<Egreso[]>> {
  try {
    console.log('🔄 Ejecutando getEgresosService con filtros:', filtros);

    // TODO: Implementar consulta real a la base de datos
    // Por ahora devolvemos datos mock para que el frontend funcione
    
    const egresosMock: Egreso[] = [
      {
        id: 1,
        fecha: filtros.fecha,
        hora: '08:30',
        concepto: 'mantenimiento',
        descripcion: 'Reparación de aire acondicionado',
        monto: 120000,
        id_inmueble: 1,
        nombre_inmueble: 'Apartamento Centro Histórico',
        id_reserva: null,
        codigo_reserva: null,
        metodo_pago: 'transferencia',
        fecha_creacion: `${filtros.fecha}T08:30:00Z`,
        comprobante: 'FACT-001'
      },
      {
        id: 2,
        fecha: filtros.fecha,
        hora: '10:15',
        concepto: 'limpieza',
        descripcion: 'Servicio de limpieza profunda',
        monto: 80000,
        id_inmueble: 2,
        nombre_inmueble: 'Casa Zona Norte',
        id_reserva: 2,
        codigo_reserva: 'RSV-2024-002',
        metodo_pago: 'efectivo',
        fecha_creacion: `${filtros.fecha}T10:15:00Z`,
        comprobante: null
      },
      {
        id: 3,
        fecha: filtros.fecha,
        hora: '13:45',
        concepto: 'servicios_publicos',
        descripcion: 'Factura de servicios públicos - Abril',
        monto: 150000,
        id_inmueble: 3,
        nombre_inmueble: 'Loft Zona Rosa',
        id_reserva: null,
        codigo_reserva: null,
        metodo_pago: 'transferencia',
        fecha_creacion: `${filtros.fecha}T13:45:00Z`,
        comprobante: 'SERV-001'
      },
      {
        id: 4,
        fecha: filtros.fecha,
        hora: '15:20',
        concepto: 'suministros',
        descripcion: 'Compra de amenities para huéspedes',
        monto: 45000,
        id_inmueble: 1,
        nombre_inmueble: 'Apartamento Centro Histórico',
        id_reserva: null,
        codigo_reserva: null,
        metodo_pago: 'tarjeta',
        fecha_creacion: `${filtros.fecha}T15:20:00Z`,
        comprobante: null
      },
      {
        id: 5,
        fecha: filtros.fecha,
        hora: '17:10',
        concepto: 'comision',
        descripcion: 'Comisión plataforma Airbnb',
        monto: 35000,
        id_inmueble: 2,
        nombre_inmueble: 'Casa Zona Norte',
        id_reserva: 3,
        codigo_reserva: 'RSV-2024-003',
        metodo_pago: 'otro',
        fecha_creacion: `${filtros.fecha}T17:10:00Z`,
        comprobante: 'COM-001'
      }
    ];

    // Filtrar por inmueble si se especifica
    let egresosFiltrados = egresosMock;
    if (filtros.id_inmueble) {
      egresosFiltrados = egresosMock.filter(egreso => egreso.id_inmueble === filtros.id_inmueble);
    }

    console.log(`✅ ${egresosFiltrados.length} egresos encontrados`);

    return { 
      data: egresosFiltrados,
      error: null
    };

  } catch (error) {
    console.error('❌ Error en getEgresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener egresos',
        status: 500,
        details: error
      }
    };
  }
}