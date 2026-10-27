using System.Collections.Generic;
using UnityEngine;

namespace VitalVR
{
    /// <summary>
    /// Fictional rule set for UI/flow testing only. It is not a clinical protocol and must never be
    /// used to assess a real person. Replace with a professionally reviewed training scenario only.
    /// </summary>
    [CreateAssetMenu(menuName = "V.I.T.A.L/Demo Triage Rules", fileName = "DemoTriageRules")]
    public sealed class DemoTriageRules : ScriptableObject
    {
        [Header("Fictional demonstration only")]
        [Tooltip("Index of the demo question whose Yes answer shows the priority-colored demo state. Not a clinical threshold.")]
        [Min(0)] public int priorityDemoQuestionIndex = 2;
        [Tooltip("Number of No answers that shows the monitor-colored demo state. Not a clinical threshold.")]
        [Min(1)] public int monitorDemoNoAnswerThreshold = 2;

        public DemoEvaluation Evaluate(IReadOnlyList<bool> yesAnswers)
        {
            int noCount = 0;
            for (int i = 0; i < yesAnswers.Count; i++)
            {
                if (!yesAnswers[i]) noCount++;
            }

            if (priorityDemoQuestionIndex >= 0 &&
                priorityDemoQuestionIndex < yesAnswers.Count &&
                yesAnswers[priorityDemoQuestionIndex])
            {
                return new DemoEvaluation(
                    DemoOutcome.PriorityDemo,
                    "Prioridad · simulación",
                    "Se activó una regla ficticia de demostración. No es una alerta médica ni una recomendación.");
            }

            if (noCount >= Mathf.Max(1, monitorDemoNoAnswerThreshold))
            {
                return new DemoEvaluation(
                    DemoOutcome.MonitorDemo,
                    "Seguimiento · simulación",
                    "Se alcanzó un umbral ficticio del prototipo. No representa una evaluación clínica.");
            }

            return new DemoEvaluation(
                DemoOutcome.StableDemo,
                "Estable · simulación",
                "Resultado demostrativo de esta misión. No confirma que una persona esté sana.");
        }
    }
}
