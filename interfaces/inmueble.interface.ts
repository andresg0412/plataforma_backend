export interface Inmueble {
  id_inmueble?: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  tipo_inmueble: string;
  area: number;
  precio_alquiler?: number;
  precio_venta?: number;
  estado: string;
  descripcion?: string;
  id_propietario: number;
  id_empresa: number;
  creado_en?: Date;
  actualizado_en?: Date;
}