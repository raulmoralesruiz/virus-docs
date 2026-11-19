---
title: Instalación y Configuración
description: "Pasos para levantar el entorno de desarrollo completo: backend, frontend y docs."
---

Esta guía cubre cómo configurar los tres repositorios del proyecto para desarrollar en local.

## Requisitos

- **Node.js**: 20.19.0+, 22.12.0+ o 24.x (comprobado con v24).
- **pnpm**: 9 o superior (los lockfiles usan `lockfileVersion 9.0`; el backend declara `packageManager: pnpm@10.14.0`). Actívalo con `corepack enable` o instálalo con `npm i -g pnpm`.
- **Git**: para clonar los repositorios.

> El gestor de paquetes canónico del proyecto es **pnpm** (hay `pnpm-lock.yaml` en cada repo). No uses `npm`/`yarn`, que generarían lockfiles distintos.

## Estructura de directorios recomendada

Mantén los repos en la misma carpeta raíz:

```text
/virus
  ├── virus-backend    # Node.js + Express + Socket.IO (puerto 3000)
  ├── virus-frontend   # Angular zoneless (puerto 4200)
  └── virus-docs       # Astro + Starlight (esta documentación)
```

## 1. Backend (`http://localhost:3000`)

```bash
git clone <url-del-repo> virus-backend
cd virus-backend
pnpm install
pnpm dev   # tsx watch src/server.ts
```

Al arrancar expone:

| Servicio | URL |
| --- | --- |
| REST (salas, jugadores) | `http://localhost:3000/api` |
| Socket.IO | `http://localhost:3000` |
| Healthcheck | `http://localhost:3000/health` |

Notas:

- El estado es **en memoria** (`Map<roomId, GameState>`): al reiniciar el backend se pierden salas, jugadores y partidas. No hay base de datos.
- No hay variables de entorno en desarrollo; el puerto `3000` está fijado en `src/server.ts`.

## 2. Frontend (`http://localhost:4200`)

```bash
git clone <url-del-repo> virus-frontend
cd virus-frontend
pnpm install
pnpm start   # ng serve
```

Abre `http://localhost:4200`. Las URLs del backend las configura `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000/api',   // REST
  socketUrl: 'http://localhost:3000',     // Socket.IO
};
```

> La app es una **PWA instalable** (manifest + service worker). Si tienes problemas de caché tras cambios, haz un hard reload o limpia la app instalada.

## 3. Docs (`http://localhost:4321`)

```bash
git clone <url-del-repo> virus-docs
cd virus-docs
pnpm install
pnpm dev     # astro dev
```

- `pnpm build`: compila el sitio estático a `dist/`.
- `pnpm preview`: sirve el build localmente.

## Verificación rápida

Con los tres repos levantados:

1. `curl http://localhost:3000/health` → `{ "status": "ok", ... }`.
2. `curl http://localhost:3000/api/room` → `[]` (aún no hay salas).
3. Abre `http://localhost:4200` en **dos pestañas/incógnito** con dos nombres de jugador distintos, crea una sala en una y únete desde la otra, y pulsa *Iniciar*. Si la partida arranca y los turnos avanzan, todo funciona.

## Solución de problemas

| Síntoma | Causa habitual / arreglo |
| --- | --- |
| `ECONNREFUSED :3000` en el frontend | El backend no está corriendo; levanta `pnpm dev` en `virus-backend`. |
| El frontend no ve salas nuevas | Revisa `socketUrl` en `environment.ts` y que CORS no esté bloqueado en la consola. |
| Puertos ocupados | Cambia el puerto de `ng serve` (`-p 4300`) o mata el proceso del 3000. |
| `corepack` pide una versión de pnpm | El backend fija `pnpm@10.14.0`; usa esa versión o `corepack prepare pnpm@10.14.0 --activate`. |
| Comportamiento raro tras reiniciar backend | Es esperable: el estado no persiste. Vuelve a crear sala y jugadores. |

## Enlaces

- [API Socket.IO y REST](/api/socket-io)
- [Arquitectura del frontend](/guides/frontend-architecture)
- [Arquitectura del backend](/guides/backend-architecture)
