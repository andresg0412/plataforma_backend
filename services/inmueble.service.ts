import { InmuebleRepository } from '../repositories/inmueble.repository';

export class InmuebleService {
  private repo: InmuebleRepository;

  constructor() {
    this.repo = new InmuebleRepository();
  }

  async getInmueblesByEmpresa(empresaId: number) {
    return this.repo.findByEmpresa(empresaId);
  }

  async getInmueblesByEmpresaAndPropietario(empresaId: number, propietarioId: number) {
    return this.repo.findByEmpresaAndPropietario(empresaId, propietarioId);
  }

  async getAllInmuebles() {
    return this.repo.findAll();
  }
}