using System;
using UnityEngine;

namespace VitalVR
{
    /// <summary>
    /// Desktop/editor fallback that emits the same semantic events as a future speech adapter.
    /// It does not access a microphone or recognize actual speech.
    /// </summary>
    public sealed class DemoKeyboardRecognizer : MonoBehaviour, IKeywordRecognizer
    {
        [SerializeField] private GameFlowController flow;
        [SerializeField] private bool enabledForEditor = true;
        private bool listening = true;

        public event Action<VoiceCommand> CommandRecognized;

        private void Awake()
        {
            if (flow == null) flow = FindObjectOfType<GameFlowController>();
        }

        public void SetListening(bool value) { listening = value; }

        private void Update()
        {
            if (!enabledForEditor || !listening || flow == null) return;

            if (Input.GetKeyDown(KeyCode.Y)) Emit(VoiceCommand.Yes);
            if (Input.GetKeyDown(KeyCode.N)) Emit(VoiceCommand.No);
            if (Input.GetKeyDown(KeyCode.R)) Emit(VoiceCommand.Repeat);
            if (Input.GetKeyDown(KeyCode.H)) Emit(VoiceCommand.Help);
            if (Input.GetKeyDown(KeyCode.F)) Emit(VoiceCommand.Finish);
            if (Input.GetKeyDown(KeyCode.E)) flow.ContinueMission();
            if (Input.GetKeyDown(KeyCode.X)) flow.RestartMission();
        }

        private void Emit(VoiceCommand command)
        {
            if (CommandRecognized != null) CommandRecognized(command);
        }
    }
}
