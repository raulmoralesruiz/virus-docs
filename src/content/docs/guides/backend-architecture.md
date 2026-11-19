---
title: Backend (Node.js)
description: "Arquitectura del servidor: Express + Socket.IO, estado en memoria, servicios de reglas y eventos."
---

El backend es un servidor **Node.js** (TypeScript, ESM) que expone la API REST mínima de arranque y toda la lógica de juego en tiempo real por **Socket.IO**. No hay base de datos: el estado vive en memoria.

## Stack

| Pieza | Uso |
| --- | --- |
| Node.js + TypeScript (ESM) | Runtime y tipado (imports con sufijo `.js`). |
| Express | REST: jugadores, salas, health. |
| Socket.IO | Lobby, partidas, eventos de juego (transporte WebSocket). |
| Jest | Tests unitarios e integrados (175 tests). |
| tsx | Desarrollo: `pnpm dev` → `tsx watch src/server.ts`. |

## Punto de entrada (`src/server.ts`)

```ts
const app = express();
app.use(cors(socketConfig.cors));
app.use(express.json());
app.use('/api', apiRouter);          // /api/player, /api/room
app.get('/health', ...);

const httpServer = createServer(app);
const io = initIO(httpServer);       // WebSocket sobre el mismo puerto 3000
registerSockets(io);                 // room + player + game events
startInactivityMonitor();            // limpieza por inactividad
httpServer.listen(3000);
```

Todo (HTTP + WS) corre en el **puerto 3000**; el cliente no necesita abrir otro.

## Estructura de carpetas

```text
src
├── server.ts                 # bootstrap: express + io + monitor
├── api/                      # REST (lectura/arranque)
│   ├── index.ts              # router /api
│   ├── player.controller.ts  # POST/GET/PUT /api/player
│   └── room.controller.ts    # GET /api/room, GET /api/room/:id
├── sockets/                  # handlers Socket.IO
│   ├── index.ts              # io.on('connect') → registra los 3 módulos
│   ├── room.events.ts        # room:new/join/getAll/leave/config:update/reset
│   ├── player.events.ts      # player:identify/reconnect (+ disconnect)
│   └── game.events.ts        # game:start/getState/draw/play-card/discard/end-turn
├── services/
│   ├── game.service.ts       # Map<roomId, GameState>, arranque, estado público, abandono
│   ├── room.service.ts       # salas, timer de lobby (10 min), config, host
│   ├── player.service.ts     # Map<playerId, Player> + socketId
│   ├── deck.service.ts       # shuffle, mazos base/Halloween
│   ├── turn-timer.service.ts # cuenta atrás del turno + timeout
│   ├── inactivity-monitor... # fin de partida por 30 min sin actividad
│   ├── game-inactivity.service.ts
│   ├── query/query.service.ts# mapToPublicState (estado → payload público)
│   └── card/
│       ├── card.service.ts   # dispatcher por kind/subtype
│       ├── draw-card.service.ts   # robar + reciclar descarte, HAND_LIMIT=3
│       ├── discard-card.service.ts
│       ├── organ-card.service.ts / virus-card.service.ts / medicine-card.service.ts
│       └── treatment/        # 11 tratamientos (trasplante, contagio, ladrón de
│                             #   órganos/colores, alien, cambio de cuerpos,
│                             #   aparición, experimento fallido, truco o trato,
│                             #   guantes, error médico)
├── constants/                # nombres de eventos, errores, turnos
├── config/                   # deck.config.ts (cartas), socket.config.ts (CORS)
├── interfaces/               # Card, Game, Player, Room
├── utils/                    # logger, organ-utils, victory, trick-or-treat, labels, history
└── ws/                       # io.ts (instancia única), emitter.ts (emisiones reutilizables)
```

## Estado en memoria

Tres contenedores globales (módulos) sostienen toda la app:

| Contenedor | Estructura | Qué guarda |
| --- | --- | --- |
| `games` | `Map<roomId, GameState>` | Mazo, descarte, manos, tableros, turno, timers, ganador, historial. |
| `rooms` | `Room[]` | Salas, host, jugadores, `inProgress`, config, `createdAt`. |
| `players` | `Map<playerId, Player>` | Jugadores con `socketId` actual y `roomId`. |

> **Consecuencia**: al reiniciar el proceso se pierde todo. Para pruebas y desarrollo es suficiente; para producción habría que persistir.

## Estado público vs. privado

`GameState` separa lo que se comparte de lo que es secreto:

| Zona | Contenido |
| --- | --- |
| `g.players` (privado) | Manos completas (`Card[]`), `skipNextTurn`. Nunca sale del servidor. |
| `g.public.players` (público) | `handCount`, `board` (órganos + cartas adheridas), `hasTrickOrTreat`. |
| `g.public` (común) | `turnIndex`, `turnDeadlineTs`, `winner`, `history`, contadores de mazo/descarte. |

`query.service.ts#mapToPublicState` construye el payload `PublicGameState` que viaja por `game:state` / `game:started`, y `getPlayerHand` genera el `PlayerHandPayload` (unicast) de cada jugador.

## Flujo de una partida

```mermaid
flowchart TD
  A[room:new / room:join] --> B[Lobby: timer 10 min\nroom:timer cada 1 s]
  B --> C[game:start\nsolo host, 2-6 jugadores]
  C --> D[buildDeck base/Halloween\nrepartir 3 cartas por jugador]
  D --> E[game:started a sala\n+ game:hand por socket]
  E --> F{Turno activo\n60 s por defecto}
  F --> G[game:draw / game:play-card\n/ game:discard / game:end-turn]
  G --> H[Validar reglas\ncard.service.ts + treatment/*]
  H -->|ok| I[game:hand + game:state\nrobar 1 y endTurn]
  H -->|fallo| J[game:error {code,message}]
  I --> K{checkVictory?\n4 órganos sanos de colores distintos}
  K -->|sí| L[game:end con winner\nsetRoomInProgress false]
  K -->|no| F
  F -->|timeout| M[descartar 1 carta al azar\ny endTurn]
  G --> N[inactivity monitor\n30 min → game:end + borrar sala]
```

Puntos clave del dispatcher (`card.service.ts`):

1. **`switch` por `kind`/`subtype`**: cada tipo de carta tiene su servicio de reglas (organ/virus/medicine + 11 tratamientos).
2. **Jugada válida** → `checkVictory(g)`. Si hay ganador, **no** roba ni avanza el turno; si fue *Aparición*, se queda con la carta y decide después.
3. **`game:play-card`** especial: si la carta jugada es *Guantes de Látex*, las manos actualizadas se emiten a **todos** (los demás ven su propia mano tras el cambio).
4. Todos los resultados de error son `{ code, message }` de `error.constants.ts` (ver [Referencia API](/api/socket-io#tabla-de-errores-gameerror)).

## Timers

| Timer | Dónde | Comportamiento |
| --- | --- | --- |
| Turno | `turn-timer.service.ts` | Emite `game:state` (volatile) cada segundo con `remainingSeconds`; al agotarse: descarta 1 carta al azar del jugador activo (salvo `pendingAction` de Aparición) y `endTurn`. |
| Lobby | `room.service.ts` | Cuenta atrás de 10 min (`room:timer`); al cero, `removeRoom` + `room:closed`. |
| Inactividad | `inactivity-monitor.service.ts` | Cada minuto: si una partida `inProgress` lleva >30 min sin `lastActionAt` → `game:error` (`INACTIVITY_TIMEOUT`), `game:end`, `room:reset` y borra la sala. |

`lastActionAt` se actualiza en cada `playCard` y `discardCards` exitosos.

## Testing

- `pnpm test`: **Jest** con 175 tests. Los servicios de reglas (`card/*`, `treatment/*`) son funciones puras de `GameState → resultado`, fáciles de testear sin red.
- `pnpm test:coverage`, `pnpm test:watch`.

## Enlaces

- [Reglas y mecánicas](/guides/game-mechanics)
- [API Socket.IO y REST](/api/socket-io)
- [Arquitectura del frontend](/guides/frontend-architecture)
