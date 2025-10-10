import { FiltrosEgresos, ResumenEgresos } from '../../interfaces/egreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener resumen de egresos por fecha e inmueble
 * Calcula totales, promedios y desglose por inmueble
 */
export async function getResumenEgresosService(filtros: FiltrosEgresos): Promise<ServiceResponse<ResumenEgresos>> {
  try {
    console.log('🔄 Ejecutando getResumenEgresosService con filtros:', filtros);

    // TODO: Implementar consulta real a la base de datos
    // Por ahora calculamos basado en datos mock
    
    // Simulamos obtener los egresos del día
    const egresosMock = [
      { id_inmueble: 1, nombre_inmueble: 'Apartamento Centro Histórico', monto: 120000 },
      { id_inmueble: 1, nombre_inmueble: 'Apartamento Centro Histórico', monto: 45000 },
      { id_inmueble: 2, nombre_inmueble: 'Casa Zona Norte', monto: 80000 },
      { id_inmueble: 2, nombre_inmueble: 'Casa Zona Norte', monto: 35000 },
      { id_inmueble: 3, nombre_inmueble: 'Loft Zona Rosa', monto: 150000 }
    ];

    // Filtrar por inmueble si se especifica
    let egresosFiltrados = egresosMock;
    if (filtros.id_inmueble) {
      egresosFiltrados = egresosMock.filter(egreso => egreso.id_inmueble === filtros.id_inmueble);
    }

    // Calcular totales
    const totalEgresos = egresosFiltrados.reduce((total, egreso) => total + egreso.monto, 0);
    const totalMovimientos = egresosFiltrados.length;
    const promedioPorMovimiento = totalMovimientos > 0 ? totalEgresos / totalMovimientos : 0;

    // Agrupar por inmueble
    const egresosPorInmueble = egresosFiltrados.reduce((grupos, egreso) => {
      const id = egreso.id_inmueble;
      if (!grupos[id]) {
        grupos[id] = {
          id_inmueble: id,
          nombre_inmueble: egreso.nombre_inmueble,
          total_egresos: 0,
          cantidad_movimientos: 0
        };
      }
      grupos[id].total_egresos += egreso.monto;
      grupos[id].cantidad_movimientos += 1;
      return grupos;
    }, {} as Record<number, any>);

    const resumen: ResumenEgresos = {
      fecha: filtros.fecha,
      inmueble_filtro: filtros.id_inmueble ? egresosFiltrados[0]?.nombre_inmueble || null : null,
      total_egresos: totalEgresos,
      cantidad_egresos: totalMovimientos,
      promedio_egreso: promedioPorMovimiento,
      desglose_inmuebles: Object.values(egresosPorInmueble).map(grupo => ({
        id_inmueble: grupo.id_inmueble,
        nombre_inmueble: grupo.nombre_inmueble,
        total: grupo.total_egresos,
        cantidad: grupo.cantidad_movimientos
      }))
    };

    console.log(`✅ Resumen calculado: ${totalEgresos} en ${totalMovimientos} movimientos`);

    return { 
      data: resumen,
      error: null
    };

  } catch (error) {
    console.error('❌ Error en getResumenEgresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener resumen de egresos',
        status: 500,
        details: error
      }
    };
  }
}