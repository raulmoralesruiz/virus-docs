---
title: Instalación y Configuración
description: Pasos para levantar el entorno de desarrollo completo.
---

Esta guía cubre cómo configurar ambos repositorios para trabajar en local.

## Prerrequisitos

-   **Node.js**: v18 o superior.
-   **Gestor de paquetes**: Se recomienda `pnpm`.
-   **Git**: Para clonar los repositorios.

## Estructura de Directorios Recomendada

Recomendamos mantener los repositorios en una misma carpeta raíz:

```text
/virus-project
  ├── virus-backend
  ├── virus-frontend
  └── virus-docs
```

## 1. Configurar Backend

```bash
# Entrar al directorio
cd virus-backend

# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev
```
El servidor backend iniciará por defecto en `http://localhost:3000`.

### Variables de Entorno (Backend)

Actualmente, el backend utiliza valores por defecto para simplificar el desarrollo.
-   `PORT`: 3000 (configurable internamente).

## 2. Configurar Frontend

```bash
# Entrar al directorio
cd virus-frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm start
```
La aplicación web estará disponible en `http://localhost:4200`.

### Variables de Entorno (Frontend)

El frontend conecta por defecto a `http://localhost:3000` en el entorno de desarrollo (`src/environments/environment.development.ts`).

## Verificación

1.  Abre el navegador en `http://localhost:4200`.
2.  Deberías ver la pantalla de inicio.
3.  Si el backend está corriendo, deberías poder crear una sala o ver la lista de salas disponibles.
