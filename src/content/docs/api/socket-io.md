---
title: Referencia API (Socket.IO y REST)
description: Documentación detallada de todos los eventos de Socket.IO, sus payloads, y los endpoints REST del backend.
---

La comunicación de juego es **exclusivamente por eventos de Socket.IO** (transporte WebSocket). El REST solo se usa para el arranque: listar salas, leer una sala y gestionar el identificador de jugador.

- **Base URL del backend**: `http://localhost:3000` (configurable en `environment.ts` del frontend).
- **Conexión**: `io('http://localhost:3000', { transports: ['websocket'] })`.
- **Identidad**: el socket se asocia a un jugador mediante `socket.data.playerId` (servidor). El cliente persiste el jugador en `localStorage` y se identifica con `player:identify` / `player:reconnect`.

## Tipos compartidos

```ts
// Identidad
interface Player { id: string; name: string; socketId?: string; roomId?: string }

// Carta
type CardKind = 'organ' | 'virus' | 'medicine' | 'treatment';
type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'multi' | 'halloween' | 'orange' | 'treatment';
interface Card { id: string; kind: CardKind; color: CardColor; subtype?: string }

// Órgano sobre la mesa (con cartas adheridas)
interface OrganOnBoard extends Card { attached: Card[] }

// Estado público de un jugador (lo que ven los demás)
interface PublicPlayerInfo {
  player: Player;
  board: OrganOnBoard[];
  handCount: number;            // solo el recuento, nunca las cartas
  hasTrickOrTreat?: boolean;
}

// Estado público de la partida
interface PublicGameState {
  roomId: string;
  startedAt: string;            // ISO
  discardCount: number;
  topDiscard?: Card;            // última carta del descarte
  deckCount: number;
  players: PublicPlayerInfo[];
  turnIndex: number;            // índice en players del jugador activo
  turnDeadlineTs: number;       // epoch ms
  remainingSeconds: number;     // recalculado en cada emisión
  winner?: PublicPlayerInfo;    // presente solo cuando hay ganador
  history: HistoryEntry[];      // historial de jugadas
  pendingAction?: { type: 'ApparitionDecision'; playerId: string; cardId: string };
}

interface HistoryEntry {
  plainText?: string;
  player?: string;
  action?: string;
  cardName?: string;
  cardColor?: string;
  target?: string;
}

// Sala
interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  inProgress: boolean;
  visibility: 'public' | 'private';
  config: { mode: 'base' | 'halloween'; timerSeconds: 30 | 60 | 90 | 120 };
  createdAt: number;
}

// Pago de mano privada (solo va al propietario)
interface PlayerHandPayload { roomId: string; playerId: string; hand: Card[] }

// Error de juego
interface GameError { code: string; message: string }
```

## Objetivos de jugada (`target`)

El campo `target` de `game:play-card` cambia según el tipo de carta:

```ts
// Órgano (Mutante: reemplaza), Virus, Medicina, Ladrón de Órganos,
// Ladrón de Colores, Trasplante Alien, etc.
type SimpleTarget = { playerId: string; organId: string }

// Trasplante / Trasplante Alien (2 órganos)
type TransplantTarget = {
  a: { playerId: string; organId: string };
  b: { playerId: string; organId: string };
}

// Contagio (una o varias parejas origen→destino)
type ContagionTargets = Array<{
  fromOrganId: string;      // órgano tuyo con el virus
  toPlayerId: string;       // rival destino
  toOrganId: string;
}>

// Error Médico, Truco o Trato (solo jugador)
type PlayerTarget = { playerId: string }

// Experimento Fallido
type FailedExperimentTarget = {
  playerId: string;
  organId: string;
  action: 'medicine' | 'virus';
}

// Cambio de Cuerpos
type BodySwapTarget = { direction: 'clockwise' | 'counter-clockwise' }
```

## Eventos por jugador

El cliente persiste el jugador en `localStorage` y lo asocia al socket al conectar.

| Evento | Dirección | Payload | Descripción |
| --- | --- | --- | --- |
| `player:identify` | C → S | `{ playerId: string }` | Asocia el socket con un jugador existente. El servidor liga `socket.data.playerId` y guarda el `socketId` del jugador. |
| `player:identified` | S → C | `{ ok: boolean; reconnected?: boolean }` | Confirmación de identidad (o reconexión) aceptada. |
| `player:reconnect` | C → S | `{ playerId: string }` | Reconexión: reasocia el socket y reemite, en orden, `room:joined`, `game:state`, `game:hand` (si hay partida en curso) y `game:end` (si ya hubo ganador). Termina emitiendo `player:identified` con `reconnected: true`. |

> Los eventos `player:new`, `player:created`, `player:getById`, `player:found` y `player:notFound` existen como constantes (`PLAYER_CONSTANTS`) pero sus handlers están comentados: la creación y lectura de jugadores se hace por **REST** (ver abajo).

## Eventos por sala (lobby)

| Evento | Dirección | Payload | Descripción |
| --- | --- | --- | --- |
| `room:new` | C → S | `{ player: Player; visibility?: 'public' \| 'private' }` | Crea la sala, une automáticamente al host y arranca el **timer de lobby** (10 min). |
| `room:join` | C → S | `{ roomId: string; player: Player }` | Une a un jugador. Solo si la sala no está `inProgress` y no supera 6 jugadores. |
| `room:getAll` | C → S | — | Pide la lista de salas → responde `rooms:list`. |
| `room:leave` | C → S | `{ roomId: string; playerId: string }` | Saca al jugador. Si la partida queda sin jugadores suficientes, emite `game:state` (`null`) y `game:end` (`winner: null`). |
| `room:config:update` | C → S | `{ roomId: string; config: RoomConfig }` | Cambia `mode` / `timerSeconds`. **Solo el host** y solo si la partida no ha empezado. |
| `rooms:list` | S → C | `Room[]` | Broadcast de la lista de salas **públicas** tras crear/unirse/salir. |
| `room:joined` | S → C | `Room` | Estado actual de la sala (se reemite al unirse, al salir alguien y al actualizar la config). |
| `room:timer` | S → C | `{ remainingSeconds: number }` | Broadcast cada segundo mientras corre el timer de lobby (10 min; al agotarse la sala se cierra y se emite `room:closed`). |
| `room:closed` | S → C | — | La sala se cerró al agotar el timer de lobby (10 min). El servidor expulsa a los sockets de la sala. (El cierre por inactividad **durante** la partida —30 min— emite `game:error` `INACTIVITY_TIMEOUT` + `game:end` + `room:reset`, no este evento.) |
| `room:reset` | C → S | `{ roomId: string }` | Reinicia la partida con los mismos jugadores (equivalente a `game:start`): emite `game:started`, las manos y `game:end` con `winner: null`. **Nota**: la restricción a host se hace solo en la UI (el servidor no valida `hostId` en este handler); y al resetear las manos se emiten a la **sala entera** (el cliente filtra por `playerId`). |

## Eventos de partida

| Evento | Dirección | Payload | Descripción |
| --- | --- | --- | --- |
| `game:start` | C → S | `{ roomId: string }` | **Solo el host** inicia la partida. Requiere 2–6 jugadores. Emite `game:started` a la sala y `game:hand` por socketId a cada jugador. |
| `game:started` | S → C | `PublicGameState` | Estado público inicial (broadcast a la sala). No incluye manos. |
| `game:hand` | S → C (unicast) | `PlayerHandPayload` | Mano privada del jugador. Se emite al iniciar, al robar, al descartar, tras jugar y al reiniciar. Con *Guantes de Látex* se emite a **todos** (cada uno recibe la suya). |
| `game:getState` | C → S | `{ roomId: string }` | Pide el estado público actual → responde `game:state`. |
| `game:state` | S → C | `PublicGameState` | Estado público tras cada acción válida (turno activo, deadline, historial, tableros, contadores). |
| `game:draw` | C → S | `{ roomId: string }` | Roba una carta (solo en tu turno). Si el mazo está vacío, recicla el descarte conservando la carta superior. |
| `game:play-card` | C → S | `{ roomId: string; cardId: string; target?: AnyPlayTarget }` | Juega una carta. El `target` varía según el tipo (ver "Objetivos de jugada"). El jugador se deduce de `socket.data.playerId`. |
| `game:discard` | C → S | `{ roomId: string; cardIds: string[] }` | Descarta 1–3 cartas propias, rellena la mano hasta 3 y **finaliza el turno** (solo en tu turno). Emite `game:state` + `game:hand`. |
| `game:end-turn` | C → S | `{ roomId: string }` | Termina el turno: limpia cualquier `pendingAction` (p. ej. Aparición pendiente), avanza al siguiente jugador (que completa su mano hasta 3 cartas si tiene `skipNextTurn`, p. ej. Guantes de Látex) y programa el timer del nuevo turno. |
| `game:error` | S → C | `GameError` | Error de validación de cualquier evento de partida (código + mensaje en español). |
| `game:end` | S → C | `{ roomId: string; winner: PublicPlayerInfo \| null }` | Fin de la partida (victoria, abandono forzado o reset). `winner: null` indica fin sin ganador. |

### Comportamiento tras cada acción válida

Todo evento de partida que modifica el estado termina emitiendo:

1. `game:state` → broadcast a la sala con el **estado público** actualizado.
2. `game:hand` → unicast al jugador que actuó con su **mano privada** (solo cuando la mano cambia: al robar, descartar o jugar; no al terminar turno).

Los errores nunca modifican el estado: se responde únicamente con `game:error`.

> **Tick del timer**: mientras dura un turno, el servidor emite `game:state` (volatile) **una vez por segundo** con `remainingSeconds` recalculado. Al agotarse el tiempo, el jugador activo descarta 1 carta al azar y su mano se rellena — salvo si hay `pendingAction` (Aparición), en cuyo caso solo pasa el turno y se queda la carta.

## Endpoints REST

Base URL: `http://localhost:3000` (`environment.baseUrl = http://localhost:3000/api` en el frontend). CORS abierto (config `socket.config.ts`).

| Método | Ruta | Cuerpo | Respuesta 2xx | Errores |
| --- | --- | --- | --- | --- |
| `GET` | `/api/room` | — | `Room[]` — solo salas **públicas** | — |
| `GET` | `/api/room/:id` | — | `Room` | `404` `{ error: 'Room not found' }` |
| `POST` | `/api/player` | `{ name: string }` | `Player` — jugador creado (el frontend lo guarda en `localStorage`) | `400` `{ error: 'Name is required' }` |
| `GET` | `/api/player/:id` | — | `Player` | `404` `{ error: 'Player not found' }` |
| `PUT` | `/api/player/:id` | `{ name: string }` | `Player` — nombre actualizado (el frontend crea uno nuevo si recibe `404`) | `400` / `404` |
| `GET` | `/health` | — | `{ status: 'ok', time: ISO }` | — |

> **Nota**: crear sala y unirse a ella **no** se hace por REST, sino por eventos de Socket.IO (`room:new`, `room:join`). El REST solo cubre el arranque (lista de salas, lectura de una sala) y el identificador del jugador.
>
> Todo el estado es **en memoria** (`Map<roomId, GameState>`): al reiniciar el backend se pierden salas, jugadores y partidas.

## Tabla de errores (`game:error`)

Todos los errores de partida siguen la forma `{ code, message }`:

| `code` | Mensaje | Cuándo ocurre |
| --- | --- | --- |
| `NO_PLAYER` | Jugador no identificado | Socket sin `playerId` asociado al actuar. |
| `NOT_HOST` | Solo el host puede reiniciar la partida | Definida en `error.constants.ts` pero **no se emite actualmente**: `room:reset` no valida `hostId` en el servidor (la restricción es solo de UI). |
| `NUMBER_PLAYERS` | Número de jugadores incorrecto | `game:start` con menos de 2 o más de 6 jugadores. |
| `PLAYER_NOT_IDENTIFIED` | Jugador no identificado | El socket no está ligado a ningún jugador. |
| `ROOM_NOT_FOUND` / `NO_ROOM` | Sala no existe | Operación sobre una sala inexistente. |
| `NOT_IN_ROOM` | No perteneces a esta sala | El jugador no está en la sala indicada. |
| `GAME_NOT_FOUND` / `NO_GAME` | Partida no encontrada | Operación de partida sin juego activo en la sala. |
| `NOT_YOUR_TURN` | No es tu turno | Robar, descartar, jugar carta o terminar turno fuera de turno. |
| `NO_CARDS_LEFT` | No hay cartas para robar | Mazo y descarte vacíos a la vez. |
| `NO_CARD` | No tienes esa carta en mano | La carta a jugar/descartar no está en tu mano. |
| `PUBLIC_MISSING` | Estado público no encontrado | El estado público de la partida no está inicializado. |
| `DUPLICATE_ORGAN` | Ya tienes un órgano de ese color | Juegas un segundo órgano del mismo color. |
| `NO_TARGET` | Debes seleccionar un órgano a infectar | Carta dirigida sin `target` completo. |
| `INVALID_TARGET` | Objetivo inválido | `target` presente pero mal formado. |
| `NO_ORGAN` | Órgano no encontrado | El órgano objetivo no existe en el tablero. |
| `COLOR_MISMATCH` | La carta no coincide con el color del órgano | Virus/medicina/órgano incompatible con el color del órgano (Multi es comodín). |
| `UNSUPPORTED_CARD` | Tipo de carta no soportado aún | `kind` desconocido en el dispatcher. |
| `UNSUPPORTED_TREATMENT` | Tipo de tratamiento no soportado aún | `subtype` de tratamiento desconocido. |
| `EMPTY_DISCARD` | El mazo de descartes está vacío | Se intentó reciclar el descarte estando vacío. |
| `SERVER_ERROR` | Error interno | Excepción no controlada en el handler. |
| `ALREADY_IMMUNE` | El órgano ya está inmune | Segunda medicina sobre un órgano ya inmune. |
| `IMMUNE_ORGAN` | El órgano es inmune | Virus sobre un órgano con 2 medicinas (inmune). |
| `HAND_LIMIT_REACHED` | Has alcanzado el límite de cartas en mano | Robar con 3 cartas en mano. |
| `NO_VIRUS` | Virus no encontrado | Tratamiento que requiere virus sobre un órgano sin virus. |
| `ORGAN_NOT_INFECTED_OR_VACCINATED` | El órgano debe estar infectado o vacunado | Experimento Fallido sobre órgano sano. |
| `ORGAN_NOT_VACCINATED` | El órgano no está vacunado | Tratamiento que requiere órgano vacunado. |
| `ORGAN_NOT_INFECTED` | El órgano no está infectado | Tratamiento que requiere órgano infectado. |
| `INVALID_ACTION` | Acción no válida | Acción inválida para el contexto (p. ej. experimento fallido). |

## Enlaces

- [Reglas y mecánicas](/guides/game-mechanics)
- [Glosario de términos](/reference/glossary)
- [Arquitectura del backend](/guides/backend-architecture)
