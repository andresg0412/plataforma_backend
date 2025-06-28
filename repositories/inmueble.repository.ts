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
  async updateById(id: string, data: any) {
    // Construir query dinámico solo con los campos editables
    const allowedFields = [
      'direccion', 'ciudad', 'departamento', 'tipo_inmueble', 'area',
      'precio_alquiler', 'precio_venta', 'estado', 'descripcion',
      'id_propietario', 'id_empresa'
    ];
    
    const fields = Object.keys(data).filter(f => allowedFields.includes(f));
    if (fields.length === 0) {
      return { success: false, error: new Error('No hay campos válidos para actualizar') };
    }

    // Agregar campo de actualización automática
    fields.push('actualizado_en');
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.slice(0, -1).map(f => data[f]); // Todos excepto actualizado_en
    values.push(new Date()); // actualizado_en
    values.push(id); // WHERE condition

    const query = `UPDATE inmuebles SET ${setClause} WHERE id_inmueble = $${fields.length + 1}`;
    
    try {
      const { rowCount } = await pool.query(query, values);
      return { success: !!rowCount && rowCount > 0, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
  async insert(inmueble: Inmueble) {
    const query = `INSERT INTO inmuebles (
      id_propietario, id_empresa, direccion, ciudad, departamento, 
      tipo_inmueble, area_total, area_construida, numero_habitaciones, 
      numero_banos, precio_arriendo, precio_venta, descripcion, estado
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
    
    const values = [
      inmueble.id_propietario ?? null,
      inmueble.id_empresa,
      inmueble.direccion,
      inmueble.ciudad,
      inmueble.departamento,
      inmueble.tipo_inmueble,
      inmueble.area_total,
      inmueble.area_construida,
      inmueble.numero_habitaciones ?? null,
      inmueble.numero_banos ?? null,
      inmueble.precio_arriendo ?? null,
      inmueble.precio_venta ?? null,
      inmueble.descripcion ?? null,
      inmueble.estado
    ];

    try {
      const { rows } = await pool.query(query, values);
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
=======
  async list() {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
  async getByEmpresa(empresaId: number) {
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

  async listByEmpresa(id_empresa: number) {
  async getByPropietario(propietarioId: number) {
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
      WHERE i.id_propietario = $1
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query, [propietarioId]);
      return { data: rows, error: null };
  async getById(id: string) {
    const query = `SELECT i.*, p.nombre as propietario_nombre, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_inmueble = $1`;
    
    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}