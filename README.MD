# Proyecto 2 — Sistema de Inventario y Ventas

**Universidad del Valle de Guatemala**  
Base de Datos 1 · Ciclo 1, 2026  
Alejandro Manuel Jerez Melgar — 24678

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Docker | 24+ |
| Docker Compose | v2 (incluido con Docker Desktop) |
| Git | cualquier versión reciente |

No se necesita Node.js, MySQL ni ningún otro runtime instalado localmente.

---

## Levantar el proyecto desde cero

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd proyecto2
```

### 2. Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

El `.env.example` ya incluye las credenciales requeridas por la rúbrica:

```env
MYSQL_ROOT_PASSWORD=rootsecret
MYSQL_DATABASE=tienda_db
MYSQL_USER=proy2
MYSQL_PASSWORD=secret
JWT_SECRET=cambia_esto_por_un_secreto_seguro
```

> ⚠️ **No cambies `MYSQL_USER` ni `MYSQL_PASSWORD`** — la rúbrica exige `proy2` / `secret`.

### 3. Levantar todos los servicios

```bash
docker compose up
```

Docker construirá las imágenes y levantará tres contenedores en orden:

```
tienda_db        → MySQL 8.0  (puerto 3306)
tienda_backend   → Node.js    (puerto 3001)
tienda_frontend  → React/Vite (puerto 5173)
```

La base de datos se inicializa automáticamente con:

| Script | Contenido |
|---|---|
| `01_DDL.sql` | Todas las tablas con PK, FK y NOT NULL |
| `02_datos_prueba.sql` | 25+ registros por tabla |
| `03_indices.sql` | 4 índices justificados |
| `04_views.sql` | Vista `vista_inventario` |

### 4. Abrir la aplicación

```
http://localhost:5173
```

**Credenciales de prueba:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `carlos.mendez` | `Pass1234` | Administrador |
| `ana.garcia` | `Pass1234` | Vendedor |
| `jose.perez` | `Pass1234` | Supervisor |

---

## Detener el proyecto

```bash
# Detener sin borrar datos
docker compose down

# Detener y borrar la base de datos (reset completo)
docker compose down -v
```

---

## Estructura del proyecto

```
proyecto2/
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── db/
│   └── init/
│       ├── 01_DDL.sql
│       ├── 02_datos_prueba.sql
│       ├── 03_indices.sql
│       └── 04_views.sql
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── routes/
│       ├── auth.js
│       ├── clientes.js
│       ├── productos.js
│       ├── ventas.js
│       ├── reportes.js
│       ├── categorias.js
│       └── proveedores.js
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        ├── api.js
        ├── components/
        │   ├── Layout.jsx
        │   └── Layout.css
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Clientes.jsx
            ├── Productos.jsx
            ├── Ventas.jsx
            ├── Reportes.jsx
            └── Proveedores.jsx
```

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Base de datos | MySQL 8.0 |
| Backend | Node.js 22 + Express |
| Frontend | React 18 + Vite |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| Contenedores | Docker + Docker Compose |

---

## API — endpoints principales

Todos los endpoints (excepto `/api/auth/login`) requieren el header:  
`Authorization: Bearer <token>`

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login, retorna JWT |
| POST | `/api/auth/logout` | Logout (stateless) |

### Recursos CRUD
| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/api/clientes` | Listar / crear clientes |
| GET/PUT/DELETE | `/api/clientes/:id` | Obtener / editar / eliminar |
| GET/POST | `/api/productos` | Listar / crear productos |
| GET/PUT/DELETE | `/api/productos/:id` | Obtener / editar / eliminar |
| GET/POST | `/api/ventas` | Listar / registrar ventas |
| GET/DELETE | `/api/ventas/:id` | Detalle / eliminar venta |
| GET/POST | `/api/proveedores` | Listar / crear proveedores |
| GET/PUT/DELETE | `/api/proveedores/:id` | Obtener / editar / eliminar |
| GET/POST | `/api/categorias` | Listar / crear categorías |

### Reportes
| Ruta | Consulta SQL usada |
|---|---|
| `/api/reportes/ventas-por-mes` | `GROUP BY` + `HAVING` + `SUM` |
| `/api/reportes/productos-mas-vendidos` | Subquery en `FROM` |
| `/api/reportes/clientes-sin-compras` | Subquery con `NOT IN` |
| `/api/reportes/top-clientes` | CTE con `WITH` |
| `/api/reportes/resumen-inventario` | `VIEW vista_inventario` |
| `/api/reportes/vendedores-activos` | Subquery con `EXISTS` |

---

## Diseño de base de datos

### Tablas

| Tabla | PK | Descripción |
|---|---|---|
| `Rol` | id_Rol | Roles de usuario |
| `Usuario` | id_Usuario | Empleados del sistema |
| `Cliente` | id_Cliente | Clientes de la tienda |
| `Venta` | id_Venta | Cabecera de cada venta |
| `Detalle` | id_Detalle | Líneas de productos por venta |
| `Producto` | id_Producto | Catálogo de productos |
| `Categoria` | id_Categoria | Categorías de productos |
| `Proveedor` | id_Proveedor | Proveedores |
| `Categoria_Producto` | (id_Categoria, id_Producto) | Relación M:N |
| `Proveedor_Producto` | (id_Proveedor, id_Producto) | Relación M:N |

### Índices definidos

| Índice | Tabla.Columna | Justificación |
|---|---|---|
| `idx_venta_fecha` | `Venta.Fecha` | Filtros y agrupaciones en reportes de ventas |
| `idx_producto_nombre` | `Producto.nombre_Producto` | Búsquedas por nombre en la UI |
| `idx_detalle_venta` | `Detalle.id_Venta` | JOINs frecuentes entre Venta y Detalle |
| `idx_usuario_nombre` | `Usuario.nombre_Usuario` | Búsqueda en login (`WHERE nombre_Usuario = ?`) |

---

## Transacciones explícitas

El registro de una venta (`POST /api/ventas`) usa una transacción explícita:

```
BEGIN
  INSERT INTO Venta ...
  FOR EACH producto:
    SELECT stock FOR UPDATE        ← bloqueo optimista
    IF stock < cantidad → ROLLBACK + error 400
    INSERT INTO Detalle ...
    UPDATE Producto SET stock = stock - cantidad
COMMIT
```

Si cualquier paso falla (stock insuficiente, producto inexistente, error de BD), se ejecuta `ROLLBACK` y ningún cambio queda guardado.

---

## Funcionalidades implementadas

- ✅ Login / logout con sesión JWT (8 horas)
- ✅ CRUD completo: Clientes, Productos, Proveedores, Categorías
- ✅ Registro de ventas con múltiples productos y descuento de stock automático
- ✅ Dashboard con estadísticas en tiempo real
- ✅ 6 reportes visibles en la UI con descripción de la consulta SQL usada
- ✅ Exportar ventas y reportes a CSV desde la UI
- ✅ Manejo de errores visible en todos los formularios
- ✅ Transacción explícita con ROLLBACK en ventas
- ✅ VIEW utilizado por el backend (`vista_inventario`)
- ✅ Índices explícitos con justificación