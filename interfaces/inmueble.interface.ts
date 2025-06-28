export interface Inmueble {
  id_inmueble?: number;
  titulo: string;
  descripcion?: string;
  direccion: string;
  precio: number;
  tipo_inmueble: string; // casa, apartamento, oficina, etc.
  habitaciones?: number;
  banos?: number;
  area_m2?: number;
  estado: 'activo' | 'inactivo';
  id_propietario: number;
  id_empresa?: number | null;
  creado_en?: Date;
  actualizado_en?: Date;
}