import pool from '../libs/db';

export class InmuebleRepository {
  async findById(id_inmueble: number) {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_inmueble = $1
    `;
    try {
      const { rows } = await pool.query(query, [id_inmueble]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async findByIdWithDetails(id_inmueble: number) {
    const query = `
      SELECT 
        i.*,
        p.id_usuario as propietario_user_id,
        u.id_empresa as propietario_empresa_id,
        e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_inmueble = $1 AND i.estado = 'activo'
    `;
    try {
      const { rows } = await pool.query(query, [id_inmueble]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async logicalDeleteById(id_inmueble: number) {
    const query = `
      UPDATE inmuebles 
      SET estado = 'inactivo', actualizado_en = CURRENT_TIMESTAMP 
      WHERE id_inmueble = $1 AND estado = 'activo'
    `;
    try {
      const { rowCount } = await pool.query(query, [id_inmueble]);
      return { success: !!rowCount && rowCount > 0, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }

  async list() {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.estado = 'activo'
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async listByEmpresa(id_empresa: number) {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_empresa = $1 AND i.estado = 'activo'
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query, [id_empresa]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}