import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';
import { Propietario } from '../interfaces/propietario.interface';

export class PropietarioRepository {
  async getPropietarios(id_empresa?: number) {
    let query = `
      SELECT 
        p.id_propietario as id,
        u.nombre,
        u.apellido,
        u.email,
        p.telefono,
        p.direccion,
        u.cedula,
        u.creado_en as fecha_registro,
        u.estado_activo as estado,
        u.id_empresa,
        COALESCE(
          array_agg(
            CASE 
              WHEN i.id_inmueble IS NOT NULL 
              THEN i.id_inmueble::text 
              ELSE NULL 
            END
          ) FILTER (WHERE i.id_inmueble IS NOT NULL), 
          '{}'::text[]
        ) as inmuebles
      FROM propietarios p
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN inmuebles i ON p.id_propietario = i.id_propietario
    `;

    const params: any[] = [];
    
    if (id_empresa !== undefined) {
      query += ` AND u.id_empresa = $1`;
      params.push(id_empresa);
    }

    query += `
      GROUP BY 
        p.id_propietario, 
        u.nombre, 
        u.apellido, 
        u.email, 
        p.telefono, 
        p.direccion, 
        u.cedula, 
        u.creado_en, 
        u.estado_activo, 
        u.id_empresa
      ORDER BY u.creado_en DESC
    `;

    try {
      const { rows } = await pool.query(query, params);
      console.log('Propietarios obtenidos:', rows);
      return { data: rows, error: null };
    } catch (error: any) {
      console.error('Error al obtener propietarios:', error);
      return { data: null, error };
    }
  }
}
