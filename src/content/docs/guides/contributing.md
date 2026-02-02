---
title: Guía de Contribución
description: Cómo colaborar en el proyecto.
---

¡Gracias por tu interés en contribuir! Este proyecto es open source y valoramos cualquier tipo de ayuda.

## Flujo de Trabajo

1.  **Fork** del repositorio que deseas mejorar (Frontend, Backend o Docs).
2.  Crea una rama (`git checkout -b feature/mi-mejora`).
3.  Implementa tus cambios.
4.  Si es código, asegúrate de que compila (`npm run build`) y pasa los tests (`npm test`).
5.  Haz Commit y Push.
6.  Abre un Pull Request describiendo tus cambios.

## Convenciones de Código

### General
-   Usamos **TypeScript** en modo estricto. Evita `any` siempre que sea posible.
-   El código debe estar en Inglés (variables, funciones, comentarios internos).
-   Los commits siguen la convención [Conventional Commits](https://www.conventionalcommits.org/) (ej: `feat: add new card logic`, `fix: resolve socket disconnect issue`).

### Backend
-   Arquitectura hexagonal simplificada:
    -   `sockets/`: Controladores de eventos.
    -   `services/`: Lógica de negocio pura.
    -   `utils/`: Helpers sin estado.
-   Evitar lógica de juego dentro de los controladores de socket. Delegar siempre a servicios.

### Frontend
-   Componentes pequeños y reutilizables.
-   Manejo de estado reactivo (Signals o RxJS) para reflejar los eventos del socket.

## Cómo agregar nuevos eventos

Si necesitas agregar una nueva funcionalidad que requiere comunicación cliente-servidor:

1.  Define la constante del evento en `SharedConstants` (si existe) o en ambos repositorios para evitar typos.
2.  Implementa el listener en el backend (`src/sockets/`).
3.  Crea el servicio correspondiente en el backend.
4.  Actualiza la documentación en `virus-docs/src/content/docs/api/socket-io.md`.
5.  Implementa el emisor/listener en el frontend (`socket.service.ts`).

## Testing

-   **Backend**: Jest. Ejecuta `pnpm test` antes de enviar tu PR.
-   **Frontend**: Karma/Jasmine. Asegúrate de que los tests existentes no se rompan.
