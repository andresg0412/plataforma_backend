# Inmuebles API Endpoint

## GET /inmuebles

Lista inmuebles con filtros opcionales según el rol del usuario autenticado.

### Autenticación
Requiere header `Authorization: Bearer <jwt_token>`

### Parámetros de consulta (Query Parameters)

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_empresa` | number | No | Filtrar por ID de empresa (solo superadmin) |
| `nombre` | string | No | Buscar por nombre del inmueble (búsqueda parcial) |
| `tipo` | string | No | Filtrar por tipo de inmueble |
| `ubicacion` | string | No | Buscar por ubicación (búsqueda parcial) |
| `precio_min` | number | No | Precio mínimo |
| `precio_max` | number | No | Precio máximo |
| `estado_activo` | boolean | No | Filtrar por estado activo |
| `page` | number | No | Página (por defecto: 1) |
| `limit` | number | No | Elementos por página (por defecto: 10, máximo: 100) |

### Permisos por rol

- **SUPERADMIN**: Ve todos los inmuebles. Puede filtrar por `id_empresa`
- **EMPRESA/ADMINISTRADOR**: Ve solo inmuebles de su empresa
- **PROPIETARIO**: Ve solo sus propios inmuebles

### Ejemplos de uso

```bash
# Listar todos los inmuebles (superadmin)
GET /inmuebles

# Buscar inmuebles por nombre
GET /inmuebles?nombre=casa

# Filtrar por rango de precio
GET /inmuebles?precio_min=100000&precio_max=500000

# Paginación
GET /inmuebles?page=2&limit=20

# Filtros combinados
GET /inmuebles?tipo=residencial&ubicacion=bogota&estado_activo=true&page=1&limit=10
```

### Respuesta

```json
{
  "isError": false,
  "code": 200,
  "data": {
    "inmuebles": [
      {
        "id_inmueble": 1,
        "id_propietario": 1,
        "id_empresa": 1,
        "nombre": "Casa en Chapinero",
        "tipo": "residencial",
        "ubicacion": "Bogotá, Chapinero",
        "precio": 350000000,
        "estado_activo": true,
        "creado_en": "2024-01-15T10:30:00.000Z",
        "propietario_nombre": "Juan",
        "propietario_apellido": "Pérez",
        "empresa_nombre": "Inmobiliaria ABC"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "timestamp": "2024-06-28T21:34:00.000Z"
}
```

### Códigos de respuesta

- `200`: Éxito
- `400`: Parámetros inválidos
- `401`: No autenticado
- `403`: Sin permisos
- `500`: Error interno del servidor