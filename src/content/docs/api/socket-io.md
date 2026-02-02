---
title: Referencia API Socket.IO
description: Documentación detallada de eventos y payloads de Socket.IO.
---

La comunicación entre cliente y servidor se realiza exclusivamente mediante eventos de Socket.IO.

## Eventos de Sala (Room)

Estos eventos gestionan la entrada y salida de jugadores en las salas de juego.

| Evento | Dirección | Descripción | Payload |
| :--- | :--- | :--- | :--- |
| `room:new` | Cliente -> Servidor | Crea una nueva sala. | `{ player: PlayerProfile, visibility: 'public' \| 'private' }` |
| `room:join` | Cliente -> Servidor | Une a un jugador a una sala existente. | `{ roomId: string, player: PlayerProfile }` |
| `room:leave` | Cliente -> Servidor | Un jugador abandona la sala. | `{ roomId: string, playerId: string }` |
| `room:get_all` | Cliente -> Servidor | Solicita la lista de salas públicas. | `void` |
| `rooms:list` | Servidor -> Cliente | Devuelve la lista de salas disponibles. | `RoomPublicInfo[]` |
| `room:joined` | Servidor -> Cliente | Confirma que se ha unido a la sala y envía datos iniciales. | `Room` |

## Eventos de Jugador

| Evento | Dirección | Descripción | Payload |
| :--- | :--- | :--- | :--- |
| `player:identify` | Cliente -> Servidor | Identifica el socket con un playerId persistente. | `{ playerId: string }` |
| `player:reconnect` | Cliente -> Servidor | Intenta reconectar un jugador tras una desconexión. | `{ playerId: string }` |

## Eventos de Juego (Game)

El núcleo de la interacción de la partida.

### Acciones del Cliente

| Evento | Descripción | Payload |
| :--- | :--- | :--- |
| `game:start` | El Host inicia la partida. | `{ roomId: string }` |
| `game:draw` | El jugador roba una carta de la baraja. | `{ roomId: string }` |
| `game:play_card` | Juega una carta de la mano. | `{ roomId: string, cardId: string, target?: Target }` |
| `game:discard` | Descarta una o varias cartas. | `{ roomId: string, cardIds: string[] }` |
| `game:end_turn` | Finaliza el turno voluntariamente (si aplica). | `{ roomId: string }` |

### Respuestas del Servidor

| Evento | Descripción | Payload |
| :--- | :--- | :--- |
| `game:state` | **Broadcast**. Estado público del tablero. Se emite tras cada cambio. | `GamePublicState` |
| `game:hand` | **Unicast**. Envía la mano privada al jugador específico. | `{ roomId, playerId, hand: Card[] }` |
| `game:error` | **Unicast**. Notifica un error o acción inválida. | `{ code: string, message: string }` |
| `game:end` | **Broadcast**. Notifica el fin de la partida y el ganador. | `{ roomId, winner: Player }` |

## Estructuras de Datos (Payloads)

### Target (Objetivo de carta)

Dependiendo de la carta, el `target` puede variar:

**Jugar sobre un órgano:**
```json
{
  "playerId": "target-player-id",
  "organId": "target-organ-id"
}
```

**Jugar sobre un jugador (ej: Error Médico):**
```json
{
  "playerId": "target-player-id"
}
```

**Trasplante (Intercambio):**
```json
{
  "a": { "playerId": "p1", "organId": "o1" },
  "b": { "playerId": "p2", "organId": "o2" }
}
```
