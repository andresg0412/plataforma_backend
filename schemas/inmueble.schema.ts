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
  numero_habitaciones: z.number().int().min(0).optional(),
  numero_banos: z.number().int().min(0).optional(),
  precio_arriendo: z.number().positive().optional(),
  descripcion: z.string().optional(),
  estado: z.enum(['disponible', 'ocupado', 'mantenimiento'], {
    errorMap: () => ({ message: 'Estado debe ser: disponible, ocupado o mantenimiento' })
  }).default('disponible'),
});

export type InmuebleInput = z.infer<typeof InmuebleSchema>;

// Esquema para query parameters del endpoint GET /inmuebles
export const InmueblesQuerySchema = z.object({
  id_empresa: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type Inmueble = z.infer<typeof InmuebleSchema>;
export type InmueblesQuery = z.infer<typeof InmueblesQuerySchema>;
