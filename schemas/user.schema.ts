import { z } from 'zod';

// Esquema basado en la tabla usuarios de la base de datos
export const UserSchema = z.object({
  id_usuario: z.number().optional(),
  nombre: z.string().min(1),
  email: z.string().email(),
  password_hash: z.string().min(6),
  id_roles: z.number(),
  id_empresa: z.number().nullable().optional(),
  creado_en: z.date().optional(),
});
