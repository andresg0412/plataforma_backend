export interface Inmueble {
  id_inmueble: number;
  direccion: string;
  tipo?: string;
  valor_arriendo?: number;
  estado?: string;
  id_empresa: number;
  id_propietario?: number;
  creado_en?: Date;
  empresa_nombre?: string;
  propietario_nombre?: string;
  propietario_telefono?: string;
}

export interface InmueblesQueryParams {
  id_empresa?: number;
}