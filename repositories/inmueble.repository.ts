import pool from '../libs/db';
import { Inmueble } from '../interfaces/inmueble.interface';

export class InmuebleRepository {
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

  async list() {
    const query = `SELECT i.*, p.nombre as propietario_nombre, e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios p ON i.id_propietario = p.id_propietario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      ORDER BY i.creado_en DESC`;
    
    try {
      const { rows } = await pool.query(query);
      return { data: rows, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

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