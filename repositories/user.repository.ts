import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class UserRepository {
  async findByEmail(email: string) {
    const query = `SELECT u.*, r.name as rol_name, p.id_propietario, i.id_inmueble
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN propietarios p ON u.id_usuario = p.id_usuario
      LEFT JOIN inmuebles i ON p.id_propietario = i.id_propietario
      WHERE u.email = $1`;
    try {
      const { rows } = await pool.query(query, [email]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async insert(user: any) {
    const query = `INSERT INTO usuarios (nombre, email, password_hash, id_roles, id_empresa)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [user.nombre, user.email, user.password_hash, user.id_roles, user.id_empresa];
    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async list() {
    const query = `SELECT u.id_usuario, u.nombre, u.email, u.id_roles, u.id_empresa, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa`;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async getById(id: string) {
    const query = `SELECT u.id_usuario, u.nombre, u.email, u.id_roles, u.id_empresa, u.creado_en, r.name as rol_name, e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.id_roles = r.id_rol
      LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
      WHERE u.id_usuario = $1`;
    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async updatePassword(email: string, password_hash: string) {
    const query = `UPDATE usuarios SET password_hash = $1 WHERE email = $2`;
    try {
      await pool.query(query, [password_hash, email]);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
}
