export interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  cedula: string;
  fecha_registro: string; // ISO date
  estado: 'activo' | 'inactivo';
  id_empresa: number;
  inmuebles: string[]; // Array de IDs de inmuebles
}

export interface GetPropietariosQuery {
  id_empresa?: number;
}
