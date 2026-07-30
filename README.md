# 🎯 Cazador de Gastos

> Aplicación web para detección y gestión de gastos innecesarios

---

## 📖 Descripción

**Cazador de Gastos** es una API REST desarrollada en Laravel que ayuda a los usuarios a detectar gastos innecesarios mediante el análisis de ingresos y gastos. El sistema genera recomendaciones personalizadas y alertas (en la app, SMS y WhatsApp) para mejorar la administración financiera.

### Integrantes
- **Vargas Vicente Ivonee Montserrat**
- **Matias Carreño Manuel de Jesús**

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 18, Vite, Recharts |
| Base de datos | MySQL 8 |
| Autenticación | Laravel Sanctum |
| Comunicación | Postfix (email), Twilio (SMS + WhatsApp) |
| API Testing | Bruno |
| VCS | GitHub |

---

## 🗄️ Diagrama Entidad-Relación



### Tablas de la base de datos

| Tabla | Descripción |
|-------|-------------|
| `roles` | Roles del sistema (admin, advisor, standard) |
| `users` | Usuarios con su rol asignado |
| `categories` | Categorías de gastos e ingresos |
| `expenses` | Gastos registrados por usuario |
| `incomes` | Ingresos del usuario |
| `tags` | Etiquetas para gastos |
| `expense_tags` | Tabla pivote N:M expenses ↔ tags |
| `budgets` | Presupuestos mensuales por categoría |
| `alerts` | Alertas del sistema |
| `recommendations` | Recomendaciones de ahorro |

---

## 🔐 Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| **Administrador** | admin@cazador.com | Admin@12345 |
| **Asesor (Advisor)** | advisor@cazador.com | Advisor@12345 |
| **Usuario estándar** | user@cazador.com | User@12345 |

> ⚠️ Las contraseñas requieren: mínimo 8 caracteres, una mayúscula, un número y un carácter especial.

---

## 🚀 Instalación local

### Requisitos
- PHP >= 8.3
- MySQL 8.3
- Composer
- Node.js >= 20

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Editar .env con tus credenciales de MySQL y META
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Editar con la URL de tu backend
npm run dev
```

---

## 🌐 URLs del proyecto

| Recurso | URL |
|---------|-----|
| **Proyecto desplegado** | http://2.24.86.101:83/cazador-gastos/login |
| **URL base de la API** | http://2.24.86.101:82/api/v1/expenses |
| **GitHub Projects** | https://github.com/users/22161260-source/projects/2 |
| **Figma Prototipo** |  |

---

## 📡 Endpoints de la API

### Autenticación
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

### Gastos (requiere autenticación)
```
GET    /api/v1/expenses?search=&category_id=&date_from=&date_to=&page=
POST   /api/v1/expenses
GET    /api/v1/expenses/{id}
PUT    /api/v1/expenses/{id}
DELETE /api/v1/expenses/{id}
GET    /api/v1/expenses-stats?month=&year=
```

### Ingresos
```
GET    /api/v1/incomes
POST   /api/v1/incomes
PUT    /api/v1/incomes/{id}
DELETE /api/v1/incomes/{id}
```

### Presupuestos
```
GET    /api/v1/budgets?month=&year=
POST   /api/v1/budgets
PUT    /api/v1/budgets/{id}
DELETE /api/v1/budgets/{id}
```

### Alertas
```
GET    /api/v1/alerts
PUT    /api/v1/alerts/{id}/read
PUT    /api/v1/alerts/read-all
DELETE /api/v1/alerts/{id}
```

### Recomendaciones
```
GET    /api/v1/recommendations
POST   /api/v1/recommendations/{id}/send-whatsapp
PUT    /api/v1/recommendations/{id}/dismiss
```

### Reportes (Admin/Advisor)
```
GET    /api/v1/reports/monthly?month=&year=
GET    /api/v1/reports/savings
GET    /api/v1/reports/unnecessary-expenses
GET    /api/v1/reports/users
```

### Admin
```
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
PUT    /api/v1/users/{id}/toggle-active
GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/{id}
DELETE /api/v1/categories/{id}
```

---

## 📨 Comunicación con el usuario

| Canal | Disparador |
|-------|-----------|
| **Email** (GMAIL en VPS) | Registro de cuenta, recuperación de contraseña |
| **WhatsApp** (META BUSINNES) | Envío manual de recomendaciones de ahorro |

---

## 🧪 Pruebas con Bruno

La colección de Bruno está en la carpeta `/bruno/` del repositorio:
- `01-auth/login-admin.bru` — Login y obtención del token
- `02-expenses/get-expenses.bru` — Endpoint protegido con token
- `03-errors/access-denied-403.bru` — Acceso denegado por rol
- `03-errors/invalid-data-422.bru` — Datos inválidos
- `03-errors/login-standard-user.bru` — Login usuario estándar

---

## 🖥️ Despliegue en VPS

### Requisitos del servidor
- Ubuntu 22.04 LTS
- Nginx
- PHP 8.3 + FPM
- MySQL 8
- Certbot (SSL)
- Postfix (correo)

### Comandos de despliegue
```bash
# Backend
cd /var/www/cazador-de-gastos/backend
composer install --no-dev
php artisan config:cache
php artisan migrate --force
php artisan storage:link

# Frontend
cd /var/www/cazador-de-gastos/frontend
npm install
npm run build
# Copiar dist/ a /var/www/html/

# SSL
certbot --nginx -d TU VPS.COM
```

---

## 🎨 Diseño

**Paleta de colores:**
- **Verde Esmeralda** (#10b981): Representa crecimiento y prosperidad financiera
- **Azul Marino** (#1e293b): Transmite confianza, estabilidad y seriedad

**Teoría del color:** El verde estimula la motivación para ahorrar, mientras el azul oscuro crea un ambiente de seriedad y profesionalismo en la gestión financiera.

---


*© 2026 Cazador de Gastos — Vargas & Matias*

