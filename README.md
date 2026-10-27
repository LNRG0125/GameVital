# V.I.T.A.L VR — prototipo educativo

Prototipo base en Unity para una experiencia inmersiva educativa inspirada en la estación V.I.T.A.L / Voxi-Safe. El visor ejecuta el juego; la Raspberry Pi Zero 2 W es una estación periférica opcional y **no** se considera capaz de ejecutar la aplicación VR.

> **Seguridad:** V.I.T.A.L VR es una simulación educativa, no un dispositivo médico validado. No diagnostica, no sustituye la valoración profesional ni debe utilizarse para tomar decisiones clínicas. Las reglas incluidas son demostrativas y deben ser aprobadas por profesionales sanitarios antes de cualquier uso formativo.

## Contenido
- `Docs/DISENO.md`: documento de diseño, flujo narrativo, escenas, arquitectura, configuración Unity y plan de pruebas e integración.
- `Assets/Scripts/`: código C# inicial independiente de un proveedor de voz o hardware.

## Inicio rápido
1. Cree un proyecto Unity 2022.3 LTS o Unity 6 (3D URP recomendado) y añada TextMesh Pro desde Package Manager.
2. Copie `Assets/` y `Docs/` a la raíz del proyecto.
3. Siga la configuración de escenas y referencias descrita en `Docs/DISENO.md`.
4. Ejecute en el Editor: controles de teclado `Y` (Sí), `N` (No), `R` (Repetir), `H` (Ayuda), `F` (Finalizar), `E` (interactuar/continuar) y `X` (reiniciar). También se pueden conectar los métodos públicos del controlador a botones UI.

El prototipo incluye respuestas de voz simuladas por teclado, texto/subtítulos, progreso, exploración de estación seleccionable, reglas de resultado explícitamente ficticias y un transporte de hardware simulado. No se incluye todavía un motor de reconocimiento de voz real, assets 3D ni un protocolo de producción.
