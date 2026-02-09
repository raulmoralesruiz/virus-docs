---
title: Arquitectura Backend
description: Documentación del servidor Node.js, gestión de salas y motor de juego.
---

## Visión General

El backend está construido con **Node.js** y **TypeScript**, utilizando **Express** para la API básica y **Socket.IO** para la comunicación bidireccional en tiempo real. Su responsabilidad principal es validar la lógica del juego y sincronizar el estado entre todos los clientes.

### Tecnologías Clave

*   **Runtime:** Node.js
*   **Lenguaje:** TypeScript
*   **WebSockets:** Socket.IO
*   **Nodemon:** Para desarrollo (Hot Reload)

## Estructura del Proyecto

El código fuente reside en `virus-backend/src`.

```text
src/
├── api/            # Endpoints REST
├── config/         # Configuración de entorno
├── services/       # Lógica de negocio
│   ├── game/       # Reglas del juego y validaciones
│   └── room/       # Gestión de salas
├── sockets/        # Manejadores de eventos de Socket.IO
├── utils/          # Utilidades generales
└── server.ts       # Punto de entrada de la aplicación
```

## Motor del Juego (Game Loop)

El núcleo del backend es el motor de juego, que procesa las acciones de los jugadores de forma secuencial y atómica.

1.  **Recepción:** El servidor recibe un evento `game:play_card` con el `cardId` y el `target`.
2.  **Validación:**
    *   ¿Es el turno del jugador?
    *   ¿Tiene la carta en su mano?
    *   ¿Es un objetivo válido para esa carta? (Ej: No jugar Virus rojo sobre Órgano azul).
3.  **Ejecución:**
    *   Se aplica el efecto de la carta (modificar estado del tablero).
    *   Se mueve la carta al descarte.
4.  **Comprobación de Victoria:** ¿El jugador tiene 4 órganos sanos tras la jugada?
5.  **Actualización:**
    *   Si gana: Emite `game:end`.
    *   Si no: Emite `game:state` a todos los clientes con el nuevo tablero.

## Gestión de Salas (Rooms)

El sistema de salas permite múltiples partidas simultáneas.

*   **Room ID:** Identificador único generado (corto y legible para compartir).
*   **Estado:** `WAITING` (Lobby), `PLAYING` (En curso), `FINISHED`.
*   **Persistencia:** Actualmente en memoria (los datos se pierden si el servidor se reinicia). Para producción se recomendaría Redis.

## Sistema de Eventos

La comunicación es puramente basada en eventos. Ver la [Referencia API Socket.IO](/api/socket-io) para una lista completa.

### Manejo de Desconexiones

El servidor implementa un sistema básico de "reconectividad":
*   Si un socket se desconecta, el jugador permanece en la sala un tiempo prudencial.
*   Si el cliente se reconecta con el mismo `playerId`, se le reasigna su socket y se le envía el estado actual para que retome la partida.
