---
title: Guía de Testing
description: Estrategias y herramientas para probar el proyecto Virus.
---

## Introducción

Garantizar la estabilidad del juego, especialmente con la lógica compleja de interacciones entre cartas, es fundamental. Utilizamos diferentes niveles de pruebas.

## Backend Testing

El backend utiliza **Jest** como framework de pruebas.

### Ejecución
```bash
cd virus-backend
pnpm test
```

### Tipos de Pruebas

1.  **Unitarias (Servicios):**
    *   Probar reglas de negocio aisladas.
    *   *Ejemplo:* Verificar que un órgano no acepte un virus de otro color.
    *   *Ejemplo:* Verificar que el mazo se baraje correctamente.

2.  **Integración (Sockets):**
    *   Simular conexiones de clientes Socket.IO.
    *   Verificar que al enviar un evento `play_card`, el servidor responda con el nuevo estado correcto.

## Frontend Testing

El frontend utiliza **Jasmine** y **Karma** (o el runner configurado por defecto en Angular).

### Ejecución
```bash
cd virus-frontend
pnpm test
```

### Estrategia

*   **Componentes Aislados:** Verificar que los componentes (especialmente los "Dumb components") renderizan correctamente los inputs.
*   **Servicios:** Probar la lógica de transformación de datos en el `GameStore` y los parsers de respuestas.

## Testing Manual (QA)

Debido a la naturaleza multijugador en tiempo real, las pruebas manuales son inevitables.

### Escenario de Prueba Básico
1.  Abrir dos navegadores (o pestañas de incógnito).
2.  Navegador A: Crear Sala -> Copiar Código.
3.  Navegador B: Unirse a Sala con el Código.
4.  Navegador A: Iniciar Partida.
5.  Comprobar que ambos reciben sus cartas y ven el tablero.
6.  Realizar una ronda de jugadas y verificar la sincronización visual.
