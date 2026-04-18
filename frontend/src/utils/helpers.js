export function confidenceLabel(c, t) {
  if (c >= 70) return { text: t("confidence_high", { defaultValue: "High Confidence" }), color: "var(--color-text-success)" };
  if (c >= 45) return { text: t("confidence_moderate", { defaultValue: "Moderate Confidence" }), color: "var(--color-text-warning)" };
  return { text: t("confidence_low", { defaultValue: "Low Confidence" }), color: "var(--color-text-tertiary)" };
}
