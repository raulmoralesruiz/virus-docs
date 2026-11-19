---
title: Testing
description: Estrategia de tests de backend (Jest ESM) y frontend (Jest + jest-preset-angular, zoneless).
---

Ambos repos usan **Jest**. El objetivo es que la lógica de reglas del backend sea testeable sin red, y que el frontend se verifique con el entorno real de Angular (zoneless).

## Resumen

| Repo | Comando | Stack de tests |
| --- | --- | --- |
| `virus-backend` | `pnpm test` | Jest + `ts-jest` (preset ESM), `testEnvironment: node`. 175 tests. |
| `virus-frontend` | `pnpm test` | Jest + `jest-preset-angular`, `testEnvironment: jsdom`. 743 tests. |

Variantes: `pnpm test:coverage` (con cobertura) y, en backend, `pnpm test:watch`.

## Backend (`virus-backend`)

### Configuración (`jest.config.ts`)

```ts
preset: 'ts-jest/presets/default-esm',
testEnvironment: 'node',
transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
extensionsToTreatAsEsm: ['.ts'],
moduleNameMapper: { '^(.*)\\.js$': '$1' }, // import './x.js' → './x'
```

- El proyecto es **ESM** (`"type": "module"`); por eso `ts-jest` en modo ESM y el `moduleNameMapper` que resuelve los sufijos `.js`.
- Los archivos de test se colocan junto al código: `src/**/*.spec.ts`.

### Qué se prueba

- **Reglas de cartas** (`services/card/*` y `treatment/*`): son funciones puras `GameState → resultado`. Se construye un `GameState` mínimo y se comprueba éxito/`error.code` (p. ej. `COLOR_MISMATCH`, `IMMUNE_ORGAN`, `HAND_LIMIT_REACHED`).
- **Turnos** (`turn/turn.service.ts`, `turn-timer.service.ts`): avance de turno, `skipNextTurn`, timeouts.
- **Salas y jugadores** (`room.service.ts`, `player.service.ts`): crear/unirse/salir, límites de jugadores, host.
- **Mazos** (`deck.service.ts`, `config/deck.config.ts`): barajado, mazos base vs. Halloween.
- **Victoria** (`utils/victory-utils.ts`): 4 órganos sanos de colores distintos, exclusión del portador de *Truco o Trato*.

### Ejemplo de patrón

```ts
it('rechaza un virus sobre órgano inmune', () => {
  const g = estadoConOrganInmune();
  const res = playVirusCard(g, jugador, 0, { playerId: rival.id, organId: organInmune.id });
  expect(res.success).toBe(false);
  expect(res.error?.code).toBe('IMMUNE_ORGAN');
});
```

> Si aparecen handles abiertos o timers colgando, corre `npx jest --detectOpenHandles` para localizar el test (suelen ser tests de timers de turno).

## Frontend (`virus-frontend`)

### Configuración (`jest.config.js`)

```js
preset: 'jest-preset-angular',
setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
testEnvironment: 'jsdom',
moduleNameMapper: {
  '^@app/(.*)$': '<rootDir>/src/app/$1',
  '^@core/(.*)$': '<rootDir>/src/app/core/$1',
  '^@features/(.*)$': '<rootDir>/src/app/features/$1',
  '^@env/(.*)$': '<rootDir>/src/environments/$1',
  // ... @shared, @styles
},
transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|rxjs)'],
```

- **Zoneless**: `setup-jest.ts` **lanza un error si `zone.js` se carga** en el entorno de tests (el proyecto usa `provideZonelessChangeDetection()`). Por eso no se usa `fakeAsync`/`tick`; se prefieren timers de Jest o `whenStable()`.
- Stubs de APIs no implementadas en jsdom: `ResizeObserver`, `HTMLMediaElement.load`.
- `testPathIgnorePatterns` excluye `tests/` (scenarios manuales de socket) de la suite unitaria.

### Qué se prueba

- **Componentes** (features y shared): renderizado con signals, interacción (drag & drop, modales), estados de UI (error, ganador, turno).
- **Servicios core**: stores (`GameStoreService`, `RoomStoreService`), servicios de socket (con `Socket` mockeado), servicios REST (`ApiPlayerService`, `ApiRoomService`) con `HttpClientTestingModule`.
- **Modelos**: `room.model`, `card.model`, etc.

### Ejemplo de patrón (componente con signals)

```ts
it('muestra la cuenta atrás del turno', () => {
  const store = TestBed.inject(GameStoreService);
  store.publicState.set(estadoConTurno(42)); // 42 s restantes

  const fixture = TestBed.createComponent(GameTurnComponent);
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('42');
});
```

> En tests de timers se recomienda `jest.useFakeTimers()` + `jest.advanceTimersByTime()` (o `whenStable()` para el ciclo de vida de Angular), **no** `fakeAsync`/`tick`.

## Scenarios de integración (frontend)

En `virus-frontend/tests/` hay specs de alto nivel (`1-start-game`, `2-play-card`, `3-attack-player`, `4-reconnection`, `5-game-end`) que ejercitan el flujo completo contra un servidor real. No están en la suite `pnpm test` (están excluidos); se usan para validar cambios de comportamiento de extremo a extremo.

## Checklist antes de commit

- [ ] `pnpm test` verde en el repo que has tocado (y en ambos si el cambio es de API/eventos).
- [ ] Si tocas eventos Socket o REST, actualiza [Referencia API](/api/socket-io) y los tipos en `core/models`.
- [ ] Si tocas reglas, añade el caso al test correspondiente (éxito + al menos un fallo con su `code`).
