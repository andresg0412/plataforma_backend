// Helper para estructurar respuestas API
export function successResponse(data: any, code = 200) {
  return {
    isError: false,
    data,
    code,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse({
  message,
  code = 500,
  error = undefined
}: {
  message: string;
  code?: number;
  error?: any;
}) {
  return {
    isError: true,
    data: null,
    code,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
}
