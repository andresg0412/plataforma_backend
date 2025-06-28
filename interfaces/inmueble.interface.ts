export interface Inmueble {
  id_inmueble?: number;
  id_propietario?: number;
  id_empresa: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  tipo_inmueble: string; // 'casa', 'apartamento', 'local', 'oficina', etc.
  area_total: number;
  area_construida: number;
  numero_habitaciones?: number;
  numero_banos?: number;
  precio_arriendo?: number;
  precio_venta?: number;
  descripcion?: string;
  estado: string; // 'disponible', 'ocupado', 'mantenimiento', etc.
  creado_en?: Date;
  actualizado_en?: Date;
}