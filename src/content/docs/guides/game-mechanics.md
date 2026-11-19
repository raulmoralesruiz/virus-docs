---
title: Reglas y Mecánicas del Juego
description: Guía completa, punto por punto, de las reglas, tipos de cartas, turnos y condiciones de victoria de Virus.
---

## Introducción

**Virus** es un juego de cartas rápido de sabotaje: mientras intentas montar tu propio cuerpo sano, infectas el de tus rivales, les robas órganos y les rompes la estrategia con cartas de tratamiento. La partida la gestiona por completo el servidor (el cliente solo muestra el estado), por lo que **las reglas que se implementan en el backend son la fuente de verdad**.

En esta guía:

1. [Objetivo y victoria](#objetivo-y-victoria)
2. [Montaje de la partida](#montaje-de-la-partida)
3. [Componentes del tablero](#componentes-del-tablero)
4. [Estructura del mazo](#estructura-del-mazo)
5. [El turno](#el-turno)
6. [Cartas de órgano](#cartas-de-órgano)
7. [Cartas de virus](#cartas-de-virus)
8. [Cartas de medicina](#cartas-de-medicina)
9. [Cartas de tratamiento](#cartas-de-tratamiento)
10. [Reglas especiales](#reglas-especiales)
11. [Fallo del turno y tiempos](#fallo-del-turno-y-tiempos)
12. [Salidas, abandonos y fin de partida](#salidas-abandonos-y-fin-de-partida)
13. [Resumen rápido de reglas](#resumen-rápido-de-reglas)

## Objetivo y victoria

Gana el primer jugador que tenga en su cuerpo **4 órganos sanos de colores distintos**.

Punto por punto:

1. **Sanos**: el órgano **no tiene virus** pegado. Los virus se quedan adheridos al órgano hasta que se curan o el órgano se extirpa.
2. **Colores distintos**: un color solo cuenta una vez. Tener 4 corazones sanos (o 2 rojos + 2 verdes sanos) **no** vale; se necesitan 4 colores diferentes entre los órganos sanos.
3. **En tu propia mesa**: solo cuentan los órganos de tu cuerpo, no los que robas temporalmente a otros (los robos de órgano los dejan en tu cuerpo de forma permanente, así que sí cuentan).
4. **El check de victoria ocurre tras cada jugada válida**. En cuanto alguien lo cumple, la partida termina inmediatamente (no se roba ni se pasa el turno).

:::warning
**Truco o Trato anula la victoria.** El jugador sobre el que recaiga la carta *Truco o Trato* queda excluido del check de victoria: por muchos órganos sanos que tenga, **no puede ganar** mientras la maldición esté sobre él. Ver [Reglas especiales](#reglas-especiales).
:::

Las medicinas **no** son requisito de victoria. Un órgano sano (sin virus) cuenta igual si está vacunado, inmune o sin nada.

## Montaje de la partida

- **Jugadores**: de 2 a 6 por sala.
- **Host**: el jugador que crea la sala. Es el único que puede **iniciar la partida**, **reiniciarla** y **cambiar la configuración** de la sala.
- **Modo de juego** (configuración de sala, elegible antes de empezar):
  - **Base**: mazo clásico de 68 cartas.
  - **Halloween**: base + expansión de 12 cartas (80 en total). Es el modo por defecto.
- **Duración del turno**: por defecto 60 s; configurable por sala a **30, 60, 90 o 120 s**.
- **Mano inicial**: 3 cartas por jugador. El turno empieza por el primer jugador de la sala.
- La **salud de las salas en el lobby** se cierra sola a los 10 minutos (ver [Fallo del turno y tiempos](#fallo-del-turno-y-tiempos)).

## Componentes del tablero

Cada jugador tiene:

| Zona | Contenido | Visibilidad |
| :--- | :--- | :--- |
| **Mano** | Máximo 3 cartas, ocultas | Solo el propietario ve las cartas (los demás solo el *número* de cartas) |
| **Cuerpo** | Órganos colocados, con virus y medicinas adheridos | Visible para todos |
| **Mazo** | Cartas boca abajo, compartidas por la sala | Solo se ve el contador de cartas |
| **Descarte** | Cartas jugadas, boca arriba, compartidas | Todos ven la carta superior; los demás solo el contador |

Además, todos ven en tiempo real:

- De quién es el **turno** y los **segundos restantes**.
- El **historial de jugadas** (quién jugó qué y sobre qué objetivo).
- Quién tiene **Truco o Trato**.
- Quién es el **ganador** al final.

## Estructura del mazo

### Modo base (68 cartas)

| Tipo | Color | Cantidades |
| :--- | :--- | :--- |
| **Órganos** | Rojo (Corazón), Verde (Estómago), Azul (Cerebro), Amarillo (Hueso) | 5 de cada color |
| **Órganos** | Multicolor | 1 |
| **Virus** | Rojo, Verde, Azul, Amarillo | 4 de cada color |
| **Virus** | Multicolor | 1 |
| **Medicinas** | Rojo, Verde, Azul, Amarillo | 4 de cada color |
| **Medicinas** | Multicolor | 4 |
| **Tratamientos** | Contagio | 2 |
| **Tratamientos** | Ladrón de Órganos | 3 |
| **Tratamientos** | Trasplante | 3 |
| **Tratamientos** | Guantes de Látex | 1 |
| **Tratamientos** | Error Médico | 1 |

### Expansión Halloween (+12 cartas, modo "halloween")

| Carta | Cantidad |
| :--- | :--- |
| Truco o Trato | 1 |
| Experimento Fallido | 2 |
| Ladrón de Colores (Rojo) | 1 |
| Ladrón de Colores (Verde) | 1 |
| Ladrón de Colores (Azul) | 1 |
| Ladrón de Colores (Amarillo) | 1 |
| Cambio de Cuerpos | 1 |
| Aparición | 1 |
| Trasplante Alien | 2 |
| Órgano Mutante (naranja) | 1 |

:::info
**Colores y órganos.** En este juego cada color tiene un nombre de órgano: **Rojo = Corazón, Verde = Estómago, Azul = Cerebro, Amarillo = Hueso**. El color **Multicolor** actúa como comodín con virus y medicinas. El color **Naranja** es exclusivo del Órgano Mutante (expansión).
:::

## El turno

El flujo de un turno es fijo y automático:

1. **Juegas UNA carta** (órgano, virus, medicina o tratamiento) eligiendo sus objetivos.
2. El servidor **comprueba la victoria**.
3. Si no hay ganador, **robas 1 carta** automáticamente (hasta el límite de 3).
4. El **turno pasa al siguiente jugador** (sentido de las agujas del reloj) y arranca su reloj.

Tres formas de terminar el turno sin jugar la carta "normal":

- **Descartar**: puedes descartar **1, 2 o 3 cartas** de tu mano. Robas hasta volver a 3 y el turno pasa. (Esto es la jugada `game:discard`.)
- **Pasar**: puedes simplemente finalizar el turno sin hacer nada (jugada `game:end-turn`). Solo lo puede hacer el jugador activo.
- **Fallo de tiempo**: si el reloj llega a 0, el servidor **descarta una carta al azar** de tu mano, completa la mano y pasa el turno. Ver [Fallo del turno y tiempos](#fallo-del-turno-y-tiempos).

:::note
**Guantes de Látex salta turnos.** Si un rival jugó *Guantes de Látex* contra ti, **pierdes tu siguiente turno**: el servidor completa tu mano a 3 cartas y el turno sigue pasando al siguiente jugador sin que hagas nada.
:::

Excepción importante: si jugaste **Aparición**, no robas ni pasa el turno; **debes jugar la carta que robaste en ese mismo turno** (o terminar el turno, en cuyo caso se queda en tu mano). El servidor bloquea jugar cualquier otra carta hasta que resuelvas la decisión. Ver [Aparición](#aparición).

## Cartas de órgano

Pones tu órgano en **tu propio cuerpo**. Reglas:

1. **Máximo 1 órgano por color** en tu cuerpo. Intentar poner un segundo órgano del mismo color es un error (`DUPLICATE_ORGAN`).
2. Al colocarse, el órgano va **limpio** (sin virus ni medicinas).
3. **Órgano multicolor**: cuenta como un 5.º color para la victoria (un color más de los 4 normales), pero sigue la regla de 1 por color: no puedes tener 2 multicolores.
4. **Órgano Mutante (naranja, expansión)**: es especial. Al jugarlo **debes elegir uno de tus propios órganos** (de cualquier color): ese órgano y todo lo que tenga adherido (virus y medicinas) se descartan, y el Mutante ocupa su lugar. Es una carta de reemplazo dirigida, no un color normal.
5. El color de un órgano **puede cambiar** por cartas de tratamiento (Ladrón de Colores). La restricción de duplicados se aplica al color *actual* del órgano.

## Cartas de virus

Infectas **un órgano concreto de cualquier jugador** (también el tuyo). El virus se adhiere al órgano.

Reglas de compatibilidad de color:

- El virus debe coincidir con el color del órgano, **o** ser multicolor, **o** el órgano debe ser multicolor.
- Virus rojo en Cerebro (azul) → **error** `COLOR_MISMATCH`.

Qué pasa al aplicar un virus (en este orden):

1. **Órgano inmune (2 medicinas)**: no se puede infectar. Error `IMMUNE_ORGAN`.
2. **Hay una vacuna compatible** (medicina del mismo color, o cualquiera de los dos multicolor): la vacuna **se neutraliza** — la medicina y el virus se van juntas al descarte. El órgano queda libre pero sin vacuna.
3. **Hay vacuna pero de color incompatible**: no se puede infectar (la vacuna protege; solo la rompe el virus de su color). Error `COLOR_MISMATCH`.
4. **Órgano limpio**: el virus se adhiere. El órgano queda **infectado**.
5. **Ya tenía un virus**: se **extirpa el órgano** — el órgano y todas sus cartas adheridas (virus y medicinas) van al descarte. Es la única forma de destruir un órgano ajeno directamente.

:::tip
Un virus siempre se gasta (va al descarte) en cualquier caso: o se adhiere, o neutraliza una vacuna, o destruye el órgano.
:::

## Cartas de medicina

Cura o vacuna **un órgano concreto de cualquier jugador**. La medicina se adhiere al órgano.

Reglas de compatibilidad de color: mismas que el virus (mismo color, o cualquiera multicolor).

Qué pasa al aplicar una medicina (en este orden):

1. **Órgano ya inmune (2 medicinas)**: no se puede añadir más. Error `ALREADY_IMMUNE`.
2. **Órgano infectado**: la medicina debe curar un virus **compatible** (mismo color o multicolor). Si lo hace, virus y medicina van al descarte (neutralización). Si **no** hay virus compatible, es un error: no se puede "vacunar por encima" de un virus que no matabas.
3. **Órgano limpio**: la medicina se adhiere como **vacuna**.

Estados de un órgano según sus medicinas:

| Medicinas | Estado | Efecto |
| :--- | :--- | :--- |
| 0 | Limpio / Infectado | Vulnerable a virus de su color |
| 1 | **Vacunado** | Un virus del mismo color solo logrará romper la vacuna (no infectar). Un virus de color distinto no lo toca |
| 2 | **Inmune** | Ni virus ni más medicinas lo afectan. Sigue contando como órgano sano para la victoria |

:::tip
**La inmunidad es una carta de victoria gratuita.** 2 medicinas = órgano inmune = órgano sano permanente (siempre que no lo roben o extirpen con otra carta). Es el motor defensivo del juego.
:::

## Cartas de tratamiento

Son cartas de acción instantánea. Cada una tiene su propia regla de objetivos:

### Base

#### Trasplante (3 copias)

**Intercambia 2 órganos entre 2 cuerpos** (pueden ser del mismo jugador si tienes 2 órganos de colores distintos en el tuyo, o de 2 jugadores distintos).

- Ninguno de los dos órganos puede ser **inmune**.
- Después del intercambio, **ningún jugador puede tener 2 órganos del mismo color** (si provocaría duplicado, es error `DUPLICATE_ORGAN`).
- Los virus y medicinas adheridos **viajan con el órgano**.

#### Ladrón de Órganos (3 copias)

**Roba un órgano de un rival** y lo pone en tu cuerpo.

- El órgano no puede ser inmune.
- No puedes tener ya un órgano de ese color.
- Los virus/medicinas adheridos viajan con el órgano.

#### Contagio (2 copias)

**Mueve un virus de TU órgano a un órgano rival.** Puedes usarlo varias veces en la misma carta (cada objetivo: "desde mi órgano X → al órgano Y del rival").

- El virus de origen debe estar adherido a tu órgano elegido.
- El órgano destino debe estar **limpio**: no inmune, no infectado, sin vacunas.
- El color del virus debe coincidir con el color del órgano destino (o cualquiera multicolor).

#### Guantes de Látex (1 copia)

Carta sin objetivo (afecta a **todos los demás jugadores**):

- Todos los rivales **descartan toda su mano** y roban una mano nueva de 3 cartas (reciclando el descarte si hace falta).
- Además, **pierden su siguiente turno** (lo salta el servidor automáticamente).

#### Error Médico (1 copia)

**Intercambia tu cuerpo completo con el de un rival** (todos los órganos, con sus virus y medicinas).

- No hay comprobación de duplicados de color (los cuerpos se intercambian tal cual).
- **Truco o Trato, si estaba sobre alguno de los dos cuerpos, pasa al jugador que queda con ese cuerpo** (la maldición viaja con el cuerpo, no con la persona).

### Expansión Halloween

#### Truco o Trato (1 copia)

**Maldecés a un rival**: ese jugador **deja de poder ganar** (se le excluye del check de victoria) mientras la maldición esté sobre él.

- Es visible para todos en su cuerpo.
- **Puede transferirse**: si *tú* eres el portador y aplicas una medicina sobre un órgano de un rival, la maldición pasa al rival (es la forma de pasarle la patata).
- **Viaja con el cuerpo** en *Error Médico* y *Cambio de Cuerpos*.
- Si el portador **abandona la partida**, la maldición desaparece.

#### Experimento Fallido (2 copias)

Juegas sobre un órgano (tuyo o rival) que esté **infectado o vacunado** y eliges:

- **Como medicina multicolor**: se aplica con las reglas normales de medicina (curar, vacunar…).
- **Como virus multicolor**: se aplica con las reglas normales de virus (infectar, neutralizar, extirpar…).

Es una carta "comodín total" para órganos con cartas encima.

#### Ladrón de Colores (4 copias, una por color)

**Roba un órgano de un rival, pero solo si es del color de la carta.**

- **Ignora la inmunidad**: a diferencia del Ladrón de Órganos, sí roba órganos con 2 medicinas.
- No puedes tener ya un órgano de ese color.
- Es la única forma de ganar un órgano inmune ajeno.

#### Cambio de Cuerpos (1 copias)

**Rota los cuerpos de todos los jugadores** en sentido **horario** o **antihorario** (lo eliges).

- Cada jugador recibe el cuerpo del jugador anterior (o siguiente) según el sentido.
- **Truco o Trato viaja con los cuerpos**.
- Con 2 jugadores es equivalente a un Error Médico entre los dos.

#### Aparición (1 copia)

**Robas la última carta del descarte y te la llevas a la mano.** La carta "Aparición" se descarta a cambio.

- Regla especial: **debes jugar esa carta robada en ese mismo turno** (o terminar el turno, en cuyo caso se queda en tu mano). El servidor bloquea jugar cualquier otra carta hasta que resuelvas la decisión (error `MUST_PLAY_APPARITION_CARD`).
- Si el descarte está vacío, la carta no se puede jugar.

#### Trasplante Alien (2 copias)

**Intercambia 2 órganos entre 2 cuerpos** exactamente como el Trasplante normal, **pero también puede tocar órganos inmunes**.

- Sigue habiendo la restricción de duplicados de color tras el intercambio.

#### Órgano Mutante (1 copia)

Ver [Cartas de órgano](#cartas-de-órgano): reemplaza uno de tus órganos existentes.

## Reglas especiales

### Decisión pendiente (Aparición)

Cuando se juega *Aparición*, el estado de la partida guarda una **acción pendiente** con la carta robada. Efectos:

- El jugador debe jugar esa carta concreta en ese mismo turno (jugar *Aparición* no termina el turno); cualquier otra jugada se rechaza con `MUST_PLAY_APPARITION_CARD`.
- Si el reloj de turno se agota **con una decisión pendiente**, el servidor **pasa el turno directamente** sin descartar ninguna carta al azar (la carta robada se queda en la mano para cuando le toque de nuevo).
- Al jugar la carta pendiente, la decisión se limpia.

### Truco o Trato y la victoria

Resumen de la mecánica completa:

| Situación | Qué ocurre con la maldición |
| :--- | :--- |
| Se juega *Truco o Trato* sobre un rival | El rival deja de poder ganar |
| El portador aplica medicina en órgano de otro | La maldición **pasa al rival** |
| *Error Médico* entre portador y otro | La maldición **viaja con el cuerpo** |
| *Cambio de Cuerpos* | La maldición **viaja con los cuerpos** |
| El portador abandona | La maldición **desaparece** |

### Inmunidad y robos

- **Trasplante / Ladrón de Órganos**: no pueden tocar órganos inmunes.
- **Ladrón de Colores / Trasplante Alien**: sí pueden robar/intercambiar órganos inmunes.
- La inmunidad **viaja con el órgano**: si robas un órgano inmune, tú lo tienes inmune.

## Fallo del turno y tiempos

- **Reloj de turno**: cada jugador tiene el tiempo configurado en la sala (30/60/90/120 s, por defecto 60 s). El contador se ve para todos (`remainingSeconds` en el estado público).
- **Al agotarse el reloj** (y no haber decisión pendiente):
  1. El servidor **descarta una carta al azar** de la mano del jugador activo.
  2. La mano se completa a 3 cartas y se notifica al jugador.
  3. El turno pasa al siguiente jugador.
- **Inactividad de partida**: si una sala en juego lleva **30 minutos** sin ninguna jugada válida, el servidor cierra la partida (se notifica a todos), elimina la sala y libera el estado.
- **Lobby**: una sala sin juego en curso se cierra sola a los **10 minutos** y desaparece de la lista pública.

## Salidas, abandonos y fin de partida

- **Salir de sala en juego**: tu mano y tu cuerpo se descartan al descarte; si tenías Truco o Trato, la maldición desaparece. El turno se reajusta.
- **Quedarse 1 jugador**: la partida termina de forma forzada (el último jugador no "gana"; simplemente se cierra).
- **Quedarse 0 jugadores**: la sala se elimina.
- **Cambio de host**: si el host abandona una sala con jugadores, el host pasa al siguiente jugador.
- **Conexión perdida**: el jugador puede reconectar (el identificador de jugador persiste en el navegador y el servidor reasocia el socket). Al reconectar se le reenvía la sala, el estado público, su mano y, si ya hubo ganador, el resultado.
- **Reiniciar**: solo el host, tras terminar o en cualquier momento en el lobby (evento `room:reset`), reinicia la partida con los mismos jugadores.

## Resumen rápido de reglas

| Pregunta | Respuesta |
| :--- | :--- |
| ¿Cuántos jugadores? | 2–6 por sala |
| ¿Cuántas cartas en mano? | Máximo 3 |
| ¿Gana quién? | El primero con 4 órganos sanos de colores distintos (sin Truco o Trato) |
| ¿Cuánto dura el turno? | 30/60/90/120 s según la sala (por defecto 60 s) |
| ¿Qué hago en mi turno? | Jugar 1 carta (o descartar 1–3, o pasar). Robo y paso automático |
| ¿Un virus mata un órgano? | No: un 2.º virus compatible lo **extirpa** (destruye el órgano y sus cartas) |
| ¿Qué es la inmunidad? | 2 medicinas en un órgano: inmune a virus y a más medicinas |
| ¿Qué es Truco o Trato? | El portador **no puede ganar**; la maldición puede pasarse o viajar con el cuerpo |
| ¿Se puede robar un órgano inmune? | Solo con Ladrón de Colores o Trasplante Alien |
| ¿Qué pasa si me quedo sin mazo? | Se recicla el descarte (se baraja) automáticamente |
| ¿Se puede jugar en móvil? | Sí: es una PWA instalable y la interfaz es responsive |
