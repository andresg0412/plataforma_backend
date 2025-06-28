import { InmuebleRepository } from '../../repositories/inmueble.repository';
import { UserRepository } from '../../repositories/user.repository';
import { InmuebleFilters } from '../../interfaces/inmueble.interface';
import { ROLES } from '../../constants/globalConstants';

const inmuebleRepository = new InmuebleRepository();
const userRepository = new UserRepository();

/**
 * Obtiene los inmuebles visibles para el usuario autenticado según su rol y filtros.
 * @param userId id del usuario autenticado
 * @param filters filtros de búsqueda
 * @returns lista de inmuebles visibles o error
 */
export async function getInmuebles(userId: number, filters: InmuebleFilters) {
  // 1. Consultar el usuario autenticado y su rol
  const { data: authUser, error: userError } = await userRepository.findById(userId);
  if (!authUser) {
    return { data: null, error: { message: 'Usuario autenticado no encontrado', ...userError } };
  }

  // 2. Obtener inmuebles según el rol y filtros
  try {
    const result = await inmuebleRepository.listWithFilters(
      filters, 
      authUser.id_roles, 
      authUser.id_empresa,
      userId
    );
    
    return result;
  } catch (error) {
    console.error('Error al obtener inmuebles:', error);
    return { data: null, error: { message: 'Error interno del servidor' } };
  }
}