export interface Inmueble {
  id_inmueble?: number;
  id_propietario?: number;
  id_empresa: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  tipo_inmueble: string; // 'casa', 'apartamento', 'local', 'oficina', etc.
  numero_habitaciones?: number;
  numero_banos?: number;
  precio_arriendo?: number;
  descripcion?: string;
  estado: string; // 'disponible', 'ocupado', 'mantenimiento', etc.
}

export interface InmueblesQueryParams {
  id_empresa?: number;
}