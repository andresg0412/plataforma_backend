import pool from '../libs/db';

export class InmueblesRepository {
  /**
   * Obtiene todos los inmuebles
   */
  async getAllInmuebles() {
    const query = `
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, i.id_propietario, i.id_empresa, i.estado,
             e.nombre_empresa as empresa_nombre
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
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
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, i.id_propietario, i.id_empresa, i.estado,
             e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_empresa = $1
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
      SELECT i.id_inmueble, i.nombre, i.descripcion, i.direccion, i.capacidad, i.id_propietario, i.id_empresa, i.estado,
             e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_empresa = $1 AND i.id_propietario = $2
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