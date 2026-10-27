using UnityEngine;

namespace VitalVR
{
    /// <summary>Attach to the station collider and call Select from an XRIT interact event or UI button.</summary>
    public sealed class VitaStationTarget : MonoBehaviour
    {
        [SerializeField] private GameFlowController flow;
        [SerializeField] private GameObject selectionHighlight;

        private void Awake()
        {
            if (flow == null) flow = FindObjectOfType<GameFlowController>();
            if (selectionHighlight != null) selectionHighlight.SetActive(false);
        }

        public void Select()
        {
            if (flow == null) return;
            flow.SelectStation();
            if (selectionHighlight != null) selectionHighlight.SetActive(true);
        }
    }
}
