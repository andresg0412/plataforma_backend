import pool from '../libs/db';

export class InmuebleRepository {
  async getById(id: string) {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_inmueble = $1
    `;
    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

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

  async getByPropietario(propietarioId: number) {
    const query = `
      SELECT i.*, p.id_usuario, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE i.id_propietario = $1
      ORDER BY i.creado_en DESC
    `;
    try {
      const { rows } = await pool.query(query, [propietarioId]);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}