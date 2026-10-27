using System;
using UnityEngine;

namespace VitalVR
{
    public enum MissionStage
    {
        Welcome = 0,
        Exploration = 1,
        Conversation = 2,
        Evaluation = 3,
        Closing = 4
    }

    public enum VoiceCommand
    {
        Yes,
        No,
        Repeat,
        Help,
        Finish
    }

    // These labels belong to a fictional training scenario; they are not medical triage.
    public enum DemoOutcome
    {
        StableDemo,
        MonitorDemo,
        PriorityDemo
    }

    public enum StationConnectionState
    {
        Disconnected,
        Connecting,
        Connected,
        Error
    }

    [Serializable]
    public sealed class DemoEvaluation
    {
        public DemoOutcome outcome;
        public string displayLabel;
        public string explanation;

        public DemoEvaluation(DemoOutcome outcome, string displayLabel, string explanation)
        {
            this.outcome = outcome;
            this.displayLabel = displayLabel;
            this.explanation = explanation;
        }
    }

    /// <summary>Pluggable contract for semantic commands. Audio capture is deliberately outside this interface.</summary>
    public interface IKeywordRecognizer
    {
        event Action<VoiceCommand> CommandRecognized;
        void SetListening(bool listening);
    }

    /// <summary>Optional peripheral link. The game must remain usable when no station is connected.</summary>
    public interface IStationTransport
    {
        StationConnectionState State { get; }
        event Action<StationConnectionState> StateChanged;
        event Action<string> SemanticCommandReceived;
        void Connect();
        void Disconnect();
        void SendSemanticEvent(string eventName);
    }
}
