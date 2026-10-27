# V.I.T.A.L VR Web — guía de ejecución

## Qué incluye

Una experiencia de navegador sin Unity basada en un panorama equirectangular 360° generado para el prototipo. Three.js renderiza la habitación desde un visor en primera persona; la escena permite arrastrar para mirar y seleccionar marcadores de la cama, ventana, lavamanos y estación V.I.T.A.L. Un HUD narrativo acompaña cinco etapas: bienvenida, exploración, conversación, evaluación demostrativa y cierre.

La habitación se representa con la panorámica (`public/assets/isolation-room-360.jpg`), no con geometría arquitectónica editable. Esto da al prototipo una apariencia de fotografía inmersiva, aunque no equivale a una recreación 3D fotogramétrica de un hospital real. El punto interactivo de la estación abre una ficha que sí utiliza las dos imágenes aportadas por el usuario (`vital-device-front.jpg` y `voxi-safe-concept.jpg`), incluye selector de vista y superpone una pantalla de ejemplo animada sobre la vista frontal. Para adaptar dimensiones, objetos o dispositivos dentro del entorno panorámico, sustituir la panorámica por fotografía 360° autorizada o por un modelo 3D optimizado.

## Publicación en GitHub Pages

El sitio de proyecto se sirve bajo `/GameVital/`, no en la raíz del dominio. `npm run build:pages` genera el bundle con esa base y el workflow `.github/workflows/pages.yml` publica desde `main`. Para habilitarlo, configura en el repositorio GitHub **Settings → Pages → Build and deployment → Source → GitHub Actions** y fusiona la PR #2. La ejecución de Actions que finalice correctamente servirá <https://lnrg0125.github.io/GameVital/>. Si la fuente de Pages continúa en “Deploy from a branch”, el workflow no podrá publicar hasta cambiar esa opción.

## Inicio

Requisitos: Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Vite sirve el sitio en la URL local que imprime el comando. Para probar el build:

```bash
npm run build
npm run preview
```

Se puede publicar el directorio `dist/` en cualquier hosting estático con soporte HTTPS. Se necesita HTTPS (o localhost) para varios permisos de navegador, especialmente micrófono y WebXR. El modo de escritorio con botones no necesita permisos.

## Estructura

```text
index.html                         Estructura del HUD, controles y modales accesibles
src/main.js                        Panorama Three.js, hotspots, flujo, voz, WebXR
src/style.css                      Interfaz responsive y estados visuales
public/assets/isolation-room-360.jpg  Entorno panorámico inmersivo
```

## Flujo y mecánicas

1. **Bienvenida:** explicación educativa, controles, ayuda y opción de salida.
2. **Exploración:** arrastrar para mirar; seleccionar la estación señalada junto al lavamanos. Botón de continuar permite avanzar sin seleccionar.
3. **Conversación:** tres preguntas ficticias Sí/No; se puede responder con botones, teclado o voz consentida.
4. **Evaluación:** reglas de demostración codificadas en `evaluateSimulation()`. Sí en la pregunta de ayuda produce una etiqueta prioritaria demostrativa; dos o más No producen seguimiento ficticio; las demás respuestas producen estado ficticio estable. Nunca son umbrales clínicos.
5. **Cierre:** explicación de límites y opción de reiniciar. Las respuestas existen sólo en memoria y se eliminan al reiniciar o recargar.

## Voz, privacidad y accesibilidad

La app no activa el micrófono por defecto. El primer clic en “Hablar” explica que el navegador puede procesar el audio según su proveedor/configuración; un segundo clic expresa consentimiento y luego el propio navegador solicita permisos. Se usa `SpeechRecognition` / `webkitSpeechRecognition` sólo si está disponible. Idioma solicitado: `es-CO`; la exactitud y el procesamiento local/remoto dependen del navegador y no se garantizan offline. Respuestas con botones son siempre una alternativa equivalente. La página no almacena audio, transcripciones ni respuestas, no tiene backend y no incorpora analítica.

La narración con `speechSynthesis` es opcional y empieza desactivada. La ayuda abre controles, alternativa a voz, tamaño de subtítulos y alto contraste. Se acompaña color con texto; el resultado no depende solo del color.

## WebXR

Si el navegador expone `navigator.xr` y admite `immersive-vr`, aparece un botón para entrar a la panorámica con WebXR. Se pide DOM overlay opcional para conservar HUD y subtítulos, y los mandos lanzan rayos a los puntos interactivos. La disponibilidad varía por visor, navegador, permisos y compatibilidad con DOM overlay; verificar en el equipo objetivo. Si no hay WebXR, la experiencia completa sigue disponible en vista de escritorio/táctil.

## Límites y siguientes pasos

- La escena actual es una imagen 360°, no locomoción real ni una habitación con colisiones/objetos 3D editables.
- No existe integración con Raspberry Pi/Voxi-Safe, BLE, LAN o IA; no se transmiten respuestas a hardware.
- La API de voz web no asegura uso sin internet ni procesamiento local; para una futura opción offline, integrar un motor local en un adaptador independiente y probar latencia/precisión por acentos y ruido.

### Animaciones del dispositivo

- Alternancia frontal/concepto con transición de imagen.
- Texto de pantalla cambia entre bienvenida, escucha, respuesta, procesamiento y cierre.
- Ondas de audio, brillo tenue y líneas de barrido representan actividad ficticia.
- Los tres indicadores verde/ámbar/rojo pulsan suavemente, acompañados por sus etiquetas.
- Las animaciones son visuales únicamente y no comunican un estado clínico real. En el panel, las palabras “demo” y “simulación” permanecen visibles.
- Reemplazar el panorama sólo por contenido autorizado, sin pacientes identificables. Una habitación real requeriría controles de privacidad, consentimiento y evaluación de accesibilidad.
- Los escenarios clínicos futuros requieren protocolos definidos y validados por profesionales sanitarios. No reutilizar las reglas de prueba en práctica clínica.
