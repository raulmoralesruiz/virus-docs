---
title: Arquitectura Frontend
description: Documentación técnica del cliente Angular, gestión de estado y componentes.
---

## Visión General

El cliente del proyecto Virus es una aplicación **Angular** moderna diseñada para ser rápida, reactiva y fácil de mantener. Se comunica con el backend mediante **Socket.IO** para ofrecer una experiencia de juego en tiempo real.

### Tecnologías Clave

*   **Framework:** Angular (última versión estable)
*   **Lenguaje:** TypeScript
*   **Estilos:** CSS moderno con variables (Custom Properties)
*   **Comunicación:** `ngx-socket-io` / `socket.io-client`
*   **Iconografía:** SVG Sprites optimizados

## Estructura del Proyecto

El código fuente se encuentra en `virus-frontend/src/app` y sigue una arquitectura basada en características (**Feature-based architecture**).

```text
src/app/
├── core/               # Servicios singleton, guardias, interceptores
│   ├── services/       # Lógica de negocio global (Socket, Auth)
│   └── models/         # Interfaces y tipos compartidos
├── features/           # Módulos funcionales
│   ├── game/           # Lógica principal del juego (Tablero, Cartas)
│   ├── home/           # Pantalla de bienvenida y creación de sala
│   ├── room-list/      # Lista de salas disponibles
│   └── room/           # Sala de espera antes de iniciar
└── shared/             # Componentes reutilizables (Botones, Inputs)
```

## Gestión del Estado (Game Store)

La gestión del estado de la partida es crítica. Se utiliza un patrón de **Store centralizado** (`GameStore`) que actúa como la única fuente de verdad para el estado del juego en el cliente.

### Flujo de Datos

1.  **Evento Socket:** El servidor emite un evento (ej: `game_state_update`).
2.  **Servicio Socket:** `SocketGameService` captura el evento.
3.  **Store Update:** Se actualiza el `BehaviorSubject` o `Signal` en el `GameStore`.
4.  **Componentes:** Los componentes suscritos (Smart Components) reciben el nuevo estado y actualizan la vista automáticamente.

## Componentes

Distinguimos dos tipos de componentes para mantener la lógica separada de la presentación:

### 1. Smart Components (Contenedores)
Gestionan la lógica, se comunican con los servicios y pasan datos a sus hijos.
*   *Ejemplo:* `GameBoardComponent`, `GameLayoutComponent`.

### 2. Dumb Components (Presentacionales)
Solo se encargan de renderizar datos (`input`) y emitir eventos de usuario (`output`). No tienen dependencias de servicios complejos.
*   *Ejemplo:* `PlayerCardComponent`, `PlayerBoardComponent`.

## Sistema de Iconos (SVG Sprite)

Para optimizar el rendimiento y facilitar el mantenimiento, utilizamos un sistema de **SVG Sprites**.

*   Todos los iconos se definen en `svg-sprite.component.html`.
*   Se consumen utilizando un componente envoltorio que hace referencia al ID del símbolo SVG.
*   Esto reduce el número de nodos DOM y facilita el estilado mediante CSS (`fill`, `stroke`).

## Guía de Estilos

*   **Variables CSS:** Se definen en `:root` para colores, espaciados y tipografías.
*   **Scoped Styles:** Cada componente encapsula sus estilos (`ViewEncapsulation.Emulated`).
*   **Responsive:** Diseño fluido adaptado a escritorio y móviles (estilos condicionales y media queries).
