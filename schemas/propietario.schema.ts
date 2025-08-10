import { z } from 'zod';

export const PropietarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  cedula: z.string().min(1, 'Cédula es requerida'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  id_empresa: z.number().positive('ID de empresa debe ser positivo'),
});

export const CreatePropietarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  cedula: z.string().min(1, 'Cédula es requerida'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  id_empresa: z.number().positive('ID de empresa debe ser positivo'),
});

export const GetPropietariosQuerySchema = z.object({
  id_empresa: z.number().positive().optional(),
});

export type PropietarioInput = z.infer<typeof PropietarioSchema>;
export type CreatePropietarioInput = z.infer<typeof CreatePropietarioSchema>;
export type GetPropietariosQueryInput = z.infer<typeof GetPropietariosQuerySchema>;
