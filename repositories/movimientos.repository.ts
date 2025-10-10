import pool from '../libs/db';
import { 
  Movimiento, 
  CreateMovimientoData, 
  EditMovimientoData, 
  ResumenDiario,
  InmuebleSelector 
} from '../interfaces/movimiento.interface';
import { v4 as uuidv4 } from 'uuid';

export class MovimientosRepository {
  /**
   * Obtiene movimientos por fecha y empresa
   */
  static async getMovimientosByFecha(fecha: string, empresaId: string): Promise<Movimiento[]> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.fecha = $1 AND m.id_empresa = $2
      ORDER BY m.fecha_creacion DESC
    `;
    
    const { rows } = await pool.query(query, [fecha, empresaId]);
    return rows;
  }

  /**
   * Obtiene movimientos por inmueble y fecha
   */
  static async getMovimientosByInmuebleFecha(idInmueble: string, fecha: string): Promise<Movimiento[]> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.id_inmueble = $1 AND m.fecha = $2
      ORDER BY m.fecha_creacion DESC
    `;
    
    const { rows } = await pool.query(query, [idInmueble, fecha]);
    return rows;
  }

  /**
   * Obtiene resumen diario por fecha y empresa
   */
  static async getResumenDiario(fecha: string, empresaId: string): Promise<ResumenDiario | null> {
    const query = `
      SELECT 
        fecha,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance,
        COUNT(*) as cantidad_movimientos
      FROM movimientos 
      WHERE fecha = $1 AND id_empresa = $2
      GROUP BY fecha
    `;
    
    const { rows } = await pool.query(query, [fecha, empresaId]);
    
    if (rows.length === 0) {
      return {
        fecha,
        total_ingresos: 0,
        total_egresos: 0,
        balance: 0,
        cantidad_movimientos: 0
      };
    }
    
    return {
      fecha: rows[0].fecha,
      total_ingresos: parseFloat(rows[0].total_ingresos) || 0,
      total_egresos: parseFloat(rows[0].total_egresos) || 0,
      balance: parseFloat(rows[0].balance) || 0,
      cantidad_movimientos: parseInt(rows[0].cantidad_movimientos) || 0
    };
  }

  /**
   * Crea un nuevo movimiento
   */
  static async createMovimiento(data: CreateMovimientoData): Promise<Movimiento> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO movimientos (
        id, fecha, tipo, concepto, descripcion, monto, 
        id_inmueble, id_reserva, metodo_pago, comprobante, 
        id_empresa, fecha_creacion, fecha_actualizacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      id,
      data.fecha,
      data.tipo,
      data.concepto,
      data.descripcion,
      data.monto,
      data.id_inmueble,
      data.id_reserva,
      data.metodo_pago,
      data.comprobante,
      data.id_empresa
    ];
    
    const { rows } = await pool.query(query, values);
    
    // Obtener el movimiento completo con JOINs
    return this.getMovimientoById(rows[0].id);
  }

  /**
   * Obtiene un movimiento por ID
   */
  static async getMovimientoById(id: string): Promise<Movimiento> {
    const query = `
      SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.concepto,
        m.descripcion,
        m.monto,
        m.id_inmueble,
        i.nombre as nombre_inmueble,
        m.id_reserva,
        r.codigo as codigo_reserva,
        m.metodo_pago,
        m.comprobante,
        m.id_empresa,
        m.fecha_creacion,
        m.fecha_actualizacion
      FROM movimientos m
      LEFT JOIN inmuebles i ON m.id_inmueble = i.id_inmueble::text
      LEFT JOIN reservas r ON m.id_reserva = r.id_reserva::text
      WHERE m.id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      throw new Error('Movimiento no encontrado');
    }
    
    return rows[0];
  }

  /**
   * Actualiza un movimiento
   */
  static async updateMovimiento(id: string, data: EditMovimientoData): Promise<Movimiento> {
    // Construir la query dinámicamente según los campos a actualizar
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fecha !== undefined) {
      setFields.push(`fecha = $${paramIndex++}`);
      values.push(data.fecha);
    }
    if (data.tipo !== undefined) {
      setFields.push(`tipo = $${paramIndex++}`);
      values.push(data.tipo);
    }
    if (data.concepto !== undefined) {
      setFields.push(`concepto = $${paramIndex++}`);
      values.push(data.concepto);
    }
    if (data.descripcion !== undefined) {
      setFields.push(`descripcion = $${paramIndex++}`);
      values.push(data.descripcion);
    }
    if (data.monto !== undefined) {
      setFields.push(`monto = $${paramIndex++}`);
      values.push(data.monto);
    }
    if (data.id_inmueble !== undefined) {
      setFields.push(`id_inmueble = $${paramIndex++}`);
      values.push(data.id_inmueble);
    }
    if (data.id_reserva !== undefined) {
      setFields.push(`id_reserva = $${paramIndex++}`);
      values.push(data.id_reserva);
    }
    if (data.metodo_pago !== undefined) {
      setFields.push(`metodo_pago = $${paramIndex++}`);
      values.push(data.metodo_pago);
    }
    if (data.comprobante !== undefined) {
      setFields.push(`comprobante = $${paramIndex++}`);
      values.push(data.comprobante);
    }

    if (setFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar fecha_actualizacion y el ID al final
    setFields.push(`fecha_actualizacion = NOW()`);
    values.push(id);

    const query = `
      UPDATE movimientos 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      throw new Error('Movimiento no encontrado');
    }

    // Obtener el movimiento completo con JOINs
    return this.getMovimientoById(rows[0].id);
  }

  /**
   * Elimina un movimiento (eliminación física)
   */
  static async deleteMovimiento(id: string): Promise<void> {
    const query = 'DELETE FROM movimientos WHERE id = $1';
    const { rowCount } = await pool.query(query, [id]);
    
    if (rowCount === 0) {
      throw new Error('Movimiento no encontrado');
    }
  }

  /**
   * Obtiene inmuebles para selector
   */
  static async getInmueblesSelector(empresaId: string): Promise<InmuebleSelector[]> {
    const query = `
      SELECT 
        id_inmueble::text as id,
        nombre,
        direccion,
        estado
      FROM inmuebles 
      WHERE id_empresa = $1 AND estado = 'activo'
      ORDER BY nombre ASC
    `;
    
    const { rows } = await pool.query(query, [empresaId]);
    return rows;
  }

  /**
   * Verifica si existe un inmueble y pertenece a la empresa
   */
  static async existsInmuebleInEmpresa(inmuebleId: string, empresaId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM inmuebles 
      WHERE id_inmueble::text = $1 AND id_empresa = $2
    `;
    
    const { rows } = await pool.query(query, [inmuebleId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Verifica si existe una reserva y pertenece a la empresa
   */
  static async existsReservaInEmpresa(reservaId: string, empresaId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM reservas r
      JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
      WHERE r.id_reserva::text = $1 AND i.id_empresa = $2
    `;
    
    const { rows } = await pool.query(query, [reservaId, empresaId]);
    return rows.length > 0;
  }

  /**
   * Verifica si existe una empresa
   */
  static async existsEmpresa(empresaId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM empresas WHERE id_empresa = $1';
    const { rows } = await pool.query(query, [empresaId]);
    return rows.length > 0;
  }
}