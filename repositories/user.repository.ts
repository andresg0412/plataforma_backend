import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../libs/supabaseClient';

export class UserRepository {
  async findByEmail(email: string) {
    return supabase.from('usuarios').select('*, roles(name), propietarios(id), inmuebles(id)').eq('email', email).single();
  }
  async insert(user: any) {
    return supabase.from('usuarios').insert([user]).select().single();
  }
  async list() {
    return supabase.from('usuarios').select('id, nombre, email, rol_id, empresa_id, creado_en, roles(name), empresas(nombre)');
  }
  async getById(id: string) {
    return supabase.from('usuarios').select('id, nombre, email, rol_id, empresa_id, creado_en, roles(name), empresas(nombre)').eq('id', id).single();
  }
  async updatePassword(email: string, password_hash: string) {
    return supabase.from('usuarios').update({ password_hash }).eq('email', email);
  }
}
