# Virus Project Documentation

Repositorio central de documentación para el proyecto open source **Virus**.

Este sitio unifica la información técnica, guías de desarrollo y referencia de API tanto del frontend como del backend.

## 🛠️ Tecnologías

-   **Framework**: [Astro](https://astro.build)
-   **Theme**: [Starlight](https://starlight.astro.build)
-   **Diagramas**: [Mermaid](https://mermaid.js.org) (vía `astro-mermaid`)

## 🚀 Cómo ejecutar localmente

### Prerrequisitos
-   Node.js v18+
-   pnpm (recomendado)

### Pasos

1.  Instalar dependencias:
    ```bash
    pnpm install
    ```

2.  Iniciar servidor de desarrollo:
    ```bash
    pnpm dev
    ```

3.  Abrir en el navegador:
    `http://localhost:4321`

## 📂 Estructura del Contenido

La documentación se encuentra en `src/content/docs/`.

-   `index.mdx`: Página de inicio.
-   `guides/`: Guías de arquitectura, instalación y contribución.
-   `api/`: Referencia técnica (Socket.IO events, endpoints).

## 📝 Cómo contribuir a la documentación

1.  Crea o edita archivos `.md` o `.mdx` en `src/content/docs`.
2.  Usa componentes de Starlight como `<Card>`, `<Tabs>`, etc.
3.  Para diagramas, usa bloques de código con lenguaje `mermaid`.
4.  Asegúrate de que el servidor dev (`pnpm dev`) se vea correctamente antes de hacer commit.

## 📄 Licencia

Este proyecto es parte de la suite Virus Open Source y se distribuye bajo la licencia **GNU AGPLv3**.
