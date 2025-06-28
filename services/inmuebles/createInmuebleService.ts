import { InmuebleRepository } from '../../repositories/inmueble.repository';
import { UserRepository } from '../../repositories/user.repository';
import { Inmueble } from '../../interfaces/inmueble.interface';
import { ROLES } from '../../constants/globalConstants';

export class CreateInmuebleService {
  private inmuebleRepository: InmuebleRepository;
  private userRepository: UserRepository;

  constructor() {
    this.inmuebleRepository = new InmuebleRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Lógica de creación de inmueble con control de permisos y reglas de negocio.
   * @param loggedUserId id del usuario autenticado
   * @param inmuebleData datos del inmueble a crear
   */
  async execute(loggedUserId: number, inmuebleData: Inmueble) {
    // 1. Obtener información del usuario autenticado
    const { data: loggedUser, error } = await this.userRepository.getById(loggedUserId.toString());
    if (error || !loggedUser) {
      return { error: { status: 404, message: 'Usuario no encontrado' } };
    }

    // 2. Validar campos requeridos
    if (!inmuebleData.direccion || !inmuebleData.ciudad || !inmuebleData.departamento) {
      return { error: { status: 400, message: 'Dirección, ciudad y departamento son requeridos' } };
    }

    if (!inmuebleData.tipo_inmueble || !inmuebleData.area_total || !inmuebleData.area_construida) {
      return { error: { status: 400, message: 'Tipo de inmueble, área total y área construida son requeridos' } };
    }

    // 3. Validar que área construida no sea mayor que área total
    if (inmuebleData.area_construida > inmuebleData.area_total) {
      return { error: { status: 400, message: 'El área construida no puede ser mayor al área total' } };
    }

    // 4. Reglas de negocio según el rol del usuario autenticado
    const empresaInmueble = Number(inmuebleData.id_empresa);

    if (loggedUser.id_roles === ROLES.SUPERADMIN) {
      // Superadmin puede crear inmuebles para cualquier empresa
      return await this.inmuebleRepository.insert(inmuebleData);
    }

    if (loggedUser.id_roles === ROLES.EMPRESA || loggedUser.id_roles === ROLES.ADMINISTRADOR) {
      // Empresa y Administrador solo pueden crear inmuebles en su propia empresa
      if (empresaInmueble !== loggedUser.id_empresa) {
        return { error: { status: 403, message: 'Solo puede crear inmuebles en su propia empresa' } };
      }
      return await this.inmuebleRepository.insert({ ...inmuebleData, id_empresa: loggedUser.id_empresa });
    }

    if (loggedUser.id_roles === ROLES.PROPIETARIO) {
      // Propietario puede crear inmuebles para su empresa y debe asociarse al propietario
      if (empresaInmueble !== loggedUser.id_empresa) {
        return { error: { status: 403, message: 'Solo puede crear inmuebles en su propia empresa' } };
      }

      // Obtener el id_propietario del usuario
      const { data: userData, error: userError } = await this.userRepository.findByEmail(loggedUser.email);
      if (userError || !userData || !userData.id_propietario) {
        return { error: { status: 400, message: 'Usuario propietario no encontrado o no tiene registro de propietario' } };
      }

      return await this.inmuebleRepository.insert({
        ...inmuebleData,
        id_empresa: loggedUser.id_empresa,
        id_propietario: userData.id_propietario
      });
    }

    // Si el rol no está contemplado
    return { error: { status: 403, message: 'No tiene permisos para crear inmuebles' } };
  }
}