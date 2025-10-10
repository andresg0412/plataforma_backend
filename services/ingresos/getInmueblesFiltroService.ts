import { InmuebleFiltro } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener lista de inmuebles para filtros
 * Retorna inmuebles activos de la empresa
 */
export async function getInmueblesFiltroService(empresaId: number): Promise<ServiceResponse<InmuebleFiltro[]>> {
  try {
    console.log('🔄 Ejecutando getInmueblesFiltroService para empresa:', empresaId);

    // TODO: Implementar consulta real a la base de datos
    // Por ahora devolvemos datos mock
    
    const inmueblesMock: InmuebleFiltro[] = [
      {
        id: 1,
        nombre: 'Apartamento Centro Histórico',
        direccion: 'Carrera 10 #15-20, Centro'
      },
      {
        id: 2,
        nombre: 'Casa Zona Norte',
        direccion: 'Calle 80 #25-15, Zona Norte'
      },
      {
        id: 3,
        nombre: 'Loft Zona Rosa',
        direccion: 'Carrera 15 #85-30, Zona Rosa'
      },
      {
        id: 4,
        nombre: 'Apartamento Chapinero',
        direccion: 'Calle 63 #11-40, Chapinero'
      },
      {
        id: 5,
        nombre: 'Penthouse La Candelaria',
        direccion: 'Carrera 8 #12-25, La Candelaria'
      }
    ];

    console.log(`✅ ${inmueblesMock.length} inmuebles encontrados para filtro`);

    return { data: inmueblesMock, error: null };

  } catch (error) {
    console.error('❌ Error en getInmueblesFiltroService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener inmuebles para filtro',
        status: 500,
        details: error
      }
    };
  }
}