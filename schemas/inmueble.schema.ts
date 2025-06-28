import { z } from 'zod';

// Schema para validar los filtros de consulta de inmuebles
export const InmuebleFiltersSchema = z.object({
  id_empresa: z.coerce.number().optional(),
  nombre: z.string().optional(),
  tipo: z.string().optional(),
  ubicacion: z.string().optional(),
  precio_min: z.coerce.number().optional(),
  precio_max: z.coerce.number().optional(),
  estado_activo: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type InmuebleFiltersType = z.infer<typeof InmuebleFiltersSchema>;