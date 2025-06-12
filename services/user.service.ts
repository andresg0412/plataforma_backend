import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/\d/, 'Al menos 1 número')
  .regex(/[a-z]/, 'Al menos 1 minúscula')
  .regex(/[A-Z]/, 'Al menos 1 mayúscula');

export class UserService {
  private repo: UserRepository;
  constructor() {
    this.repo = new UserRepository();
  }
  async list() {
    return this.repo.list();
  }
  async create(user: any) {
    return this.repo.insert(user);
  }
  async getById(id: string) {
    return this.repo.getById(id);
  }
  async login(email: string, password: string) {
    const { data: user, error } = await this.repo.findByEmail(email);
    if (error || !user) return { error: { status: 401, message: 'Credenciales inválidas' } };
    // Compara el password hasheado
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { error: { status: 401, message: 'Credenciales inválidas' } };
    return { user };
  }
  async resetPassword(email: string, password: string) {
    // Valida la contraseña antes de hashear
    const parse = passwordSchema.safeParse(password);
    if (!parse.success) {
      return { error: { status: 400, message: parse.error.errors.map(e => e.message).join(', ') } };
    }
    // Verifica que el usuario exista
    const { data: user, error } = await this.repo.findByEmail(email);
    if (error || !user) return { error: { status: 404, message: 'Usuario no encontrado' } };
    // Hashea la nueva contraseña
    const password_hash = await bcrypt.hash(password, 10);
    // Actualiza la contraseña
    const { error: updateError } = await this.repo.updatePassword(email, password_hash);
    if (updateError) return { error: { status: 500, message: updateError.message } };
    return { success: true };
  }
}
