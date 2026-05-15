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
git clone https://github.com/alemanuel18/Proyecto2_DB.git
cd proyecto2
git checkout db/Proyecto3
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
| `maria.juarez` | `Pass1234` | Bodeguero |
| `jose.perez` | `Pass1234` | Supervisor |
| `roberto.castillo` | `Pass1234` | Cajero |

---

## Matriz de Roles (Nivel Base de Datos)

El sistema implementa control de acceso granular a nivel de base de datos (`tienda_db`). Cada rol tiene permisos específicos usando `GRANT` sobre las tablas.

| Rol | Tablas Accesibles | Operaciones Permitidas |
|---|---|---|
| **Administrador** | Todas | `ALL PRIVILEGES` |
| **Vendedor** | `Cliente`, `Producto` | `SELECT` |
| | `Venta`, `Detalle`, `Cliente` | `SELECT`, `INSERT`, `UPDATE` |
| **Bodeguero** | `Categoria`, `Proveedor`, `Categoria_Producto`, `Proveedor_Producto` | `SELECT` |
| | `Producto` | `SELECT`, `INSERT`, `UPDATE` |
| **Supervisor** | Todas | `SELECT` |
| | `Proveedor`, `Cliente`, `Categoria` | `INSERT`, `UPDATE` |
| **Cajero** | `Cliente`, `Producto` | `SELECT` |
| | `Venta`, `Detalle` | `SELECT`, `INSERT`, `UPDATE` |

> [!NOTE]
> La capa del backend también cuenta con un `roleMiddleware.js` que verifica el tipo de usuario mediante el token JWT y restringe los endpoints antes de llegar a la base de datos, actuando como una doble capa de seguridad.

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
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
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
        ├── hooks/
        │   └── usePermisos.js
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
| Autorización | Middleware de roles por endpoint |
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
| Método | Ruta | Descripción | Roles permitidos |
|---|---|---|---|
| GET | `/api/clientes` | Listar clientes | Admin, Vendedor, Supervisor |
| POST | `/api/clientes` | Crear cliente | Admin |
| PUT/DELETE | `/api/clientes/:id` | Editar / eliminar | Admin |
| GET | `/api/productos` | Listar productos | Admin, Vendedor, Supervisor |
| POST | `/api/productos` | Crear producto | Admin |
| PUT/DELETE | `/api/productos/:id` | Editar / eliminar | Admin |
| GET | `/api/ventas` | Listar ventas | Admin, Vendedor, Supervisor |
| POST | `/api/ventas` | Registrar venta | Admin, Vendedor |
| DELETE | `/api/ventas/:id` | Eliminar venta | Admin, Vendedor |
| GET | `/api/proveedores` | Listar proveedores | Admin, Supervisor |
| POST | `/api/proveedores` | Crear proveedor | Admin |
| PUT/DELETE | `/api/proveedores/:id` | Editar / eliminar | Admin |
| GET/POST | `/api/categorias` | Listar / crear | Admin |

### Reportes
| Ruta | Consulta SQL usada | Roles permitidos |
|---|---|---|
| `/api/reportes/ventas-por-mes` | `GROUP BY` + `HAVING` + `SUM` | Admin, Supervisor |
| `/api/reportes/productos-mas-vendidos` | Subquery en `FROM` | Admin, Supervisor |
| `/api/reportes/clientes-sin-compras` | Subquery con `NOT IN` | Admin, Supervisor |
| `/api/reportes/top-clientes` | CTE con `WITH` | Admin, Supervisor |
| `/api/reportes/resumen-inventario` | `VIEW vista_inventario` | Admin, Supervisor |
| `/api/reportes/vendedores-activos` | Subquery con `EXISTS` | Admin, Supervisor |

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
- ✅ Control de acceso por roles (Administrador, Vendedor, Supervisor)
- ✅ CRUD completo: Clientes, Productos, Proveedores, Categorías
- ✅ Registro de ventas con múltiples productos y descuento de stock automático
- ✅ Dashboard con estadísticas en tiempo real
- ✅ 6 reportes visibles en la UI con descripción de la consulta SQL usada
- ✅ Exportar ventas y reportes a CSV desde la UI
- ✅ Manejo de errores visible en todos los formularios
- ✅ Transacción explícita con ROLLBACK en ventas
- ✅ VIEW utilizado por el backend (`vista_inventario`)
- ✅ Índices explícitos con justificación
