# V.I.T.A.L VR Web

Experiencia educativa e inmersiva que se ejecuta en el navegador. Usa una panorámica 360° de una habitación de aislamiento hospitalaria, interacción con puntos del entorno, una misión narrativa de cinco etapas, subtítulos, controles de teclado/botones y reconocimiento de voz opcional cuando el navegador lo soporta. Al seleccionar la estación, presenta las dos imágenes de V.I.T.A.L/Voxi-Safe compartidas por el usuario con una pantalla y señales luminosas animadas de demostración. En dispositivos compatibles también ofrece WebXR.

> **Aviso:** simulación educativa. No es un sistema médico validado, no diagnostica y no debe guiar decisiones clínicas. Los estados verde/ámbar/rojo son resultados ficticios de demostración. Ante necesidades reales, acudir a profesionales sanitarios.

## Ejecutar localmente

Requiere Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite. Para generar y revisar la versión estática:

```bash
npm run build
npm run preview
```

El reconocimiento de voz solicita consentimiento explícito antes de activarse y requiere permiso de micrófono. Su disponibilidad y procesamiento dependen del navegador; el juego ofrece botones como alternativa. La aplicación no persiste respuestas ni audio. El panorama se sirve desde `public/assets/` y la escena puede abrirse sin servicios externos.

## Controles

- Ratón/táctil: arrastrar para mirar; pulsar marcadores para inspeccionar y seleccionar la estación.
- Teclado: `Y` sí, `N` no, `R` repetir, `H` ayuda, `F` finalizar, `E` continuar, `X` recentrar, flechas para mirar.
- En VR: WebXR y puntero de control si el visor/navegador admite sesión inmersiva y DOM overlay.

La guía de escenas y arquitectura Unity del prototipo previo permanece en `Docs/DISENO.md`; la versión web y su estructura están en `Docs/WEB.md`.

## GitHub Pages

El sitio del repositorio usa `npm run build:pages`, que compila con la ruta base `/GameVital/`. El flujo de publicación está en `.github/workflows/pages.yml` y se ejecuta al actualizar `main`. En GitHub configura **Settings → Pages → Build and deployment → Source: GitHub Actions** y fusiona la PR #2. Cuando termine la acción `Deploy V.I.T.A.L VR to GitHub Pages`, la página estará en <https://lnrg0125.github.io/GameVital/>.
