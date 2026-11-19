---
title: Glosario de Términos
description: Definiciones de todos los términos del juego y del sistema, usados en el código y en la documentación.
---

## Conceptos de juego

### Tablero y pilas

- **Body / Cuerpo**: La zona de juego de un jugador donde se colocan sus órganos. Solo se permite **un órgano por color**. Es la zona pública y visible de cada jugador.
- **Hand / Mano**: Las cartas ocultas de un jugador (máximo 3). Solo el propietario ve las cartas; los demás solo ven el recuento (`handCount`).
- **Deck / Mazo**: Pila de cartas boca abajo, compartida por la sala. Su tamaño es 68 (modo base) u 80 (modo Halloween).
- **Discard Pile / Descarte**: Pila de cartas jugadas, boca arriba y compartida. Todos ven la carta superior. Cuando el mazo se agota, el descarte se recicla (se baraja) para formar un nuevo mazo.
- **Board / Mesa**: En el estado público, la lista `board` de un jugador: sus órganos con las cartas adheridas (`attached`).
- **Attached / Adheridas**: Las cartas (virus y medicinas) pegadas a un órgano sobre la mesa.

### Cartas

- **Organ / Órgano**: Carta base. Colores: Rojo (Corazón), Verde (Estómago), Azul (Cerebro), Amarillo (Hueso), Multicolor y Naranja (Mutante). Es lo que se necesita para ganar.
- **Virus**: Carta que se adhiere a un órgano de color compatible. Un 2.º virus compatible extirpa el órgano.
- **Medicine / Medicina**: Carta que cura un virus compatible o vacuna un órgano limpio. 1 medicina = vacunado; 2 medicinas = inmune.
- **Treatment / Tratamiento**: Carta de acción instantánea (Trasplante, Contagio, Truco o Trato, Aparición…).
- **Multi / Multicolor**: Color comodín: los virus y medicinas multicolores actúan sobre cualquier color, y los órganos multicolores aceptan cualquier virus/medicina.
- **Mutant Organ / Órgano Mutante**: Órgano naranja (expansión) que al jugarse reemplaza a uno de tus órganos existentes.

### Estados de un órgano

- **Infectado**: El órgano tiene al menos un virus adherido. No cuenta para la victoria.
- **Vacunado**: El órgano tiene 1 medicina adherida (y no está infectado). La vacuna solo la rompe un virus de su color.
- **Inmune**: El órgano tiene 2 medicinas adheridas. Inmune a virus y a medicinas adicionales. Sigue contando como órgano sano.
- **Extirpado**: Órgano destruido (2 virus compatibles o reemplazado por un Mutante). Va al descarte con todo lo adherido.
- **Neutralización**: Virus y medicina de color compatible que se cancelan mutuamente y van al descarte.

### Partida

- **Turno**: Fase del jugador activo. Juega 1 carta (o descarta 1–3, o pasa), roba 1 y el turno avanza. Tiene reloj (30/60/90/120 s).
- **Fallo de turno**: El reloj llega a 0: se descarta una carta al azar de la mano y el turno pasa.
- **Skip / Turno saltado**: El jugador pierde su siguiente turno (efecto de Guantes de Látex).
- **Victory / Victoria**: 4 órganos sanos de colores distintos en el propio cuerpo. El portador de Truco o Trato queda excluido del check.
- **Pending action / Acción pendiente**: Decisión forzosa tras jugar Aparición: el jugador debe jugar la carta robada o pasar.
- **Host**: Jugador que creó la sala; puede iniciar, reiniciar y configurar la sala.
- **Trick or Treat / Truco o Trato**: Maldición: el portador no puede ganar; se transfiere al tratar órganos o viaja con el cuerpo.

## Conceptos técnicos

### Estado y arquitectura

- **GameState**: Objeto que representa toda una partida (mazo, descarte, manos privadas, estado público, turno, timers, historial, ganador, acción pendiente).
- **Public state / Estado público**: La proyección `public` del `GameState`: lo que ven todos los jugadores (tableros, contadores, turno, temporizador, historial, ganador, acción pendiente).
- **Private state / Estado privado**: Las manos reales de cada jugador. Solo el servidor y el propietario la ven (viaja por el evento `game:hand` unicast).
- **Room / Sala**: Instancia aislada de una partida: jugadores, host, visibilidad (pública/privada), configuración (modo y duración de turno) y estado `inProgress`.
- **Server-authoritative**: Toda la lógica de juego vive en el backend; el cliente solo envía intenciones y renderiza el estado. Nunca se confía en el cliente.
- **In-memory store**: El estado de salas y partidas vive en memoria del servidor (`Map<roomId, GameState>`). Al reiniciar el proceso se pierde (no hay persistencia).

### Comunicación

- **Socket.IO**: Canal de eventos en tiempo real entre cliente y servidor (transporte WebSocket). Es la vía exclusiva de juego.
- **REST API**: Endpoints HTTP de solo lectura/creación para el arranque: `GET /api/room`, `GET /api/room/:id`, `POST /api/player`, `PUT /api/player/:id`, `GET /api/player/:id`.
- **PlayerId**: Identificador único persistente de un usuario (generado en el cliente con UUID y persistido en `localStorage`). Permite reconectar tras un corte de red.
- **SocketId**: Identificador de la conexión activa. El servidor mantiene el mapa playerId ↔ socketId para enrutar los eventos privados (manos).
- **Reconnect / Reconexión**: Al reconectar, el cliente emite `player:reconnect` y el servidor reasocia el socket, reenviando sala, estado público, mano y resultado.

### Frontend

- **Zoneless**: Modo de detección de cambios de Angular sin `zone.js`; las actualizaciones se disparan por **signals**.
- **Signals**: Primitivas reactivas de Angular (`signal`, `computed`) usadas como estado observable en servicios y componentes.
- **Store service**: Servicio con signals que expone el estado reactivo de una característica (p. ej. `GameStoreService`, `RoomStoreService`).
- **Feature**: Carpeta de una funcionalidad (home, room-list, room, game) con sus componentes y plantillas.
- **PWA**: Progressive Web App: el frontend es instalable (service worker) y funciona como app en la pantalla de inicio.

### Errores

- **GameError**: Objeto `{ code, message }` que el servidor emite en `game:error`. El `code` es estable (p. ej. `NOT_YOUR_TURN`, `COLOR_MISMATCH`) y el `message` es texto legible para mostrar en la interfaz.
