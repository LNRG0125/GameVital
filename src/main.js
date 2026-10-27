import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';
import './webxr.css';
import './device.css';

const ASSET_BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);
const ui = {
  scene: $('scene'), progressFill: $('progressFill'), progressCount: $('progressCount'),
  stageLabel: $('stageLabel'), messageTitle: $('messageTitle'), messageBody: $('messageBody'),
  questionControls: $('questionControls'), welcomeCard: $('welcomeCard'),
  continueButton: $('continueButton'), finishButton: $('finishButton'),
  yesButton: $('yesButton'), noButton: $('noButton'), repeatButton: $('repeatButton'),
  helpButton: $('helpButton'), micButton: $('micButton'), micLabel: $('micLabel'),
  voiceNotice: $('voiceNotice'), resultPanel: $('resultPanel'), resultIcon: $('resultIcon'),
  resultTitle: $('resultTitle'), resultText: $('resultText'), objectCard: $('objectCard'),
  objectTitle: $('objectTitle'), objectDescription: $('objectDescription'), interactObject: $('interactObject'),
  deviceShowcase: $('deviceShowcase'), deviceImage: $('deviceImage'), deviceStage: $('deviceStage'),
  deviceScreenOverlay: $('deviceScreenOverlay'), deviceScreenText: $('deviceScreenText'),
  deviceScreenCaption: $('deviceScreenCaption'), deviceAnimationText: $('deviceAnimationText'),
  deviceFrontButton: $('deviceFrontButton'), deviceAngleButton: $('deviceAngleButton'),
  hotspotLabel: $('hotspotLabel'), hintText: $('hintText'), roomLabel: $('roomLabel'),
  helpModal: $('helpModal'), toast: $('toast'), vrButton: $('vrButton')
};
ui.deviceImage.src = `${ASSET_BASE}assets/vital-device-front.jpg`;

const steps = [
  { key: 'welcome', label: 'BIENVENIDA', title: 'Un espacio tranquilo para empezar.', body: 'Hola, soy Vita. Te acompañaré en una breve misión de bienestar. Puedes explorar la habitación con el ratón o los controles, y responder con botones o voz.' },
  { key: 'explore', label: 'EXPLORACIÓN', title: 'Mira a tu alrededor.', body: 'Explora esta habitación con calma. Busca la estación V.I.T.A.L: está junto al lavabo, en la pared azul. Selecciónala cuando la encuentres. También puedes pulsar Continuar.' },
  { key: 'conversation', label: 'CONVERSACIÓN', title: 'Hablemos un momento.', body: 'Practiquemos una conversación ficticia. Responde con Sí o No. No compartas datos personales ni información médica real.' },
  { key: 'evaluation', label: 'EVALUACIÓN', title: 'Veamos cómo funciona.', body: 'Estoy procesando respuestas de demostración de forma local. El estado que aparece ilustra reglas ficticias; no es una valoración de salud.' },
  { key: 'closing', label: 'CIERRE', title: 'Gracias por explorar conmigo.', body: 'La misión terminó. Esta experiencia es educativa y no sustituye la atención profesional. Puedes reiniciar para practicar de nuevo.' }
];
const questions = [
  '¿Te sientes cómodo para continuar con esta experiencia?',
  '¿Quieres que te muestre cómo funciona la interacción sin contacto?',
  '¿Necesitas ayuda para usar esta experiencia?'
];
const objectInfo = {
  station: { title: 'Estación V.I.T.A.L', description: 'Una interfaz de voz pensada para facilitar conversaciones sin contacto físico. En esta experiencia, sus funciones se representan de manera demostrativa.' },
  bed: { title: 'Área de descanso', description: 'La habitación prioriza la comodidad, el espacio personal y una iluminación suave para crear un entorno más acogedor.' },
  window: { title: 'Luz natural', description: 'La luz diurna y la vista al exterior ayudan a que la habitación se sienta tranquila y menos institucional.' },
  sink: { title: 'Lavamanos clínico', description: 'Un punto de higiene accesible dentro de la habitación. La misión no requiere tocar ni manipular ningún equipo.' }
};

let stageIndex = 0;
let questionIndex = 0;
let answers = [];
let selectedObject = null;
let soundEnabled = false;
let recognition = null;
let listening = false;
let voiceConsent = false;
let voiceConsentPending = false;
let toastTimer = 0;
let subtitleScale = 1;
let highContrast = false;
let startYaw = Math.PI / 2;
let startPitch = -0.015;
let yaw = startYaw;
let pitch = startPitch;
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let pointerDown = null;
let hoveredTarget = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0, 0);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.xr.enabled = true;
renderer.domElement.setAttribute('aria-label', 'Panorama interactivo. Arrastra para mirar a tu alrededor.');
ui.scene.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
loader.load(`${ASSET_BASE}assets/isolation-room-360.jpg`, (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(49, 96, 64),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, toneMapped: false })
  );
  // Use a back-facing sphere without mirrored object-scale, preserving the panorama's left/right order.
  scene.add(room);
}, undefined, () => {
  ui.roomLabel.textContent = 'No se pudo cargar el entorno panorámico';
});

const hotspotSpecs = [
  { id: 'station', u: 0.817, v: 0.438, label: 'Estación V.I.T.A.L', size: 0.66 },
  { id: 'bed', u: 0.12, v: 0.63, label: 'Área de descanso', size: 0.52 },
  { id: 'window', u: 0.30, v: 0.34, label: 'Luz natural', size: 0.48 },
  { id: 'sink', u: 0.66, v: 0.48, label: 'Lavamanos clínico', size: 0.46 }
];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const hotspotMeshes = [];
const hotspotGroups = [];

function panoramaDirection(u, v) {
  const phi = u * Math.PI * 2;
  const theta = v * Math.PI;
  // Coordinates match SphereGeometry's equirectangular UV layout with a back-facing material.
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)).normalize();
}

for (const spec of hotspotSpecs) {
  const direction = panoramaDirection(spec.u, spec.v);
  const group = new THREE.Group();
  group.position.copy(direction.clone().multiplyScalar(42));
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().negate());
  group.userData = { id: spec.id, label: spec.label };
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(spec.size * 0.73, 0.025, 8, 42),
    new THREE.MeshBasicMaterial({ color: 0x9ce8d6, transparent: true, opacity: 0.9 })
  );
  group.add(halo);
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(spec.size * 0.11, 14, 10),
    new THREE.MeshBasicMaterial({ color: 0xd3fff0, transparent: true, opacity: 0.9 })
  );
  group.add(center);
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(spec.size * 0.85, 10, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false, depthWrite: false })
  );
  hit.userData = { id: spec.id, label: spec.label };
  group.add(hit);
  scene.add(group);
  hotspotMeshes.push(hit);
  hotspotGroups.push(group);
}

function updateCamera() {
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}
updateCamera();

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => ui.toast.classList.remove('show'), 2300);
}

let deviceView = 'front';
function setDeviceScreen(label, caption) {
  if (ui.deviceScreenText) ui.deviceScreenText.textContent = label;
  if (ui.deviceScreenCaption) ui.deviceScreenCaption.textContent = caption;
  if (ui.deviceAnimationText) ui.deviceAnimationText.textContent = caption;
}

function showDeviceView(view) {
  if (view === deviceView) return;
  deviceView = view;
  ui.deviceStage.classList.add('changing');
  window.setTimeout(() => {
    ui.deviceImage.src = view === 'front' ? `${ASSET_BASE}assets/vital-device-front.jpg` : `${ASSET_BASE}assets/voxi-safe-concept.jpg`;
    ui.deviceImage.alt = view === 'front'
      ? 'Dispositivo V.I.T.A.L frontal, imagen compartida por el usuario'
      : 'Concepto del dispositivo Voxi-Safe en perspectiva, imagen compartida por el usuario';
    ui.deviceScreenOverlay.classList.toggle('hidden', view !== 'front');
    ui.deviceFrontButton.classList.toggle('active', view === 'front');
    ui.deviceAngleButton.classList.toggle('active', view === 'angle');
    ui.deviceAnimationText.textContent = view === 'front'
      ? 'Pantalla activa · demo interactiva'
      : 'Vista conceptual · referencia compartida';
    ui.deviceStage.classList.remove('changing');
  }, 150);
}

function speak(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-CO';
  utterance.rate = 0.94;
  utterance.pitch = 1.02;
  window.speechSynthesis.speak(utterance);
}

function currentSpokenText() {
  if (stageIndex === 2 && questions[questionIndex]) return questions[questionIndex];
  return `${steps[stageIndex].title} ${steps[stageIndex].body}`;
}

function setStage(index, options = {}) {
  stageIndex = Math.max(0, Math.min(4, index));
  selectedObject = null;
  ui.objectCard.classList.add('hidden');
  document.querySelectorAll('.step').forEach((step, i) => {
    step.classList.toggle('active', i === stageIndex);
    step.classList.toggle('done', i < stageIndex);
  });
  ui.progressFill.style.width = `${(stageIndex + 1) * 20}%`;
  ui.progressCount.innerHTML = `${String(stageIndex + 1).padStart(2, '0')} <i>/ 05</i>`;
  ui.stageLabel.textContent = `ETAPA 0${stageIndex + 1} · ${steps[stageIndex].label}`;
  ui.messageTitle.textContent = steps[stageIndex].title;
  ui.messageBody.textContent = steps[stageIndex].body;
  ui.questionControls.classList.toggle('hidden', stageIndex !== 2);
  ui.finishButton.classList.toggle('hidden', stageIndex === 0 || stageIndex === 4);
  ui.resultPanel.classList.toggle('hidden', stageIndex !== 3);
  ui.continueButton.classList.toggle('hidden', stageIndex === 2);
  ui.continueButton.innerHTML = stageIndex === 0 ? 'Comenzar <span>→</span>'
    : stageIndex === 1 ? 'Continuar sin seleccionar <span>→</span>'
    : stageIndex === 3 ? 'Ver cierre <span>→</span>'
    : stageIndex === 4 ? 'Reiniciar misión <span>↻</span>' : 'Continuar <span>→</span>';
  ui.hintText.textContent = stageIndex === 1 ? 'Busca la estación junto al lavabo y selecciónala' : 'Arrastra para mirar alrededor';
  ui.roomLabel.textContent = stageIndex === 1 ? 'Exploración libre · selecciona un punto luminoso' : 'Sala de aislamiento · luz natural';
  if (stageIndex === 1) setDeviceScreen('Estación lista', 'Modo exploración · demo');
  if (stageIndex === 2) setDeviceScreen('Escucha activa', 'Conversación de demostración');
  if (stageIndex === 3) setDeviceScreen('Procesando demo', 'Respuestas ficticias · local');
  if (stageIndex === 4) setDeviceScreen('Sesión finalizada', 'Sin datos guardados');
  if (stageIndex === 2) {
    questionIndex = 0;
    answers = [];
    ui.messageTitle.textContent = 'Pregunta 1 de 3';
    ui.messageBody.textContent = questions[0];
  }
  if (stageIndex === 4) ui.messageBody.textContent = steps[4].body;
  if (options.speak !== false) speak(currentSpokenText());
}

function beginExperience() {
  ui.welcomeCard.classList.add('hidden');
  setStage(0);
  ui.continueButton.classList.remove('hidden');
}

function selectHotspot(id) {
  const info = objectInfo[id];
  if (!info) return;
  selectedObject = id;
  ui.objectTitle.textContent = info.title;
  ui.objectDescription.textContent = info.description;
  const isStation = id === 'station';
  ui.objectCard.classList.toggle('device-mode', isStation);
  ui.deviceShowcase.classList.toggle('hidden', !isStation);
  ui.interactObject.classList.toggle('hidden', !isStation || stageIndex !== 1);
  if (isStation) {
    setDeviceScreen(stageIndex === 2 ? 'Te escucho' : 'Hola, soy Vita', stageIndex === 2 ? 'Escucha activa · demo' : 'Interacción por voz');
  }
  ui.objectCard.classList.remove('hidden');
  if (id === 'station' && stageIndex === 1) {
    showToast('Estación localizada. Selecciona “Interactuar” para continuar.');
  } else {
    showToast(info.title);
  }
}

function interactWithStation() {
  if (stageIndex !== 1) return;
  ui.objectCard.classList.add('hidden');
  setStage(2);
}

function continueMission() {
  if (stageIndex === 0) {
    setStage(1);
    return;
  }
  if (stageIndex === 1) {
    interactWithStation();
    return;
  }
  if (stageIndex === 3) {
    setStage(4);
    return;
  }
  if (stageIndex === 4) {
    answers = [];
    questionIndex = 0;
    ui.welcomeCard.classList.add('hidden');
    setStage(0);
    return;
  }
}

function answerQuestion(answer) {
  if (stageIndex !== 2 || !questions[questionIndex]) return;
  answers.push(Boolean(answer));
  const confirmation = answer ? 'Sí, anotado.' : 'No, anotado.';
  setDeviceScreen(answer ? 'Respuesta: Sí' : 'Respuesta: No', 'Respuesta temporal · demo');
  showToast(confirmation);
  if (questionIndex < questions.length - 1) {
    questionIndex++;
    ui.messageTitle.textContent = `Pregunta ${questionIndex + 1} de 3`;
    ui.messageBody.textContent = questions[questionIndex];
    ui.stageLabel.textContent = `ETAPA 03 · CONVERSACIÓN · RESPUESTA ${questionIndex} REGISTRADA`;
    speak(questions[questionIndex]);
    return;
  }
  evaluateSimulation();
}

function evaluateSimulation() {
  const priority = answers.length > 2 && answers[2] === true;
  const noCount = answers.filter((value) => !value).length;
  let result;
  if (priority) {
    result = {
      className: 'priority', icon: '!', title: 'Prioridad · simulación',
      text: 'Una regla ficticia de demostración activó este estado. No es una alerta médica, diagnóstico ni recomendación.'
    };
  } else if (noCount >= 2) {
    result = {
      className: 'monitor', icon: '◷', title: 'Seguimiento · simulación',
      text: 'Se alcanzó un umbral ficticio del prototipo. No representa una evaluación clínica.'
    };
  } else {
    result = {
      className: 'stable', icon: '✓', title: 'Estable · simulación',
      text: 'Resultado demostrativo de esta misión. No confirma que una persona esté sana.'
    };
  }
  ui.resultPanel.className = `result-panel ${result.className}`;
  ui.resultIcon.textContent = result.icon;
  ui.resultTitle.textContent = result.title;
  ui.resultText.textContent = result.text;
  setStage(3, { speak: false });
  // setStage hides the panel for all but stage 3; restore the outcome after updating the scene.
  ui.resultPanel.className = `result-panel ${result.className}`;
  ui.resultIcon.textContent = result.icon;
  ui.resultTitle.textContent = result.title;
  ui.resultText.textContent = result.text;
  setDeviceScreen('Resultado de demo', result.title);
  speak(`Evaluación demostrativa. ${result.title}. ${result.text}`);
}

function finishMission() {
  window.speechSynthesis?.cancel?.();
  setStage(4);
  showToast('Misión finalizada. No se guardaron respuestas.');
}

function resetView() {
  yaw = startYaw;
  pitch = startPitch;
  updateCamera();
  showToast('Vista recentrada');
}

function openHelp() { ui.helpModal.classList.remove('hidden'); }
function closeHelp() { ui.helpModal.classList.add('hidden'); }

function handleCommand(command) {
  const text = command.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\b(s[ií]|claro|correcto|afirmativo)\b/.test(text)) answerQuestion(true);
  else if (/\b(no|negativo)\b/.test(text)) answerQuestion(false);
  else if (/repet|otra vez/.test(text)) repeatCurrent();
  else if (/ayud|asistencia/.test(text)) openHelp();
  else if (/finaliz|termin|salir/.test(text)) finishMission();
  else if (/continu|siguiente|comenzar|empezar/.test(text)) continueMission();
  else showToast('No entendí el comando. Puedes usar los botones de pantalla.');
}

function repeatCurrent() {
  const text = currentSpokenText();
  speak(text);
  showToast('Repitiendo indicación');
}

function requestVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    startVoiceRecognition();
    return;
  }
  if (!voiceConsent) {
    if (!voiceConsentPending) {
      voiceConsentPending = true;
      ui.micLabel.textContent = 'Acepto voz';
      ui.voiceNotice.textContent = 'El navegador puede procesar el audio según su proveedor y configuración. El juego no guarda audio ni respuestas. Pulsa “Acepto voz” para continuar o usa los botones.';
      ui.voiceNotice.classList.remove('hidden');
      return;
    }
    voiceConsent = true;
    voiceConsentPending = false;
    ui.micLabel.textContent = 'Hablar';
  }
  startVoiceRecognition();
}

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    ui.voiceNotice.textContent = 'El reconocimiento de voz no está disponible en este navegador. Puedes responder con los botones.';
    ui.voiceNotice.classList.remove('hidden');
    showToast('Usa Sí / No o el teclado: voz no disponible');
    return;
  }
  if (listening && recognition) {
    recognition.stop();
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'es-CO';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;
  recognition.onstart = () => {
    listening = true;
    ui.micButton.classList.add('listening');
    ui.micLabel.textContent = 'Escuchando…';
    ui.voiceNotice.textContent = 'Te escucho. Di Sí, No, Repetir, Necesito ayuda o Finalizar.';
    ui.voiceNotice.classList.remove('hidden');
  };
  recognition.onresult = (event) => {
    const said = event.results[0][0].transcript;
    ui.voiceNotice.textContent = `Te escuché: “${said}”`;
    handleCommand(said);
  };
  recognition.onerror = (event) => {
    const message = event.error === 'not-allowed'
      ? 'El permiso de micrófono fue denegado. Puedes continuar con los botones.'
      : 'No pude reconocerlo. Intenta de nuevo o usa los botones.';
    ui.voiceNotice.textContent = message;
    ui.voiceNotice.classList.remove('hidden');
  };
  recognition.onend = () => {
    listening = false;
    ui.micButton.classList.remove('listening');
    ui.micLabel.textContent = 'Hablar';
  };
  try { recognition.start(); }
  catch { showToast('No fue posible iniciar el micrófono. Usa los botones.'); }
}

function getScreenPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function checkHover(event) {
  getScreenPointer(event);
  const hits = raycaster.intersectObjects(hotspotMeshes, false);
  const hit = hits[0]?.object;
  const id = hit?.userData?.id || null;
  hoveredTarget = id;
  $('reticle').classList.toggle('hover', Boolean(id));
  if (id && stageIndex === 1) {
    const spec = hotspotSpecs.find((item) => item.id === id);
    ui.hotspotLabel.textContent = `${spec?.label || 'Explorar'}  ↗`;
    ui.hotspotLabel.classList.remove('hidden');
  } else ui.hotspotLabel.classList.add('hidden');
  renderer.domElement.style.cursor = id ? 'pointer' : dragging ? 'grabbing' : 'grab';
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  pointerDown = { x: event.clientX, y: event.clientY, moved: false };
  dragging = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  renderer.domElement.setPointerCapture?.(event.pointerId);
});
renderer.domElement.addEventListener('pointermove', (event) => {
  if (dragging && pointerDown) {
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    if (Math.abs(event.clientX - pointerDown.x) + Math.abs(event.clientY - pointerDown.y) > 4) pointerDown.moved = true;
    yaw -= dx * 0.0034;
    pitch -= dy * 0.0028;
    pitch = THREE.MathUtils.clamp(pitch, -1.18, 1.18);
    updateCamera();
    lastPointer = { x: event.clientX, y: event.clientY };
  }
  checkHover(event);
});
renderer.domElement.addEventListener('pointerup', (event) => {
  if (pointerDown && !pointerDown.moved) {
    getScreenPointer(event);
    const hit = raycaster.intersectObjects(hotspotMeshes, false)[0]?.object;
    if (hit?.userData?.id) selectHotspot(hit.userData.id);
  }
  dragging = false;
  pointerDown = null;
});
renderer.domElement.addEventListener('pointercancel', () => { dragging = false; pointerDown = null; });
renderer.domElement.addEventListener('pointerleave', () => { if (!dragging) { hoveredTarget = null; $('reticle').classList.remove('hover'); } });

// Keyboard controls are the accessible desktop fallback and mirror the spoken command vocabulary.
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!ui.helpModal.classList.contains('hidden')) closeHelp();
    else if (!ui.objectCard.classList.contains('hidden')) ui.objectCard.classList.add('hidden');
    return;
  }
  if (event.key.toLowerCase() === 'y') answerQuestion(true);
  else if (event.key.toLowerCase() === 'n') answerQuestion(false);
  else if (event.key.toLowerCase() === 'r') repeatCurrent();
  else if (event.key.toLowerCase() === 'h') openHelp();
  else if (event.key.toLowerCase() === 'f') finishMission();
  else if (event.key.toLowerCase() === 'e' || event.key === 'Enter') continueMission();
  else if (event.key.toLowerCase() === 'x') resetView();
  else if (event.key.startsWith('Arrow')) {
    const n = 0.08;
    if (event.key === 'ArrowLeft') yaw += n;
    if (event.key === 'ArrowRight') yaw -= n;
    if (event.key === 'ArrowUp') pitch = Math.min(1.18, pitch + n);
    if (event.key === 'ArrowDown') pitch = Math.max(-1.18, pitch - n);
    updateCamera();
  }
});

$('startButton').addEventListener('click', beginExperience);
ui.continueButton.addEventListener('click', continueMission);
ui.finishButton.addEventListener('click', finishMission);
ui.yesButton.addEventListener('click', () => answerQuestion(true));
ui.noButton.addEventListener('click', () => answerQuestion(false));
ui.repeatButton.addEventListener('click', repeatCurrent);
ui.helpButton.addEventListener('click', openHelp);
ui.micButton.addEventListener('click', requestVoiceRecognition);
$('accessibilityButton').addEventListener('click', openHelp);
$('soundButton').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  $('soundButton').classList.toggle('active', soundEnabled);
  $('soundButton').textContent = soundEnabled ? '♫' : '♪';
  if (!soundEnabled) window.speechSynthesis?.cancel?.();
  else speak(currentSpokenText());
});
$('interactObject').addEventListener('click', interactWithStation);
ui.deviceFrontButton.addEventListener('click', () => showDeviceView('front'));
ui.deviceAngleButton.addEventListener('click', () => showDeviceView('angle'));
$('closeObject').addEventListener('click', () => ui.objectCard.classList.add('hidden'));
$('resetViewButton').addEventListener('click', resetView);
$('helpButton').addEventListener('dblclick', closeHelp);
$('closeHelp').addEventListener('click', closeHelp);
ui.helpModal.addEventListener('click', (event) => { if (event.target === ui.helpModal) closeHelp(); });
$('textLarger').addEventListener('click', () => {
  subtitleScale = Math.min(1.45, subtitleScale + 0.1);
  document.documentElement.style.setProperty('--subtitle-scale', subtitleScale);
  document.querySelector('.assistant-message p').style.fontSize = `${11.5 * subtitleScale}px`;
  document.querySelector('.assistant-message p').style.lineHeight = '1.6';
});
$('textSmaller').addEventListener('click', () => {
  subtitleScale = Math.max(0.9, subtitleScale - 0.1);
  document.querySelector('.assistant-message p').style.fontSize = `${11.5 * subtitleScale}px`;
});
$('contrastToggle').addEventListener('click', (event) => {
  highContrast = !highContrast;
  document.documentElement.classList.toggle('high-contrast', highContrast);
  event.currentTarget.textContent = highContrast ? 'Contraste normal' : 'Alto contraste';
});

// Optional WebXR room view. DOM overlay keeps captions, buttons, and controls accessible in supported headsets.
(async () => {
  if (!navigator.xr) return;
  try {
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!supported) return;
    const button = VRButton.createButton(renderer, { optionalFeatures: ['local-floor', 'bounded-floor', 'dom-overlay'], domOverlay: { root: document.getElementById('ui-layer') } });
    button.classList.add('vr-button-native');
    button.textContent = '◉ Entrar en VR';
    document.body.appendChild(button);
    ui.vrButton.classList.remove('hidden');
    ui.vrButton.addEventListener('click', () => button.click());
    for (let index = 0; index < 2; index++) {
      const controller = renderer.xr.getController(index);
      controller.addEventListener('select', () => {
        raycaster.setFromXRController(controller);
        const hit = raycaster.intersectObjects(hotspotMeshes, false)[0]?.object;
        if (hit?.userData?.id) selectHotspot(hit.userData.id);
      });
      scene.add(controller);
      const beam = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -4)]),
        new THREE.LineBasicMaterial({ color: 0x88e6d3, transparent: true, opacity: 0.72 })
      );
      controller.add(beam);
    }
  } catch (error) {
    console.info('WebXR no disponible en este navegador:', error);
  }
})();

function animate() {
  const time = performance.now() * 0.001;
  for (let i = 0; i < hotspotGroups.length; i++) {
    const group = hotspotGroups[i];
    group.children[0].scale.setScalar(1 + Math.sin(time * 1.6 + i) * 0.045);
    group.children[1].scale.setScalar(1 + Math.sin(time * 2.3 + i) * 0.12);
    const active = hoveredTarget === group.userData.id;
    group.children[0].material.opacity = active ? 1 : 0.74;
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setStage(0, { speak: false });
