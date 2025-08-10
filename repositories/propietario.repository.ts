import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';
import { Propietario, CreatePropietarioRequest } from '../interfaces/propietario.interface';

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

  async createUsuario(userData: {
    nombre: string;
    apellido: string;
    email: string;
    cedula: string;
    username: string;
    password_hash: string;
    id_roles: number;
    id_empresa: number;
    estado_activo: boolean;
  }) {
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, cedula, username, password_hash, id_roles, id_empresa, estado_activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `;
    
    const values = [
      userData.nombre,
      userData.apellido,
      userData.email,
      userData.cedula,
      userData.username,
      userData.password_hash,
      userData.id_roles,
      userData.id_empresa,
      userData.estado_activo
    ];

    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      return { data: null, error };
    }
  }

  async createPropietario(propietarioData: {
    id_usuario: number;
    telefono: string;
    direccion: string;
  }) {
    const query = `
      INSERT INTO propietarios (id_usuario, telefono, direccion)
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const values = [
      propietarioData.id_usuario,
      propietarioData.telefono,
      propietarioData.direccion
    ];

    try {
      const { rows } = await pool.query(query, values);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al crear propietario:', error);
      return { data: null, error };
    }
  }

  async getPropietarioById(id: number) {
    const query = `
      SELECT 
        p.id_propietario as id,
        u.nombre,
        u.apellido,
        u.email,
        p.telefono,
        p.direccion,
        u.cedula,
        u.creado_en as fecha_registro,
        CASE WHEN u.estado_activo THEN 'activo' ELSE 'inactivo' END as estado,
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
      WHERE p.id_propietario = $1
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
    `;

    try {
      const { rows } = await pool.query(query, [id]);
      return { data: rows[0], error: null };
    } catch (error: any) {
      console.error('Error al obtener propietario por ID:', error);
      return { data: null, error };
    }
  }
}
