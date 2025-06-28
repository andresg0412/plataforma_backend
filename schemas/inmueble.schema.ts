import { z } from 'zod';

// Esquema basado en la tabla inmuebles de la base de datos
export const InmuebleSchema = z.object({
  id_inmueble: z.number().optional(),
  direccion: z.string().min(1, 'Dirección es requerida'),
  ciudad: z.string().min(1, 'Ciudad es requerida'),
  departamento: z.string().min(1, 'Departamento es requerido'),
  tipo_inmueble: z.string().min(1, 'Tipo de inmueble es requerido'),
  area: z.number().positive('El área debe ser un número positivo'),
  precio_alquiler: z.number().positive().optional(),
  precio_venta: z.number().positive().optional(),
  estado: z.string().min(1, 'Estado es requerido'),
  descripcion: z.string().optional(),
  id_propietario: z.number().positive('ID propietario es requerido'),
  id_empresa: z.number().positive('ID empresa es requerido'),
  creado_en: z.date().optional(),
  actualizado_en: z.date().optional(),
});

// Schema para actualización (todos los campos opcionales excepto validaciones básicas)
export const InmuebleUpdateSchema = z.object({
  direccion: z.string().min(1).optional(),
  ciudad: z.string().min(1).optional(),
  departamento: z.string().min(1).optional(),
  tipo_inmueble: z.string().min(1).optional(),
  area: z.number().positive().optional(),
  precio_alquiler: z.number().positive().optional(),
  precio_venta: z.number().positive().optional(),
  estado: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  id_propietario: z.number().positive().optional(),
  id_empresa: z.number().positive().optional(),
});

export type InmuebleUpdate = z.infer<typeof InmuebleUpdateSchema>;