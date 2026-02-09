---
title: Glosario de Términos
description: Definiciones de términos comunes usados en el código y documentación.
---

## Conceptos de Juego

*   **Body (Cuerpo):** Zona de juego de cada jugador donde se colocan los órganos. Máximo 1 órgano de cada color.
*   **Hand (Mano):** Las 3 cartas que el jugador tiene ocultas y disponibles para jugar.
*   **Deck (Mazo):** Pila de cartas boca abajo de donde roban los jugadores.
*   **Discard Pile (Descarte):** Pila de cartas jugadas o descartadas, boca arriba. Si el mazo se agota, el descarte se baraja para formar un nuevo mazo.
*   **Organ (Órgano):** Carta base de color (Rojo, Azul, Verde, Amarillo, Multicolor).
*   **Treatment (Tratamiento):** Carta de acción instantánea.

## Conceptos Técnicos

*   **Room (Sala):** Instancia aislada de una partida. Contiene la lista de jugadores conectados y el estado actual del juego.
*   **Host:** El jugador que creó la sala. Tiene permisos especiales para iniciar la partida o expulsar jugadores.
*   **PlayerId:** Identificador único persistente de un usuario (UUID). Permite reconectar si se cae el socket.
*   **SocketId:** Identificador efímero de la conexión actual. Cambia si la página se recarga.
*   **GameState:** Objeto JSON masivo que representa la "verdad" de la partida en un momento dado (tableros, turnos, cartas).
