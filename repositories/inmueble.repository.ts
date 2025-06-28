import pool from '../libs/db';
import { InmuebleFilters } from '../interfaces/inmueble.interface';

export class InmuebleRepository {
  
  async listWithFilters(filters: InmuebleFilters, userRole: number, userEmpresaId: number | null, userId?: number) {
    let baseQuery = `
      SELECT i.id_inmueble, i.id_propietario, i.id_empresa, i.nombre, i.tipo, i.ubicacion, i.precio, i.estado_activo, i.creado_en,
             p.nombre as propietario_nombre, p.apellido as propietario_apellido,
             e.nombre as empresa_nombre
      FROM inmuebles i
      LEFT JOIN propietarios pr ON i.id_propietario = pr.id_propietario
      LEFT JOIN usuarios p ON pr.id_usuario = p.id_usuario
      LEFT JOIN empresas e ON i.id_empresa = e.id_empresa
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCounter = 1;

    // Aplicar filtros de rol
    if (userRole === 1) { // SUPERADMIN
      // Puede ver todos los inmuebles, filtrar por id_empresa si se proporciona
      if (filters.id_empresa) {
        baseQuery += ` AND i.id_empresa = $${paramCounter}`;
        params.push(filters.id_empresa);
        paramCounter++;
      }
    } else if (userRole === 2 || userRole === 3) { // EMPRESA o ADMINISTRADOR
      // Solo inmuebles de su empresa
      if (userEmpresaId) {
        baseQuery += ` AND i.id_empresa = $${paramCounter}`;
        params.push(userEmpresaId);
        paramCounter++;
      }
    } else if (userRole === 4) { // PROPIETARIO
      // Solo sus propios inmuebles
      baseQuery += ` AND pr.id_usuario = $${paramCounter}`;
      params.push(userId);
      paramCounter++;
    }

    // Aplicar filtros opcionales
    if (filters.nombre) {
      baseQuery += ` AND i.nombre ILIKE $${paramCounter}`;
      params.push(`%${filters.nombre}%`);
      paramCounter++;
    }

    if (filters.tipo) {
      baseQuery += ` AND i.tipo ILIKE $${paramCounter}`;
      params.push(`%${filters.tipo}%`);
      paramCounter++;
    }

    if (filters.ubicacion) {
      baseQuery += ` AND i.ubicacion ILIKE $${paramCounter}`;
      params.push(`%${filters.ubicacion}%`);
      paramCounter++;
    }

    if (filters.precio_min) {
      baseQuery += ` AND i.precio >= $${paramCounter}`;
      params.push(filters.precio_min);
      paramCounter++;
    }

    if (filters.precio_max) {
      baseQuery += ` AND i.precio <= $${paramCounter}`;
      params.push(filters.precio_max);
      paramCounter++;
    }

    if (filters.estado_activo !== undefined) {
      baseQuery += ` AND i.estado_activo = $${paramCounter}`;
      params.push(filters.estado_activo);
      paramCounter++;
    }

    // Agregar ordenamiento
    baseQuery += ` ORDER BY i.creado_en DESC`;

    // Agregar paginación
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    baseQuery += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    params.push(limit, offset);

    try {
      const { rows } = await pool.query(baseQuery, params);
      
      // Consulta para contar el total de registros
      let countQuery = baseQuery.replace(
        /SELECT.*?FROM/s, 
        'SELECT COUNT(*) as total FROM'
      ).replace(/ ORDER BY.*$/s, '').replace(/ LIMIT.*$/s, '');
      
      const countParams = params.slice(0, -2); // Remover limit y offset
      const { rows: countRows } = await pool.query(countQuery, countParams);
      const total = parseInt(countRows[0].total);

      return { 
        data: {
          inmuebles: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error listing inmuebles:', error);
      return { data: null, error };
    }
  }
}