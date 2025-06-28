import pool from '../libs/db';

export class InmueblesRepository {
  /**
   * Obtiene todos los inmuebles
   */
  async getAllInmuebles() {
    const query = `
      SELECT i.id_inmueble, i.direccion, i.tipo, i.valor_arriendo, i.estado, 
             i.id_empresa, i.id_propietario, i.creado_en,
             e.nombre as empresa_nombre,
             p.nombre as propietario_nombre, p.telefono as propietario_telefono
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene inmuebles filtrados por empresa
   */
  async getInmueblesByEmpresa(empresaId: number) {
    const query = `
      SELECT i.id_inmueble, i.direccion, i.tipo, i.valor_arriendo, i.estado, 
             i.id_empresa, i.id_propietario, i.creado_en,
             e.nombre as empresa_nombre,
             p.nombre as propietario_nombre, p.telefono as propietario_telefono
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      WHERE i.id_empresa = $1
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query, [empresaId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene inmuebles filtrados por empresa y propietario
   */
  async getInmueblesByEmpresaAndPropietario(empresaId: number, propietarioId: number) {
    const query = `
      SELECT i.id_inmueble, i.direccion, i.tipo, i.valor_arriendo, i.estado, 
             i.id_empresa, i.id_propietario, i.creado_en,
             e.nombre as empresa_nombre,
             p.nombre as propietario_nombre, p.telefono as propietario_telefono
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      WHERE i.id_empresa = $1 AND i.id_propietario = $2
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query, [empresaId, propietarioId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene el id_propietario asociado a un usuario
   */
  async getPropietarioIdByUserId(userId: number) {
    const query = `SELECT id_propietario FROM propietarios WHERE id_usuario = $1`;
    try {
      const { rows } = await pool.query(query, [userId]);
      return { data: rows[0]?.id_propietario || null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}