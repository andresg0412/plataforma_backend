export interface Inmueble {
  id_inmueble: number;
  id_propietario: number;
  id_empresa: number;
  nombre: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  estado_activo: boolean;
  creado_en: Date;
}

export interface InmuebleFilters {
  id_empresa?: number;
  nombre?: string;
  tipo?: string;
  ubicacion?: string;
  precio_min?: number;
  precio_max?: number;
  estado_activo?: boolean;
  page?: number;
  limit?: number;
}