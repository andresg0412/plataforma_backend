import { z } from 'zod';

// Esquema para respuesta de inmuebles - basado en estructura de la base de datos
export const InmuebleSchema = z.object({
  id_inmueble: z.number(),
  direccion: z.string(),
  tipo: z.string().optional(),
  valor_arriendo: z.number().optional(),
  estado: z.string().optional(),
  id_empresa: z.number(),
  id_propietario: z.number().optional(),
  creado_en: z.date().optional(),
  empresa_nombre: z.string().optional(),
  propietario_nombre: z.string().optional(),
  propietario_telefono: z.string().optional(),
});

// Esquema para query parameters del endpoint GET /inmuebles
export const InmueblesQuerySchema = z.object({
  id_empresa: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type Inmueble = z.infer<typeof InmuebleSchema>;
export type InmueblesQuery = z.infer<typeof InmueblesQuerySchema>;