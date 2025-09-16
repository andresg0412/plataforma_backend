import { EditReservaRequest } from '../../interfaces/reserva.interface';
import { ReservasRepository } from '../../repositories/reservas.repository';

const reservasRepository = new ReservasRepository();

export async function editReservaService(id: number, data: EditReservaRequest) {
  // Validar que al menos un campo editable esté presente
  const editableFields = [
    'fecha_entrada',
    'fecha_salida',
    'numero_huespedes',
    'precio_total',
    'estado',
    'observaciones',
    'id_empresa'
  ];
  const fieldsToUpdate: any = {};
  for (const key of editableFields) {
    if (data[key as keyof EditReservaRequest] !== undefined) {
      fieldsToUpdate[key] = data[key as keyof EditReservaRequest];
    }
  }
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('Debe enviar al menos un campo editable para actualizar la reserva.');
  }
  // Actualizar la reserva principal
  const updated = await reservasRepository.updateReserva(id, fieldsToUpdate);
  if (!updated) {
    throw new Error('No se pudo actualizar la reserva.');
  }
  // TODO: Si se envían huéspedes, actualizar la relación huespedes-reserva
  // (No implementado aquí, requiere lógica adicional)
  return updated;
}
