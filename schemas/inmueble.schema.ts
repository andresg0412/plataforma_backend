import { z } from 'zod';

export const InmueblesQuerySchema = z.object({
  id_empresa: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
}).strict();