export function isSampleMode(): boolean {
  const v = process.env.SAMPLE_MODE;
  return v === "1" || v === "true" || v === "yes";
}

export function assertSampleModeOffline(): void {
  if (!isSampleMode()) return;
  // SAMPLE_MODE is retrieval + rule critic only. Never require a live model.
  delete process.env.ANTHROPIC_API_KEY;
}
