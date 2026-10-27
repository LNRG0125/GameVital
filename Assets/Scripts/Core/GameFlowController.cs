using System.Collections.Generic;
using UnityEngine;

namespace VitalVR
{
    /// <summary>Five-stage, non-clinical mission flow. Session answers are memory-only and cleared on restart.</summary>
    public sealed class GameFlowController : MonoBehaviour
    {
        [SerializeField] private DemoTriageRules demoRules;
        [SerializeField] private VitalHud hud;
        [SerializeField] private InteractionFeedback feedback;
        [SerializeField] private MonoBehaviour optionalRecognizerComponent;
        [SerializeField] private MonoBehaviour optionalStationTransportComponent;

        private readonly List<bool> answers = new List<bool>();
        private readonly string[] questions =
        {
            "¿Te sientes cómodo para continuar con esta experiencia?",
            "¿Quieres que repita la explicación de la estación?",
            "¿Necesitas ayuda para usar esta experiencia?"
        };

        private IKeywordRecognizer recognizer;
        private IStationTransport stationTransport;
        private MissionStage stage = MissionStage.Welcome;
        private int questionIndex;
        private string subtitle;
        private string prompt;
        private string status = "Modo de demostración · estación no conectada";
        private bool helpVisible;
        private DemoEvaluation lastEvaluation;

        public MissionStage CurrentStage { get { return stage; } }
        public int AnswerCount { get { return answers.Count; } }

        private void Awake()
        {
            if (hud == null) hud = FindObjectOfType<VitalHud>();
            if (feedback == null) feedback = FindObjectOfType<InteractionFeedback>();
            recognizer = optionalRecognizerComponent as IKeywordRecognizer;
            stationTransport = optionalStationTransportComponent as IStationTransport;
            // Convenience for prototypes: interfaces can be discovered on sibling MonoBehaviours.
            MonoBehaviour[] siblings = GetComponents<MonoBehaviour>();
            for (int i = 0; i < siblings.Length; i++)
            {
                if (recognizer == null) recognizer = siblings[i] as IKeywordRecognizer;
                if (stationTransport == null) stationTransport = siblings[i] as IStationTransport;
            }

            if (recognizer != null) recognizer.CommandRecognized += HandleVoiceCommand;
            if (stationTransport != null)
            {
                stationTransport.StateChanged += HandleStationState;
                stationTransport.SemanticCommandReceived += HandleStationCommand;
            }

            ShowWelcome();
        }

        private void OnDestroy()
        {
            if (recognizer != null) recognizer.CommandRecognized -= HandleVoiceCommand;
            if (stationTransport != null)
            {
                stationTransport.StateChanged -= HandleStationState;
                stationTransport.SemanticCommandReceived -= HandleStationCommand;
            }
        }

        public void ContinueMission()
        {
            helpVisible = false;
            switch (stage)
            {
                case MissionStage.Welcome:
                    stage = MissionStage.Exploration;
                    subtitle = "Explore con calma y localiza la estación V.I.T.A.L. Puedes seleccionarla o pulsar Continuar.";
                    prompt = "Misión 2 de 5 · Explora la habitación";
                    break;
                case MissionStage.Exploration:
                    SelectStation();
                    return;
                case MissionStage.Evaluation:
                    stage = MissionStage.Closing;
                    subtitle = "La misión terminó. Si tienes una necesidad de salud real, contacta al personal sanitario o utiliza los canales locales apropiados. Puedes reiniciar para practicar.";
                    prompt = "Misión 5 de 5 · Cierre";
                    break;
                case MissionStage.Closing:
                    RestartMission();
                    return;
            }
            RefreshHud();
        }

        public void SelectStation()
        {
            if (stage != MissionStage.Exploration) return;
            stage = MissionStage.Conversation;
            if (feedback != null) { feedback.Pulse(); feedback.SetListening(true); }
            questionIndex = 0;
            answers.Clear();
            subtitle = "Encontraste la estación. Practiquemos una conversación ficticia; no compartas datos personales ni información médica real.";
            prompt = "Misión 3 de 5 · Conversación";
            if (stationTransport != null) stationTransport.SendSemanticEvent("station_selected");
            ShowCurrentQuestion();
        }

        public void AnswerYes() { SubmitAnswer(true); }
        public void AnswerNo() { SubmitAnswer(false); }

        private void SubmitAnswer(bool yes)
        {
            if (stage != MissionStage.Conversation || questionIndex >= questions.Length) return;
            answers.Add(yes);
            if (stationTransport != null)
                stationTransport.SendSemanticEvent(yes ? "answer_yes" : "answer_no");

            questionIndex++;
            if (feedback != null) feedback.Pulse();
            helpVisible = false;
            if (questionIndex < questions.Length)
            {
                subtitle = questions[questionIndex];
                string acknowledgement = yes ? "Respuesta recibida: Sí" : "Respuesta recibida: No";
                prompt = acknowledgement + " · Pregunta " + (questionIndex + 1) + " de " + questions.Length;
                RefreshHud();
            }
            else
            {
                EvaluateDemo();
            }
        }

        private void EvaluateDemo()
        {
            stage = MissionStage.Evaluation;
            if (feedback != null) { feedback.SetListening(false); feedback.Pulse(); }
            lastEvaluation = demoRules != null
                ? demoRules.Evaluate(answers)
                : MakeSafeFallbackEvaluation();
            subtitle = "Procesamiento local de respuestas ficticias. " + lastEvaluation.explanation;
            prompt = "Misión 4 de 5 · " + lastEvaluation.displayLabel;
            switch (lastEvaluation.outcome)
            {
                case DemoOutcome.PriorityDemo: status = "SIMULACIÓN · PRIORIDAD DE DEMO · NO CLÍNICO"; break;
                case DemoOutcome.MonitorDemo: status = "SIMULACIÓN · SEGUIMIENTO DE DEMO · NO CLÍNICO"; break;
                default: status = "SIMULACIÓN · ESTABLE DE DEMO · NO CLÍNICO"; break;
            }
            RefreshHud();
        }

        private static DemoEvaluation MakeSafeFallbackEvaluation()
        {
            return new DemoEvaluation(DemoOutcome.StableDemo, "Estable · simulación",
                "Reglas de demostración no configuradas. No es una evaluación clínica.");
        }

        public void RepeatCurrent()
        {
            helpVisible = false;
            switch (stage)
            {
                case MissionStage.Welcome:
                    subtitle = "Hola, soy Vita, tu guía virtual. Esta experiencia es educativa y no realiza una evaluación médica. Responde con voz o botones; puedes pedir ayuda o finalizar.";
                    break;
                case MissionStage.Exploration:
                    subtitle = "Explora con calma y localiza la estación V.I.T.A.L. Selecciónala o pulsa Continuar.";
                    break;
                case MissionStage.Conversation:
                    if (questionIndex < questions.Length) subtitle = questions[questionIndex];
                    break;
                case MissionStage.Evaluation:
                    if (lastEvaluation != null) subtitle = lastEvaluation.explanation + " No es un diagnóstico.";
                    break;
                case MissionStage.Closing:
                    subtitle = "La misión terminó. Esto no sustituye atención profesional. Puedes reiniciar para practicar.";
                    break;
            }
            RefreshHud();
        }

        public void ShowHelp()
        {
            helpVisible = !helpVisible;
            if (helpVisible) subtitle = "Puedes pausar o finalizar en cualquier momento. También puedes usar botones grandes en pantalla.";
            RefreshHud();
        }

        public void FinishMission()
        {
            if (recognizer != null) recognizer.SetListening(false);
            if (feedback != null) feedback.SetListening(false);
            helpVisible = false;
            stage = MissionStage.Closing;
            subtitle = "Has finalizado la misión. Esta actividad es sólo educativa y no ofrece diagnóstico ni consejo médico. Si necesitas atención, consulta al personal sanitario.";
            prompt = "Misión 5 de 5 · Cierre";
            RefreshHud();
        }

        public void RestartMission()
        {
            answers.Clear();
            questionIndex = 0;
            lastEvaluation = null;
            stage = MissionStage.Welcome;
            helpVisible = false;
            status = "Modo de demostración · estación no conectada";
            ShowWelcome();
        }

        private void ShowWelcome()
        {
            stage = MissionStage.Welcome;
            subtitle = "Hola, soy Vita, tu guía virtual. Esta experiencia es educativa y no realiza una evaluación médica. Puedes responder hablando o con los botones. Di ‘necesito ayuda’ o ‘finalizar’ cuando quieras.";
            prompt = "Misión 1 de 5 · Bienvenida";
            if (recognizer != null) recognizer.SetListening(true);
            RefreshHud();
        }

        private void ShowCurrentQuestion()
        {
            subtitle = questions[questionIndex];
            prompt = "Pregunta " + (questionIndex + 1) + " de " + questions.Length + " · Responde Sí o No";
            RefreshHud();
        }

        private void HandleVoiceCommand(VoiceCommand command)
        {
            switch (command)
            {
                case VoiceCommand.Yes:
                    if (stage == MissionStage.Conversation) AnswerYes(); else if (stage == MissionStage.Welcome || stage == MissionStage.Exploration) ContinueMission();
                    break;
                case VoiceCommand.No:
                    if (stage == MissionStage.Conversation) AnswerNo();
                    break;
                case VoiceCommand.Repeat: RepeatCurrent(); break;
                case VoiceCommand.Help: ShowHelp(); break;
                case VoiceCommand.Finish: FinishMission(); break;
            }
        }

        private void HandleStationCommand(string command)
        {
            // Allow only a tiny semantic allowlist. Never accept remote rule changes or arbitrary dialogue.
            switch (command)
            {
                case "yes": HandleVoiceCommand(VoiceCommand.Yes); break;
                case "no": HandleVoiceCommand(VoiceCommand.No); break;
                case "repeat": HandleVoiceCommand(VoiceCommand.Repeat); break;
                case "help": HandleVoiceCommand(VoiceCommand.Help); break;
                case "finish": HandleVoiceCommand(VoiceCommand.Finish); break;
            }
        }

        private void HandleStationState(StationConnectionState connectionState)
        {
            status = connectionState == StationConnectionState.Connected
                ? "Estación conectada · modo de demostración"
                : "Modo independiente · estación " + connectionState.ToString().ToLowerInvariant();
            RefreshHud();
        }

        private void RefreshHud()
        {
            if (hud == null) return;
            string[] stages = { "Bienvenida", "Exploración", "Conversación", "Evaluación", "Cierre" };
            string progress = "Etapa " + ((int)stage + 1) + " de 5";
            hud.Render(stages[(int)stage], progress, subtitle, prompt, status, helpVisible);
        }
    }
}
