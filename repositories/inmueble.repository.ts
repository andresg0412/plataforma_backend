import { supabase } from '../libs/supabaseClient';

export class InmuebleRepository {
  async findByEmpresa(empresaId: number) {
    return supabase
      .from('inmuebles')
      .select('*')
      .eq('empresa_id', empresaId);
  }

  async findByEmpresaAndPropietario(empresaId: number, propietarioId: number) {
    return supabase
      .from('inmuebles')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('propietario_id', propietarioId);
  }

  async findAll() {
    return supabase
      .from('inmuebles')
      .select('*');
  }
}