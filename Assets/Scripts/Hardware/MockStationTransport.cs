using System;
using UnityEngine;

namespace VitalVR
{
    /// <summary>Offline fake transport for Editor demos. No network, BLE, audio or personal data is used.</summary>
    public sealed class MockStationTransport : MonoBehaviour, IStationTransport
    {
        public StationConnectionState State { get; private set; } = StationConnectionState.Disconnected;
        public event Action<StationConnectionState> StateChanged;
        public event Action<string> SemanticCommandReceived;

        public void Connect() { SetState(StationConnectionState.Connected); }
        public void Disconnect() { SetState(StationConnectionState.Disconnected); }
        public void SendSemanticEvent(string eventName)
        {
            Debug.Log("[V.I.T.A.L demo transport] " + eventName);
        }

        /// <summary>Editor-only test hook: simulate an allowlisted command from a future station.</summary>
        public void SimulateCommand(string command)
        {
            if (State != StationConnectionState.Connected) return;
            if (command != "yes" && command != "no" && command != "repeat" && command != "help" && command != "finish") return;
            if (SemanticCommandReceived != null) SemanticCommandReceived(command);
        }

        private void SetState(StationConnectionState value)
        {
            State = value;
            if (StateChanged != null) StateChanged(value);
        }
    }
}
