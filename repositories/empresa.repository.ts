import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';

export class EmpresaRepository {
  async getEmpresas() {
    const query = `SELECT id_empresa, nombre
      FROM empresas
      WHERE estado = 'activa';`;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}
