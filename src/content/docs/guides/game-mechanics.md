---
title: Reglas y Mecánicas del Juego
description: Explicación detallada de las reglas, tipos de cartas y flujo del juego Virus.
---

## Introducción

**Virus** es un juego de cartas rápido y adictivo donde el objetivo es mantener tu cuerpo a salvo de infecciones mientras intentas boicotear a tus rivales. El objetivo final es ser el primer jugador en completar un cuerpo con **4 órganos sanos** de diferente color.

## Objetivo del Juego

Para ganar, un jugador debe tener en su zona de juego **4 órganos de diferente color** (Corazón, Estómago, Hueso, Cerebro) que estén:
1.  **Sanos** (sin virus).
2.  **Vacunados** (con una medicina).
3.  **Inmunizados** (con dos medicinas).

Los órganos infectados (con un virus) no cuentan para la victoria, pero siguen ocupando un espacio en tu cuerpo. Si un órgano acumula 2 virus, es extirpado (destruido).

## Componentes del Juego

El mazo se compone de diferentes tipos de cartas:

### 1. Órganos (Base del cuerpo)
Son la base para ganar. Solo puedes tener uno de cada color en tu zona de juego.

| Icono | Color | Descripción |
| :--- | :--- | :--- |
| ❤️ | Rojo | Corazón |
| 🦴 | Amarillo | Hueso |
| 🧠 | Azul | Cerebro |
| 🥯 | Verde | Estómago |
| 🌈 | Multicolor | Órgano comodín |

### 2. Virus (Ataque)
Sirven para destruir los órganos de los rivales.
*   **Infectar:** Coloca un virus sobre un órgano libre del mismo color de un rival.
*   **Destruir:** Coloca un virus sobre un órgano ya infectado del mismo color. El órgano y los dos virus se descartan.
*   **Neutralizar Vacuna:** Coloca un virus sobre un órgano vacunado (con una medicina) para eliminar la medicina.

### 3. Medicinas (Defensa)
Protegen tus órganos.
*   **Curar:** Coloca una medicina sobre un órgano infectado para eliminar el virus.
*   **Vacunar:** Coloca una medicina sobre un órgano libre para protegerlo.
*   **Inmunizar:** Coloca una segunda medicina sobre un órgano vacunado. Este órgano se vuelve **inmune** y ya no puede ser atacado por virus ni afectado por cartas de tratamiento (excepto casos especiales).

### 4. Tratamientos (Acciones Especiales)
Son cartas de acción inmediata que pueden cambiar el curso de la partida. Se juegan y van directamente al descarte.

*   **Trasplante (Transplant):** Intercambia un órgano entre dos jugadores. No importa si están sanos, infectados o vacunados (salvo inmunizados).
*   **Ladrón de Órganos (Thief):** Roba un órgano de otro jugador y añádelo a tu cuerpo.
*   **Contagio (Contagion):** Pasa tantos virus como puedas de tus órganos a los de los demás jugadores.
*   **Guante de Látex (Latex Glove):** Todos los demás jugadores pierden su turno (descartan su mano y no roban).
*   **Error Médico (Medical Error):** Intercambia todo tu cuerpo con el de otro jugador.

## Flujo del Turno

Cada jugador comienza con **3 cartas**. En su turno, un jugador debe seguir estos pasos:

1.  **Acción (Elegir una):**
    *   **Jugar carta:** Coloca una carta en tu zona de juego o en la de un rival.
    *   **Descartar:** Descarta tantas cartas como quieras de tu mano si no puedes o no quieres jugar.
2.  **Robar:** Roba cartas del mazo hasta volver a tener **3 cartas** en la mano.
3.  **Paso de Turno:** El turno pasa al siguiente jugador.

## Condiciones de Validación

El sistema digital valida automáticamente las jugadas según estas reglas:

*   No puedes jugar un órgano si ya tienes uno de ese color (salvo que uses el multicolor estratégicamente).
*   Los colores deben coincidir: Virus Rojo solo afecta a Órganos Rojos o Medicinas Rojas.
*   Las cartas comodín (Multicolor) pueden afectar o ser afectadas por cualquier color.
*   Los órganos inmunizados (2 medicinas) son intocables.
