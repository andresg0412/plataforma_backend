import { z } from 'zod';

// Esquema basado en la tabla inmuebles de la base de datos
export const InmuebleSchema = z.object({
  id_inmueble: z.number().optional(),
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  direccion: z.string().min(1, 'La dirección es requerida'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  tipo_inmueble: z.string().min(1, 'El tipo de inmueble es requerido'),
  habitaciones: z.number().optional(),
  banos: z.number().optional(),
  area_m2: z.number().positive().optional(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  id_propietario: z.number().positive('El ID del propietario es requerido'),
  id_empresa: z.number().nullable().optional(),
  creado_en: z.date().optional(),
  actualizado_en: z.date().optional(),
});

export const InmuebleDeleteSchema = z.object({
  id_inmueble: z.string().regex(/^\d+$/, 'ID de inmueble debe ser un número válido').transform(Number),
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
