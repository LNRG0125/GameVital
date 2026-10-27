# V.I.T.A.L VR — Documento de diseño y guía de prototipo

**Versión:** 0.1 · **Plataforma objetivo:** visor OpenXR con PC/standalone compatible · **Idioma inicial:** español

## 1. Resumen

V.I.T.A.L VR es una experiencia narrativa en primera persona para conocer, de forma segura y sin contacto, el recorrido de una estación de voz e inteligencia artificial de apoyo. En una habitación de aislamiento moderna, luminosa y acogedora, una guía virtual acompaña al jugador por una misión corta: conocer el lugar, encontrar la estación, practicar un diálogo de bienestar, observar una evaluación **simulada** y cerrar la sesión.

La experiencia no es una consulta clínica ni una herramienta de diagnóstico. Los estados verde/amarillo/rojo representan únicamente el resultado de reglas de demostración configurables. Nunca debe inferirse que “verde” significa que una persona está sana, ni que el resultado sustituye protocolos clínicos.

### Objetivos de aprendizaje
- Reconocer las partes y el propósito general de una estación de interacción por voz sin contacto.
- Practicar una conversación accesible con confirmación, repetición y solicitud de ayuda.
- Entender que las respuestas pasan por un motor de reglas explícito y que la salida simulada requiere interpretación profesional.
- Comprender límites, privacidad y alternativas cuando el reconocimiento o la conexión no funcionan.

### Público y duración
Público general y equipos de formación; sesión orientativa de 4–7 minutos, configurable. No recoger nombre, documento, fecha de nacimiento ni datos clínicos identificables. Usar datos ficticios y borrar las respuestas al reiniciar.

## 2. Experiencia y tono

La habitación debe ser reconocible como un entorno hospitalario, pero no amenazante: luz natural difusa, paredes marfil/blanco, azul oscuro y turquesa para navegación, superficies limpias, plantas decorativas opcionales y señalización clara. Sin sonidos de monitor alarmantes, sangre, urgencia dramatizada ni cuenta regresiva. La guía es cálida, neutral, no infantil y nunca afirma ser profesional sanitario.

La estación usa como referencia visual el dispositivo V.I.T.A.L/Voxi-Safe compartido: carcasa clara, pantalla azul oscuro, rejilla de audio, cámara/sensores representados de forma neutral e indicadores verde/ámbar/rojo. Los elementos sensibles (cámara/micrófono) se explican visualmente; la cámara puede representarse como cubierta o apagada en modo privacidad. Los colores siempre se acompañan de texto e icono (no depender solo del color).

### Controles y accesibilidad
- Voz opcional: «Sí», «No», «Repetir», «Necesito ayuda», «Finalizar».
- Alternativa equivalente: botones grandes visibles y seleccionables por puntero/rayo del visor, control o mirada temporizada opcional.
- En Editor/PC: `Y`, `N`, `R`, `H`, `F`, `E`, `X` (sí/no/repetir/ayuda/finalizar/continuar/reiniciar).
- Subtítulos permanentes durante voz, tamaño y contraste configurables, panel de instrucciones, volumen por separado, modo sentado, teletransporte o movimiento por etapas (preferido para evitar mareo), opción de pausar y salir en cualquier momento.
- No usar vibración obligatoria, destellos, flashes, texto pequeño ni feedback exclusivamente sonoro. Animación de ondas de voz suave con indicador de escucha/procesamiento explícito.

## 3. Flujo de la misión (cinco etapas)

| Etapa | Acción del jugador | Respuesta del asistente / salida |
|---|---|---|
| 1. Bienvenida | Inicia, revisa controles y elige continuar o pedir ayuda. | Explica que es una simulación, controles, privacidad y opción de salir. Pasa a exploración. |
| 2. Exploración | Observa la habitación y selecciona el objeto V.I.T.A.L (o pulsa continuar como alternativa). | Resalta la estación con contorno/etiqueta y presenta sus componentes sin afirmar capacidades no implementadas. Al seleccionarla, inicia el diálogo. |
| 3. Conversación | Responde Sí/No a preguntas ficticias; puede repetir o pedir ayuda. | Preguntas genéricas de bienestar para demostrar la interfaz: “¿Te sientes cómodo para continuar?”, “¿Quieres que repita la explicación?”, “¿Necesitas ayuda para usar esta experiencia?”. No recolectar síntomas reales en el prototipo. Cada respuesta queda solo en memoria. |
| 4. Evaluación simulada | Observa el procesamiento local demostrativo y confirma que entiende el alcance. | El motor evalúa las respuestas ficticias mediante reglas configurables. Presenta un estado con etiqueta y explicación “resultado de demostración; no clínico”. Sin conexión se muestra exactamente igual. |
| 5. Cierre | Revisa resumen educativo y elige reiniciar o salir. | Resume controles, limita interpretaciones, recuerda consultar a personal sanitario ante necesidades reales. Reiniciar elimina las respuestas de la sesión. |

**Comandos globales:** Repetir vuelve a pronunciar/mostrar el texto actual; Necesito ayuda abre una tarjeta de ayuda sin perder el paso; Finalizar detiene la misión y muestra un cierre seguro; Reiniciar borra estado temporal y vuelve a bienvenida. Interpretaciones ambiguas no deben desencadenar transición: pedir confirmación o usar botones.

### Diálogo inicial sugerido
1. “Hola, soy Vita, tu guía virtual. Esta experiencia es educativa y no realiza una evaluación médica. Puedes responder hablando o con los botones. Di ‘necesito ayuda’ o ‘finalizar’ cuando quieras.”
2. “Explora con calma la habitación. Localiza la estación V.I.T.A.L y selecciónala. También puedes usar Continuar.”
3. Preguntas de práctica indicadas en la tabla; confirmar visualmente cada respuesta.
4. “Voy a mostrar cómo un conjunto de reglas de demostración transforma respuestas ficticias en un estado ilustrativo. No es un diagnóstico ni una recomendación.”
5. “La misión terminó. Si tienes una necesidad de salud real, contacta al personal sanitario o utiliza los canales de emergencia locales. Puedes reiniciar para practicar.”

## 4. Estructura Unity

### Escenas
- `00_Boot` (opcional): carga configuración, idioma y escena principal.
- `01_IsolationRoom`: habitación, rig XR, asistente, estación interactiva, HUD, gestores y salida de simulación. Para el primer prototipo basta una escena.
- `02_Accessibility` (opcional): menú de configuración reutilizable como panel, no necesita escena propia.

### Jerarquía sugerida para `01_IsolationRoom`
```text
01_IsolationRoom
├── XR Origin (Action-based)           [XR Interaction Toolkit]
│   ├── Camera Offset / Main Camera
│   ├── Left Controller / Right Controller
│   └── Teleportation Provider (opcional)
├── Environment
│   ├── RoomShell / SoftLights / Wayfinding
│   ├── VitaStation (Collider + VitaStationTarget)
│   └── Guide (avatar opcional + VoiceWave visual)
├── Canvas_WorldSpace (HUD a 1.5–2 m; tamaño legible)
│   ├── SubtitleText, StageText, ProgressText, StatusText
│   ├── PromptText, HelpPanel, AccessibilityControls
│   └── Buttons: Sí / No / Repetir / Ayuda / Finalizar / Continuar / Reiniciar
└── App
    ├── GameFlowController
    ├── DemoKeyboardRecognizer
    ├── TriageRules (asset ScriptableObject)
    └── MockStationTransport
```
Los métodos públicos del `GameFlowController` se conectan a botones con `Button.onClick`. El componente `VitaStationTarget` debe recibir un evento `Interact` del XR Interaction Toolkit o llamar a `SelectStation()` desde un botón. No se acopla el núcleo de la experiencia a XRIT, para mantenerlo testeable.

### Scripts incluidos
- `Core/GameFlowController.cs`: máquina de estados, diálogo, progreso, respuestas en memoria, comandos globales, reinicio y evaluación.
- `Core/SimulationTypes.cs`: enums/contratos de transporte y resultado.
- `Rules/DemoTriageRules.cs`: reglas de ejemplo configurables vía Inspector; no clínicas.
- `Voice/DemoKeyboardRecognizer.cs`: adaptador de entrada de demostración; permite probar sin micrófono.
- `Hardware/MockStationTransport.cs`: contrato intercambiable y estación ficticia desconectada.
- `Interaction/VitaStationTarget.cs`: objetivo seleccionable desde XRIT/botón.
- `UI/VitalHud.cs`: enlace UI opcional con referencias TextMeshPro y color complementario al texto.
- `UI/InteractionFeedback.cs`: pulso visual breve y ondas de escucha; clip de confirmación opcional, sin audio por defecto.

## 5. Arquitectura técnica

```text
Visor (Unity + C# + OpenXR)
 ├─ XR / navegación / interacción
 ├─ diálogo + HUD + accesibilidad
 ├─ IKeywordRecognizer  ← teclado/demo | motor local | estación
 ├─ respuesta de sesión → ISimulationRules (reglas configuradas localmente)
 └─ IStationTransport   ← mock | BLE | LAN local
                                          │
                              Voxi-Safe / Raspberry Pi Zero 2 W
                               ├─ captura/keyword spotting TinyML
                               ├─ estado de dispositivo mínimo
                               └─ sin ejecutar el render VR
```

**Principio de separación:** la experiencia sólo consume eventos semánticos (`Yes`, `No`, `Repeat`, etc.); no procesa audio bruto dentro del motor del juego. El motor de reglas recibe respuestas tipadas, devuelve un resultado y explicación, y no realiza inferencias generativas. El adaptador físico es opcional y sustituible por otro sin modificar la misión.

### Interfaces de voz y alternativas
El código inicial implementa teclado para que el prototipo funcione sin hardware. Para una primera prueba de voz real se puede usar el servicio de dictado/plataforma del visor, pero la disponibilidad, idiomas, permisos, latencia, conexión y retención varían por fabricante; no asumir que es offline. Alternativa local: modelo pequeño de keyword spotting/TinyML o motor local compatible con el visor/Raspberry, limitado a gramática cerrada y comandos de una o pocas palabras. La Pi Zero 2 W puede tener recursos ajustados: medir uso de CPU/RAM, latencia y temperatura; cuantizar el modelo, reducir vocabulario y evitar prometer reconocimiento continuo robusto. Debe existir pulsar-para-hablar, confirmación y controles no verbales.

### Integración opcional de estación
Definir `IStationTransport` con operaciones de conexión, estado y envío de evento mínimo. Probar primero con `MockStationTransport`. Después evaluar:
- **BLE:** bajo consumo y sin infraestructura, pero emparejamiento, soporte del visor, límites de MTU/fragmentación y permisos deben validarse en el hardware objetivo.
- **Wi‑Fi/LAN local:** mayor facilidad para mensajes de telemetría estructurados y depuración, pero requiere red, autenticación, cifrado, gestión de reconexión y exposición controlada. No abrir un servidor accesible fuera de la red clínica.
- No transmitir audio ni identificadores personales en el MVP. Compartir, como máximo, estado de disponibilidad, versión de protocolo y evento de comando si existe necesidad aprobada.

Fijar un protocolo versionado antes de producción (por ejemplo mensajes JSON UTF‑8 con `protocolVersion`, `messageId`, `type`, `timestamp` opcional y carga útil mínima); esquema, claves, permisos, cifrado y política de registros requieren revisión de seguridad. No aceptar que la estación envíe instrucciones de triaje arbitrarias ni permitir que hardware no confiable cambie las reglas. Rechazar versiones desconocidas, duplicados y mensajes fuera de estado; mostrar “estación no disponible” y seguir en modo independiente. Sin reloj confiable, no guardar timestamp personal.

### Privacidad, seguridad y límites
- Procesamiento local como objetivo; el prototipo no persiste respuestas ni envía audio.
- Micrófono sólo con consentimiento y señal visible de escucha; indicador de silencio y alternativa de botones.
- No grabar ni guardar audio/transcripciones. Si una integración futura lo requiere, consentimiento explícito, finalidad, retención mínima, controles de borrado y revisión de privacidad/ética aplicable en Colombia.
- Sin nube, telemetría ni analítica con datos sensibles por defecto. Auditar dependencias y permisos del visor.
- Reglas clínicas futuras deben ser versionadas, aprobadas por profesionales y evaluadas formalmente. Este prototipo sólo admite reglas ficticias; no autoriza uso clínico.

## 6. Reglas configurables de demostración

El asset `DemoTriageRules` contiene la pregunta que provoca un estado “crítico” demostrativo y un umbral de respuestas negativas para “monitoreo”; lo demás queda “estable” demostrativo. Los parámetros se exponen para mostrar configurabilidad, con nombres y mensajes que declaran que son ficticios. **No copiar los umbrales de ejemplo a un protocolo sanitario.** En un producto de formación, reemplazar por un escenario simulado validado y etiquetarlo en pantalla en todo momento.

## 7. Configuración en Unity (prototipo)

1. Instalar Unity 2022.3 LTS o Unity 6 con módulos para el dispositivo de destino. Crear proyecto 3D URP (opcional, útil para iluminación eficiente).
2. Copiar las carpetas `Assets/` y `Docs/` de este repositorio al proyecto; importar TextMesh Pro Essentials cuando Unity lo solicite. C# usa `TMPro` sólo en `VitalHud`; eliminar/omitir el componente si se prefiere UI legacy.
3. Abrir Package Manager e instalar **XR Plugin Management**, **OpenXR Plugin** y **XR Interaction Toolkit**. Activar OpenXR para Android u OpenXR para PC según visor; seleccionar perfiles de interacción del hardware y completar validaciones de Project Validation.
4. Instalar los Starter Assets de XR Interaction Toolkit si se desean locomoción y acciones preconfiguradas. Crear una escena con XR Origin, habitación, `VitaStationTarget` y un Canvas World Space. Configurar el EventSystem con `XR UI Input Module` (o el módulo apropiado para la versión de XRIT), ray interactor y UI interaction en el controlador. No mezclar módulos de entrada incompatibles. En el asistente se puede añadir `InteractionFeedback`, asignar varias barras de onda y, opcionalmente, un clip muy suave; no se genera audio si no se asigna un clip.
5. Crear `DemoTriageRules` mediante **Assets → Create → V.I.T.A.L → Demo Triage Rules**; asignarlo al GameFlowController. Añadir `VitalHud`, asignar referencias de texto TMP y conectar `Refresh` si se necesita actualización manual. El controlador también busca `VitalHud` en la escena al iniciar.
6. Añadir `DemoKeyboardRecognizer` al mismo objeto del controlador para ejecución en Editor. Para botones de UI, enlazar `AnswerYes`, `AnswerNo`, `RepeatCurrent`, `ShowHelp`, `FinishMission`, `ContinueMission`, `SelectStation`, `RestartMission`; los controles de accesibilidad pueden llamar `IncreaseSubtitleSize`, `DecreaseSubtitleSize`, `ResetSubtitleSize` y `ToggleHighContrast` en `VitalHud`.
7. En el Editor, ejecutar y probar con teclado. Para visor, reemplazar la entrada de demo por adaptador XR/voz y compilar al dispositivo compatible. Comprobar escala de mundo, subtítulos, confort, rendimiento y permisos de micrófono.

Este repositorio no incluye un `.unity`/`.asset` serializado porque la escena y los perfiles OpenXR dependen de la versión y del visor; la guía permite construirlos sin asumir un dispositivo específico.

## 8. Probar sin estación física ni visor

- Ejecutar en Unity Editor como “modo escritorio”: cámara del jugador, teclado, botones UI y selección de estación con botón; no requiere micrófono, internet ni Raspberry Pi.
- Comprobar todas las rutas: bienvenida→exploración→conversación→evaluación→cierre; Sí/No; repetir; ayuda; finalizar desde cada estado; reinicio y limpieza de respuestas.
- Probar `MockStationTransport` para desconexión/estado de estación. La misión debe continuar sin dependencia del dispositivo.
- Pruebas manuales de límites: texto largo, sesión interrumpida, ningún botón pulsado, voz no entendida (en futura integración), permisos denegados, desconexión y comandos repetidos.
- Validar accesibilidad con el HUD siempre legible, sin distinguir estados sólo por color y con recorrido posible sentado. Revisar mareo con teletransporte/movimiento instantáneo.
- Para automatización, probar el motor de reglas como unidad con respuestas vacías, todas afirmativas, respuestas negativas y la respuesta configurada como señal de demostración; confirmar que nunca aparece “diagnóstico”. No se declara certificación clínica.

## 9. Fase 2: integración con hardware

1. **Definición de alcance:** decidir si la Pi detecta palabras o sólo retransmite eventos; definir comandos, latencia, alcance, seguridad y responsabilidad. No ejecutar render VR en la Pi.
2. **Prototipo de enlace:** mock → transporte LAN local o BLE según visores y entorno. Enviar sólo tokens de comando y heartbeat. Documentar formato/versionado, reconexión, errores y mecanismo de desconexión.
3. **Voz local:** evaluar modelo TinyML de vocabulario cerrado sobre Pi Zero 2 W o inferencia en visor; medir precisión por idioma/acento/ruido con participantes consentidores y datos sintéticos. Si se procesan respuestas habladas libres, el coste y privacidad son mayores; preferir comandos cerrados y botones de respaldo. No afirmar funcionamiento offline hasta probarlo de extremo a extremo.
4. **Pruebas de seguridad y privacidad:** revisar emparejamiento/autenticación, cifrado según transporte, actualización segura, borrado, registros, amenazas físicas y red hospitalaria con responsables técnicos y de privacidad.
5. **Validación de experiencia:** estudio de usabilidad y accesibilidad con personal de salud; validar contenidos y reglas con comité clínico antes de cualquier contexto formativo clínico. Mantener explícito el carácter de simulación hasta obtener autorizaciones pertinentes.

## 10. Criterios de aceptación del prototipo
- Se completa misión de cinco etapas en escritorio sin micrófono, internet ni estación.
- Controles de teclado y botones siguen el mismo flujo; progreso y subtítulos cambian en cada paso.
- Ayuda/repetir/finalizar/reiniciar funcionan en cualquier etapa.
- El resultado se muestra como simulado/no médico, y los datos se eliminan al reiniciar.
- La ausencia de hardware no bloquea la experiencia.
- OpenXR queda como objetivo de despliegue, sujeto a prueba en visor real; la Raspberry Pi se trata como periférico.
