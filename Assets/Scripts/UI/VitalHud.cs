using TMPro;
using UnityEngine;

namespace VitalVR
{
    /// <summary>Optional HUD binder. Keep labels, icons and text together; never rely on color alone.</summary>
    public sealed class VitalHud : MonoBehaviour
    {
        [SerializeField] private TMP_Text stageText;
        [SerializeField] private TMP_Text progressText;
        [SerializeField] private TMP_Text subtitleText;
        [SerializeField] private TMP_Text promptText;
        [SerializeField] private TMP_Text statusText;
        [SerializeField] private GameObject helpPanel;
        [SerializeField] private TMP_Text helpText;
        [SerializeField] private float subtitleSizeStep = 2f;
        private float baseSubtitleSize;
        private bool highContrast;

        private void Awake()
        {
            if (subtitleText != null) baseSubtitleSize = subtitleText.fontSize;
        }

        public void IncreaseSubtitleSize()
        {
            if (subtitleText != null) subtitleText.fontSize = Mathf.Min(48f, subtitleText.fontSize + subtitleSizeStep);
        }

        public void DecreaseSubtitleSize()
        {
            if (subtitleText != null) subtitleText.fontSize = Mathf.Max(18f, subtitleText.fontSize - subtitleSizeStep);
        }

        public void ResetSubtitleSize()
        {
            if (subtitleText != null && baseSubtitleSize > 0f) subtitleText.fontSize = baseSubtitleSize;
        }

        public void ToggleHighContrast()
        {
            highContrast = !highContrast;
            if (subtitleText != null) subtitleText.color = highContrast ? Color.black : new Color32(35, 65, 86, 255);
            if (promptText != null) promptText.color = highContrast ? Color.black : new Color32(35, 65, 86, 255);
        }

        public void Render(string stage, string progress, string subtitle, string prompt, string status, bool showHelp)
        {
            Set(stageText, stage);
            Set(progressText, progress);
            Set(subtitleText, subtitle);
            Set(promptText, prompt);
            Set(statusText, status);
            if (statusText != null)
            {
                // Text remains explicit; color is supplementary and never the only status cue.
                if (!string.IsNullOrEmpty(status) && status.Contains("PRIORIDAD")) statusText.color = new Color32(180, 48, 48, 255);
                else if (!string.IsNullOrEmpty(status) && status.Contains("SEGUIMIENTO")) statusText.color = new Color32(145, 104, 0, 255);
                else if (!string.IsNullOrEmpty(status) && status.Contains("ESTABLE")) statusText.color = new Color32(32, 112, 76, 255);
                else statusText.color = new Color32(35, 65, 86, 255);
            }
            if (helpPanel != null) helpPanel.SetActive(showHelp);
            if (helpText != null && showHelp)
                helpText.text = "Puedes responder con los botones o, en el modo de voz, decir: Sí, No, Repetir, Necesito ayuda o Finalizar. Esta experiencia es una simulación educativa.";
        }

        private static void Set(TMP_Text target, string value)
        {
            if (target != null) target.text = value ?? string.Empty;
        }
    }
}
