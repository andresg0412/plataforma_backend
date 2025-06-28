import { ROLES } from '../../constants/globalConstants';
import { InmuebleRepository } from '../../repositories/inmueble.repository';
import { UserRepository } from '../../repositories/user.repository';

const inmuebleRepository = new InmuebleRepository();
const userRepository = new UserRepository();

/**
 * Lógica de eliminación de inmueble con control de permisos.
 * @param loggedUserId id del usuario autenticado
 * @param targetInmuebleId id del inmueble a eliminar
 */
export async function deleteInmuebleService(loggedUserId: number, targetInmuebleId: number) {
  // 1. Consultar usuario autenticado
  const { data: loggedUser } = await userRepository.findById(loggedUserId);
  if (!loggedUser) {
    return { error: { status: 401, message: 'No autenticado' } };
  }

  // 2. Consultar inmueble a eliminar
  const { data: targetInmueble } = await inmuebleRepository.findByIdWithDetails(targetInmuebleId);
  if (!targetInmueble) {
    return { error: { status: 404, message: 'Inmueble no encontrado o ya inactivo' } };
  }

  // 3. Lógica de permisos
  if (loggedUser.id_roles === ROLES.SUPERADMIN) {
    // Superadmin puede eliminar cualquier inmueble
    return await inmuebleRepository.logicalDeleteById(targetInmuebleId);
  }

  if (loggedUser.id_roles === ROLES.EMPRESA || loggedUser.id_roles === ROLES.ADMINISTRADOR) {
    // Empresa/Admin solo puede eliminar inmuebles de su empresa
    const inmuebleEmpresaId = targetInmueble.id_empresa || targetInmueble.propietario_empresa_id;
    
    if (inmuebleEmpresaId !== loggedUser.id_empresa) {
      return { error: { status: 403, message: 'Solo puede eliminar inmuebles de su empresa' } };
    }
    
    return await inmuebleRepository.logicalDeleteById(targetInmuebleId);
  }

  // Propietario no puede eliminar inmuebles
  return { error: { status: 403, message: 'No tiene permisos para eliminar inmuebles' } };
}