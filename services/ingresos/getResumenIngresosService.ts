import { FiltrosIngresos, ResumenIngresos } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener resumen de ingresos por fecha e inmueble
 * Calcula totales, promedios y desglose por inmueble
 */
export async function getResumenIngresosService(filtros: FiltrosIngresos): Promise<ServiceResponse<ResumenIngresos>> {
  try {
    console.log('🔄 Ejecutando getResumenIngresosService con filtros:', filtros);

    // TODO: Implementar consulta real a la base de datos
    // Por ahora calculamos basado en datos mock
    
    // Simulamos obtener los ingresos del día
    const ingresosMock = [
      { id_inmueble: 1, nombre_inmueble: 'Apartamento Centro Histórico', monto: 300000 },
      { id_inmueble: 1, nombre_inmueble: 'Apartamento Centro Histórico', monto: 50000 },
      { id_inmueble: 2, nombre_inmueble: 'Casa Zona Norte', monto: 150000 },
      { id_inmueble: 3, nombre_inmueble: 'Loft Zona Rosa', monto: 80000 },
      { id_inmueble: 3, nombre_inmueble: 'Loft Zona Rosa', monto: 120000 }
    ];

    // Filtrar por inmueble si se especifica
    let ingresosFiltrados = ingresosMock;
    if (filtros.id_inmueble) {
      ingresosFiltrados = ingresosMock.filter(ingreso => ingreso.id_inmueble === filtros.id_inmueble);
    }

    // Calcular totales
    const totalIngresos = ingresosFiltrados.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const cantidadIngresos = ingresosFiltrados.length;
    const promedioIngreso = cantidadIngresos > 0 ? totalIngresos / cantidadIngresos : 0;

    // Calcular desglose por inmueble (solo si no hay filtro específico de inmueble)
    let desgloseInmuebles = undefined;
    if (!filtros.id_inmueble) {
      const inmuebleMap = new Map();
      
      ingresosFiltrados.forEach(ingreso => {
        const key = ingreso.id_inmueble;
        if (!inmuebleMap.has(key)) {
          inmuebleMap.set(key, {
            id_inmueble: ingreso.id_inmueble,
            nombre_inmueble: ingreso.nombre_inmueble,
            total: 0,
            cantidad: 0
          });
        }
        
        const inmuebleData = inmuebleMap.get(key);
        inmuebleData.total += ingreso.monto;
        inmuebleData.cantidad += 1;
      });

      desgloseInmuebles = Array.from(inmuebleMap.values());
    }

    const resumen: ResumenIngresos = {
      fecha: filtros.fecha,
      inmueble_filtro: filtros.id_inmueble ? `Inmueble ID: ${filtros.id_inmueble}` : null,
      total_ingresos: totalIngresos,
      cantidad_ingresos: cantidadIngresos,
      promedio_ingreso: Math.round(promedioIngreso),
      desglose_inmuebles: desgloseInmuebles
    };

    console.log('✅ Resumen de ingresos generado:', resumen);

    return { data: resumen, error: null };

  } catch (error) {
    console.error('❌ Error en getResumenIngresosService:', error);
    return {
      data: null,
      error: {
        message: 'Error al generar resumen de ingresos',
        status: 500,
        details: error
      }
    };
  }
}