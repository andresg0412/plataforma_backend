import { z } from 'zod';

// Esquema basado en la tabla inmuebles de la base de datos
export const InmuebleSchema = z.object({
  id_inmueble: z.number().optional(),
  id_propietario: z.number().optional(),
  id_empresa: z.number(),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().min(1, 'La ciudad es requerida'),
  departamento: z.string().min(1, 'El departamento es requerido'),
  tipo_inmueble: z.enum(['casa', 'apartamento', 'local', 'oficina', 'bodega', 'lote'], {
    errorMap: () => ({ message: 'Tipo de inmueble debe ser: casa, apartamento, local, oficina, bodega o lote' })
  }),
  area_total: z.number().positive('El área total debe ser mayor a 0'),
  area_construida: z.number().positive('El área construida debe ser mayor a 0'),
  numero_habitaciones: z.number().int().min(0).optional(),
  numero_banos: z.number().int().min(0).optional(),
  precio_arriendo: z.number().positive().optional(),
  precio_venta: z.number().positive().optional(),
  descripcion: z.string().optional(),
  estado: z.enum(['disponible', 'ocupado', 'mantenimiento'], {
    errorMap: () => ({ message: 'Estado debe ser: disponible, ocupado o mantenimiento' })
  }).default('disponible'),
  creado_en: z.date().optional(),
  actualizado_en: z.date().optional(),
});

export type InmuebleInput = z.infer<typeof InmuebleSchema>;