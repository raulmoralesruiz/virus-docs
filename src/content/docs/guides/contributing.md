---
title: Guía de Contribución
description: "Cómo colaborar en el proyecto: flujo, convenciones de código, ramas y checklist."
---

Gracias por querer colaborar. El proyecto tiene tres repos (`virus-backend`, `virus-frontend`, `virus-docs`) y un flujo sencillo.

## Antes de empezar

1. Lee [Instalación](/guides/installation) y levanta los tres repos.
2. Familiarízate con la [arquitectura](/guides/architecture) y la [referencia de API](/api/socket-io).
3. Abre un issue (o comenta en uno existente) antes de trabajar en cambios grandes, para no duplicar trabajo.

## Flujo de trabajo

```text
main ──► feature/branca-corta ──► PR ──► review ──► merge a main
```

1. **Rama**: crea una rama desde `main`. Nombra como `feature/<desc>`, `fix/<desc>` o `docs/<desc>` (ej. `fix/turno-timeout`, `docs/api-sockets`).
2. **Código**: desarrolla, escribe tests y mantén los de otros en verde.
3. **PR**: describe el cambio, el porqué y cómo lo probaste. Si tocas eventos/REST, enlaza el cambio en la doc de API.

## Convenciones de código

### General

- **Gestor de paquetes**: siempre **pnpm** (lockfiles `pnpm-lock.yaml`). No generes `package-lock.json` ni `yarn.lock`.
- **Idioma**: código, mensajes de error y logs en **español**; nombres de variables/funciones en **inglés** (o español si el archivo ya lo usa). Mantén coherencia por archivo.
- **Formato**: sigue el estilo ya presente en cada archivo (espacios 2, sin tabs). Hay `prettier` en el frontend.

### Backend

- ESM: los imports llevan sufijo `.js` (`import { logger } from '../utils/logger.js'`).
- La lógica de reglas vive en `services/card/*` como **funciones puras** `GameState → resultado`. No mezcles red/sockets ahí.
- Los eventos se emiten con las constantes de `constants/*.ts` (no cadenas sueltas).
- Los errores usan `GAME_ERRORS` (`error.constants.ts`), con `code` y `message`.
- Todo lo público se sirve desde `g.public`; las manos siempre por `getPlayerHand` (unicast).
- Tests: `src/**/*.spec.ts`, Jest ESM.

### Frontend

- **Zoneless**: no uses `zone.js`, `fakeAsync` ni `tick`. Estado con **signals** (`signal`, `computed`, `effect`).
- El cambio de detección lo dispara la mutación de señales; evita `OnPush` manual si no es necesario.
- Servicios `core/` son singletons; las features no deben importar otras features.
- Navegación lazy (`loadComponent` en `app.routes.ts`).
- Nombres de eventos: usa `GAME_CONSTANTS` / `PLAYER_CONSTANTS` / `ROOM_CONSTANTS` de `core/constants`, no cadenas.
- Tests: Jest + `jest-preset-angular` (jsdom). Mockea el `Socket` de `socket.io-client`.

## Checklist de pull request

- [ ] `pnpm test` en verde en los repos afectados (backend y/o frontend).
- [ ] Si tocas reglas o eventos: tests nuevos/actualizados + [Referencia API](/api/socket-io) actualizada.
- [ ] Si tocas la UI: revisado en modo claro y oscuro (`ThemeService`) y con PWA instalada.
- [ ] Sin `console.log` de depuración; usa el `logger` del backend.
- [ ] Mensaje de commit claro (imperativo, en español o inglés, según el repo).

## Formato de commit

Usa el formato convencional (recomendado):

```text
tipo(alcance): descripción corta

tipo: feat | fix | docs | style | refactor | test | chore
ej:
  feat(game): añadir tratamiento de Aparición
  fix(turno): no descartar en pendingAction al expirar
  docs(api): documentar evento room:config:update
```

## Cómo reportar bugs

Incluye:

- Repos y versiones (backend, frontend, docs).
- Pasos para reproducir (ideal con 2 jugadores reales por socket).
- Lo esperado vs. lo obtenido.
- Consolas del navegador y logs del backend (el `logger` es verboso y ayuda mucho).
